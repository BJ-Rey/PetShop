-- 更新 users 表，添加 role 字段
-- Run this if you already have the database created

USE `cat_mall`;

-- Add role column (if not exists)
-- Note: This will fail if column already exists, which is fine
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色: user, merchant, admin' AFTER `phone`;

-- Update existing test users (if they exist)
-- Merchant accounts
UPDATE `users` SET `role` = 'merchant' WHERE `phone` = '18247122807';
UPDATE `users` SET `role` = 'merchant' WHERE `phone` = '13800138000';

-- User accounts
UPDATE `users` SET `role` = 'user' WHERE `phone` = '13848836315';

-- Verify updates
SELECT id, openid, nickname, phone, role FROM `users` 
WHERE `phone` IN ('18247122807', '13800138000', '13848836315');
