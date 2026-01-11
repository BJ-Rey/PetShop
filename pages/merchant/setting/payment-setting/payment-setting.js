// pages/merchant/setting/payment-setting/payment-setting.js
const app = getApp()
const merchantApi = require('../../../../api/merchantApi')

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
    },
    
    // 加载状态
    isLoading: false,
    // 提交状态
    isSubmitting: false
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
   * 从数据库加载支付设置
   */
  async loadPaymentSetting() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getPaymentSetting()
      console.log('获取支付设置成功:', res)
      
      if (res && res.data) {
        this.setData({
          paymentMethods: res.data.paymentMethods || this.data.paymentMethods,
          paymentTimeout: res.data.paymentTimeout || this.data.paymentTimeout,
          autoConfirmDays: res.data.autoConfirmDays || this.data.autoConfirmDays,
          transactionFee: res.data.transactionFee || this.data.transactionFee,
          minWithdrawAmount: res.data.minWithdrawAmount || this.data.minWithdrawAmount,
          withdrawFee: res.data.withdrawFee || this.data.withdrawFee,
          refundSettings: res.data.refundSettings || this.data.refundSettings,
          notificationSettings: res.data.notificationSettings || this.data.notificationSettings
        })
      }
    } catch (error) {
      console.error('获取支付设置失败:', error)
      wx.showToast({
        title: '加载支付设置失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
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
   * 保存支付设置 - 调用数据库API
   */
  async savePaymentSetting() {
    // 防止重复提交
    if (this.data.isSubmitting) {
      return
    }

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
    
    this.setData({ isSubmitting: true })
    
    wx.showLoading({
      title: '保存中..',
      mask: true
    })
    
    try {
      const res = await merchantApi.updatePaymentSetting(paymentSetting)
      console.log('保存支付设置成功:', res)
      
      wx.hideLoading()
      
      // 更新初始数据副本，标记为已保存
      this.initialData = JSON.stringify(paymentSetting)
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存支付设置失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
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