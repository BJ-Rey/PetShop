# Implementation Plan: 商家角色识别和界面切换修复

## Overview

本实现计划修复商家登录后仍显示用户界面的问题。按照数据流顺序修复：后端 → auth.js → login.js → mine.js → app.js。

## Tasks

- [x] 1. 验证后端返回数据结构
  - 检查 AuthController.java 确认 role 字段正确返回
  - 检查数据库中商家用户的 role 字段值
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. 修复前端角色解析和存储
  - [x] 2.1 修复 auth.js 中的 verifyPhoneAndIdentifyUser 函数
    - 简化角色解析逻辑，直接使用 res.role
    - 同步更新 app.globalData.isMerchant
    - 添加调试日志
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.2 编写 auth.js 角色解析单元测试
    - **Property 2: 前端正确解析并存储角色**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 3. 修复登录后跳转逻辑
  - [x] 3.1 修复 login.js 中的 handleLogin 函数
    - 根据 userInfo.role 判断跳转目标
    - 商家跳转到 /pages/merchant/dashboard/dashboard
    - 普通用户跳转到首页或回调页面
    - 添加跳转失败降级处理
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. 修复"我的"页面角色菜单显示
  - [x] 4.1 修复 mine.js 中的 checkLoginStatus 函数
    - 根据 userInfo.role 设置 isMerchant 标志
    - 动态构建菜单列表
    - 商家显示"商家管理"入口
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.2 修复 mine.wxml 模板
    - 确保菜单列表正确渲染
    - _Requirements: 4.2_

  - [ ]* 4.3 编写角色菜单显示测试
    - **Property 3: 角色与菜单显示一致性**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [x] 5. 修复应用启动时角色状态恢复
  - [x] 5.1 修复 app.js 中的 checkLoginStatus 函数
    - 从 Storage 恢复 userInfo
    - 根据 userInfo.role 设置 globalData.isMerchant
    - 添加调试日志
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.2 修复 auth.js 中的 logout 函数
    - 清除 Storage 中的 userInfo 和 token
    - 重置 globalData.isMerchant 为 false
    - _Requirements: 5.4_

  - [ ]* 5.3 编写角色状态持久化测试
    - **Property 4: 角色状态持久化和恢复**
    - **Property 5: 登出清除所有角色状态**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 6. Checkpoint - 功能验证
  - 使用商家账号登录，验证跳转到商家管理页面
  - 验证"我的"页面显示"商家管理"入口
  - 关闭小程序重新打开，验证角色状态保持
  - 退出登录，验证角色状态清除
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. 数据库商家用户配置（如需要）
  - [x] 7.1 创建或更新商家用户 SQL
    - 确保测试手机号对应的用户 role 为 'merchant'
    - _Requirements: 1.1_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 修复顺序按数据流：后端 → auth.js → login.js → mine.js → app.js
- 每个修复点都添加 console.log 便于调试
- 测试时使用商家手机号（如 13800138000）验证

