// 登录验证和权限管理工具

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
const isLoggedIn = () => {
  const userInfo = wx.getStorageSync('userInfo');
  return !!userInfo;
};

/**
 * 获取用户信息
 * @returns {Object|null} - 用户信息对象或null
 */
const getUserInfo = () => {
  return wx.getStorageSync('userInfo') || null;
};

/**
 * 获取用户角色
 * @returns {string} - 用户角色：guest、user或merchant
 */
const getUserRole = () => {
  const userInfo = getUserInfo();
  if (!userInfo) {
    return 'guest'; // guest, user, merchant
  }
  // 直接从userInfo.role获取角色，而不是从本地存储获取isMerchant标志
  return userInfo.role || 'user';
};

/**
 * 检查用户是否是商家
 * @returns {boolean} - 是否是商家
 */
const isMerchant = () => {
  return getUserRole() === 'merchant';
};

/**
 * 检查用户是否有权限
 * @param {string} requiredRole - 所需角色：guest、user或merchant
 * @returns {boolean} - 是否有权限
 */
const hasPermission = (requiredRole) => {
  const userRole = getUserRole();
  // 角色层级关系：guest < user < merchant
  const roleHierarchy = {
    guest: 0,
    user: 1,
    merchant: 2
  };
  
  // 检查当前角色是否高于或等于所需角色
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

const request = require('./request');

/**
 * 验证手机号并识别用户类型
 * @param {string} phoneNumber - 手机号
 * @param {string} verificationCode - 验证码
 * @returns {Promise<Object>} - 包含用户信息的Promise
 */
const verifyPhoneAndIdentifyUser = (phoneNumber, verificationCode) => {
  return request.post('/api/auth/login', {
    phone: phoneNumber,
    code: verificationCode
  }).then(res => {
      console.log('[Auth] Login Response:', res);

      // request.js 已经返回 result.data，所以 res 就是 {token, role, openid, userInfo}
      // 直接获取 role，不需要多层判断
      const role = res.role || 'user';
      
      console.log('[Auth] Parsed Role:', role);

      // Backend returns { token, role, openid, userInfo }
      // Map to frontend expected structure
      const userInfo = {
          phoneNumber: phoneNumber,
          role: role,  // 确保 role 正确设置
          token: res.token,
          id: res.openid,
          nickname: res.userInfo?.nickname || '',
          avatarUrl: res.userInfo?.avatarUrl || '',
          agreementAgreed: true,
          agreementVersion: '1.0.0',
          agreementTime: Date.now()
      };
      
      // 存储到本地
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('token', res.token);
      
      // 同步更新全局状态
      const app = getApp();
      if (app) {
          app.globalData.userInfo = userInfo;
          app.globalData.isMerchant = (role === 'merchant');
          app.globalData.userToken = res.token;
          console.log('[Auth] Updated globalData.isMerchant:', app.globalData.isMerchant);
      }
      
      return userInfo;
  });
};

/**
 * 登录验证拦截器
 * @param {Function} successCallback - 已登录时的回调函数
 * @param {Function} failCallback - 未登录时的回调函数
 */
const loginInterceptor = (successCallback, failCallback) => {
  if (isLoggedIn()) {
    // 已登录，执行成功回调
    successCallback && successCallback(getUserInfo());
  } else {
    // 未登录，显示登录弹窗或跳转登录页
    wx.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          // 跳转登录页
          wx.navigateTo({
            url: '/pages/login/login',
            success: () => {
              failCallback && failCallback();
            }
          });
        }
      }
    });
  }
};

/**
 * 权限验证拦截器
 * @param {string} requiredRole - 所需角色
 * @param {Function} successCallback - 有权限时的回调函数
 * @param {Function} failCallback - 无权限时的回调函数
 */
const permissionInterceptor = (requiredRole, successCallback, failCallback) => {
  loginInterceptor(
    (userInfo) => {
      if (hasPermission(requiredRole)) {
        // 有权限，执行成功回调
        successCallback && successCallback(userInfo);
      } else {
        // 无权限，显示提示
        wx.showToast({
          title: '没有操作权限',
          icon: 'none',
          duration: 2000
        });
        failCallback && failCallback();
      }
    },
    failCallback
  );
};

/**
 * 退出登录
 * 清除 Storage 中的 userInfo 和 token
 * 重置 globalData.isMerchant 为 false
 * Requirements: 5.4
 */
const logout = () => {
  try {
    // 清除 Storage 中的 userInfo 和 token
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
    wx.removeStorageSync('merchantInfo');
    wx.removeStorageSync('isMerchant');
    
    // 重置 globalData
    const app = getApp();
    if (app) {
      app.globalData.userInfo = null;
      app.globalData.isMerchant = false;
      app.globalData.merchantInfo = null;
      app.globalData.userToken = null;
      console.log('[Auth] Logout: globalData reset, isMerchant:', app.globalData.isMerchant);
    }
    
    console.log('[Auth] Logout: Storage cleared');
    
    // 显示退出成功提示
    wx.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 2000
    });
  } catch (error) {
    console.error('[Auth] Logout failed:', error);
  }
};

/**
 * 检查权限并执行操作
 * @param {Function} callback - 有权限时执行的回调
 * @returns {boolean} - 是否有权限
 */
const checkPermission = (callback) => {
  console.log('checkPermission called');
  if (isLoggedIn()) {
    console.log('User is logged in, executing callback');
    if (callback && typeof callback === 'function') {
      callback();
    }
    return true;
  }
  console.log('User is NOT logged in');


  // 未登录，尝试唤起弹窗
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage) {
    const authModal = currentPage.selectComponent('#auth-modal');
    if (authModal) {
      authModal.show(callback);
      return false;
    }
  }

  // 降级处理：直接跳转登录页
  wx.navigateTo({
    url: '/pages/login/login'
  });
  return false;
};

module.exports = {
  isLoggedIn,
  getUserInfo,
  getUserRole,
  hasPermission,
  isMerchant,
  verifyPhoneAndIdentifyUser,
  loginInterceptor,
  permissionInterceptor,
  logout,
  checkPermission
};
