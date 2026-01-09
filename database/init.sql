-- 初始化数据库脚本 (Initialize Database Script)
-- 对应部署指南中的 "创建数据表" 步骤

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `cat_mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cat_mall`;

-- ==========================================
-- 1. 表结构定义 (Table Schema Definitions)
-- ==========================================

-- 1.1 商家表 (Merchants)
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '商家ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商家名称',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `address` VARCHAR(255) COMMENT '商家地址',
  `logo` VARCHAR(255) COMMENT '商家Logo URL',
  `rating` DECIMAL(2,1) DEFAULT 5.0 COMMENT '商家评分',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_merchants_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家信息表';

-- 1.2 用户表 (Users) - 新增
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信OpenID',
  `nickname` VARCHAR(64) COMMENT '用户昵称',
  `avatar_url` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色: user, merchant, admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 1.3 地址表 (Addresses) - 新增
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '地址ID',
  `openid` VARCHAR(64) NOT NULL COMMENT '关联用户OpenID',
  `name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '收货人电话',
  `address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认地址',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_addresses_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

-- 1.4 宠物表 (Pets)
CREATE TABLE IF NOT EXISTS `pets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '宠物ID',
  `name` VARCHAR(100) NOT NULL COMMENT '宠物昵称',
  `breed` VARCHAR(50) COMMENT '品种',
  `age` VARCHAR(20) COMMENT '年龄',
  `gender` ENUM('male', 'female') DEFAULT 'male' COMMENT '性别',
  `price` DECIMAL(10,2) NOT NULL COMMENT '全款价格',
  `deposit` DECIMAL(10,2) NOT NULL COMMENT '定金价格',
  `status` ENUM('available', 'booked', 'sold') DEFAULT 'available' COMMENT '状态: 可预订/已定/已售',
  `description` TEXT COMMENT '详细描述',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `health_status` VARCHAR(50) DEFAULT '健康' COMMENT '健康状况',
  `merchant_id` INT COMMENT '所属商家ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE SET NULL,
  INDEX `idx_pets_status` (`status`),
  INDEX `idx_pets_breed` (`breed`),
  INDEX `idx_pets_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物商品表';

-- 1.5 商品表 (Products)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `category` VARCHAR(50) COMMENT '分类(food, toy, etc.)',
  `price` DECIMAL(10,2) NOT NULL COMMENT '现价',
  `original_price` DECIMAL(10,2) COMMENT '原价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `rating` DECIMAL(2,1) DEFAULT 5.0 COMMENT '评分',
  `image` VARCHAR(255) COMMENT '商品图片URL',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_category` (`category`),
  INDEX `idx_products_sales` (`sales`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='普通商品表';

-- 1.6 服务表 (Services)
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '服务ID',
  `name` VARCHAR(100) NOT NULL COMMENT '服务名称',
  `category` VARCHAR(50) COMMENT '分类',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `duration` VARCHAR(50) COMMENT '服务时长',
  `description` TEXT COMMENT '服务描述',
  `merchant_name` VARCHAR(100) COMMENT '商家名称(冗余)',
  `merchant_id` INT COMMENT '关联商家ID',
  `image` VARCHAR(255) COMMENT '服务图片URL',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `rating` DECIMAL(2,1) DEFAULT 5.0 COMMENT '评分',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_services_category` (`category`),
  INDEX `idx_services_merchant_id` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务项目表';

-- 1.7 订单表 (Orders)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户OpenID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总额',
  `status` ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
  `items_json` TEXT COMMENT '订单项JSON数据(冗余)',
  `address_snapshot` TEXT COMMENT '地址快照',
  `tracking_number` VARCHAR(64) COMMENT '快递单号',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_user_id` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 1.8 订单项表 (Order Items) - 新增
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL COMMENT '关联订单ID',
  `product_id` INT COMMENT '商品ID',
  `product_name` VARCHAR(100) COMMENT '商品名称快照',
  `price` DECIMAL(10,2) NOT NULL COMMENT '购买单价',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '购买数量',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '总价',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  INDEX `idx_order_items_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品明细表';

-- ==========================================
-- 2. 存储过程与函数 (Stored Procedures)
-- ==========================================

DELIMITER //

-- 2.1 统计商家总销售额
DROP PROCEDURE IF EXISTS `sp_get_merchant_sales` //
CREATE PROCEDURE `sp_get_merchant_sales`(IN m_id INT, OUT total_sales DECIMAL(10,2))
BEGIN
    -- 这是一个示例，实际逻辑可能需要关联 order_items 和 products/services
    -- 这里简单统计 services 表中的 sales * price (假设 sales 是销量)
    SELECT SUM(price * sales) INTO total_sales FROM services WHERE merchant_id = m_id;
END //

DELIMITER ;

-- ==========================================
-- 3. 导入测试数据 (Import Mock Data)
-- ==========================================

-- 1. Merchants Data
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (1, '上海萌宠犬舍1号店', '13862268059', '武汉朝阳区街道120号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo1', 4.7, '2024-09-15 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (2, '杭州宝贝宠物会所2号店', '13886709910', '武汉海淀区街道980号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo2', 5.0, '2024-03-12 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (3, '西安爱心宠物会所3号店', '13858393690', '西安天河区街道955号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo3', 4.1, '2024-03-29 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (4, '成都星空猫舍4号店', '13812579111', '武汉朝阳区街道23号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo4', 4.7, '2024-08-03 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (5, '深圳森林犬舍5号店', '13845046333', '北京武侯区街道844号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo5', 4.7, '2025-01-04 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (6, '武汉森林猫舍6号店', '13842506457', '西安武侯区街道47号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo6', 4.7, '2024-02-13 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (7, '北京蓝天猫舍7号店', '13853863622', '广州天河区街道918号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo7', 4.9, '2024-06-16 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (8, '广州森林猫舍8号店', '13855567643', '西安浦东新区街道239号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo8', 5.0, '2024-10-22 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (9, '武汉宝贝宠物乐园9号店', '13817982953', '深圳武侯区街道113号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo9', 4.1, '2024-10-17 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (10, '上海月亮犬舍10号店', '13858268202', '上海浦东新区街道865号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo10', 4.3, '2025-07-22 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (11, '武汉海洋宠物会所11号店', '13870689968', '成都朝阳区街道316号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo11', 4.8, '2024-03-26 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (12, '杭州海洋宠物医院12号店', '13829812575', '武汉海淀区街道598号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo12', 4.6, '2024-06-06 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (13, '北京星空犬舍13号店', '13864455868', '武汉海淀区街道897号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo13', 4.6, '2025-12-27 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (14, '上海蓝天宠物会所14号店', '13842213366', '杭州浦东新区街道36号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo14', 4.9, '2025-01-16 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (15, '成都宝贝宠物店15号店', '13811542474', '深圳浦东新区街道168号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo15', 4.2, '2025-07-11 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (16, '成都蓝天宠物店16号店', '13830768916', '上海朝阳区街道526号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo16', 4.7, '2024-10-17 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (17, '深圳海洋宠物乐园17号店', '13898733204', '深圳浦东新区街道834号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo17', 4.8, '2024-03-25 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (18, '杭州蓝天宠物店18号店', '13862167922', '上海浦东新区街道329号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo18', 5.0, '2025-12-25 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (19, '上海爱心宠物店19号店', '13825336031', '成都天河区街道884号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo19', 4.7, '2024-08-20 00:00:00');
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES (20, '杭州蓝天猫舍20号店', '13822509157', '杭州南山区街道269号', 'https://placehold.co/200x200/2196F3/ffffff?text=Logo20', 4.9, '2025-05-04 00:00:00');

-- 2. Users Data
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (1, 'openid_user_1_81344', '王杰', 'https://placehold.co/100x100/4CAF50/ffffff?text=王', '13922827184', '2024-07-07 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (2, 'openid_user_2_19783', '王强', 'https://placehold.co/100x100/4CAF50/ffffff?text=王', '13957355445', '2024-05-17 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (3, 'openid_user_3_19161', '李杰', 'https://placehold.co/100x100/4CAF50/ffffff?text=李', '13916857302', '2024-07-12 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (4, 'openid_user_4_80430', '王娟', 'https://placehold.co/100x100/4CAF50/ffffff?text=王', '13972854293', '2024-01-30 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (5, 'openid_user_5_43594', '刘娟', 'https://placehold.co/100x100/4CAF50/ffffff?text=刘', '13916288807', '2024-02-22 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (6, 'openid_user_6_87096', '陈军', 'https://placehold.co/100x100/4CAF50/ffffff?text=陈', '13993983769', '2025-03-24 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (7, 'openid_user_7_44146', '杨娟', 'https://placehold.co/100x100/4CAF50/ffffff?text=杨', '13989005289', '2024-02-22 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (8, 'openid_user_8_12165', '李静', 'https://placehold.co/100x100/4CAF50/ffffff?text=李', '13977409676', '2025-04-07 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (9, 'openid_user_9_47307', '周静', 'https://placehold.co/100x100/4CAF50/ffffff?text=周', '13957386981', '2025-09-19 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (10, 'openid_user_10_14150', '杨敏', 'https://placehold.co/100x100/4CAF50/ffffff?text=杨', '13948369763', '2024-10-01 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (11, 'openid_user_11_90176', '周磊', 'https://placehold.co/100x100/4CAF50/ffffff?text=周', '13942174216', '2025-06-22 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (12, 'openid_user_12_19552', '陈娟', 'https://placehold.co/100x100/4CAF50/ffffff?text=陈', '13983214410', '2024-04-22 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (13, 'openid_user_13_38016', '张静', 'https://placehold.co/100x100/4CAF50/ffffff?text=张', '13975812613', '2024-02-23 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (14, 'openid_user_14_27955', '杨磊', 'https://placehold.co/100x100/4CAF50/ffffff?text=杨', '13956209951', '2025-03-16 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (15, 'openid_user_15_14906', '王芳', 'https://placehold.co/100x100/4CAF50/ffffff?text=王', '13975493900', '2024-03-07 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (16, 'openid_user_16_87563', '吴静', 'https://placehold.co/100x100/4CAF50/ffffff?text=吴', '13979814785', '2025-05-26 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (17, 'openid_user_17_76126', '李敏', 'https://placehold.co/100x100/4CAF50/ffffff?text=李', '13945934986', '2025-03-02 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (18, 'openid_user_18_88645', '吴杰', 'https://placehold.co/100x100/4CAF50/ffffff?text=吴', '13930621863', '2025-09-28 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (19, 'openid_user_19_12748', '陈军', 'https://placehold.co/100x100/4CAF50/ffffff?text=陈', '13976094774', '2024-01-18 00:00:00');
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `created_at`) VALUES (20, 'openid_user_20_64650', '周勇', 'https://placehold.co/100x100/4CAF50/ffffff?text=周', '13956517891', '2024-08-03 00:00:00');

-- 3. Pets Data
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (1, '加菲No.1', '加菲', '9个月', 'female', 9775, 1955, 'available', '这是一只非常可爱的加菲，性格温顺。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet1', '健康', 9, '2025-10-15 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (2, '中华田园猫No.2', '中华田园猫', '7个月', 'male', 4740, 948, 'available', '这是一只非常可爱的中华田园猫，性格活泼。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet2', '健康', 4, '2025-04-07 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (3, '暹罗No.3', '暹罗', '12个月', 'female', 2808, 561, 'sold', '这是一只非常可爱的暹罗，性格高冷。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet3', '健康', 5, '2025-07-20 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (4, '中华田园猫No.4', '中华田园猫', '10个月', 'male', 9762, 1952, 'available', '这是一只非常可爱的中华田园猫，性格温顺。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet4', '健康', 4, '2024-10-08 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (5, '金吉拉No.5', '金吉拉', '4个月', 'male', 9702, 1940, 'booked', '这是一只非常可爱的金吉拉，性格活泼。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet5', '健康', 20, '2025-07-15 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (6, '布偶No.6', '布偶', '12个月', 'female', 3252, 650, 'booked', '这是一只非常可爱的布偶，性格高冷。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet6', '健康', 17, '2024-10-14 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (7, '布偶No.7', '布偶', '12个月', 'male', 9540, 1908, 'available', '这是一只非常可爱的布偶，性格活泼。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet7', '健康', 3, '2025-10-26 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (8, '暹罗No.8', '暹罗', '8个月', 'female', 5452, 1090, 'available', '这是一只非常可爱的暹罗，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet8', '健康', 4, '2025-09-03 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (9, '波斯猫No.9', '波斯猫', '12个月', 'female', 9718, 1943, 'available', '这是一只非常可爱的波斯猫，性格活泼。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet9', '健康', 15, '2025-12-24 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (10, '波斯猫No.10', '波斯猫', '12个月', 'male', 4551, 910, 'sold', '这是一只非常可爱的波斯猫，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet10', '健康', 11, '2024-09-30 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (11, '斯芬克斯No.11', '斯芬克斯', '10个月', 'male', 1295, 259, 'available', '这是一只非常可爱的斯芬克斯，性格活泼。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet11', '健康', 17, '2024-01-22 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (12, '暹罗No.12', '暹罗', '1个月', 'female', 6037, 1207, 'available', '这是一只非常可爱的暹罗，性格活泼。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet12', '健康', 13, '2024-07-13 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (13, '斯芬克斯No.13', '斯芬克斯', '3个月', 'male', 2774, 554, 'sold', '这是一只非常可爱的斯芬克斯，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet13', '健康', 17, '2025-12-11 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (14, '波斯猫No.14', '波斯猫', '5个月', 'male', 7798, 1559, 'sold', '这是一只非常可爱的波斯猫，性格温顺。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet14', '健康', 4, '2024-01-06 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (15, '中华田园猫No.15', '中华田园猫', '8个月', 'female', 3874, 774, 'sold', '这是一只非常可爱的中华田园猫，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet15', '健康', 12, '2025-11-09 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (16, '美短No.16', '美短', '4个月', 'male', 9959, 1991, 'sold', '这是一只非常可爱的美短，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet16', '健康', 8, '2025-08-06 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (17, '布偶No.17', '布偶', '4个月', 'female', 2643, 528, 'available', '这是一只非常可爱的布偶，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet17', '健康', 2, '2024-11-28 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (18, '加菲No.18', '加菲', '11个月', 'female', 2380, 476, 'sold', '这是一只非常可爱的加菲，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet18', '健康', 8, '2024-06-07 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (19, '暹罗No.19', '暹罗', '8个月', 'female', 7343, 1468, 'available', '这是一只非常可爱的暹罗，性格温顺。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet19', '健康', 4, '2024-12-10 00:00:00');
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `created_at`) VALUES (20, '英短No.20', '英短', '12个月', 'female', 4553, 910, 'booked', '这是一只非常可爱的英短，性格粘人。', 'https://placehold.co/400x400/FF9800/ffffff?text=Pet20', '健康', 7, '2025-04-17 00:00:00');

-- 4. Products Data
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (1, '进口猫粮1号', 'food', 490, 588, 299, 4063, 4.6, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod1', '2025-05-20 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (2, '进口逗猫棒2号', 'medicine', 150, 180, 355, 1261, 5.0, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod2', '2025-08-22 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (3, '进口猫粮3号', 'grooming', 90, 108, 537, 440, 4.1, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod3', '2024-04-01 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (4, '进口猫砂4号', 'medicine', 289, 346, 986, 3873, 4.2, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod4', '2024-05-02 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (5, '进口猫砂5号', 'daily', 139, 166, 204, 1847, 5.0, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod5', '2024-06-20 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (6, '进口洗耳液6号', 'medicine', 58, 69, 638, 1653, 4.9, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod6', '2024-07-08 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (7, '进口洗耳液7号', 'toy', 361, 433, 954, 3249, 4.7, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod7', '2025-08-28 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (8, '进口猫粮8号', 'clothing', 171, 205, 719, 3380, 4.3, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod8', '2025-12-17 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (9, '进口逗猫棒9号', 'toy', 61, 73, 692, 4321, 4.6, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod9', '2025-01-25 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (10, '进口牵引绳10号', 'medicine', 188, 225, 462, 925, 4.9, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod10', '2024-11-08 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (11, '进口洗耳液11号', 'medicine', 243, 291, 101, 2392, 4.6, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod11', '2024-12-13 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (12, '进口逗猫棒12号', 'toy', 110, 132, 57, 3781, 4.6, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod12', '2024-07-06 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (13, '进口洗耳液13号', 'toy', 244, 292, 710, 4849, 4.3, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod13', '2024-05-04 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (14, '进口逗猫棒14号', 'medicine', 307, 368, 531, 3684, 4.0, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod14', '2025-09-23 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (15, '进口牵引绳15号', 'clothing', 390, 468, 821, 3820, 4.3, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod15', '2025-01-26 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (16, '进口营养膏16号', 'clothing', 367, 440, 682, 172, 4.9, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod16', '2024-02-25 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (17, '进口牵引绳17号', 'grooming', 392, 470, 322, 3725, 4.8, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod17', '2025-09-03 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (18, '进口猫粮18号', 'medicine', 303, 363, 727, 2198, 5.0, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod18', '2025-01-10 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (19, '进口猫抓板19号', 'food', 245, 294, 557, 4400, 4.1, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod19', '2025-09-17 00:00:00');
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `created_at`) VALUES (20, '进口猫抓板20号', 'grooming', 50, 60, 321, 4495, 4.7, 'https://placehold.co/400x400/9C27B0/ffffff?text=Prod20', '2024-06-15 00:00:00');

-- 5. Services Data
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (1, '专业健康咨询1', 'other', 845, '62分钟', '提供专业的专业健康咨询1服务。', '商家16', 16, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc1', 401, 4.8, '2024-12-07 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (2, '专业绝育手术2', 'training', 200, '112分钟', '提供专业的专业绝育手术2服务。', '商家3', 3, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc2', 1364, 4.5, '2024-01-14 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (3, '专业摄影3', 'training', 688, '45分钟', '提供专业的专业摄影3服务。', '商家14', 14, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc3', 334, 4.5, '2025-09-20 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (4, '专业摄影4', 'other', 916, '86分钟', '提供专业的专业摄影4服务。', '商家1', 1, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc4', 1970, 4.9, '2025-01-22 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (5, '专业行为训练5', 'vaccine', 641, '44分钟', '提供专业的专业行为训练5服务。', '商家16', 16, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc5', 1731, 4.8, '2024-05-04 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (6, '专业绝育手术6', 'vaccine', 99, '32分钟', '提供专业的专业绝育手术6服务。', '商家5', 5, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc6', 833, 4.7, '2024-01-13 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (7, '专业健康咨询7', 'vaccine', 474, '71分钟', '提供专业的专业健康咨询7服务。', '商家18', 18, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc7', 251, 4.9, '2025-05-28 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (8, '专业健康咨询8', 'vaccine', 335, '54分钟', '提供专业的专业健康咨询8服务。', '商家7', 7, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc8', 239, 4.4, '2025-01-30 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (9, '专业洗澡美容9', 'medical', 647, '120分钟', '提供专业的专业洗澡美容9服务。', '商家14', 14, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc9', 291, 4.9, '2025-09-02 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (10, '专业洗澡美容10', 'other', 780, '60分钟', '提供专业的专业洗澡美容10服务。', '商家11', 11, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc10', 1052, 4.0, '2024-07-05 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (11, '专业健康咨询11', 'boarding', 861, '107分钟', '提供专业的专业健康咨询11服务。', '商家20', 20, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc11', 461, 4.2, '2025-06-24 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (12, '专业洗澡美容12', 'consultation', 236, '106分钟', '提供专业的专业洗澡美容12服务。', '商家14', 14, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc12', 114, 4.7, '2024-03-29 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (13, '专业寄养13', 'boarding', 86, '90分钟', '提供专业的专业寄养13服务。', '商家18', 18, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc13', 343, 4.8, '2025-06-13 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (14, '专业健康咨询14', 'vaccine', 827, '42分钟', '提供专业的专业健康咨询14服务。', '商家2', 2, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc14', 401, 4.9, '2025-02-26 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (15, '专业洗澡美容15', 'other', 398, '41分钟', '提供专业的专业洗澡美容15服务。', '商家6', 6, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc15', 1532, 4.5, '2024-11-22 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (16, '专业摄影16', 'vaccine', 55, '44分钟', '提供专业的专业摄影16服务。', '商家12', 12, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc16', 1043, 4.2, '2024-03-22 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (17, '专业摄影17', 'vaccine', 599, '99分钟', '提供专业的专业摄影17服务。', '商家12', 12, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc17', 511, 4.7, '2025-01-23 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (18, '专业行为训练18', 'consultation', 344, '93分钟', '提供专业的专业行为训练18服务。', '商家17', 17, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc18', 1780, 4.2, '2025-01-02 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (19, '专业摄影19', 'consultation', 727, '47分钟', '提供专业的专业摄影19服务。', '商家5', 5, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc19', 448, 4.4, '2025-06-29 00:00:00');
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES (20, '专业行为训练20', 'consultation', 918, '101分钟', '提供专业的专业行为训练20服务。', '商家4', 4, 'https://placehold.co/400x400/E91E63/ffffff?text=Svc20', 1831, 4.8, '2025-07-16 00:00:00');

-- 6. Orders Data
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (1, 'ORD2026010856182', 'openid_user_1_81344', 1717, 'cancelled', '[{"id": 7, "name": "商品7", "price": 53, "count": 2}, {"id": 9, "name": "商品9", "price": 25, "count": 1}, {"id": 6, "name": "商品6", "price": 232, "count": 2}, {"id": 1, "name": "商品1", "price": 81, "count": 3}, {"id": 10, "name": "商品10", "price": 293, "count": 3}]', '2025-03-28 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (2, 'ORD2026010852746', 'openid_user_2_19783', 1919, 'shipped', '[{"id": 6, "name": "商品6", "price": 255, "count": 3}, {"id": 11, "name": "商品11", "price": 225, "count": 3}, {"id": 3, "name": "商品3", "price": 479, "count": 1}]', '2025-03-21 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (3, 'ORD2026010868119', 'openid_user_3_19161', 1182, 'pending', '[{"id": 5, "name": "商品5", "price": 90, "count": 2}, {"id": 6, "name": "商品6", "price": 37, "count": 2}, {"id": 9, "name": "商品9", "price": 206, "count": 2}, {"id": 14, "name": "商品14", "price": 258, "count": 2}]', '2025-11-22 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (4, 'ORD2026010830663', 'openid_user_4_80430', 632, 'shipped', '[{"id": 2, "name": "商品2", "price": 316, "count": 2}]', '2025-01-04 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (5, 'ORD2026010852036', 'openid_user_5_43594', 358, 'shipped', '[{"id": 3, "name": "商品3", "price": 72, "count": 1}, {"id": 17, "name": "商品17", "price": 286, "count": 1}]', '2024-12-14 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (6, 'ORD2026010871997', 'openid_user_6_87096', 412, 'cancelled', '[{"id": 20, "name": "商品20", "price": 66, "count": 2}, {"id": 9, "name": "商品9", "price": 218, "count": 1}, {"id": 6, "name": "商品6", "price": 31, "count": 2}]', '2025-07-19 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (7, 'ORD2026010872163', 'openid_user_7_44146', 1023, 'completed', '[{"id": 9, "name": "商品9", "price": 324, "count": 1}, {"id": 11, "name": "商品11", "price": 48, "count": 1}, {"id": 6, "name": "商品6", "price": 166, "count": 2}, {"id": 17, "name": "商品17", "price": 319, "count": 1}]', '2024-10-07 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (8, 'ORD2026010895062', 'openid_user_8_12165', 1720, 'paid', '[{"id": 19, "name": "商品19", "price": 383, "count": 1}, {"id": 6, "name": "商品6", "price": 151, "count": 3}, {"id": 12, "name": "商品12", "price": 236, "count": 2}, {"id": 12, "name": "商品12", "price": 334, "count": 1}, {"id": 10, "name": "商品10", "price": 78, "count": 1}]', '2025-10-21 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (9, 'ORD2026010848197', 'openid_user_9_47307', 3423, 'completed', '[{"id": 7, "name": "商品7", "price": 303, "count": 3}, {"id": 14, "name": "商品14", "price": 222, "count": 1}, {"id": 6, "name": "商品6", "price": 309, "count": 1}, {"id": 2, "name": "商品2", "price": 429, "count": 3}, {"id": 8, "name": "商品8", "price": 232, "count": 3}]', '2025-10-29 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (10, 'ORD2026010865574', 'openid_user_10_14150', 1377, 'shipped', '[{"id": 5, "name": "商品5", "price": 99, "count": 3}, {"id": 3, "name": "商品3", "price": 222, "count": 3}, {"id": 19, "name": "商品19", "price": 126, "count": 1}, {"id": 20, "name": "商品20", "price": 144, "count": 2}]', '2025-03-22 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (11, 'ORD2026010827470', 'openid_user_11_90176', 3730, 'paid', '[{"id": 12, "name": "商品12", "price": 182, "count": 1}, {"id": 5, "name": "商品5", "price": 379, "count": 2}, {"id": 18, "name": "商品18", "price": 494, "count": 3}, {"id": 14, "name": "商品14", "price": 89, "count": 3}, {"id": 1, "name": "商品1", "price": 347, "count": 3}]', '2024-04-20 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (12, 'ORD2026010869505', 'openid_user_12_19552', 596, 'pending', '[{"id": 12, "name": "商品12", "price": 298, "count": 2}]', '2024-09-23 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (13, 'ORD2026010874147', 'openid_user_13_38016', 237, 'shipped', '[{"id": 2, "name": "商品2", "price": 237, "count": 1}]', '2025-10-30 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (14, 'ORD2026010885092', 'openid_user_14_27955', 2714, 'pending', '[{"id": 8, "name": "商品8", "price": 114, "count": 2}, {"id": 3, "name": "商品3", "price": 498, "count": 3}, {"id": 1, "name": "商品1", "price": 303, "count": 2}, {"id": 20, "name": "商品20", "price": 386, "count": 1}]', '2025-06-02 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (15, 'ORD2026010862178', 'openid_user_15_14906', 2425, 'cancelled', '[{"id": 20, "name": "商品20", "price": 249, "count": 3}, {"id": 18, "name": "商品18", "price": 22, "count": 2}, {"id": 6, "name": "商品6", "price": 127, "count": 2}, {"id": 7, "name": "商品7", "price": 460, "count": 3}]', '2025-07-10 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (16, 'ORD2026010880264', 'openid_user_16_87563', 2888, 'paid', '[{"id": 9, "name": "商品9", "price": 425, "count": 2}, {"id": 7, "name": "商品7", "price": 460, "count": 3}, {"id": 12, "name": "商品12", "price": 329, "count": 2}]', '2025-05-31 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (17, 'ORD2026010868850', 'openid_user_17_76126', 393, 'paid', '[{"id": 16, "name": "商品16", "price": 393, "count": 1}]', '2024-12-19 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (18, 'ORD2026010865827', 'openid_user_18_88645', 1374, 'pending', '[{"id": 16, "name": "商品16", "price": 159, "count": 2}, {"id": 1, "name": "商品1", "price": 208, "count": 1}, {"id": 7, "name": "商品7", "price": 424, "count": 2}]', '2025-09-27 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (19, 'ORD2026010899588', 'openid_user_19_12748', 2649, 'paid', '[{"id": 12, "name": "商品12", "price": 369, "count": 2}, {"id": 13, "name": "商品13", "price": 203, "count": 3}, {"id": 15, "name": "商品15", "price": 452, "count": 1}, {"id": 4, "name": "商品4", "price": 425, "count": 2}]', '2024-07-30 00:00:00');
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `created_at`) VALUES (20, 'ORD2026010875290', 'openid_user_20_64650', 1305, 'completed', '[{"id": 5, "name": "商品5", "price": 435, "count": 3}]', '2024-02-26 00:00:00');

-- 7. Order Items Data
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (1, 1, 7, '商品7', 53, 2, 106);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (2, 1, 9, '商品9', 25, 1, 25);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (3, 1, 6, '商品6', 232, 2, 464);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (4, 1, 1, '商品1', 81, 3, 243);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (5, 1, 10, '商品10', 293, 3, 879);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (6, 2, 6, '商品6', 255, 3, 765);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (7, 2, 11, '商品11', 225, 3, 675);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (8, 2, 3, '商品3', 479, 1, 479);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (9, 3, 5, '商品5', 90, 2, 180);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (10, 3, 6, '商品6', 37, 2, 74);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (11, 3, 9, '商品9', 206, 2, 412);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (12, 3, 14, '商品14', 258, 2, 516);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (13, 4, 2, '商品2', 316, 2, 632);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (14, 5, 3, '商品3', 72, 1, 72);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (15, 5, 17, '商品17', 286, 1, 286);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (16, 6, 20, '商品20', 66, 2, 132);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (17, 6, 9, '商品9', 218, 1, 218);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (18, 6, 6, '商品6', 31, 2, 62);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (19, 7, 9, '商品9', 324, 1, 324);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (20, 7, 11, '商品11', 48, 1, 48);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (21, 7, 6, '商品6', 166, 2, 332);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (22, 7, 17, '商品17', 319, 1, 319);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (23, 8, 19, '商品19', 383, 1, 383);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (24, 8, 6, '商品6', 151, 3, 453);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (25, 8, 12, '商品12', 236, 2, 472);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (26, 8, 12, '商品12', 334, 1, 334);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (27, 8, 10, '商品10', 78, 1, 78);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (28, 9, 7, '商品7', 303, 3, 909);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (29, 9, 14, '商品14', 222, 1, 222);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (30, 9, 6, '商品6', 309, 1, 309);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (31, 9, 2, '商品2', 429, 3, 1287);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (32, 9, 8, '商品8', 232, 3, 696);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (33, 10, 5, '商品5', 99, 3, 297);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (34, 10, 3, '商品3', 222, 3, 666);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (35, 10, 19, '商品19', 126, 1, 126);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (36, 10, 20, '商品20', 144, 2, 288);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (37, 11, 12, '商品12', 182, 1, 182);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (38, 11, 5, '商品5', 379, 2, 758);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (39, 11, 18, '商品18', 494, 3, 1482);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (40, 11, 14, '商品14', 89, 3, 267);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (41, 11, 1, '商品1', 347, 3, 1041);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (42, 12, 12, '商品12', 298, 2, 596);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (43, 13, 2, '商品2', 237, 1, 237);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (44, 14, 8, '商品8', 114, 2, 228);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (45, 14, 3, '商品3', 498, 3, 1494);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (46, 14, 1, '商品1', 303, 2, 606);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (47, 14, 20, '商品20', 386, 1, 386);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (48, 15, 20, '商品20', 249, 3, 747);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (49, 15, 18, '商品18', 22, 2, 44);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (50, 15, 6, '商品6', 127, 2, 254);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (51, 15, 7, '商品7', 460, 3, 1380);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (52, 16, 9, '商品9', 425, 2, 850);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (53, 16, 7, '商品7', 460, 3, 1380);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (54, 16, 12, '商品12', 329, 2, 658);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (55, 17, 16, '商品16', 393, 1, 393);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (56, 18, 16, '商品16', 159, 2, 318);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (57, 18, 1, '商品1', 208, 1, 208);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (58, 18, 7, '商品7', 424, 2, 848);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (59, 19, 12, '商品12', 369, 2, 738);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (60, 19, 13, '商品13', 203, 3, 609);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (61, 19, 15, '商品15', 452, 1, 452);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (62, 19, 4, '商品4', 425, 2, 850);
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES (63, 20, 5, '商品5', 435, 3, 1305);

-- 8. Addresses Data
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (1, 'openid_user_1_81344', '收货人1', '13949292248', '北京市朝阳区街道1号', 0, '2024-01-05 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (2, 'openid_user_2_19783', '收货人2', '13977662053', '北京市朝阳区街道2号', 0, '2024-04-01 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (3, 'openid_user_3_19161', '收货人3', '13923935199', '北京市朝阳区街道3号', 0, '2025-09-08 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (4, 'openid_user_4_80430', '收货人4', '13948548077', '北京市朝阳区街道4号', 0, '2024-03-04 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (5, 'openid_user_5_43594', '收货人5', '13998458810', '北京市朝阳区街道5号', 1, '2024-03-11 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (6, 'openid_user_6_87096', '收货人6', '13975689316', '北京市朝阳区街道6号', 0, '2025-12-05 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (7, 'openid_user_7_44146', '收货人7', '13945187847', '北京市朝阳区街道7号', 0, '2024-12-13 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (8, 'openid_user_8_12165', '收货人8', '13912151403', '北京市朝阳区街道8号', 0, '2024-11-24 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (9, 'openid_user_9_47307', '收货人9', '13949896556', '北京市朝阳区街道9号', 0, '2025-11-08 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (10, 'openid_user_10_14150', '收货人10', '13947868391', '北京市朝阳区街道10号', 1, '2024-07-08 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (11, 'openid_user_11_90176', '收货人11', '13973783046', '北京市朝阳区街道11号', 0, '2024-11-13 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (12, 'openid_user_12_19552', '收货人12', '13979517005', '北京市朝阳区街道12号', 0, '2024-03-22 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (13, 'openid_user_13_38016', '收货人13', '13916256223', '北京市朝阳区街道13号', 0, '2024-03-29 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (14, 'openid_user_14_27955', '收货人14', '13978976163', '北京市朝阳区街道14号', 0, '2024-06-13 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (15, 'openid_user_15_14906', '收货人15', '13933713967', '北京市朝阳区街道15号', 1, '2024-08-22 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (16, 'openid_user_16_87563', '收货人16', '13939399356', '北京市朝阳区街道16号', 0, '2025-09-13 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (17, 'openid_user_17_76126', '收货人17', '13974303150', '北京市朝阳区街道17号', 0, '2025-05-19 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (18, 'openid_user_18_88645', '收货人18', '13957662066', '北京市朝阳区街道18号', 0, '2024-12-21 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (19, 'openid_user_19_12748', '收货人19', '13968641172', '北京市朝阳区街道19号', 0, '2024-06-08 00:00:00');
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES (20, 'openid_user_20_64650', '收货人20', '13970708234', '北京市朝阳区街道20号', 1, '2025-10-16 00:00:00');
