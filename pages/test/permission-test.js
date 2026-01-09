// pages/test/permission-test.js
const auth = require('../../utils/auth');
const app = getApp();

Page({
  data: {
    currentRole: 'guest',
    isMerchant: false,
    hasPermission: false,
    appPermissionResult: '',
    authPermissionResult: ''
  },

  onLoad() {
    this.checkPermissions();
  },

  // 检查当前用户权限
  checkPermissions() {
    let role = 'guest';
    let isMerchant = false;
    let hasPermission = false;
    let appPermission = false;
    
    try {
      role = auth.getUserRole() || 'guest';
      isMerchant = auth.isMerchant() || false;
      hasPermission = auth.hasPermission('merchant') || false;
      appPermission = app.checkPermission('manage_merchant') || false;
    } catch (error) {
      console.error('检查权限时出错:', error);
    }
    
    this.setData({
      currentRole: role,
      isMerchant: isMerchant,
      hasPermission: hasPermission,
      appPermissionResult: appPermission ? '✅ app.checkPermission通过' : '❌ app.checkPermission失败',
      authPermissionResult: hasPermission ? '✅ auth.hasPermission通过' : '❌ auth.hasPermission失败'
    });
  },

  // 测试app.checkPermission
  testAppPermission() {
    let result = false;
    try {
      result = app.checkPermission('manage_merchant') || false;
    } catch (error) {
      console.error('测试app.checkPermission时出错:', error);
    }
    
    this.setData({
      appPermissionResult: result ? '✅ app.checkPermission通过' : '❌ app.checkPermission失败'
    });
  },

  // 测试auth.hasPermission
  testAuthPermission() {
    let result = false;
    try {
      result = auth.hasPermission('merchant') || false;
    } catch (error) {
      console.error('测试auth.hasPermission时出错:', error);
    }
    
    this.setData({
      authPermissionResult: result ? '✅ auth.hasPermission通过' : '❌ auth.hasPermission失败'
    });
  },

  // 跳转到商家首页
  goToMerchantDashboard() {
    wx.navigateTo({
      url: '/pages/merchant/dashboard/dashboard'
    });
  },

  // 跳转到宠物上传页面
  goToPetUpload() {
    wx.navigateTo({
      url: '/pages/merchant/pet/upload/upload'
    });
  },

  // 更新权限信息
  refreshPermissions() {
    this.checkPermissions();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    });
  }
});
