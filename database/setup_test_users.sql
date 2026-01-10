-- 设置测试账号数据
-- 验证码 123456 (在代码逻辑中硬编码，此处仅配置数据库记录)

USE `cat_mall`;

-- ==========================================
-- 1. 配置商家账号
-- ==========================================

-- 1.1 商家账号: 18247122807
-- 插入商家记录
INSERT INTO `merchants` (`name`, `phone`, `address`, `logo`, `rating`, `created_at`)
SELECT '测试商家店铺', '18247122807', '测试商家地址888号', 'https://placehold.co/200x200/2196F3/ffffff?text=Merchant', 5.0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM `merchants` WHERE `phone` = '18247122807');

-- 插入关联的用户记录 (用于登录) - 包含 role 字段
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `role`, `created_at`)
SELECT 'openid_merchant_18247', '测试商家', 'https://placehold.co/100x100/FF5722/ffffff?text=Merchant', '18247122807', 'merchant', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '18247122807');

-- 确保已存在的用户 role 为 merchant
UPDATE `users` SET `role` = 'merchant' WHERE `phone` = '18247122807';

-- 1.2 商家账号: 13800138000 (常用测试号)
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `role`, `created_at`)
SELECT 'openid_13800138000', '测试商家A', 'https://placehold.co/100x100/9C27B0/ffffff?text=MA', '13800138000', 'merchant', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '13800138000');

-- 确保已存在的用户 role 为 merchant
UPDATE `users` SET `role` = 'merchant' WHERE `phone` = '13800138000';

-- ==========================================
-- 2. 配置普通用户账号
-- ==========================================

-- 2.1 普通用户账号: 13848836315
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `role`, `created_at`)
SELECT 'openid_user_13848', '测试用户', 'https://placehold.co/100x100/4CAF50/ffffff?text=User', '13848836315', 'user', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '13848836315');

-- 确保已存在的用户 role 为 user
UPDATE `users` SET `role` = 'user' WHERE `phone` = '13848836315';

-- ==========================================
-- 3. 验证配置
-- ==========================================
-- 查看测试账号配置结果
SELECT id, openid, nickname, phone, role FROM `users` 
WHERE `phone` IN ('18247122807', '13800138000', '13848836315');
