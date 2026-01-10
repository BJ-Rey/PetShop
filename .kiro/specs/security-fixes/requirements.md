# Requirements Document

## Introduction

本文档定义了宠物商城小程序项目中发现的安全漏洞和编程问题的修复需求。项目包含微信小程序前端（JavaScript）和 Spring Boot 后端（Java），存在多个严重的安全隐患需要系统性修复。

## Glossary

- **System**: 宠物商城系统，包含前端小程序和后端服务
- **Auth_Service**: 认证服务，负责用户登录、Token 生成和验证
- **Order_Service**: 订单服务，负责订单的创建、查询和状态管理
- **Request_Util**: 前端网络请求工具，负责 API 调用、签名和缓存
- **Token**: 用户身份凭证，用于验证用户身份和权限
- **JWT**: JSON Web Token，一种安全的 Token 格式
- **Signature**: 请求签名，用于验证请求的完整性和来源

## Requirements

### Requirement 1: 敏感配置外部化

**User Story:** As a 运维人员, I want 敏感配置信息从代码中分离, so that 防止密码泄露和便于环境切换。

#### Acceptance Criteria

1. WHEN 系统启动时, THE System SHALL 从环境变量读取数据库密码
2. WHEN 环境变量未设置时, THE System SHALL 拒绝启动并输出明确错误信息
3. THE System SHALL 不在任何配置文件中硬编码数据库密码、API密钥等敏感信息
4. WHEN 前端需要加密密钥时, THE Request_Util SHALL 从后端 API 动态获取

### Requirement 2: 安全的身份认证

**User Story:** As a 用户, I want 安全的登录机制, so that 我的账户不会被冒用。

#### Acceptance Criteria

1. WHEN 用户提交验证码登录时, THE Auth_Service SHALL 验证验证码的有效性
2. IF 验证码无效或过期, THEN THE Auth_Service SHALL 返回错误并拒绝登录
3. WHEN 用户登录成功时, THE Auth_Service SHALL 生成包含用户ID、角色和过期时间的 JWT Token
4. THE Auth_Service SHALL 使用 HMAC-SHA256 算法签名 JWT Token
5. WHEN Token 过期时, THE System SHALL 要求用户重新登录

### Requirement 3: 安全的请求签名

**User Story:** As a 开发者, I want API 请求具有防篡改能力, so that 防止请求被伪造或重放。

#### Acceptance Criteria

1. THE Request_Util SHALL 使用 HMAC-SHA256 算法生成请求签名
2. WHEN 生成签名时, THE Request_Util SHALL 包含时间戳、随机数和请求参数
3. WHEN 后端收到请求时, THE System SHALL 验证签名的有效性
4. IF 签名无效或时间戳超过5分钟, THEN THE System SHALL 拒绝请求

### Requirement 4: 订单访问权限控制

**User Story:** As a 用户, I want 只能查看自己的订单, so that 我的订单信息不会被他人获取。

#### Acceptance Criteria

1. WHEN 用户查询订单列表时, THE Order_Service SHALL 从 Token 中提取用户身份
2. THE Order_Service SHALL 只返回属于当前用户的订单
3. WHEN 商家查询订单时, THE Order_Service SHALL 验证商家角色权限
4. IF 用户尝试访问他人订单, THEN THE Order_Service SHALL 返回403错误
5. WHEN 更新订单状态时, THE Order_Service SHALL 验证操作者有权限修改该订单

### Requirement 5: 订单状态并发控制

**User Story:** As a 系统管理员, I want 订单状态更新具有并发安全性, so that 不会出现状态不一致。

#### Acceptance Criteria

1. THE Order_Service SHALL 使用乐观锁机制控制订单状态更新
2. WHEN 订单版本号不匹配时, THE Order_Service SHALL 拒绝更新并返回冲突错误
3. THE Order_Service SHALL 在状态转换前验证转换的合法性
4. IF 状态转换不合法, THEN THE Order_Service SHALL 返回明确的错误信息

### Requirement 6: Token 安全存储

**User Story:** As a 用户, I want 我的登录凭证安全存储, so that 不会被恶意程序窃取。

#### Acceptance Criteria

1. THE Auth_Service SHALL 设置 Token 的合理过期时间（默认7天）
2. WHEN 用户退出登录时, THE System SHALL 清除本地存储的 Token
3. THE Request_Util SHALL 在每次请求时检查 Token 是否过期
4. IF Token 即将过期（剩余1天）, THEN THE System SHALL 自动刷新 Token

### Requirement 7: 统一错误处理

**User Story:** As a 开发者, I want 统一的错误处理机制, so that 便于调试和用户体验一致。

#### Acceptance Criteria

1. THE System SHALL 定义标准的错误响应格式，包含 code、message 和 details
2. WHEN 发生业务异常时, THE System SHALL 返回对应的业务错误码
3. WHEN 发生系统异常时, THE System SHALL 记录详细日志但只返回通用错误信息
4. THE Request_Util SHALL 提供统一的错误拦截和处理机制

### Requirement 8: 输入验证

**User Story:** As a 系统管理员, I want 所有输入都经过验证, so that 防止注入攻击和数据异常。

#### Acceptance Criteria

1. THE System SHALL 对所有 API 输入参数进行验证
2. WHEN 创建订单时, THE Order_Service SHALL 验证金额、商品ID等必填字段
3. IF 输入验证失败, THEN THE System SHALL 返回400错误和具体的验证失败信息
4. THE System SHALL 对字符串输入进行长度和格式验证

