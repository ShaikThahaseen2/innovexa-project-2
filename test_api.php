<?php
// test_api.php - Validate the backend API endpoints

$baseUrl = 'http://127.0.0.1/full%20stack%20project%202/api';

echo "Testing Innovexa Freelance Marketplace API...\n";

// Helper to make requests
function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $options = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", array_merge([
                'Content-Type: application/json',
                'User-Agent: PHP-Test-Client'
            ], $headers)),
            'ignore_errors' => true
        ]
    ];
    if ($data !== null) {
        $options['http']['content'] = json_encode($data);
    }
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    // Parse status code
    $statusCode = 0;
    if (isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('/HTTP\/\d\.\d\s(\d+)/', $header, $matches)) {
                $statusCode = intval($matches[1]);
                break;
            }
        }
    }
    
    return [
        'status' => $statusCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

// Test 1: Fetch open projects (Public Endpoint)
echo "\nTest 1: GET /projects (Fetch public projects list)... ";
$res = makeRequest($baseUrl . '/projects');
if ($res['status'] === 200 && isset($res['body']['success']) && $res['body']['success'] === true) {
    echo "SUCCESS!\n";
    echo "Found " . count($res['body']['projects']) . " projects.\n";
    foreach ($res['body']['projects'] as $p) {
        echo "  - ID {$p['id']}: {$p['title']} (Budget: ₹{$p['budget']}) - Status: {$p['status']}\n";
    }
} else {
    echo "FAILED! Status: " . $res['status'] . "\n";
    echo "Response: " . $res['raw'] . "\n";
}

// Test 2: Login (Authenticate client user)
echo "\nTest 2: POST /auth/login (Client Authentication)... ";
$loginData = [
    'email' => 'john@example.com',
    'password' => 'password123'
];
$res = makeRequest($baseUrl . '/auth/login', 'POST', $loginData);
$accessToken = '';
if ($res['status'] === 200 && isset($res['body']['accessToken'])) {
    echo "SUCCESS!\n";
    $accessToken = $res['body']['accessToken'];
    echo "Logged in user: " . $res['body']['user']['name'] . " (Role: " . $res['body']['user']['role'] . ")\n";
} else {
    echo "FAILED! Status: " . $res['status'] . "\n";
    echo "Response: " . $res['raw'] . "\n";
}

// Test 3: Authenticated Request GET /auth/me
if ($accessToken) {
    echo "\nTest 3: GET /auth/me (Authenticated profile fetch)... ";
    $res = makeRequest($baseUrl . '/auth/me', 'GET', null, ["Authorization: Bearer $accessToken"]);
    if ($res['status'] === 200 && isset($res['body']['user'])) {
        echo "SUCCESS!\n";
        echo "Profile Name: " . $res['body']['user']['name'] . " (Verified: " . ($res['body']['user']['is_verified'] ? 'Yes' : 'No') . ")\n";
    } else {
        echo "FAILED! Status: " . $res['status'] . "\n";
        echo "Response: " . $res['raw'] . "\n";
    }
} else {
    echo "\nSkipping Test 3 due to login failure.\n";
}

// Test 4: Freelancer login & Payout withdrawal
echo "\nTest 4: Freelancer Payout Withdrawal... ";
$freelancerLogin = [
    'email' => 'jane@example.com',
    'password' => 'password123'
];
$loginRes = makeRequest($baseUrl . '/auth/login', 'POST', $freelancerLogin);
if ($loginRes['status'] === 200 && isset($loginRes['body']['accessToken'])) {
    $flToken = $loginRes['body']['accessToken'];
    $oldBalance = $loginRes['body']['user']['balance'];
    
    // Withdraw $10.00
    $withdrawData = [
        'amount' => 10.00,
        'bankDetails' => 'Chase Bank - US9876543210'
    ];
    $withdrawRes = makeRequest($baseUrl . '/payments/withdraw', 'POST', $withdrawData, ["Authorization: Bearer $flToken"]);
    
    if ($withdrawRes['status'] === 200 && $withdrawRes['body']['success'] === true) {
        echo "SUCCESS!\n";
        echo "  - Original Balance: ₹{$oldBalance}\n";
        echo "  - Fresh Balance: ₹{$withdrawRes['body']['newBalance']}\n";
        echo "  - Details: {$withdrawRes['body']['message']}\n";
    } else {
        echo "FAILED! Status: " . $withdrawRes['status'] . "\n";
        echo "Response: " . $withdrawRes['raw'] . "\n";
    }
} else {
    echo "FAILED! (Could not login as freelancer)\n";
}

