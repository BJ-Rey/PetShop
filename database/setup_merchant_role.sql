-- =================================================================
-- 商家角色配置脚本 (Merchant Role Setup Script)
-- =================================================================
-- 说明：
-- 1. 本脚本用于配置商家测试账号的 role 字段
-- 2. 确保测试手机号对应的用户 role 为 'merchant'
-- 3. 支持多个测试手机号
-- 4. 验证码在代码中硬编码为 123456
-- =================================================================

USE `cat_mall`;

-- ==========================================
-- 1. 确保 role 字段存在
-- ==========================================
-- 如果 role 字段不存在，添加它（兼容旧数据库）
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'cat_mall' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'role'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `role` VARCHAR(20) DEFAULT ''user'' COMMENT ''角色: user, merchant, admin'' AFTER `phone`',
    'SELECT ''role column already exists'''
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==========================================
-- 2. 配置商家测试账号
-- ==========================================

-- 2.1 主要测试商家账号: 13800138000
-- 如果用户不存在，先创建
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `role`, `created_at`)
SELECT 'openid_13800138000', '测试商家A', 'https://placehold.co/100x100/FF5722/ffffff?text=MA', '13800138000', 'merchant', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '13800138000');

-- 如果用户已存在，更新 role 为 merchant
UPDATE `users` SET `role` = 'merchant' WHERE `phone` = '13800138000';

-- 2.2 备用测试商家账号: 18247122807
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `role`, `created_at`)
SELECT 'openid_merchant_18247', '测试商家B', 'https://placehold.co/100x100/9C27B0/ffffff?text=MB', '18247122807', 'merchant', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '18247122807');

UPDATE `users` SET `role` = 'merchant' WHERE `phone` = '18247122807';

-- ==========================================
-- 3. 配置普通用户测试账号
-- ==========================================

-- 3.1 主要测试用户账号: 13848836315
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `role`, `created_at`)
SELECT 'openid_user_13848', '测试用户A', 'https://placehold.co/100x100/4CAF50/ffffff?text=UA', '13848836315', 'user', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '13848836315');

UPDATE `users` SET `role` = 'user' WHERE `phone` = '13848836315';

-- ==========================================
-- 4. 验证配置结果
-- ==========================================
SELECT 
    id,
    openid,
    nickname,
    phone,
    role,
    created_at
FROM `users` 
WHERE `phone` IN ('13800138000', '18247122807', '13848836315')
ORDER BY `role` DESC, `phone`;

-- ==========================================
-- 5. 显示所有商家用户
-- ==========================================
SELECT 
    id,
    openid,
    nickname,
    phone,
    role
FROM `users` 
WHERE `role` = 'merchant';

-- =================================================================
-- 脚本执行结束
-- 预期结果：
-- - 13800138000 -> role = 'merchant'
-- - 18247122807 -> role = 'merchant'
-- - 13848836315 -> role = 'user'
-- =================================================================
