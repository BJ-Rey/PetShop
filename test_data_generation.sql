-- =================================================================
-- 宠物商城测试数据生成脚本 (Test Data Generation Script)
-- =================================================================
-- 说明：
-- 1. 本脚本用于重建数据库结构并导入测试数据
-- 2. 包含完整的表结构定义（CREATE TABLE）
-- 3. 包含符合业务逻辑的测试数据（INSERT），每个表约10条
-- 4. 字符集：utf8mb4
-- =================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. 表结构定义 (Table Schema Definitions)
-- ==========================================

-- 1.1 商家表 (Merchants)
-- ------------------------------------------
DROP TABLE IF EXISTS `merchants`;
CREATE TABLE `merchants` (
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

-- 1.2 用户表 (Users)
-- ------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信OpenID',
  `nickname` VARCHAR(64) COMMENT '用户昵称',
  `avatar_url` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色: user, merchant, admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 1.3 地址表 (Addresses)
-- ------------------------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
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
-- ------------------------------------------
DROP TABLE IF EXISTS `pets`;
CREATE TABLE `pets` (
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
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE SET NULL,
  INDEX `idx_pets_status` (`status`),
  INDEX `idx_pets_breed` (`breed`),
  INDEX `idx_pets_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宠物商品表';

-- 1.5 商品表 (Products)
-- ------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '商品ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `category` VARCHAR(50) COMMENT '分类(food, toy, etc.)',
  `price` DECIMAL(10,2) NOT NULL COMMENT '现价',
  `original_price` DECIMAL(10,2) COMMENT '原价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `rating` DECIMAL(2,1) DEFAULT 5.0 COMMENT '评分',
  `image` VARCHAR(255) COMMENT '商品图片URL',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `status` ENUM('on_shelf', 'off_shelf') DEFAULT 'on_shelf' COMMENT '上下架状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_category` (`category`),
  INDEX `idx_products_sales` (`sales`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='普通商品表';

-- 1.6 服务表 (Services)
-- ------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
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

-- 1.6.1 商家轮播图表 (Merchant Banners)
-- ------------------------------------------
DROP TABLE IF EXISTS `merchant_banners`;
CREATE TABLE `merchant_banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '轮播图ID',
  `merchant_id` INT NOT NULL COMMENT '商家ID',
  `image_url` VARCHAR(255) NOT NULL COMMENT '图片URL',
  `link_type` ENUM('pet', 'product') NOT NULL COMMENT '关联类型',
  `link_id` INT NOT NULL COMMENT '关联项目ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE,
  INDEX `idx_banners_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家轮播图配置表';

-- 1.7 订单表 (Orders)
-- ------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
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

-- 1.8 订单项表 (Order Items)
-- ------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
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

-- 1.9 计数器表 (Counters - 兼容旧逻辑)
-- ------------------------------------------
DROP TABLE IF EXISTS `Counters`;
CREATE TABLE `Counters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `count` int(11) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='计数器表';


-- ==========================================
-- 2. 测试数据导入 (Insert Mock Data)
-- ==========================================

-- 2.1 商家数据 (10条)
-- 涵盖不同评分、地区
INSERT INTO `merchants` (`id`, `name`, `phone`, `address`, `logo`, `rating`, `created_at`) VALUES
(1, '爱宠健康中心', '13800138001', '北京市朝阳区三里屯SOHO 2号楼', 'https://placehold.co/200x200/2196F3/ffffff?text=Health', 5.0, NOW()),
(2, '萌宠造型屋', '13800138002', '北京市海淀区中关村大街1号', 'https://placehold.co/200x200/FF9800/ffffff?text=Beauty', 4.8, NOW()),
(3, '开心猫舍', '13800138003', '上海市浦东新区陆家嘴环路', 'https://placehold.co/200x200/4CAF50/ffffff?text=Cat', 4.5, NOW()),
(4, '忠犬训练营', '13800138004', '广州市天河区体育西路', 'https://placehold.co/200x200/9C27B0/ffffff?text=Dog', 4.9, NOW()),
(5, '奇幻水族馆', '13800138005', '深圳市南山区科技园', 'https://placehold.co/200x200/00BCD4/ffffff?text=Fish', 4.2, NOW()),
(6, '异宠乐园', '13800138006', '成都市锦江区春熙路', 'https://placehold.co/200x200/795548/ffffff?text=Exotic', 4.0, NOW()),
(7, '社区宠物诊所', '13800138007', '武汉市江汉区江汉路', 'https://placehold.co/200x200/F44336/ffffff?text=Clinic', 3.8, NOW()),
(8, '高端宠物SPA', '13800138008', '杭州市西湖区龙井路', 'https://placehold.co/200x200/E91E63/ffffff?text=SPA', 5.0, NOW()),
(9, '流浪动物救助站', '13800138009', '南京市玄武区中山陵', 'https://placehold.co/200x200/607D8B/ffffff?text=Rescue', 4.7, NOW()),
(10, '24小时宠物急诊', '13800138010', '西安市雁塔区大雁塔', 'https://placehold.co/200x200/FF5722/ffffff?text=Emergency', 4.9, NOW());

-- 2.2 用户数据 (10条)
-- 包含不同OpenID和角色
INSERT INTO `users` (`id`, `openid`, `nickname`, `avatar_url`, `phone`, `role`, `created_at`) VALUES
(1, 'user_openid_001', '张三', 'https://placehold.co/100x100/2196F3/ffffff?text=ZS', '13900000001', 'user', NOW()),
(2, 'user_openid_002', '李四', 'https://placehold.co/100x100/FF9800/ffffff?text=LS', '13900000002', 'user', NOW()),
(3, 'user_openid_003', '王五', 'https://placehold.co/100x100/4CAF50/ffffff?text=WW', '13900000003', 'user', NOW()),
(4, 'user_openid_004', '赵六', 'https://placehold.co/100x100/9C27B0/ffffff?text=ZL', '13900000004', 'merchant', NOW()),
(5, 'user_openid_005', '管理员', 'https://placehold.co/100x100/F44336/ffffff?text=Admin', '13900000005', 'admin', NOW()),
(6, 'user_openid_006', 'Alice', 'https://placehold.co/100x100/00BCD4/ffffff?text=A', '13900000006', 'user', NOW()),
(7, 'user_openid_007', 'Bob', 'https://placehold.co/100x100/795548/ffffff?text=B', '13900000007', 'user', NOW()),
(8, 'user_openid_008', 'Charlie', 'https://placehold.co/100x100/E91E63/ffffff?text=C', '13900000008', 'user', NOW()),
(9, 'user_openid_009', 'David', 'https://placehold.co/100x100/607D8B/ffffff?text=D', '13900000009', 'user', NOW()),
(10, 'user_openid_010', 'Eva', 'https://placehold.co/100x100/FF5722/ffffff?text=E', '13900000010', 'user', NOW()),
(11, 'merchant_openid_test', '测试商家', 'https://placehold.co/100x100/9C27B0/ffffff?text=Merchant', '18247122807', 'merchant', NOW()),
(12, 'user_openid_test', '测试用户', 'https://placehold.co/100x100/4CAF50/ffffff?text=User', '13848836315', 'user', NOW());

-- 2.3 地址数据 (10条)
-- 关联上述用户，包含默认和非默认
INSERT INTO `addresses` (`id`, `openid`, `name`, `phone`, `address`, `is_default`, `created_at`) VALUES
(1, 'user_openid_001', '张三', '13900000001', '北京市朝阳区三里屯SOHO', 1, NOW()),
(2, 'user_openid_001', '张三公司', '13900000001', '北京市海淀区百度大厦', 0, NOW()),
(3, 'user_openid_002', '李四家', '13900000002', '上海市浦东新区陆家嘴', 1, NOW()),
(4, 'user_openid_003', '王五家', '13900000003', '广州市天河区珠江新城', 1, NOW()),
(5, 'user_openid_006', 'Alice Home', '13900000006', 'Shenzhen Nanshan', 1, NOW()),
(6, 'user_openid_007', 'Bob Home', '13900000007', 'Chengdu Jinjiang', 1, NOW()),
(7, 'user_openid_008', 'Charlie Home', '13900000008', 'Wuhan Jianghan', 1, NOW()),
(8, 'user_openid_009', 'David Home', '13900000009', 'Nanjing Xuanwu', 1, NOW()),
(9, 'user_openid_010', 'Eva Home', '13900000010', 'Xian Yanta', 1, NOW()),
(10, 'user_openid_001', '张三父母家', '13900000001', '北京市西城区金融街', 0, NOW());

-- 2.4 宠物数据 (10条)
-- 涵盖不同品种、价格、状态
INSERT INTO `pets` (`id`, `name`, `breed`, `age`, `gender`, `price`, `deposit`, `status`, `description`, `avatar`, `health_status`, `merchant_id`, `views`, `created_at`) VALUES
(1, '小黑', '金毛犬', '2岁', 'male', 3000.00, 900.00, 'available', '非常活泼的金毛，喜欢飞盘', 'https://placehold.co/400x400/FF9800/ffffff?text=Golden', '健康', 1, 120, NOW()),
(2, '咪咪', '布偶猫', '1岁', 'female', 5000.00, 1500.00, 'available', '性格温顺，粘人，品相极佳', 'https://placehold.co/400x400/2196F3/ffffff?text=Ragdoll', '健康', 3, 350, NOW()),
(3, '旺财', '中华田园犬', '3个月', 'male', 500.00, 100.00, 'sold', '聪明伶俐，好养活', 'https://placehold.co/400x400/795548/ffffff?text=Dog', '健康', 9, 800, NOW()),
(4, '小白', '萨摩耶', '1.5岁', 'female', 2500.00, 750.00, 'booked', '微笑天使，由于主人搬家寻找新主人', 'https://placehold.co/400x400/E91E63/ffffff?text=Samoyed', '已绝育', 1, 45, NOW()),
(5, '皮皮', '柯基', '8个月', 'male', 3500.00, 1050.00, 'available', '短腿小电臀，精力充沛', 'https://placehold.co/400x400/FF5722/ffffff?text=Corgi', '健康', 4, 600, NOW()),
(6, '露露', '英国短毛猫', '2岁', 'female', 2000.00, 600.00, 'available', '蓝猫，脸圆圆的，很安静', 'https://placehold.co/400x400/607D8B/ffffff?text=BSH', '健康', 2, 150, NOW()),
(7, '哈利', '哈士奇', '1岁', 'male', 1800.00, 540.00, 'available', '拆家小能手，需要大空间', 'https://placehold.co/400x400/9C27B0/ffffff?text=Husky', '健康', 4, 300, NOW()),
(8, '娜娜', '贵宾犬', '3岁', 'female', 1500.00, 450.00, 'sold', '泰迪造型，乖巧听话', 'https://placehold.co/400x400/8BC34A/ffffff?text=Poodle', '健康', 2, 50, NOW()),
(9, '大黄', '橘猫', '5个月', 'male', 200.00, 0.00, 'available', '十只橘猫九只胖，还有一只在路上', 'https://placehold.co/400x400/FFC107/ffffff?text=Orange', '健康', 9, 999, NOW()),
(10, '辛巴', '缅因猫', '6个月', 'male', 8000.00, 2400.00, 'available', '体型巨大，性格温柔的巨人', 'https://placehold.co/400x400/3F51B5/ffffff?text=Maine', '健康', 3, 20, NOW());

-- 2.5 商品数据 (10条)
-- 涵盖不同分类、价格、库存
INSERT INTO `products` (`id`, `name`, `category`, `price`, `original_price`, `stock`, `sales`, `rating`, `image`, `views`, `status`, `created_at`) VALUES
(1, '天然狗粮通用型', 'food', 129.00, 199.00, 500, 1200, 4.8, 'https://placehold.co/400x400/795548/ffffff?text=Food', 5000, 'on_shelf', NOW()),
(2, '宠物自动喂食器', 'daily', 299.00, 399.00, 100, 800, 4.9, 'https://placehold.co/400x400/607D8B/ffffff?text=Feeder', 3000, 'on_shelf', NOW()),
(3, '猫咪逗猫棒', 'toy', 19.90, 29.90, 1000, 5000, 4.7, 'https://placehold.co/400x400/E91E63/ffffff?text=Toy', 10000, 'on_shelf', NOW()),
(4, '狗狗磨牙骨', 'toy', 39.00, 59.00, 200, 300, 4.5, 'https://placehold.co/400x400/FF9800/ffffff?text=Bone', 1500, 'on_shelf', NOW()),
(5, '宠物专用沐浴露', 'grooming', 68.00, 88.00, 300, 450, 4.6, 'https://placehold.co/400x400/2196F3/ffffff?text=Shampoo', 2000, 'on_shelf', NOW()),
(6, '豪华猫爬架', 'daily', 350.00, 500.00, 50, 120, 4.9, 'https://placehold.co/400x400/9C27B0/ffffff?text=Tree', 800, 'on_shelf', NOW()),
(7, '宠物除臭喷雾', 'daily', 25.00, 35.00, 800, 1500, 4.4, 'https://placehold.co/400x400/00BCD4/ffffff?text=Spray', 4000, 'on_shelf', NOW()),
(8, '冬季保暖狗窝', 'daily', 89.00, 129.00, 150, 200, 4.7, 'https://placehold.co/400x400/FF5722/ffffff?text=Bed', 600, 'off_shelf', NOW()),
(9, '宠物营养膏', 'food', 75.00, 95.00, 400, 600, 4.8, 'https://placehold.co/400x400/4CAF50/ffffff?text=Nutrition', 1200, 'on_shelf', NOW()),
(10, '自动饮水机滤芯', 'daily', 45.00, 55.00, 0, 900, 4.6, 'https://placehold.co/400x400/3F51B5/ffffff?text=Filter', 2500, 'on_shelf', NOW());

-- 2.5.1 商家轮播图数据 (示例)
INSERT INTO `merchant_banners` (`id`, `merchant_id`, `image_url`, `link_type`, `link_id`, `sort_order`, `created_at`) VALUES
(1, 1, 'https://placehold.co/800x400/2196F3/ffffff?text=Banner1', 'pet', 1, 1, NOW()),
(2, 1, 'https://placehold.co/800x400/FF9800/ffffff?text=Banner2', 'product', 1, 2, NOW());

-- 2.6 服务数据 (10条)
-- 涵盖不同服务类型
INSERT INTO `services` (`id`, `name`, `category`, `price`, `duration`, `description`, `merchant_name`, `merchant_id`, `image`, `sales`, `rating`, `created_at`) VALUES
(1, '犬瘟热疫苗接种', 'vaccine', 198.00, '30分钟', '包含进口疫苗一针及基础体检', '爱宠健康中心', 1, 'https://placehold.co/400x400/2196F3/ffffff?text=Vaccine', 120, 4.9, NOW()),
(2, '宠物美容套餐', 'grooming', 128.00, '90分钟', '洗澡、剪毛、修指甲全套', '萌宠造型屋', 2, 'https://placehold.co/400x400/FF9800/ffffff?text=Grooming', 350, 4.8, NOW()),
(3, '宠物寄养(小型犬)', 'boarding', 50.00, '1天', '24小时监控，包含喂食遛弯', '忠犬训练营', 4, 'https://placehold.co/400x400/4CAF50/ffffff?text=Boarding', 500, 4.7, NOW()),
(4, '宠物行为矫正', 'training', 200.00, '60分钟', '纠正乱叫、扑人等不良习惯', '忠犬训练营', 4, 'https://placehold.co/400x400/9C27B0/ffffff?text=Training', 80, 5.0, NOW()),
(5, '猫咪绝育手术(公)', 'medical', 400.00, '2小时', '微创手术，恢复快', '社区宠物诊所', 7, 'https://placehold.co/400x400/F44336/ffffff?text=Surgery', 60, 4.9, NOW()),
(6, '狂犬病疫苗接种', 'vaccine', 80.00, '20分钟', '国家定点疫苗，安全放心', '爱宠健康中心', 1, 'https://placehold.co/400x400/2196F3/ffffff?text=Rabies', 500, 5.0, NOW()),
(7, '宠物深度SPA', 'grooming', 298.00, '120分钟', '精油按摩，深层清洁', '高端宠物SPA', 8, 'https://placehold.co/400x400/E91E63/ffffff?text=SPA', 150, 4.9, NOW()),
(8, '宠物洁牙', 'medical', 150.00, '45分钟', '超声波洁牙，去除牙结石', '社区宠物诊所', 7, 'https://placehold.co/400x400/00BCD4/ffffff?text=Teeth', 200, 4.6, NOW()),
(9, '异宠健康检查', 'medical', 100.00, '30分钟', '针对仓鼠、兔子、爬宠的体检', '异宠乐园', 6, 'https://placehold.co/400x400/795548/ffffff?text=Checkup', 90, 4.8, NOW()),
(10, '急诊挂号', 'medical', 50.00, '即时', '绿色通道，优先就诊', '24小时宠物急诊', 10, 'https://placehold.co/400x400/FF5722/ffffff?text=SOS', 1000, 4.9, NOW());

-- 2.7 订单数据 (10条)
-- 涵盖不同状态、用户、金额
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `status`, `items_json`, `address_snapshot`, `tracking_number`, `created_at`) VALUES
(1, 'ORD20260101001', 'user_openid_001', 258.00, 'pending', '[{"id":1,"name":"天然狗粮","price":129,"count":2}]', '{"name":"张三","phone":"13900000001","address":"北京市朝阳区"}', NULL, NOW()),
(2, 'ORD20260101002', 'user_openid_001', 299.00, 'paid', '[{"id":2,"name":"自动喂食器","price":299,"count":1}]', '{"name":"张三","phone":"13900000001","address":"北京市朝阳区"}', NULL, NOW()),
(3, 'ORD20260101003', 'user_openid_002', 19.90, 'shipped', '[{"id":3,"name":"逗猫棒","price":19.9,"count":1}]', '{"name":"李四","phone":"13900000002","address":"上海市浦东新区"}', 'SF1234567890', NOW()),
(4, 'ORD20260101004', 'user_openid_002', 350.00, 'completed', '[{"id":6,"name":"猫爬架","price":350,"count":1}]', '{"name":"李四","phone":"13900000002","address":"上海市浦东新区"}', 'JD0987654321', NOW()),
(5, 'ORD20260101005', 'user_openid_003', 45.00, 'cancelled', '[{"id":10,"name":"滤芯","price":45,"count":1}]', '{"name":"王五","phone":"13900000003","address":"广州市天河区"}', NULL, NOW()),
(6, 'ORD20260101006', 'user_openid_003', 136.00, 'paid', '[{"id":5,"name":"沐浴露","price":68,"count":2}]', '{"name":"王五","phone":"13900000003","address":"广州市天河区"}', NULL, NOW()),
(7, 'ORD20260101007', 'user_openid_006', 500.00, 'pending', '[{"id":1,"name":"宠物寄养","price":50,"count":10}]', '{"name":"Alice","phone":"13900000006","address":"Shenzhen"}', NULL, NOW()),
(8, 'ORD20260101008', 'user_openid_007', 89.00, 'shipped', '[{"id":8,"name":"狗窝","price":89,"count":1}]', '{"name":"Bob","phone":"13900000007","address":"Chengdu"}', 'YT555666777', NOW()),
(9, 'ORD20260101009', 'user_openid_008', 25.00, 'completed', '[{"id":7,"name":"除臭喷雾","price":25,"count":1}]', '{"name":"Charlie","phone":"13900000008","address":"Wuhan"}', 'ST111222333', NOW()),
(10, 'ORD20260101010', 'user_openid_009', 150.00, 'paid', '[{"id":9,"name":"营养膏","price":75,"count":2}]', '{"name":"David","phone":"13900000009","address":"Nanjing"}', NULL, NOW());

-- 2.8 订单项数据 (12条)
-- 对应上述订单
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `amount`) VALUES
(1, 1, 1, '天然狗粮通用型', 129.00, 2, 258.00),
(2, 2, 2, '宠物自动喂食器', 299.00, 1, 299.00),
(3, 3, 3, '猫咪逗猫棒', 19.90, 1, 19.90),
(4, 4, 6, '豪华猫爬架', 350.00, 1, 350.00),
(5, 5, 10, '自动饮水机滤芯', 45.00, 1, 45.00),
(6, 6, 5, '宠物专用沐浴露', 68.00, 2, 136.00),
-- 订单7是服务类订单(假设逻辑)，这里用普通商品表代替演示，或者留空。
-- 为了外键约束完整性，这里映射到商品ID 1
(7, 7, 1, '天然狗粮通用型(代指服务)', 50.00, 10, 500.00),
(8, 8, 8, '冬季保暖狗窝', 89.00, 1, 89.00),
(9, 9, 7, '宠物除臭喷雾', 25.00, 1, 25.00),
(10, 10, 9, '宠物营养膏', 75.00, 2, 150.00);

-- 2.9 计数器数据
INSERT INTO `Counters` (`id`, `count`, `createdAt`, `updatedAt`) VALUES (1, 100, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- 脚本执行结束 (End of Script)
-- =================================================================
