// pages/merchant/setting/setting.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 商家信息
    merchantInfo: {
      logo: 'https://example.com/merchant-logo.png',
      name: '宠物乐园',
      phone: '13800138000',
      address: '北京市朝阳区宠物大街123号'
    },
    
    // 营业时间
    businessHours: '周一至周日 9:00-21:00',
    
    // 通知设置
    notificationSettings: {
      order: true,
      message: true,
      finance: true
    },
    
    // 绑定手机号
    boundPhone: '13800138000',
    
    // 应用版本
    appVersion: '1.0.0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!app.checkLogin()) {
      return
    }
    
    // 检查权限
    if (!app.checkPermission('manage_merchant')) {
      wx.showToast({
        title: '您没有权限访问此页面',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    // 加载设置数据
    this.loadSettings()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重新加载设置数据
    this.loadSettings()
  },

  /**
   * 加载设置数据
   */
  loadSettings() {
    // 模拟数据，实际应该调用API获取设置数据
    // 这里使用初始数据作为模拟
    
    // 从本地存储获取通知设置（如果有）
    const savedNotificationSettings = wx.getStorageSync('notificationSettings')
    if (savedNotificationSettings) {
      this.setData({
        notificationSettings: savedNotificationSettings
      })
    }
  },

  /**
   * 编辑商家基本信息
   */
  editMerchantInfo() {
    wx.navigateTo({
      url: '/pages/merchant/setting/edit-basic-info/edit-basic-info'
    })
  },

  /**
   * 编辑商家LOGO
   */
  editMerchantLogo() {
    wx.navigateTo({
      url: '/pages/merchant/setting/upload-logo/upload-logo'
    })
  },

  /**
   * 编辑营业时间
   */
  editBusinessHours() {
    wx.navigateTo({
      url: '/pages/merchant/setting/business-hours/business-hours'
    })
  },

  /**
   * 编辑配送设置
   */
  editShippingSettings() {
    wx.navigateTo({
      url: '/pages/merchant/setting/delivery-setting/delivery-setting'
    })
  },

  /**
   * 编辑支付设置
   */
  editPaymentSettings() {
    wx.navigateTo({
      url: '/pages/merchant/setting/payment-setting/payment-setting'
    })
  },

  /**
   * 管理商品分类
   */
  manageCategories() {
    wx.navigateTo({
      url: '/pages/merchant/setting/category/category'
    })
  },

  /**
   * 管理优惠活动
   */
  managePromotions() {
    wx.navigateTo({
      url: '/pages/merchant/setting/promotion/promotion'
    })
  },

  /**
   * 切换通知设置
   */
  toggleNotification(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    const notificationSettings = {
      ...this.data.notificationSettings,
      [type]: checked
    }
    
    this.setData({
      notificationSettings: notificationSettings
    })
    
    // 保存到本地存储
    wx.setStorageSync('notificationSettings', notificationSettings)
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    })
  },

  /**
   * 修改密码
   */
  changePassword() {
    wx.showToast({
      title: '该功能正在开发中',
      icon: 'none'
    })
  },

  /**
   * 修改支付密码
   */
  changePaymentPassword() {
    wx.showToast({
      title: '该功能正在开发中',
      icon: 'none'
    })
  },

  /**
   * 绑定手机号
   */
  bindPhone() {
    wx.showToast({
      title: '该功能正在开发中',
      icon: 'none'
    })
  },

  /**
   * 显示版本信息
   */
  showVersionInfo() {
    wx.showModal({
      title: '版本信息',
      content: `当前版本：${this.data.appVersion}\n更新日期：2025-12-19\n最新功能：\n1. 优化商家管理界面\n2. 新增财务统计功能\n3. 修复已知bug`,
      showCancel: false
    })
  },

  /**
   * 显示帮助中心
   */
  showHelpCenter() {
    wx.showToast({
      title: '该功能正在开发中',
      icon: 'none'
    })
  },

  /**
   * 显示隐私政策
   */
  showPrivacyPolicy() {
    wx.showToast({
      title: '该功能正在开发中',
      icon: 'none'
    })
  },

  /**
   * 显示服务条款
   */
  showTermsOfService() {
    wx.showToast({
      title: '该功能正在开发中',
      icon: 'none'
    })
  },

  /**
   * 管理角色与权限
   */
  managePermissions() {
    wx.navigateTo({
      url: '/pages/merchant/setting/permission/permission'
    })
  },



  /**
   * 查看操作日志
   */
  viewOperationLogs() {
    wx.navigateTo({
      url: '/pages/merchant/setting/log/log'
    })
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的登录状态信息
          wx.clearStorageSync()
          // 将页面重定向至登录页面
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})
