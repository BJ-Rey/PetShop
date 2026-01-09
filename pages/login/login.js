// pages/login/login.js
const auth = require('../../utils/auth');
const globalUtils = require('../../utils/globalUtils');
const { logError } = globalUtils;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phoneNumber: '',
    verificationCode: '',
    countdown: 0,
    canSendCode: true,
    canLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    try {
        console.log('Login page loaded', options);
        // 从options中获取可能的回调页面
        if (options && options.callbackPage) {
            this.callbackPage = decodeURIComponent(options.callbackPage);
        } else {
            this.callbackPage = '/pages/index/index';
        }
    } catch (error) {
        console.error('Login onLoad error:', error);
        this.callbackPage = '/pages/index/index';
    }
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  handleBackHome() {
    console.log('User clicked Back Home button');
    wx.switchTab({
        url: '/pages/index/index',
        success: () => {
             console.log('Switch tab success');
        },
        fail: (err) => {
            console.error('Switch tab failed:', err);
            // 尝试降级跳转
            wx.reLaunch({
                url: '/pages/index/index'
            });
        }
    });
  },

  /**
   * 验证手机号格式
   */
  isValidPhone(phoneNumber) {
    return /^1[3-9]\d{9}$/.test(phoneNumber);
  },

  /**
   * 检查是否可以登录
   */
  canLogin(phoneNumber, verificationCode) {
    // 登录按钮的状态不再依赖协议勾选，而是在点击登录时检查
    return this.isValidPhone(phoneNumber) && verificationCode.length === 6;
  },

  /**
   * 协议勾选状态变化
   */
  onAgreementChange(e) {
    this.setData({
      isAgreed: e.detail.value.length > 0
    });
  },

  /**
   * 显示用户协议
   */
  showUserAgreement() {
    this.setData({
      showAgreementModal: true,
      agreementTitle: this.data.agreements.user.title,
      agreementContent: this.data.agreements.user.content
    });
  },

  /**
   * 显示隐私政策
   */
  showPrivacyPolicy() {
    this.setData({
      showAgreementModal: true,
      agreementTitle: this.data.agreements.privacy.title,
      agreementContent: this.data.agreements.privacy.content
    });
  },

  /**
   * 隐藏协议弹窗
   */
  hideAgreementModal() {
    this.setData({
      showAgreementModal: false
    });
  },

  /**
   * 手机号输入事件处理
   */
  onPhoneInput: function(e) {
    const phoneNumber = e.detail.value;
    this.setData({
      phoneNumber,
      canSendCode: this.isValidPhone(phoneNumber) && this.data.countdown === 0,
      canLogin: this.canLogin(phoneNumber, this.data.verificationCode)
    });
  },

  /**
   * 验证码输入事件处理
   */
  onVerificationCodeInput: function(e) {
    const verificationCode = e.detail.value;
    this.setData({
      verificationCode,
      canLogin: this.canLogin(this.data.phoneNumber, verificationCode)
    });
  },

  /**
   * 发送验证码事件处理
   */
  sendVerificationCode: function() {
    if (!this.isValidPhone(this.data.phoneNumber)) {
      globalUtils.showErrorToast('请输入正确的手机号');
      return;
    }

    // 模拟发送验证码
    globalUtils.showErrorToast('验证码已发送', { icon: 'success' });

    // 开始倒计时
    this.startCountdown();
  },

  /**
   * 开始倒计时
   */
  startCountdown() {
    let countdown = 60;
    this.setData({
      countdown,
      canSendCode: false
    });

    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          countdown: 0,
          canSendCode: this.isValidPhone(this.data.phoneNumber)
        });
      } else {
        this.setData({
          countdown
        });
      }
    }, 1000);
  },

  // 处理登录
  async handleLogin() {
    try {
        if (this.data.loading) return;
        
        const { phoneNumber, verificationCode, isAgreed } = this.data;
        
        // 验证
        if (!phoneNumber || phoneNumber.length !== 11) {
        wx.showToast({
            title: '请输入正确的手机号',
            icon: 'none'
        });
        return;
        }
        
        if (!verificationCode || verificationCode.length !== 6) {
        wx.showToast({
            title: '请输入6位验证码',
            icon: 'none'
        });
        return;
        }
        
        if (!isAgreed) {
        wx.showToast({
            title: '请阅读并同意用户协议',
            icon: 'none'
        });
        return;
        }
        
        this.setData({ loading: true });
        
        // 调用登录接口
        // const userInfo = await auth.verifyPhoneAndIdentifyUser(phoneNumber, verificationCode);
        // 使用 Promise 形式以兼容不支持 await 的环境
        auth.verifyPhoneAndIdentifyUser(phoneNumber, verificationCode).then(async userInfo => {
            console.log('Login success:', userInfo);
            
            // 保存token到全局
            const app = getApp();
            app.globalData.userToken = userInfo.token;
            
            // 获取密钥
            await this.getSecretFromBackend();

            wx.showToast({
                title: '登录成功',
                icon: 'success'
            });
            
            // 根据用户角色跳转
            const redirectUrl = userInfo.role === 'merchant' ? '/pages/merchant/dashboard/dashboard' : this.callbackPage;
            console.log('Redirecting to:', redirectUrl, 'Role:', userInfo.role);

            setTimeout(() => {
                // 如果是商家且跳转到 merchant 页面，使用 navigateTo (因为 merchant 包可能不在 tabbar)
                // 如果是 tabbar 页面，使用 switchTab
                if (userInfo.role === 'merchant') {
                    console.log('Attempting to navigate to merchant dashboard...');
                    wx.navigateTo({
                        url: redirectUrl,
                        success: () => console.log('Merchant login redirect success'),
                        fail: (err) => {
                            console.error('Merchant redirect failed:', err);
                            // Fallback to home if merchant page fails
                            wx.switchTab({ url: '/pages/index/index' });
                        }
                    });
                } else {
                    globalUtils.safeNavigate(redirectUrl, { 
                        success: () => {
                            console.log('Login redirect success');
                        },
                        fail: (error) => {
                            console.error('Login redirect error:', error);
                            logError('LoginRedirect', error);
                            // 跳转失败时的降级处理
                            wx.switchTab({
                                url: '/pages/index/index',
                                fail: () => {
                                    wx.reLaunch({ url: '/pages/index/index' });
                                }
                            });
                        }
                    });
                }
            }, 1500);
        }).catch(error => {
            console.error('Login error:', error);
            wx.showToast({
                title: error.message || '登录失败',
                icon: 'none'
            });
            this.setData({ loading: false });
        });

    } catch (e) {
        console.error('HandleLogin exception:', e);
        this.setData({ loading: false });
        wx.showToast({ title: '系统错误', icon: 'none' });
    }
  },

  // 核心：调用后端/api/getSecret接口，获取敏感密钥
  async getSecretFromBackend() {
    try {
      const app = getApp();
      const userToken = app.getUserToken();
      if (!userToken) {
        console.warn('No user token available for fetching secrets');
        return;
      }

      const appConfig = require('../../config/appConfig');

      // 1. 调用云托管后端密钥接口
      // 检查是否配置了云托管，如果没有则跳过（防止开发环境报错）
      if (appConfig.cloud && appConfig.cloud.useCloudContainer) {
          const cloudRes = await wx.cloud.callContainer({
            config: { env: appConfig.cloud.env },
            path: '/api/getSecret', // 后端新增的密钥接口
            header: {
              'X-WX-SERVICE': appConfig.cloud.service,
              'Authorization': userToken // 传递登录态token，用于后端鉴权
            },
            method: 'POST'
          });

          // 2. 处理密钥返回结果，暂存到全局内存
          // 注意：wx.cloud.callContainer 返回的结构通常是 { data: { code: 0, data: {...} }, ... }
          // 取决于后端 ApiResponse 的结构
          const responseBody = cloudRes.data; 
          if (responseBody && responseBody.code === 0 && responseBody.data) {
            // 仅存全局内存，不存wx.setStorage
            app.globalData.appConfig = responseBody.data;
            console.log('密钥获取成功（仅存内存）');
          } else {
            console.error('密钥获取失败', responseBody);
            // 不阻断流程，但可能导致后续加密失败
          }
      } else {
          console.warn('云托管未配置，跳过密钥获取');
      }
    } catch (err) {
      console.error('密钥获取异常：', err);
      // wx.showToast({ title: '密钥获取网络异常', icon: 'error' });
    }
  },
});
