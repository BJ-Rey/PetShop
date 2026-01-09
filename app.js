//app.js
/**
 * 小程序应用实例
 * 管理全局状态、全局方法和生命周期
 */
App({
  /**
   * 应用启动时执行
   */
  onLaunch: function() {
    try {
        // 引入logger工具，用于全局日志记录
        this.logger = require('./utils/logger.js')
        const appConfig = require('./config/appConfig.js')
        
        // 初始化云开发环境
        if (wx.cloud && appConfig.cloud && appConfig.cloud.useCloudContainer) {
            wx.cloud.init({
                env: appConfig.cloud.env,
                traceUser: true
            });
            console.log('云开发环境初始化成功');
        }

        // 检查本地存储的登录状态
        this.checkLoginStatus()
        
        // 登录获取微信code，用于后续换取openId等信息
        wx.login({
        success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            // 此处仅示例，实际项目中应调用后端API
        },
        fail: error => {
            if (this.logger) {
                this.logger.error('login_failed', '登录失败', error)
            }
        }
        })
        
        // 获取用户信息权限设置
        wx.getSetting({
        success: res => {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称
            if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
                success: res => {
                // 保存用户信息到全局数据
                this.globalData.userInfo = res.userInfo
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                }
                },
                fail: error => {
                    if (this.logger) {
                        this.logger.error('get_user_info_failed', '获取用户信息失败', error)
                    }
                }
            })
            }
        },
        fail: error => {
            if (this.logger) {
                this.logger.error('get_setting_failed', '获取设置失败', error)
            }
        }
        })
    } catch (e) {
        console.error('App launch failed:', e);
    }
  },
  
  /**
   * 全局错误处理
   * @param {string} error - 错误信息
   */
  onError: function(error) {
    this.logger.fatal('global_error', '全局错误', error)
    // 可以在这里添加更多错误处理逻辑，如发送错误报告到服务器等
  },
  
  /**
   * 未处理的 Promise 拒绝处理
   * @param {Object} error - 错误对象
   */
  onUnhandledRejection: function(error) {
    this.logger.error('unhandled_rejection', '未处理的Promise拒绝', error)
  },
  
  /**
   * 检查登录状态
   * 从本地存储中获取用户信息并设置到全局数据
   */
  checkLoginStatus: function() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const merchantInfo = wx.getStorageSync('merchantInfo')
      
      if (userInfo) {
        this.globalData.userInfo = userInfo
        // 直接从userInfo.role获取角色，设置isMerchant标志
        this.globalData.isMerchant = userInfo.role === 'merchant'
        this.globalData.merchantInfo = merchantInfo
      }
    } catch (error) {
      this.logger.error('check_login_status_failed', '检查登录状态失败', error)
    }
  },
  
  /**
   * 全局登录检查函数
   * 检查用户是否已登录，未登录则引导登录
   * @returns {boolean} 是否已登录
   */
  checkLogin: function() {
    try {
      const auth = require('./utils/auth.js')
      if (!auth.isLoggedIn()) {
        // 用户未登录，引导登录
        wx.showModal({
          title: '请先登录',
          content: '您需要登录后才能进行此操作',
          showCancel: true,
          cancelText: '取消',
          confirmText: '去登录',
          success: res => {
            if (res.confirm) {
              // 跳转到登录页面
              wx.navigateTo({
                url: '/pages/login/login',
                fail: error => {
                  this.logger.error('navigate_login_failed', '跳转到登录页失败', error)
                }
              })
            }
          },
          fail: error => {
            this.logger.error('show_login_modal_failed', '显示登录模态框失败', error)
          }
        })
        return false
      }
      return true
    } catch (error) {
      this.logger.error('check_login_failed', '检查登录状态失败', error)
      return false
    }
  },
  
  /**
   * 自动识别用户身份类型
   * 根据手机号判断用户是否为商家
   * @param {string} phoneNumber - 手机号
   * @returns {boolean} 是否为商家
   */
  identifyUserType: function(phoneNumber) {
    try {
      // 模拟根据手机号识别用户类型，实际应该调用后端API
      // 配置指定手机号为商家用户
      const merchantPhoneNumbers = ['13800138000', '18247122807']
      const isMerchant = merchantPhoneNumbers.includes(phoneNumber)
      
      // 更新全局数据
      this.globalData.isMerchant = isMerchant
      
      // 保存到本地存储
      wx.setStorageSync('isMerchant', isMerchant)
      
      return isMerchant
    } catch (error) {
      this.logger.error('identify_user_type_failed', '识别用户类型失败', error)
      return false
    }
  },
  
  /**
   * 保存登录信息
   * 将用户信息保存到全局数据和本地存储
   * @param {Object} userInfo - 用户信息对象
   * @param {boolean} isMerchant - 是否为商家
   * @param {Object|null} merchantInfo - 商家信息对象
   */
  saveLoginInfo: function(userInfo, isMerchant = false, merchantInfo = null) {
    try {
      // 更新全局数据
      this.globalData.userInfo = userInfo
      this.globalData.isMerchant = isMerchant
      this.globalData.merchantInfo = merchantInfo
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('isMerchant', isMerchant)
      if (merchantInfo) {
        wx.setStorageSync('merchantInfo', merchantInfo)
      }
    } catch (error) {
      this.logger.error('save_login_info_failed', '保存登录信息失败', error)
    }
  },
  
  /**
   * 退出登录
   * 清除全局数据和本地存储中的用户信息
   */
  logout: function() {
    try {
      const auth = require('./utils/auth.js')
      // 清除全局数据
      this.globalData.userInfo = null
      this.globalData.isMerchant = false
      this.globalData.merchantInfo = null
      
      // 调用auth工具的logout方法，清除本地存储
      auth.logout()
    } catch (error) {
      this.logger.error('logout_failed', '退出登录失败', error)
    }
  },
  
  /**
   * 检查是否有权限执行某个操作
   * @param {string} operation - 操作名称
   * @returns {boolean} 是否有权限
   */
  checkPermission: function(operation) {
    try {
      // 直接从本地存储获取用户信息，避免模块加载顺序问题
      const userInfo = wx.getStorageSync('userInfo');
      const isMerchant = userInfo && userInfo.role === 'merchant';
      
      // 每次调用时动态计算权限
      switch(operation) {
        // 普通用户可执行的操作
        case 'add_pet':
        case 'edit_pet':
        case 'delete_pet':
        case 'view_personal_center':
        case 'checkout':
          return true;
        
        // 商家可执行的操作
        case 'manage_merchant':
        case 'manage_pets':
        case 'manage_products':
        case 'manage_orders':
        case 'manage_services':
          // 直接检查用户角色是否为商家
          return isMerchant;
        
        // 默认无权限
        default:
          return false;
      }
    } catch (error) {
      this.logger.error('check_permission_failed', '检查权限失败', error)
      return false
    }
  },
  
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null, // 用户信息
    isMerchant: false, // 是否为商家，默认不是商家
    merchantInfo: null, // 商家信息
    currentOrderItems: [], // 当前订单商品
    cartItemCount: 0, // 购物车商品数量
    cartItems: [], // 购物车商品列表
    userToken: null, // 用户登录态token（后端返回）
    appConfig: null  // 敏感密钥（aesKey/aesIv/appSecret）
  },

  // 封装：获取全局配置（方便后续页面调用）
  getAppConfig() {
    return this.globalData.appConfig;
  },

  // 封装：获取用户token（方便后续接口调用）
  getUserToken() {
    return this.globalData.userToken;
  }
})