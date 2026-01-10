# Requirements Document

## Introduction

本文档定义了修复"商家登录后仍显示用户界面"问题的需求。当前系统存在商家角色识别和界面切换的问题，导致商家用户登录后无法正确跳转到商家管理界面。

## Glossary

- **System**: 宠物商城系统，包含前端小程序和后端服务
- **Auth_Service**: 认证服务，负责用户登录和角色识别
- **Frontend**: 微信小程序前端
- **Backend**: Spring Boot 后端服务
- **Role**: 用户角色，包括 user（普通用户）和 merchant（商家）
- **UserInfo**: 存储在本地的用户信息对象

## Requirements

### Requirement 1: 后端正确返回角色信息

**User Story:** As a 商家用户, I want 登录后系统正确识别我的角色, so that 我可以访问商家管理功能。

#### Acceptance Criteria

1. WHEN 商家用户登录时, THE Auth_Service SHALL 从数据库查询并返回正确的角色信息
2. THE Backend SHALL 返回的数据结构中 role 字段位于 data 对象的顶层
3. WHEN 用户不存在时, THE Auth_Service SHALL 创建新用户并设置默认角色为 user
4. THE Backend SHALL 在响应中包含 token、role、openid 和 userInfo 字段

### Requirement 2: 前端正确解析角色信息

**User Story:** As a 商家用户, I want 前端正确解析我的角色, so that 系统知道我是商家。

#### Acceptance Criteria

1. WHEN 收到登录响应时, THE Frontend SHALL 正确解析 data.role 字段
2. THE Frontend SHALL 将角色信息存储到 userInfo.role 中
3. THE Frontend SHALL 同步更新 app.globalData.isMerchant 标志
4. WHEN 角色为 merchant 时, THE Frontend SHALL 设置 isMerchant 为 true

### Requirement 3: 登录后正确跳转界面

**User Story:** As a 商家用户, I want 登录后自动跳转到商家管理界面, so that 我可以直接开始管理工作。

#### Acceptance Criteria

1. WHEN 商家用户登录成功时, THE Frontend SHALL 跳转到 /pages/merchant/dashboard/dashboard
2. WHEN 普通用户登录成功时, THE Frontend SHALL 跳转到首页或回调页面
3. IF 商家页面跳转失败, THEN THE Frontend SHALL 降级跳转到首页并显示错误提示
4. THE Frontend SHALL 在跳转前确保用户信息已完全存储

### Requirement 4: 我的页面显示正确的角色界面

**User Story:** As a 商家用户, I want 在"我的"页面看到商家管理入口, so that 我可以随时进入管理界面。

#### Acceptance Criteria

1. WHEN 商家用户访问"我的"页面时, THE Frontend SHALL 显示商家管理入口
2. THE Frontend SHALL 根据 userInfo.role 动态显示菜单项
3. WHEN 用户角色为 merchant 时, THE Frontend SHALL 显示"商家管理"菜单项
4. THE Frontend SHALL 在页面显示时重新检查角色状态

### Requirement 5: 角色状态持久化和同步

**User Story:** As a 用户, I want 我的角色状态在应用重启后保持一致, so that 不需要重新登录。

#### Acceptance Criteria

1. THE Frontend SHALL 将完整的 userInfo（包含 role）存储到本地
2. WHEN 应用启动时, THE Frontend SHALL 从本地存储恢复角色状态
3. THE Frontend SHALL 同步 Storage 和 globalData 中的角色信息
4. WHEN 用户退出登录时, THE Frontend SHALL 清除所有角色相关状态

