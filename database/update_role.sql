-- 更新 users 表，添加 role 字段
-- Run this if you already have the database created

USE `cat_mall`;

-- Add role column
ALTER TABLE `users` ADD COLUMN `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色: user, merchant, admin' AFTER `phone`;

-- Update existing test users (if they exist)
-- Merchant (18247122807)
UPDATE `users` SET `role` = 'merchant' WHERE `phone` = '18247122807';

-- User (13848836315)
UPDATE `users` SET `role` = 'user' WHERE `phone` = '13848836315';
