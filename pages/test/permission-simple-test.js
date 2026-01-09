// pages/test/permission-simple-test.js
const auth = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    testResults: []
  },

  onLoad() {
    this.runTests();
  },

  // 执行权限测试
  runTests() {
    const results = [];
    
    // 测试1: 检查auth.isMerchant是否已导出
    try {
      const isMerchant = auth.isMerchant();
      results.push({ 
        test: 'auth.isMerchant函数导出', 
        result: '✅ 通过', 
        details: `返回值: ${isMerchant}` 
      });
    } catch (error) {
      results.push({ 
        test: 'auth.isMerchant函数导出', 
        result: '❌ 失败', 
        details: `错误: ${error.message}` 
      });
    }
    
    // 测试2: 测试auth.hasPermission('merchant')
    try {
      const hasPermission = auth.hasPermission('merchant');
      results.push({ 
        test: 'auth.hasPermission("merchant")', 
        result: hasPermission ? '✅ 通过' : '❌ 失败', 
        details: `返回值: ${hasPermission}` 
      });
    } catch (error) {
      results.push({ 
        test: 'auth.hasPermission("merchant")', 
        result: '❌ 失败', 
        details: `错误: ${error.message}` 
      });
    }
    
    // 测试3: 测试app.checkPermission('manage_merchant')
    try {
      const appPermission = app.checkPermission('manage_merchant');
      results.push({ 
        test: 'app.checkPermission("manage_merchant")', 
        result: appPermission ? '✅ 通过' : '❌ 失败', 
        details: `返回值: ${appPermission}` 
      });
    } catch (error) {
      results.push({ 
        test: 'app.checkPermission("manage_merchant")', 
        result: '❌ 失败', 
        details: `错误: ${error.message}` 
      });
    }
    
    // 测试4: 测试getUserRole
    try {
      const role = auth.getUserRole();
      results.push({ 
        test: 'auth.getUserRole()', 
        result: '✅ 通过', 
        details: `返回值: ${role}` 
      });
    } catch (error) {
      results.push({ 
        test: 'auth.getUserRole()', 
        result: '❌ 失败', 
        details: `错误: ${error.message}` 
      });
    }
    
    // 测试5: 测试getUserInfo
    try {
      const userInfo = auth.getUserInfo();
      results.push({ 
        test: 'auth.getUserInfo()', 
        result: '✅ 通过', 
        details: userInfo ? '有用户信息' : '无用户信息' 
      });
    } catch (error) {
      results.push({ 
        test: 'auth.getUserInfo()', 
        result: '❌ 失败', 
        details: `错误: ${error.message}` 
      });
    }
    
    this.setData({ testResults: results });
  },

  // 跳转到商家首页
  goToMerchantDashboard() {
    wx.navigateTo({
      url: '/pages/merchant/dashboard/dashboard'
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
