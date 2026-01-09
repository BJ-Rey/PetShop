// pages/merchant/setting/payment-setting/payment-setting.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 支付方式
    paymentMethods: {
      wechatPay: true,
      alipay: true,
      bankCard: false,
      cash: true,
      balance: false
    },
    
    // 支付设置
    paymentTimeout: 30,
    autoConfirmDays: 7,
    transactionFee: 0.6,
    minWithdrawAmount: 100,
    withdrawFee: 0.1,
    
    // 退款设置
    refundSettings: {
      allowRefund: true,
      refundValidity: 7,
      needReview: true,
      autoRefund: false,
      refundFee: 0.5
    },
    
    // 支付通知设置
    notificationSettings: {
      paymentSuccess: true,
      refundSuccess: true,
      withdrawSuccess: true,
      paymentFailed: false
    }
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
    
    // 加载支付设置
    this.loadPaymentSetting()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 保存初始数据副本，用于检查是否有未保存的修改
    this.initialData = JSON.stringify({
      paymentMethods: this.data.paymentMethods,
      paymentTimeout: this.data.paymentTimeout,
      autoConfirmDays: this.data.autoConfirmDays,
      transactionFee: this.data.transactionFee,
      minWithdrawAmount: this.data.minWithdrawAmount,
      withdrawFee: this.data.withdrawFee,
      refundSettings: this.data.refundSettings,
      notificationSettings: this.data.notificationSettings
    })
  },

  /**
   * 加载支付设置
   */
  loadPaymentSetting() {
    // 模拟数据，实际应该调用API获取支付设置
    // 从本地存储获取设置（如果有）
    const savedPaymentSetting = wx.getStorageSync('paymentSetting')
    if (savedPaymentSetting) {
      this.setData(savedPaymentSetting)
    }
  },

  /**
   * 切换支付方式
   */
  togglePaymentMethod(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    this.setData({
      [`paymentMethods.${type}`]: checked
    })
  },

  /**
   * 输入框变化事件
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [field]: value
    })
  },

  /**
   * 切换退款设置
   */
  toggleRefundSetting(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    this.setData({
      [`refundSettings.${type}`]: checked
    })
  },

  /**
   * 退款设置输入框变化事件
   */
  onRefundInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`refundSettings.${field}`]: value
    })
  },

  /**
   * 切换通知设置
   */
  toggleNotificationSetting(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    this.setData({
      [`notificationSettings.${type}`]: checked
    })
  },

  /**
   * 配置微信支付
   */
  configureWechatPay() {
    wx.showToast({
      title: '微信支付配置功能开发中',
      icon: 'none'
    })
  },

  /**
   * 配置支付宝
   */
  configureAlipay() {
    wx.showToast({
      title: '支付宝配置功能开发中',
      icon: 'none'
    })
  },

  /**
   * 配置银行卡支持
   */
  configureBankCard() {
    wx.showToast({
      title: '银行卡支持配置功能开发中',
      icon: 'none'
    })
  },

  /**
   * 检查是否有未保存的修改
   */
  hasUnsavedChanges() {
    const currentData = JSON.stringify({
      paymentMethods: this.data.paymentMethods,
      paymentTimeout: this.data.paymentTimeout,
      autoConfirmDays: this.data.autoConfirmDays,
      transactionFee: this.data.transactionFee,
      minWithdrawAmount: this.data.minWithdrawAmount,
      withdrawFee: this.data.withdrawFee,
      refundSettings: this.data.refundSettings,
      notificationSettings: this.data.notificationSettings
    })
    
    return this.initialData !== currentData
  },

  /**
   * 保存支付设置
   */
  savePaymentSetting() {
    if (this.isSaving) return
    this.isSaving = true

    const paymentSetting = {
      paymentMethods: this.data.paymentMethods,
      paymentTimeout: this.data.paymentTimeout,
      autoConfirmDays: this.data.autoConfirmDays,
      transactionFee: this.data.transactionFee,
      minWithdrawAmount: this.data.minWithdrawAmount,
      withdrawFee: this.data.withdrawFee,
      refundSettings: this.data.refundSettings,
      notificationSettings: this.data.notificationSettings
    }
    
    wx.showLoading({
      title: '保存中..',
      mask: true
    })
    
    // 模拟API请求，实际应该调用API保存支付设置
    setTimeout(() => {
      wx.hideLoading()
      
      // 保存到本地存储
      wx.setStorageSync('paymentSetting', paymentSetting)
      
      // 更新初始数据副本，标记为已保存
      this.initialData = JSON.stringify(paymentSetting)
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      this.isSaving = false
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  },

  /**
   * 返回上一页
   */
  goBack() {
    // 检查是否有未保存的修改
    if (this.hasUnsavedChanges()) {
      wx.showModal({
        title: '确认返回',
        content: '您有未保存的修改，是否确认返回？',
        confirmText: '确认返回',
        cancelText: '继续编辑',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  }
})