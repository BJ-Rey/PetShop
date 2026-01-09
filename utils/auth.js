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

/**
 * 验证手机号并识别用户类型
 * @param {string} phoneNumber - 手机号
 * @param {string} verificationCode - 验证码
 * @returns {Promise<Object>} - 包含用户信息的Promise
 * @resolve {Object} - 用户信息对象，包含role、phoneNumber等字段
 * @reject {Error} - 验证失败时抛出错误
 */
const verifyPhoneAndIdentifyUser = (phoneNumber, verificationCode) => {
  // 模拟手机号验证和用户类型识别
  // 实际项目中应调用后端API
  return new Promise((resolve, reject) => {
    // 模拟网络请求延迟
    setTimeout(() => {
      // 测试账号配置
      const testAccounts = {
        '18247122807': { role: 'merchant', id: 'merchant-test-001' },
        '13848836315': { role: 'user', id: 'user-test-001' }
      };
      
      // 验证测试账号和验证码
      if (testAccounts[phoneNumber]) {
        // 测试账号，使用固定验证码123456
        if (verificationCode === '123456') {
          const userInfo = {
            phoneNumber,
            role: testAccounts[phoneNumber].role,
            token: `mock-token-${Date.now()}`,
            id: testAccounts[phoneNumber].id
          };
          
          // 保存用户信息到本地存储
          const finalUserInfo = {
            ...userInfo,
            agreementAgreed: true,
            agreementVersion: '1.0.0',
            agreementTime: Date.now()
          };
          wx.setStorageSync('userInfo', finalUserInfo);
          resolve(finalUserInfo);
        } else {
          reject(new Error('验证码错误'));
        }
      } else {
        // 普通账号：手机号以188开头的是商家，其他是普通用户
        const isMerchant = phoneNumber.startsWith('188');
        const userInfo = {
          phoneNumber,
          role: isMerchant ? 'merchant' : 'user',
          token: `mock-token-${Date.now()}`,
          id: isMerchant ? 'merchant-001' : 'user-001',
          agreementAgreed: true,
          agreementVersion: '1.0.0',
          agreementTime: Date.now()
        };
        
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', userInfo);
        resolve(userInfo);
      }
    }, 500);
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
 */
const logout = () => {
  try {
    // 清除本地存储中的用户信息
    wx.removeStorageSync('userInfo');
    // 显示退出成功提示
    wx.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 2000
    });
  } catch (error) {
    console.error('退出登录失败:', error);
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
