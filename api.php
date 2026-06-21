<?php
// api.php - Master REST API Controller for Innovexa Catalyst Freelance Marketplace
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

// Helper to send standard JSON responses
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// JWT Helpers (HS256 implementation using native PHP)
define('JWT_SECRET', 'innovexa_super_secret_key_987654321');

function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function base64UrlDecode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function generateJWT($payload, $expiry = 3600) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + $expiry;
    
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;
    
    list($header, $payload, $signature) = $parts;
    
    $valid_sig = base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true));
    if ($signature !== $valid_sig) return false;
    
    $payload_data = json_decode(base64UrlDecode($payload), true);
    if (isset($payload_data['exp']) && $payload_data['exp'] < time()) {
        return false; // Token has expired
    }
    return $payload_data;
}

// Authentication check
function getAuthUser() {
    $headers = getallheaders();
    $authHeader = '';
    
    // Normalize headers
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            $authHeader = $value;
            break;
        }
    }
    
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $payload = verifyJWT($jwt);
        if ($payload && isset($payload['user_id'])) {
            $db = getDB();
            $stmt = $db->prepare("SELECT id, name, email, role, is_verified, is_banned, balance, bio, skills, portfolio FROM users WHERE id = ?");
            $stmt->execute([$payload['user_id']]);
            $user = $stmt->fetch();
            if ($user) {
                if ($user['is_banned']) {
                    sendResponse(['success' => false, 'message' => 'User account is banned.'], 403);
                }
                return $user;
            }
        }
    }
    return null;
}

function requireAuth() {
    $user = getAuthUser();
    if (!$user) {
        sendResponse(['success' => false, 'message' => 'Unauthorized access.'], 401);
    }
    return $user;
}

// Router configuration
$method = $_SERVER['REQUEST_METHOD'];
$route = isset($_GET['route']) ? $_GET['route'] : '';
$route = rtrim($route, '/');

// Parse request payload
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

$db = getDB();

try {
    // ==========================================
    // 1. AUTHENTICATION ENDPOINTS
    // ==========================================
    
    // POST /api/auth/register
    if ($route === 'auth/register' && $method === 'POST') {
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'freelancer'; // client, freelancer
        
        if (empty($name) || empty($email) || empty($password)) {
            sendResponse(['success' => false, 'message' => 'All fields are required.'], 400);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(['success' => false, 'message' => 'Invalid email address.'], 400);
        }
        
        if (!in_array($role, ['client', 'freelancer'])) {
            sendResponse(['success' => false, 'message' => 'Invalid user role.'], 400);
        }
        
        // Check duplicate email
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendResponse(['success' => false, 'message' => 'Email is already registered.'], 400);
        }
        
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $passwordHash, $role]);
        $userId = $db->lastInsertId();
        
        $accessToken = generateJWT(['user_id' => $userId, 'role' => $role], 3600); // 1 hr
        $refreshToken = generateJWT(['user_id' => $userId, 'type' => 'refresh'], 3600 * 24 * 7); // 7 days
        
        sendResponse([
            'success' => true,
            'message' => 'Registration successful.',
            'accessToken' => $accessToken,
            'refreshToken' => $refreshToken,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'is_verified' => 0,
                'balance' => 0.00
            ]
        ], 201);
    }
    
    // POST /api/auth/login
    elseif ($route === 'auth/login' && $method === 'POST') {
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            sendResponse(['success' => false, 'message' => 'Email and password are required.'], 400);
        }
        
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            sendResponse(['success' => false, 'message' => 'Invalid email or password.'], 401);
        }
        
        if ($user['is_banned']) {
            sendResponse(['success' => false, 'message' => 'Your account is banned.'], 403);
        }
        
        $accessToken = generateJWT(['user_id' => $user['id'], 'role' => $user['role']], 3600);
        $refreshToken = generateJWT(['user_id' => $user['id'], 'type' => 'refresh'], 3600 * 24 * 7);
        
        sendResponse([
            'success' => true,
            'message' => 'Login successful.',
            'accessToken' => $accessToken,
            'refreshToken' => $refreshToken,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'is_verified' => (bool)$user['is_verified'],
                'balance' => (float)$user['balance']
            ]
        ]);
    }
    
    // POST /api/auth/refresh
    elseif ($route === 'auth/refresh' && $method === 'POST') {
        $refreshToken = $input['refreshToken'] ?? '';
        if (empty($refreshToken)) {
            sendResponse(['success' => false, 'message' => 'Refresh token required.'], 400);
        }
        
        $payload = verifyJWT($refreshToken);
        if (!$payload || !isset($payload['type']) || $payload['type'] !== 'refresh') {
            sendResponse(['success' => false, 'message' => 'Invalid or expired refresh token.'], 401);
        }
        
        // Fetch user from db
        $stmt = $db->prepare("SELECT id, role, is_banned FROM users WHERE id = ?");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user || $user['is_banned']) {
            sendResponse(['success' => false, 'message' => 'User unavailable or banned.'], 403);
        }
        
        $newAccessToken = generateJWT(['user_id' => $user['id'], 'role' => $user['role']], 3600);
        sendResponse([
            'success' => true,
            'accessToken' => $newAccessToken
        ]);
    }
    
    // GET /api/auth/me
    elseif ($route === 'auth/me' && $method === 'GET') {
        $user = requireAuth();
        unset($user['password_hash']);
        sendResponse([
            'success' => true,
            'user' => $user
        ]);
    }
    
    // PUT /api/auth/profile
    elseif ($route === 'auth/profile' && $method === 'PUT') {
        $user = requireAuth();
        $bio = isset($input['bio']) ? trim($input['bio']) : null;
        $skills = isset($input['skills']) ? $input['skills'] : null;
        $portfolio = isset($input['portfolio']) ? trim($input['portfolio']) : null;
        
        // Format skills if it's an array
        if (is_array($skills)) {
            $skills = implode(',', array_map('trim', $skills));
        } elseif ($skills !== null) {
            $skills = trim($skills);
        }
        
        $sql = "UPDATE users SET ";
        $params = [];
        $updates = [];
        
        if ($bio !== null) {
            $updates[] = "bio = ?";
            $params[] = $bio;
        }
        if ($skills !== null) {
            $updates[] = "skills = ?";
            $params[] = $skills;
        }
        if ($portfolio !== null) {
            $updates[] = "portfolio = ?";
            $params[] = $portfolio;
        }
        
        if (empty($updates)) {
            sendResponse(['success' => false, 'message' => 'No profile update data provided.'], 400);
        }
        
        $sql .= implode(', ', $updates) . " WHERE id = ?";
        $params[] = $user['id'];
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Retrieve fresh user info
        $stmt = $db->prepare("SELECT id, name, email, role, is_verified, balance, bio, skills, portfolio FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $updatedUser = $stmt->fetch();
        
        sendResponse([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $updatedUser
        ]);
    }
    
    // ==========================================
    // 2. PROJECT ENDPOINTS
    // ==========================================
    
    // GET /api/projects (search, category, budget ranges, status)
    elseif ($route === 'projects' && $method === 'GET') {
        $search = trim($_GET['search'] ?? '');
        $category = trim($_GET['category'] ?? '');
        $skills = trim($_GET['skills'] ?? '');
        $minBudget = isset($_GET['minBudget']) ? (float)$_GET['minBudget'] : null;
        $maxBudget = isset($_GET['maxBudget']) ? (float)$_GET['maxBudget'] : null;
        $status = trim($_GET['status'] ?? 'open'); // default open
        
        $sql = "SELECT p.*, u.name AS client_name, u.email AS client_email, u.is_verified AS client_verified 
                FROM projects p 
                JOIN users u ON p.client_id = u.id 
                WHERE 1=1";
        $params = [];
        
        if ($status !== 'all') {
            $sql .= " AND p.status = ?";
            $params[] = $status;
        }
        
        if (!empty($search)) {
            $sql .= " AND (p.title LIKE ? OR p.description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if (!empty($category)) {
            $sql .= " AND p.category = ?";
            $params[] = $category;
        }
        
        if (!empty($skills)) {
            $skillList = explode(',', $skills);
            $skillConditions = [];
            foreach ($skillList as $skill) {
                $skillConditions[] = "p.skills LIKE ?";
                $params[] = "%" . trim($skill) . "%";
            }
            if (!empty($skillConditions)) {
                $sql .= " AND (" . implode(" OR ", $skillConditions) . ")";
            }
        }
        
        if ($minBudget !== null) {
            $sql .= " AND p.budget >= ?";
            $params[] = $minBudget;
        }
        
        if ($maxBudget !== null) {
            $sql .= " AND p.budget <= ?";
            $params[] = $maxBudget;
        }
        
        $sql .= " ORDER BY p.created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $projects = $stmt->fetchAll();
        
        // Format skills array for response
        foreach ($projects as &$project) {
            $project['skills'] = $project['skills'] ? array_map('trim', explode(',', $project['skills'])) : [];
            $project['budget'] = (float)$project['budget'];
            $project['client_verified'] = (bool)$project['client_verified'];
        }
        
        sendResponse(['success' => true, 'projects' => $projects]);
    }
    
    // POST /api/projects
    elseif ($route === 'projects' && $method === 'POST') {
        $user = requireAuth();
        if ($user['role'] !== 'client' && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Only clients can create projects.'], 403);
        }
        
        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $budget = (float)($input['budget'] ?? 0);
        $category = trim($input['category'] ?? '');
        $skills = $input['skills'] ?? ''; // can be array or string
        $deadline = trim($input['deadline'] ?? '');
        
        if (empty($title) || empty($description) || $budget <= 0 || empty($category) || empty($deadline)) {
            sendResponse(['success' => false, 'message' => 'Invalid project inputs.'], 400);
        }
        
        // Format skills to string comma-separated
        if (is_array($skills)) {
            $skills = implode(',', array_map('trim', $skills));
        } else {
            $skills = trim($skills);
        }
        
        $stmt = $db->prepare("INSERT INTO projects (title, description, budget, category, skills, deadline, client_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'open')");
        $stmt->execute([$title, $description, $budget, $category, $skills, $deadline, $user['id']]);
        $projectId = $db->lastInsertId();
        
        sendResponse([
            'success' => true,
            'message' => 'Project posted successfully.',
            'projectId' => $projectId
        ], 201);
    }
    
    // GET /api/projects/:id
    elseif (preg_match('/^projects\/(\d+)$/', $route, $matches) && $method === 'GET') {
        $projectId = $matches[1];
        
        $stmt = $db->prepare("SELECT p.*, u.name AS client_name, u.email AS client_email, u.is_verified AS client_verified, u.bio AS client_bio 
                              FROM projects p 
                              JOIN users u ON p.client_id = u.id 
                              WHERE p.id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();
        
        if (!$project) {
            sendResponse(['success' => false, 'message' => 'Project not found.'], 404);
        }
        
        $project['skills'] = $project['skills'] ? array_map('trim', explode(',', $project['skills'])) : [];
        $project['budget'] = (float)$project['budget'];
        $project['client_verified'] = (bool)$project['client_verified'];
        
        sendResponse(['success' => true, 'project' => $project]);
    }
    
    // PUT /api/projects/:id
    elseif (preg_match('/^projects\/(\d+)$/', $route, $matches) && $method === 'PUT') {
        $user = requireAuth();
        $projectId = $matches[1];
        
        // Fetch project to check owner
        $stmt = $db->prepare("SELECT * FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();
        
        if (!$project) {
            sendResponse(['success' => false, 'message' => 'Project not found.'], 404);
        }
        
        if ($project['client_id'] !== $user['id'] && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Unauthorized to edit this project.'], 403);
        }
        
        if ($project['status'] !== 'open') {
            sendResponse(['success' => false, 'message' => 'Can only update projects in open status.'], 400);
        }
        
        $title = trim($input['title'] ?? $project['title']);
        $description = trim($input['description'] ?? $project['description']);
        $budget = (float)($input['budget'] ?? $project['budget']);
        $category = trim($input['category'] ?? $project['category']);
        $deadline = trim($input['deadline'] ?? $project['deadline']);
        $skills = $input['skills'] ?? $project['skills'];
        
        if (is_array($skills)) {
            $skills = implode(',', array_map('trim', $skills));
        }
        
        $stmt = $db->prepare("UPDATE projects SET title = ?, description = ?, budget = ?, category = ?, skills = ?, deadline = ? WHERE id = ?");
        $stmt->execute([$title, $description, $budget, $category, $skills, $deadline, $projectId]);
        
        sendResponse(['success' => true, 'message' => 'Project updated successfully.']);
    }
    
    // DELETE /api/projects/:id
    elseif (preg_match('/^projects\/(\d+)$/', $route, $matches) && $method === 'DELETE') {
        $user = requireAuth();
        $projectId = $matches[1];
        
        $stmt = $db->prepare("SELECT * FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();
        
        if (!$project) {
            sendResponse(['success' => false, 'message' => 'Project not found.'], 404);
        }
        
        if ($project['client_id'] !== $user['id'] && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Unauthorized to delete this project.'], 403);
        }
        
        if ($project['status'] !== 'open' && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Cannot delete active project.'], 400);
        }
        
        $stmt = $db->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);
        
        sendResponse(['success' => true, 'message' => 'Project deleted successfully.']);
    }
    
    // ==========================================
    // 3. BIDDING ENDPOINTS
    // ==========================================
    
    // POST /api/projects/:id/bids
    elseif (preg_match('/^projects\/(\d+)\/bids$/', $route, $matches) && $method === 'POST') {
        $user = requireAuth();
        if ($user['role'] !== 'freelancer') {
            sendResponse(['success' => false, 'message' => 'Only freelancers can bid.'], 403);
        }
        
        $projectId = $matches[1];
        $amount = (float)($input['amount'] ?? 0);
        $deliveryDays = (int)($input['deliveryDays'] ?? 0);
        $coverLetter = trim($input['coverLetter'] ?? '');
        
        if ($amount <= 0 || $deliveryDays <= 0 || empty($coverLetter)) {
            sendResponse(['success' => false, 'message' => 'Invalid bid inputs.'], 400);
        }
        
        // Verify project is open
        $stmt = $db->prepare("SELECT status FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();
        if (!$project) {
            sendResponse(['success' => false, 'message' => 'Project not found.'], 404);
        }
        if ($project['status'] !== 'open') {
            sendResponse(['success' => false, 'message' => 'Project is no longer open for bidding.'], 400);
        }
        
        // Check if already bid
        $stmt = $db->prepare("SELECT id FROM bids WHERE project_id = ? AND freelancer_id = ?");
        $stmt->execute([$projectId, $user['id']]);
        $existingBid = $stmt->fetch();
        
        if ($existingBid) {
            // Update bid
            $stmt = $db->prepare("UPDATE bids SET amount = ?, delivery_days = ?, cover_letter = ?, status = 'pending' WHERE id = ?");
            $stmt->execute([$amount, $deliveryDays, $coverLetter, $existingBid['id']]);
            sendResponse(['success' => true, 'message' => 'Bid updated successfully.']);
        } else {
            // Insert bid
            $stmt = $db->prepare("INSERT INTO bids (project_id, freelancer_id, amount, delivery_days, cover_letter, status) VALUES (?, ?, ?, ?, ?, 'pending')");
            $stmt->execute([$projectId, $user['id'], $amount, $deliveryDays, $coverLetter]);
            sendResponse(['success' => true, 'message' => 'Bid placed successfully.'], 201);
        }
    }
    
    // GET /api/projects/:id/bids
    elseif (preg_match('/^projects\/(\d+)\/bids$/', $route, $matches) && $method === 'GET') {
        $user = requireAuth();
        $projectId = $matches[1];
        
        // Verify user is owner or freelancer who bid or admin
        $stmt = $db->prepare("SELECT client_id FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();
        
        if (!$project) {
            sendResponse(['success' => false, 'message' => 'Project not found.'], 404);
        }
        
        $isOwner = ($project['client_id'] === $user['id']);
        $isAdmin = ($user['role'] === 'admin');
        
        if ($isOwner || $isAdmin) {
            // Get all bids
            $stmt = $db->prepare("SELECT b.*, u.name AS freelancer_name, u.email AS freelancer_email, u.skills AS freelancer_skills, u.portfolio AS freelancer_portfolio, u.is_verified AS freelancer_verified 
                                  FROM bids b 
                                  JOIN users u ON b.freelancer_id = u.id 
                                  WHERE b.project_id = ? 
                                  ORDER BY b.amount ASC");
            $stmt->execute([$projectId]);
            $bids = $stmt->fetchAll();
            
            foreach ($bids as &$bid) {
                $bid['freelancer_skills'] = $bid['freelancer_skills'] ? array_map('trim', explode(',', $bid['freelancer_skills'])) : [];
                $bid['amount'] = (float)$bid['amount'];
                $bid['delivery_days'] = (int)$bid['delivery_days'];
                $bid['freelancer_verified'] = (bool)$bid['freelancer_verified'];
            }
            sendResponse(['success' => true, 'bids' => $bids]);
        } else {
            // Only get current freelancer's own bid
            $stmt = $db->prepare("SELECT b.*, u.name AS freelancer_name, u.email AS freelancer_email, u.skills AS freelancer_skills, u.portfolio AS freelancer_portfolio, u.is_verified AS freelancer_verified 
                                  FROM bids b 
                                  JOIN users u ON b.freelancer_id = u.id 
                                  WHERE b.project_id = ? AND b.freelancer_id = ?");
            $stmt->execute([$projectId, $user['id']]);
            $bid = $stmt->fetch();
            if ($bid) {
                $bid['freelancer_skills'] = $bid['freelancer_skills'] ? array_map('trim', explode(',', $bid['freelancer_skills'])) : [];
                $bid['amount'] = (float)$bid['amount'];
                $bid['delivery_days'] = (int)$bid['delivery_days'];
                $bid['freelancer_verified'] = (bool)$bid['freelancer_verified'];
                sendResponse(['success' => true, 'bids' => [$bid]]);
            } else {
                sendResponse(['success' => true, 'bids' => []]);
            }
        }
    }
    
    // GET /api/my-bids
    elseif ($route === 'my-bids' && $method === 'GET') {
        $user = requireAuth();
        if ($user['role'] !== 'freelancer' && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Only freelancers can have bids.'], 403);
        }
        
        $sql = "SELECT b.*, p.title AS project_title, p.budget AS project_budget, p.status AS project_status, u.name AS client_name 
                FROM bids b
                JOIN projects p ON b.project_id = p.id
                JOIN users u ON p.client_id = u.id";
        
        $params = [];
        if ($user['role'] !== 'admin') {
            $sql .= " WHERE b.freelancer_id = ?";
            $params[] = $user['id'];
        }
        $sql .= " ORDER BY b.created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $bids = $stmt->fetchAll();
        
        foreach ($bids as &$bid) {
            $bid['amount'] = (float)$bid['amount'];
            $bid['delivery_days'] = (int)$bid['delivery_days'];
            $bid['project_budget'] = (float)$bid['project_budget'];
        }
        
        sendResponse(['success' => true, 'bids' => $bids]);
    }
    
    // PUT /api/bids/:id/status (Accept / Reject / Shortlist)
    elseif (preg_match('/^bids\/(\d+)\/status$/', $route, $matches) && $method === 'PUT') {
        $user = requireAuth();
        $bidId = $matches[1];
        $newStatus = $input['status'] ?? ''; // accepted, rejected, shortlisted
        
        if (!in_array($newStatus, ['accepted', 'rejected', 'shortlisted'])) {
            sendResponse(['success' => false, 'message' => 'Invalid bid status.'], 400);
        }
        
        // Retrieve bid and project details
        $stmt = $db->prepare("SELECT b.*, p.client_id, p.title AS project_title, p.status AS project_status 
                              FROM bids b 
                              JOIN projects p ON b.project_id = p.id 
                              WHERE b.id = ?");
        $stmt->execute([$bidId]);
        $bid = $stmt->fetch();
        
        if (!$bid) {
            sendResponse(['success' => false, 'message' => 'Bid not found.'], 404);
        }
        
        if ($bid['client_id'] !== $user['id'] && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Unauthorized action.'], 403);
        }
        
        if ($newStatus === 'accepted') {
            if ($bid['project_status'] !== 'open') {
                sendResponse(['success' => false, 'message' => 'Project is no longer open.'], 400);
            }
            
            // Check client balance
            $clientBalance = (float)$user['balance'];
            $bidAmount = (float)$bid['amount'];
            if ($clientBalance < $bidAmount) {
                sendResponse(['success' => false, 'message' => 'Insufficient funds. Please add ₹' . ($bidAmount - $clientBalance) . ' to award contract.'], 400);
            }
            
            // Deduct Client balance and award contract
            $db->beginTransaction();
            try {
                // Deduct client balance
                $stmt = $db->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
                $stmt->execute([$bidAmount, $user['id']]);
                
                // Update Project status
                $stmt = $db->prepare("UPDATE projects SET status = 'in_progress' WHERE id = ?");
                $stmt->execute([$bid['project_id']]);
                
                // Update Bid status
                $stmt = $db->prepare("UPDATE bids SET status = 'accepted' WHERE id = ?");
                $stmt->execute([$bidId]);
                
                // Reject all other bids for this project
                $stmt = $db->prepare("UPDATE bids SET status = 'rejected' WHERE project_id = ? AND id != ?");
                $stmt->execute([$bid['project_id'], $bidId]);
                
                // Create Contract
                $stmt = $db->prepare("INSERT INTO contracts (project_id, client_id, freelancer_id, budget, status, escrow_status) VALUES (?, ?, ?, ?, 'active', 'funded')");
                $stmt->execute([$bid['project_id'], $user['id'], $bid['freelancer_id'], $bidAmount]);
                $contractId = $db->lastInsertId();
                
                // Create Transaction logs
                $stmt = $db->prepare("INSERT INTO transactions (user_id, amount, type, contract_id, description) VALUES (?, ?, 'escrow_fund', ?, ?)");
                $stmt->execute([$user['id'], $bidAmount, $contractId, "Fund escrow for contract on project: " . $bid['project_title']]);
                
                // Create milestone (default full deliverable milestone)
                $stmt = $db->prepare("INSERT INTO milestones (contract_id, title, amount, status) VALUES (?, ?, ?, 'pending')");
                $stmt->execute([$contractId, 'Final Deliverable', $bidAmount]);
                
                $db->commit();
                sendResponse(['success' => true, 'message' => 'Bid accepted and contract active with funded escrow.', 'contractId' => $contractId]);
            } catch (Exception $ex) {
                $db->rollBack();
                sendResponse(['success' => false, 'message' => 'Error during award process: ' . $ex->getMessage()], 500);
            }
        } else {
            // Just update bid status to shortlisted or rejected
            $stmt = $db->prepare("UPDATE bids SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $bidId]);
            sendResponse(['success' => true, 'message' => 'Bid status updated to ' . $newStatus]);
        }
    }
    
    // ==========================================
    // 4. CONTRACTS & MILESTONES ENDPOINTS
    // ==========================================
    
    // GET /api/contracts
    elseif ($route === 'contracts' && $method === 'GET') {
        $user = requireAuth();
        
        if ($user['role'] === 'admin') {
            $stmt = $db->prepare("SELECT c.*, p.title AS project_title, cl.name AS client_name, fr.name AS freelancer_name 
                                  FROM contracts c 
                                  JOIN projects p ON c.project_id = p.id 
                                  JOIN users cl ON c.client_id = cl.id 
                                  JOIN users fr ON c.freelancer_id = fr.id 
                                  ORDER BY c.created_at DESC");
            $stmt->execute();
        } else {
            $stmt = $db->prepare("SELECT c.*, p.title AS project_title, cl.name AS client_name, fr.name AS freelancer_name 
                                  FROM contracts c 
                                  JOIN projects p ON c.project_id = p.id 
                                  JOIN users cl ON c.client_id = cl.id 
                                  JOIN users fr ON c.freelancer_id = fr.id 
                                  WHERE c.client_id = ? OR c.freelancer_id = ? 
                                  ORDER BY c.created_at DESC");
            $stmt->execute([$user['id'], $user['id']]);
        }
        $contracts = $stmt->fetchAll();
        
        foreach ($contracts as &$c) {
            $c['budget'] = (float)$c['budget'];
            
            // Get milestones for each contract
            $mStmt = $db->prepare("SELECT * FROM milestones WHERE contract_id = ?");
            $mStmt->execute([$c['id']]);
            $c['milestones'] = $mStmt->fetchAll();
            foreach ($c['milestones'] as &$m) {
                $m['amount'] = (float)$m['amount'];
            }
        }
        
        sendResponse(['success' => true, 'contracts' => $contracts]);
    }
    
    // POST /api/contracts (Direct award shortcut if needed)
    elseif ($route === 'contracts' && $method === 'POST') {
        $user = requireAuth();
        if ($user['role'] !== 'client') {
            sendResponse(['success' => false, 'message' => 'Only clients can create contracts.'], 403);
        }
        
        $projectId = $input['projectId'] ?? 0;
        $freelancerId = $input['freelancerId'] ?? 0;
        $budget = (float)($input['budget'] ?? 0);
        
        // Simply award contract directly
        $stmt = $db->prepare("SELECT * FROM projects WHERE id = ? AND client_id = ? AND status = 'open'");
        $stmt->execute([$projectId, $user['id']]);
        $project = $stmt->fetch();
        
        if (!$project) {
            sendResponse(['success' => false, 'message' => 'Project not found or not open.'], 400);
        }
        
        $clientBalance = (float)$user['balance'];
        if ($clientBalance < $budget) {
            sendResponse(['success' => false, 'message' => 'Insufficient funds.'], 400);
        }
        
        $db->beginTransaction();
        try {
            $stmt = $db->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
            $stmt->execute([$budget, $user['id']]);
            
            $stmt = $db->prepare("UPDATE projects SET status = 'in_progress' WHERE id = ?");
            $stmt->execute([$projectId]);
            
            $stmt = $db->prepare("INSERT INTO contracts (project_id, client_id, freelancer_id, budget, status, escrow_status) VALUES (?, ?, ?, ?, 'active', 'funded')");
            $stmt->execute([$projectId, $user['id'], $freelancerId, $budget]);
            $contractId = $db->lastInsertId();
            
            $stmt = $db->prepare("INSERT INTO transactions (user_id, amount, type, contract_id, description) VALUES (?, ?, 'escrow_fund', ?, ?)");
            $stmt->execute([$user['id'], $budget, $contractId, "Fund escrow for contract: " . $project['title']]);
            
            $stmt = $db->prepare("INSERT INTO milestones (contract_id, title, amount, status) VALUES (?, 'Full Scope Deliverable', ?, 'pending')");
            $stmt->execute([$contractId, $budget]);
            
            $db->commit();
            sendResponse(['success' => true, 'message' => 'Contract awarded and funded successfully.', 'contractId' => $contractId]);
        } catch (Exception $ex) {
            $db->rollBack();
            sendResponse(['success' => false, 'message' => 'Error: ' . $ex->getMessage()], 500);
        }
    }
    
    // PUT /api/contracts/:id/milestones (Add or update a milestone/milestones list)
    elseif (preg_match('/^contracts\/(\d+)\/milestones$/', $route, $matches) && $method === 'PUT') {
        $user = requireAuth();
        $contractId = $matches[1];
        
        // Verify owner
        $stmt = $db->prepare("SELECT * FROM contracts WHERE id = ?");
        $stmt->execute([$contractId]);
        $contract = $stmt->fetch();
        
        if (!$contract) {
            sendResponse(['success' => false, 'message' => 'Contract not found.'], 404);
        }
        if ($contract['client_id'] !== $user['id'] && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Unauthorized.'], 403);
        }
        
        // Milestones replacement list
        $milestones = $input['milestones'] ?? [];
        if (empty($milestones)) {
            sendResponse(['success' => false, 'message' => 'Milestones data required.'], 400);
        }
        
        // Sum check
        $total = 0;
        foreach ($milestones as $m) {
            $total += (float)($m['amount'] ?? 0);
        }
        if (abs($total - (float)$contract['budget']) > 0.01) {
            sendResponse(['success' => false, 'message' => 'Sum of milestones ($' . $total . ') must match total contract budget ($' . $contract['budget'] . ').'], 400);
        }
        
        $db->beginTransaction();
        try {
            // Delete old milestones if pending
            $stmt = $db->prepare("DELETE FROM milestones WHERE contract_id = ? AND status = 'pending'");
            $stmt->execute([$contractId]);
            
            foreach ($milestones as $m) {
                $stmt = $db->prepare("INSERT INTO milestones (contract_id, title, amount, status) VALUES (?, ?, ?, 'pending')");
                $stmt->execute([$contractId, trim($m['title']), (float)$m['amount']]);
            }
            
            $db->commit();
            sendResponse(['success' => true, 'message' => 'Milestones updated successfully.']);
        } catch (Exception $ex) {
            $db->rollBack();
            sendResponse(['success' => false, 'message' => 'Error updating milestones: ' . $ex->getMessage()], 500);
        }
    }
    
    // POST /api/contracts/:id/submit (Freelancer submits deliverable)
    elseif (preg_match('/^contracts\/(\d+)\/submit$/', $route, $matches) && $method === 'POST') {
        $user = requireAuth();
        $contractId = $matches[1];
        $milestoneId = (int)($input['milestoneId'] ?? 0);
        $deliverableUrl = trim($input['deliverableUrl'] ?? '');
        $submissionNotes = trim($input['submissionNotes'] ?? '');
        
        if (empty($deliverableUrl) || empty($submissionNotes) || $milestoneId <= 0) {
            sendResponse(['success' => false, 'message' => 'Deliverable link and details required.'], 400);
        }
        
        // Verify contract freelancer
        $stmt = $db->prepare("SELECT * FROM contracts WHERE id = ?");
        $stmt->execute([$contractId]);
        $contract = $stmt->fetch();
        
        if (!$contract) {
            sendResponse(['success' => false, 'message' => 'Contract not found.'], 404);
        }
        if ($contract['freelancer_id'] !== $user['id']) {
            sendResponse(['success' => false, 'message' => 'Only the assigned freelancer can submit work.'], 403);
        }
        
        // Verify milestone is pending
        $stmt = $db->prepare("SELECT * FROM milestones WHERE id = ? AND contract_id = ?");
        $stmt->execute([$milestoneId, $contractId]);
        $milestone = $stmt->fetch();
        if (!$milestone) {
            sendResponse(['success' => false, 'message' => 'Milestone not found.'], 404);
        }
        if ($milestone['status'] !== 'pending') {
            sendResponse(['success' => false, 'message' => 'Milestone already submitted or approved.'], 400);
        }
        
        // Update milestone submission
        $stmt = $db->prepare("UPDATE milestones SET status = 'submitted', deliverable_url = ?, submission_notes = ? WHERE id = ?");
        $stmt->execute([$deliverableUrl, $submissionNotes, $milestoneId]);
        
        sendResponse(['success' => true, 'message' => 'Deliverable submitted successfully.']);
    }
    
    // PUT /api/contracts/:id/approve (Client approves work and releases funds)
    elseif (preg_match('/^contracts\/(\d+)\/approve$/', $route, $matches) && $method === 'PUT') {
        $user = requireAuth();
        $contractId = $matches[1];
        $milestoneId = (int)($input['milestoneId'] ?? 0);
        
        if ($milestoneId <= 0) {
            sendResponse(['success' => false, 'message' => 'Milestone ID required.'], 400);
        }
        
        // Verify client or admin
        $stmt = $db->prepare("SELECT c.*, p.title AS project_title FROM contracts c JOIN projects p ON c.project_id = p.id WHERE c.id = ?");
        $stmt->execute([$contractId]);
        $contract = $stmt->fetch();
        
        if (!$contract) {
            sendResponse(['success' => false, 'message' => 'Contract not found.'], 404);
        }
        if ($contract['client_id'] !== $user['id'] && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Unauthorized.'], 403);
        }
        
        // Get milestone
        $stmt = $db->prepare("SELECT * FROM milestones WHERE id = ? AND contract_id = ?");
        $stmt->execute([$milestoneId, $contractId]);
        $milestone = $stmt->fetch();
        if (!$milestone) {
            sendResponse(['success' => false, 'message' => 'Milestone not found.'], 404);
        }
        if ($milestone['status'] !== 'submitted' && $user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Milestone has not been submitted for review yet.'], 400);
        }
        
        $db->beginTransaction();
        try {
            // Update milestone to approved
            $stmt = $db->prepare("UPDATE milestones SET status = 'approved' WHERE id = ?");
            $stmt->execute([$milestoneId]);
            
            // Release funds (Pay freelancer)
            $amount = (float)$milestone['amount'];
            
            // Credit freelancer balance
            $stmt = $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?");
            $stmt->execute([$amount, $contract['freelancer_id']]);
            
            // Log escrow release transaction for client (debit ledger log)
            $stmt = $db->prepare("INSERT INTO transactions (user_id, amount, type, contract_id, description) VALUES (?, ?, 'escrow_release', ?, ?)");
            $stmt->execute([$contract['client_id'], -$amount, $contractId, "Released escrow payment for milestone '" . $milestone['title'] . "' on project: " . $contract['project_title']]);
            
            // Log deposit/income transaction for freelancer
            $stmt = $db->prepare("INSERT INTO transactions (user_id, amount, type, contract_id, description) VALUES (?, ?, 'deposit', ?, ?)");
            $stmt->execute([$contract['freelancer_id'], $amount, $contractId, "Received payment for milestone '" . $milestone['title'] . "' on project: " . $contract['project_title']]);
            
            // Check if all milestones are approved
            $stmt = $db->prepare("SELECT COUNT(*) FROM milestones WHERE contract_id = ? AND status != 'approved'");
            $stmt->execute([$contractId]);
            $unapprovedCount = (int)$stmt->fetchColumn();
            
            if ($unapprovedCount === 0) {
                // Complete contract
                $stmt = $db->prepare("UPDATE contracts SET status = 'completed', escrow_status = 'released' WHERE id = ?");
                $stmt->execute([$contractId]);
                
                // Update project status to completed
                $stmt = $db->prepare("UPDATE projects SET status = 'completed' WHERE id = ?");
                $stmt->execute([$contract['project_id']]);
            }
            
            $db->commit();
            sendResponse(['success' => true, 'message' => 'Milestone approved and funds of ₹' . $amount . ' released successfully.']);
        } catch (Exception $ex) {
            $db->rollBack();
            sendResponse(['success' => false, 'message' => 'Error approving milestone: ' . $ex->getMessage()], 500);
        }
    }
    
    // ==========================================
    // 5. PAYMENTS & TRANSACTIONS
    // ==========================================
    
    // POST /api/payments/fund
    elseif ($route === 'payments/fund' && $method === 'POST') {
        $user = requireAuth();
        $amount = (float)($input['amount'] ?? 0);
        $cardDetails = $input['cardDetails'] ?? ''; // Mock Stripe detail string
        
        if ($amount <= 0) {
            sendResponse(['success' => false, 'message' => 'Payment amount must be greater than zero.'], 400);
        }
        
        $db->beginTransaction();
        try {
            // Update user balance
            $stmt = $db->prepare("UPDATE users SET balance = balance + ? WHERE id = ?");
            $stmt->execute([$amount, $user['id']]);
            
            // Record deposit transaction
            $stmt = $db->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'deposit', ?)");
            $stmt->execute([$user['id'], $amount, "Deposited funds via Stripe (Mock: **** **** **** " . substr($cardDetails, -4) . ")"]);
            
            $db->commit();
            
            // Fetch fresh balance
            $stmt = $db->prepare("SELECT balance FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $newBalance = (float)$stmt->fetchColumn();
            
            sendResponse([
                'success' => true,
                'message' => 'Funds of $' . $amount . ' added successfully.',
                'newBalance' => $newBalance
            ]);
        } catch (Exception $ex) {
            $db->rollBack();
            sendResponse(['success' => false, 'message' => 'Transaction failed: ' . $ex->getMessage()], 500);
        }
    }
    
    // POST /api/payments/withdraw
    elseif ($route === 'payments/withdraw' && $method === 'POST') {
        $user = requireAuth();
        $amount = (float)($input['amount'] ?? 0);
        $bankDetails = trim($input['bankDetails'] ?? '');
        
        if ($amount <= 0) {
            sendResponse(['success' => false, 'message' => 'Withdraw amount must be greater than zero.'], 400);
        }
        
        $balance = (float)$user['balance'];
        if ($balance < $amount) {
            sendResponse(['success' => false, 'message' => 'Insufficient balance for withdrawal.'], 400);
        }
        
        $db->beginTransaction();
        try {
            // Deduct user balance
            $stmt = $db->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
            $stmt->execute([$amount, $user['id']]);
            
            // Record withdrawal transaction
            $stmt = $db->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'withdrawal', ?)");
            $stmt->execute([$user['id'], -$amount, "Withdrawal to bank account (" . $bankDetails . ")"]);
            
            $db->commit();
            
            // Fetch fresh balance
            $stmt = $db->prepare("SELECT balance FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $newBalance = (float)$stmt->fetchColumn();
            
            sendResponse([
                'success' => true,
                'message' => 'Withdrawal of ₹' . $amount . ' processed successfully.',
                'newBalance' => $newBalance
            ]);
        } catch (Exception $ex) {
            $db->rollBack();
            sendResponse(['success' => false, 'message' => 'Withdrawal transaction failed: ' . $ex->getMessage()], 500);
        }
    }
    
    // GET /api/payments/history
    elseif ($route === 'payments/history' && $method === 'GET') {
        $user = requireAuth();
        
        if ($user['role'] === 'admin') {
            $stmt = $db->prepare("SELECT t.*, u.name AS user_name, u.email AS user_email 
                                  FROM transactions t 
                                  JOIN users u ON t.user_id = u.id 
                                  ORDER BY t.created_at DESC");
            $stmt->execute();
        } else {
            $stmt = $db->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$user['id']]);
        }
        $transactions = $stmt->fetchAll();
        
        foreach ($transactions as &$t) {
            $t['amount'] = (float)$t['amount'];
        }
        
        sendResponse(['success' => true, 'transactions' => $transactions]);
    }
    
    // ==========================================
    // 6. MESSAGING ENDPOINTS
    // ==========================================
    
    // GET /api/conversations
    elseif ($route === 'conversations' && $method === 'GET') {
        $user = requireAuth();
        
        // Find users that have exchanged messages with this user
        $sql = "SELECT DISTINCT u.id, u.name, u.email, u.role, u.is_verified 
                FROM users u
                JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
                WHERE (m.sender_id = :uid OR m.receiver_id = :uid) AND u.id != :uid";
                
        $stmt = $db->prepare($sql);
        $stmt->execute([':uid' => $user['id']]);
        $conversations = $stmt->fetchAll();
        
        foreach ($conversations as &$c) {
            $c['is_verified'] = (bool)$c['is_verified'];
            
            // Get latest message for summary
            $lmStmt = $db->prepare("SELECT message_text, created_at, sender_id 
                                    FROM messages 
                                    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
                                    ORDER BY created_at DESC LIMIT 1");
            $lmStmt->execute([$user['id'], $c['id'], $c['id'], $user['id']]);
            $c['latestMessage'] = $lmStmt->fetch() ?: null;
        }
        
        sendResponse(['success' => true, 'conversations' => $conversations]);
    }
    
    // GET /api/conversations/:id/messages
    elseif (preg_match('/^conversations\/(\d+)\/messages$/', $route, $matches) && $method === 'GET') {
        $user = requireAuth();
        $chatUserId = $matches[1];
        
        // Retrieve message history
        $stmt = $db->prepare("SELECT * FROM messages 
                              WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
                              ORDER BY created_at ASC");
        $stmt->execute([$user['id'], $chatUserId, $chatUserId, $user['id']]);
        $messages = $stmt->fetchAll();
        
        sendResponse(['success' => true, 'messages' => $messages]);
    }
    
    // POST /api/conversations/:id/messages
    elseif (preg_match('/^conversations\/(\d+)\/messages$/', $route, $matches) && $method === 'POST') {
        $user = requireAuth();
        $receiverId = $matches[1];
        $messageText = trim($input['message_text'] ?? '');
        
        if (empty($messageText)) {
            sendResponse(['success' => false, 'message' => 'Message text cannot be empty.'], 400);
        }
        
        // Verify receiver exists
        $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$receiverId]);
        if (!$stmt->fetch()) {
            sendResponse(['success' => false, 'message' => 'Recipient not found.'], 404);
        }
        
        $stmt = $db->prepare("INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $receiverId, $messageText]);
        $msgId = $db->lastInsertId();
        
        sendResponse([
            'success' => true,
            'message' => [
                'id' => $msgId,
                'sender_id' => $user['id'],
                'receiver_id' => $receiverId,
                'message_text' => $messageText,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ], 201);
    }
    
    // ==========================================
    // 7. REVIEWS & RATINGS ENDPOINTS
    // ==========================================
    
    // POST /api/reviews
    elseif ($route === 'reviews' && $method === 'POST') {
        $user = requireAuth();
        $projectId = (int)($input['project_id'] ?? 0);
        $revieweeId = (int)($input['reviewee_id'] ?? 0);
        $rating = (int)($input['rating'] ?? 0);
        $comment = trim($input['comment'] ?? '');
        
        if ($rating < 1 || $rating > 5 || $projectId <= 0 || $revieweeId <= 0) {
            sendResponse(['success' => false, 'message' => 'Valid project, rating (1-5), and reviewee required.'], 400);
        }
        
        // Verify project is completed and user participated in the contract
        $stmt = $db->prepare("SELECT * FROM contracts WHERE project_id = ? AND status = 'completed'");
        $stmt->execute([$projectId]);
        $contract = $stmt->fetch();
        
        if (!$contract) {
            sendResponse(['success' => false, 'message' => 'Reviews can only be posted for completed contracts.'], 400);
        }
        
        $isClient = ($contract['client_id'] === $user['id']);
        $isFreelancer = ($contract['freelancer_id'] === $user['id']);
        
        if (!$isClient && !$isFreelancer) {
            sendResponse(['success' => false, 'message' => 'You did not participate in this project contract.'], 403);
        }
        
        // Ensure reviewer is not reviewee
        if ($user['id'] === $revieweeId) {
            sendResponse(['success' => false, 'message' => 'You cannot review yourself.'], 400);
        }
        
        // Insert review
        $stmt = $db->prepare("INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$projectId, $user['id'], $revieweeId, $rating, $comment]);
        
        sendResponse(['success' => true, 'message' => 'Review submitted successfully.'], 201);
    }
    
    // GET /api/user/:id/reviews
    elseif (preg_match('/^user\/(\d+)\/reviews$/', $route, $matches) && $method === 'GET') {
        $revieweeId = $matches[1];
        
        $stmt = $db->prepare("SELECT r.*, u.name AS reviewer_name, p.title AS project_title 
                              FROM reviews r 
                              JOIN users u ON r.reviewer_id = u.id 
                              JOIN projects p ON r.project_id = p.id 
                              WHERE r.reviewee_id = ? 
                              ORDER BY r.created_at DESC");
        $stmt->execute([$revieweeId]);
        $reviews = $stmt->fetchAll();
        
        foreach ($reviews as &$r) {
            $r['rating'] = (int)$r['rating'];
        }
        
        sendResponse(['success' => true, 'reviews' => $reviews]);
    }
    
    // GET /api/reviews (Get all reviews)
    elseif ($route === 'reviews' && $method === 'GET') {
        $stmt = $db->prepare("SELECT r.*, u1.name AS reviewer_name, u2.name AS reviewee_name, p.title AS project_title 
                              FROM reviews r 
                              JOIN users u1 ON r.reviewer_id = u1.id 
                              JOIN users u2 ON r.reviewee_id = u2.id 
                              JOIN projects p ON r.project_id = p.id 
                              ORDER BY r.created_at DESC");
        $stmt->execute();
        $reviews = $stmt->fetchAll();
        
        foreach ($reviews as &$r) {
            $r['rating'] = (int)$r['rating'];
        }
        
        sendResponse(['success' => true, 'reviews' => $reviews]);
    }
    
    // GET /api/users/:id (Public profile detail)
    elseif (preg_match('/^users\/(\d+)$/', $route, $matches) && $method === 'GET') {
        $targetUserId = $matches[1];
        
        $stmt = $db->prepare("SELECT id, name, email, role, is_verified, bio, skills, portfolio, created_at FROM users WHERE id = ?");
        $stmt->execute([$targetUserId]);
        $targetUser = $stmt->fetch();
        
        if (!$targetUser) {
            sendResponse(['success' => false, 'message' => 'User not found.'], 404);
        }
        
        sendResponse(['success' => true, 'user' => $targetUser]);
    }
    
    // ==========================================
    // 8. ADMIN MODERATION & ANALYTICS ENDPOINTS
    // ==========================================
    
    // GET /api/admin/users
    elseif ($route === 'admin/users' && $method === 'GET') {
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Admin privileges required.'], 403);
        }
        
        $stmt = $db->prepare("SELECT id, name, email, role, is_verified, is_banned, balance, created_at FROM users WHERE role != 'admin' ORDER BY name ASC");
        $stmt->execute();
        $usersList = $stmt->fetchAll();
        
        foreach ($usersList as &$u) {
            $u['is_verified'] = (bool)$u['is_verified'];
            $u['is_banned'] = (bool)$u['is_banned'];
            $u['balance'] = (float)$u['balance'];
        }
        
        sendResponse(['success' => true, 'users' => $usersList]);
    }
    
    // PUT /api/admin/users/:id/verify
    elseif (preg_match('/^admin\/users\/(\d+)\/verify$/', $route, $matches) && $method === 'PUT') {
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Admin privileges required.'], 403);
        }
        
        $targetUserId = $matches[1];
        $verifyStatus = isset($input['verify']) ? (int)$input['verify'] : 1;
        
        $stmt = $db->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $stmt->execute([$verifyStatus, $targetUserId]);
        
        sendResponse(['success' => true, 'message' => 'User verification status updated.']);
    }
    
    // PUT /api/admin/users/:id/ban
    elseif (preg_match('/^admin\/users\/(\d+)\/ban$/', $route, $matches) && $method === 'PUT') {
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Admin privileges required.'], 403);
        }
        
        $targetUserId = $matches[1];
        $banStatus = isset($input['ban']) ? (int)$input['ban'] : 1;
        
        $stmt = $db->prepare("UPDATE users SET is_banned = ? WHERE id = ?");
        $stmt->execute([$banStatus, $targetUserId]);
        
        sendResponse(['success' => true, 'message' => 'User ban status updated.']);
    }
    
    // GET /api/admin/analytics
    elseif ($route === 'admin/analytics' && $method === 'GET') {
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendResponse(['success' => false, 'message' => 'Admin privileges required.'], 403);
        }
        
        // Total Users
        $totalUsers = $db->query("SELECT COUNT(*) FROM users WHERE role != 'admin'")->fetchColumn();
        $totalClients = $db->query("SELECT COUNT(*) FROM users WHERE role = 'client'")->fetchColumn();
        $totalFreelancers = $db->query("SELECT COUNT(*) FROM users WHERE role = 'freelancer'")->fetchColumn();
        
        // Total Projects
        $totalProjects = $db->query("SELECT COUNT(*) FROM projects")->fetchColumn();
        $openProjects = $db->query("SELECT COUNT(*) FROM projects WHERE status = 'open'")->fetchColumn();
        $activeProjects = $db->query("SELECT COUNT(*) FROM projects WHERE status = 'in_progress'")->fetchColumn();
        $completedProjects = $db->query("SELECT COUNT(*) FROM projects WHERE status = 'completed'")->fetchColumn();
        
        // Total budget volume in transactions (escrow totals)
        $totalEscrowed = $db->query("SELECT SUM(budget) FROM contracts WHERE status = 'active'")->fetchColumn() ?: 0.00;
        
        // Platform Fees (We model a 10% commission fee on all completed milestones)
        $totalReleased = $db->query("SELECT SUM(budget) FROM contracts WHERE status = 'completed'")->fetchColumn() ?: 0.00;
        $estimatedPlatformFees = $totalReleased * 0.10;
        
        sendResponse([
            'success' => true,
            'analytics' => [
                'users' => [
                    'total' => (int)$totalUsers,
                    'clients' => (int)$totalClients,
                    'freelancers' => (int)$totalFreelancers
                ],
                'projects' => [
                    'total' => (int)$totalProjects,
                    'open' => (int)$openProjects,
                    'active' => (int)$activeProjects,
                    'completed' => (int)$completedProjects
                ],
                'escrow' => [
                    'activeEscrow' => (float)$totalEscrowed,
                    'totalReleased' => (float)$totalReleased,
                    'platformEarnings' => (float)$estimatedPlatformFees
                ]
            ]
        ]);
    }
    
    // Endpoint not matched
    else {
        sendResponse(['success' => false, 'message' => 'API endpoint not found: ' . $method . ' ' . $route], 404);
    }

} catch (PDOException $e) {
    sendResponse([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ], 500);
} catch (Exception $e) {
    sendResponse([
        'success' => false,
        'message' => 'General error: ' . $e->getMessage()
    ], 500);
}
