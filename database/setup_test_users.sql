-- 设置测试账号数据
-- 验证码 123456 (在代码逻辑中硬编码，此处仅配置数据库记录)

USE `cat_mall`;

-- 1. 配置商家账号: 18247122807
-- 插入商家记录
INSERT INTO `merchants` (`name`, `phone`, `address`, `logo`, `rating`, `created_at`)
SELECT '测试商家店铺', '18247122807', '测试商家地址888号', 'https://placehold.co/200x200/2196F3/ffffff?text=Merchant', 5.0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM `merchants` WHERE `phone` = '18247122807');

-- 插入关联的用户记录 (用于登录)
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `created_at`)
SELECT 'openid_merchant_18247', '测试商家', 'https://placehold.co/100x100/FF5722/ffffff?text=Merchant', '18247122807', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '18247122807');


-- 2. 配置普通用户账号: 13848836315
-- 插入用户记录
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `created_at`)
SELECT 'openid_user_13848', '测试用户', 'https://placehold.co/100x100/4CAF50/ffffff?text=User', '13848836315', NOW()
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `phone` = '13848836315');
