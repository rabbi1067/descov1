-- ==========================================================
-- DESCO Smart Prepaid Meter - Complete MySQL Database Schema
-- Database Name: desco1
-- Compatible with MySQL 8.0+ / MariaDB 10.5+
-- ==========================================================

-- Create Database (desco1)
CREATE DATABASE IF NOT EXISTS `desco1`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `desco1`;

-- Drop previous tables if existing (in correct constraint order)
DROP TABLE IF EXISTS `alert_dispatches`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `recharge_history`;
DROP TABLE IF EXISTS `balance_history`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `meters`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `smtp_configs`;
DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------
-- 1. Users Table
-- Supports Multi-Consumer, Operator Admin, and Permanent Root Super Admin
-- ----------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL COMMENT 'Full name of user',
  `email` VARCHAR(150) NOT NULL UNIQUE COMMENT 'Unique email address',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  `role` ENUM('super_admin', 'admin', 'user') NOT NULL DEFAULT 'user' COMMENT 'User role for RBAC',
  `position` VARCHAR(100) DEFAULT NULL COMMENT 'Official designation',
  `phone` VARCHAR(30) DEFAULT NULL COMMENT 'Contact telephone number',
  `address` TEXT DEFAULT NULL COMMENT 'Consumer postal address',
  `avatar` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active' COMMENT 'Account governance status',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User directory and administrative accounts';

-- ----------------------------------------------------------
-- 2. Prepaid Meters Table
-- Multi-Meter per user with individual custom alert thresholds
-- ----------------------------------------------------------
CREATE TABLE `meters` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL COMMENT 'Foreign key to users.id',
  `user_email` VARCHAR(150) NOT NULL COMMENT 'Owner notification email',
  `name` VARCHAR(150) NOT NULL COMMENT 'Descriptive meter name or unit (e.g. Flat 4B)',
  `meter_number` VARCHAR(50) NOT NULL COMMENT 'DESCO physical meter number',
  `account_number` VARCHAR(50) NOT NULL COMMENT 'DESCO consumer account number',
  `current_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Current balance in BDT',
  
  -- Individual custom thresholds per meter
  `low_threshold` DECIMAL(10, 2) NOT NULL DEFAULT 300.00 COMMENT 'Low balance warning threshold in BDT (e.g., 200 or 300)',
  `critical_threshold` DECIMAL(10, 2) NOT NULL DEFAULT 100.00 COMMENT 'Critical alert threshold in BDT (e.g., 100 or 80)',
  `emergency_threshold` DECIMAL(10, 2) NOT NULL DEFAULT 50.00 COMMENT 'Cut-off danger threshold in BDT',
  
  `notification_email` VARCHAR(150) NOT NULL COMMENT 'Alert destination email',
  `notification_phone` VARCHAR(30) DEFAULT NULL COMMENT 'SMS destination number',
  `auto_email_alert` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Enable automated email alerts',
  `last_alert_type` ENUM('none', 'low', 'critical', 'emergency') NOT NULL DEFAULT 'none' COMMENT 'Last dispatched urgency',
  `last_alert_sent_at` DATETIME DEFAULT NULL COMMENT 'Timestamp of last alert sent',
  
  `tariff_type` VARCHAR(100) NOT NULL DEFAULT 'LT-A (Residential Single Phase)' COMMENT 'Tariff classification',
  `sanctioned_load` VARCHAR(50) NOT NULL DEFAULT '3.0 kW' COMMENT 'Sanctioned grid load',
  `status` ENUM('healthy', 'low', 'critical') NOT NULL DEFAULT 'healthy' COMMENT 'Live operational status',
  `last_updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Last gateway synchronization',
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_meter_number` (`meter_number`),
  INDEX `idx_meters_user_id` (`user_id`),
  INDEX `idx_meters_account_no` (`account_number`),
  INDEX `idx_meters_status` (`status`),
  CONSTRAINT `fk_meters_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Prepaid meters and multi-threshold parameters';

-- ----------------------------------------------------------
-- 3. Balance History Snapshots Table
-- Snapshots logged on every telemetry reading for analytics
-- ----------------------------------------------------------
CREATE TABLE `balance_history` (
  `id` VARCHAR(64) NOT NULL,
  `meter_id` VARCHAR(64) NOT NULL,
  `reading_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Reading date and time',
  `balance` DECIMAL(10, 2) NOT NULL COMMENT 'Balance reading in BDT',
  `consumption` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Estimated consumption since last reading',
  `is_recharge` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indicates if reading detected a recharge',
  `recharge_amount` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Recharge value in BDT',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_history_meter_date` (`meter_id`, `reading_date`),
  CONSTRAINT `fk_history_meter` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Meter telemetry snapshots and history';

-- ----------------------------------------------------------
-- 4. Alert Dispatches Ledger
-- Persistent audit log of all automated email dispatches
-- ----------------------------------------------------------
CREATE TABLE `alert_dispatches` (
  `id` VARCHAR(64) NOT NULL,
  `meter_id` VARCHAR(64) NOT NULL,
  `meter_number` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `recipient_email` VARCHAR(150) NOT NULL COMMENT 'Destination recipient address',
  `alert_type` ENUM('low_balance', 'critical', 'emergency') NOT NULL COMMENT 'Alert level',
  `balance_at_trigger` DECIMAL(10, 2) NOT NULL COMMENT 'Balance when alert triggered',
  `threshold_value` DECIMAL(10, 2) NOT NULL COMMENT 'Configured threshold breached',
  `subject` VARCHAR(255) NOT NULL COMMENT 'Email subject header',
  `delivery_status` ENUM('sent', 'failed', 'simulated') NOT NULL DEFAULT 'sent' COMMENT 'SMTP delivery status',
  `error_details` TEXT DEFAULT NULL COMMENT 'Error message if failed',
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Precise timestamp of dispatch',
  PRIMARY KEY (`id`),
  INDEX `idx_dispatch_meter` (`meter_id`),
  INDEX `idx_dispatch_user` (`user_id`),
  INDEX `idx_dispatch_sent_at` (`sent_at`),
  CONSTRAINT `fk_dispatch_meter` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dispatch_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit ledger of dispatched alert notifications';

-- ----------------------------------------------------------
-- 5. In-App Notifications Table
-- Rendered in the notification center for users
-- ----------------------------------------------------------
CREATE TABLE `notifications` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `meter_id` VARCHAR(64) DEFAULT NULL,
  `type` ENUM('low_balance', 'critical', 'recovery', 'weekly_summary', 'system') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user_unread` (`user_id`, `is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Consumer and staff in-app notifications';

-- ----------------------------------------------------------
-- 6. Recharge History Ledger
-- Records prepaid token recharges and payment gateways
-- ----------------------------------------------------------
CREATE TABLE `recharge_history` (
  `id` VARCHAR(64) NOT NULL,
  `meter_id` VARCHAR(64) NOT NULL,
  `meter_number` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `transaction_id` VARCHAR(100) NOT NULL UNIQUE,
  `payment_method` ENUM('bKash', 'Nagad', 'Rocket', 'Card', 'Bank') NOT NULL DEFAULT 'bKash',
  `status` ENUM('success', 'pending', 'failed') NOT NULL DEFAULT 'success',
  `balance_after` DECIMAL(10, 2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_recharge_meter` (`meter_id`),
  CONSTRAINT `fk_recharge_meter` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Prepaid token recharge transactions';

-- ----------------------------------------------------------
-- 7. Outgoing SMTP Gateway Configuration
-- ----------------------------------------------------------
CREATE TABLE `smtp_configs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `sender_name` VARCHAR(150) NOT NULL DEFAULT 'DESCO Smart Balance Alert',
  `sender_email` VARCHAR(150) NOT NULL DEFAULT 'notifications@desco.org.bd',
  `smtp_host` VARCHAR(150) NOT NULL DEFAULT 'smtp.mailgun.org',
  `smtp_port` INT NOT NULL DEFAULT 587,
  `smtp_user` VARCHAR(150) NOT NULL DEFAULT 'postmaster@desco.org.bd',
  `smtp_password` VARCHAR(255) NOT NULL DEFAULT 'smtp_secret_password',
  `use_tls` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SMTP relay gateway credentials';

-- ----------------------------------------------------------
-- 8. Audit & Telemetry Logs
-- ----------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `actor_name` VARCHAR(150) NOT NULL,
  `actor_email` VARCHAR(150) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Security audit trail and automated scan logs';

-- ----------------------------------------------------------
-- 9. Consumer Support Reports and Inquiries
-- ----------------------------------------------------------
CREATE TABLE `reports` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(150) NOT NULL,
  `user_email` VARCHAR(150) NOT NULL,
  `meter_number` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('pending', 'in_progress', 'resolved') NOT NULL DEFAULT 'pending',
  `resolution_notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_reports_status` (`status`),
  CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Customer support inquiries';

-- ==========================================================
-- Seed Data: 3 Accounts (User, Admin, Super Admin)
-- Default Password for all: "123456"
-- ==========================================================

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `position`, `phone`, `address`, `avatar`, `status`, `created_at`) VALUES
-- 1. Citizen Consumer (owns the smart meter)
('usr-consumer-01', 'Tanzil Ahmed', 'user@desco.com', '$2b$12$e88K9G7vUvG816z9y7J8t.ZfI38w6k2h/f5Nl8rJp8C3uX0aQdJre', 'user', 'Residential Citizen Consumer', '+880 1712-345678', 'House 14, Road 7, Sector 4, Uttara, Dhaka-1230', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'active', NOW()),

-- 2. Operations Admin (Grid operations staff - NO consumer meters)
('usr-admin-01', 'Engr. Mahmudul Hasan', 'admin@desco.com', '$2b$12$e88K9G7vUvG816z9y7J8t.ZfI38w6k2h/f5Nl8rJp8C3uX0aQdJre', 'admin', 'Divisional Grid Operations Officer', '+880 1715-998877', 'DESCO Zone Operations Center, Mirpur-10, Dhaka', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'active', NOW()),

-- 3. Permanent Non-Deletable Root Super Admin (Executive controller - NO consumer meters)
('usr-super-root', 'Fazley Rabbi', 'fazlerabbii2000@gmail.com', '$2b$12$e88K9G7vUvG816z9y7J8t.ZfI38w6k2h/f5Nl8rJp8C3uX0aQdJre', 'super_admin', 'Chief Systems Administrator & Grid Controller', '+880 1700-000000', 'DESCO Corporate Headquarters, Nikunja-2, Dhaka', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'active', NOW());

-- ----------------------------------------------------------
-- Seed Meters (Assigned EXCLUSIVELY to Citizen Consumer usr-consumer-01)
-- ----------------------------------------------------------
INSERT INTO `meters` (`id`, `user_id`, `user_email`, `name`, `meter_number`, `account_number`, `current_balance`, `low_threshold`, `critical_threshold`, `emergency_threshold`, `notification_email`, `tariff_type`, `sanctioned_load`, `status`, `last_updated`) VALUES
('mtr-001', 'usr-consumer-01', 'user@desco.com', 'Uttara Residence Main Meter', '066120003770', '21000736', 78.18, 300.00, 100.00, 50.00, 'user@desco.com', 'LT-A (Residential Single Phase)', '5.0 kW', 'critical', NOW());

-- Seed SMTP Relay Gateway Config
INSERT INTO `smtp_configs` (`id`, `sender_name`, `sender_email`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_password`, `use_tls`, `is_active`) VALUES
(1, 'DESCO Smart Balance Alert', 'notifications@desco.org.bd', 'smtp.mailgun.org', 587, 'postmaster@notifications.desco.org.bd', 'relay_secret_token_123', 1, 1);
