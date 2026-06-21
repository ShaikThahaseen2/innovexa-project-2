-- Create database if not exists
CREATE DATABASE IF NOT EXISTS innovexa_db;
USE innovexa_db;

-- Temporarily disable foreign key checks to safely rebuild the schema
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS courses;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'freelancer', 'admin') NOT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    is_banned TINYINT(1) DEFAULT 0,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    bio TEXT,
    skills TEXT, -- Comma-separated list (e.g. "React,Tailwind CSS,PHP")
    portfolio TEXT, -- JSON array of items or simple text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Projects Table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    skills TEXT, -- Comma-separated list (e.g. "React,Tailwind CSS")
    deadline DATE NOT NULL,
    client_id INT NOT NULL,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bids Table
CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    delivery_days INT NOT NULL,
    cover_letter TEXT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'shortlisted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Contracts Table
CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    client_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'completed', 'disputed') DEFAULT 'active',
    escrow_status ENUM('funded', 'released', 'refunded') DEFAULT 'funded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Milestones Table
CREATE TABLE milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'submitted', 'approved') DEFAULT 'pending',
    deliverable_url VARCHAR(255) DEFAULT NULL,
    submission_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Reviews Table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT NOT NULL, -- 1 to 5
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Transactions Table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('deposit', 'withdrawal', 'escrow_fund', 'escrow_release', 'escrow_refund') NOT NULL,
    contract_id INT DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Sample Data

-- Seed Users: Passwords are all hashed bcrypt for "password123"
INSERT INTO users (id, name, email, password_hash, role, is_verified, balance, bio, skills, portfolio) VALUES
(1, 'John Doe', 'john@example.com', '$2y$10$uIrxhKXl8FRWzMtCDzfpsuBF9wBluRf9t9ZoLBlDk324rdWKJsxxq', 'client', 1, 10000.00, 'Project Manager at TechCorp. Hiring top developers for digital products.', NULL, NULL),
(2, 'Jane Smith', 'jane@example.com', '$2y$10$uIrxhKXl8FRWzMtCDzfpsuBF9wBluRf9t9ZoLBlDk324rdWKJsxxq', 'freelancer', 1, 310.00, 'Senior Frontend Engineer specializing in React, Tailwind, and high-performance SPAs.', 'React,Tailwind CSS,JavaScript,TypeScript,HTML5,CSS3', 'https://github.com/janesmith'),
(3, 'Admin User', 'admin@example.com', '$2y$10$uIrxhKXl8FRWzMtCDzfpsuBF9wBluRf9t9ZoLBlDk324rdWKJsxxq', 'admin', 1, 0.00, 'Innovexa Catalyst Marketplace Administrator.', NULL, NULL);

-- Seed Projects
INSERT INTO projects (id, title, description, budget, category, skills, deadline, client_id, status) VALUES
(1, 'Build a React Dashboard', 'We need a highly responsive dashboard with stats, graphs, user tables, and clean layout built using React and Tailwind CSS.', 1200.00, 'Web Development', 'React,Tailwind CSS', '2024-06-30', 1, 'open'),
(2, 'Create Marketing Landing Page', 'Build a premium responsive landing page using HTML, CSS, and vanilla JS. Must look outstanding.', 400.00, 'Web Design', 'HTML,CSS,JavaScript', '2024-07-15', 1, 'open');

-- Seed Bids
INSERT INTO bids (id, project_id, freelancer_id, amount, delivery_days, cover_letter, status) VALUES
(1, 1, 2, 1100.00, 10, 'I can do this quickly with high quality and custom animations.', 'pending');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
