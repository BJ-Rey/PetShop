// pages/merchant/setting/notification-setting/notification-setting.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 通知渠道选项
    notificationChannels: [
      { value: 'wechat', name: '微信通知' },
      { value: 'sms', name: '短信通知' },
      { value: 'email', name: '邮件通知' },
      { value: 'app', name: '应用内通知' }
    ],
    
    // 订单通知设置
    orderNotification: {
      enabled: true,
      newOrder: true,
      statusChange: true,
      cancelled: true,
      refunded: true,
      completed: true,
      channels: ['wechat', 'app']
    },
    
    // 客户消息通知设置
    customerNotification: {
      enabled: true,
      consultation: true,
      review: true,
      complaint: true,
      suggestion: false,
      channels: ['wechat', 'app']
    },
    
    // 财务通知设置
    financeNotification: {
      enabled: true,
      transaction: true,
      settlement: true,
      invoice: true,
      withdraw: true,
      channels: ['wechat', 'sms', 'email', 'app']
    },
    
    // 通知接收人列表
    recipients: [
      { id: 1, name: '李经理', phone: '13800138000', email: 'manager@example.com' },
      { id: 2, name: '张客服', phone: '13900139000', email: 'service@example.com' }
    ]
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
    
    // 加载通知设置
    this.loadNotificationSetting()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 保存初始数据副本，用于检查是否有未保存的修改
    this.initialData = JSON.stringify({
      orderNotification: this.data.orderNotification,
      customerNotification: this.data.customerNotification,
      financeNotification: this.data.financeNotification,
      recipients: this.data.recipients
    })
  },

  /**
   * 加载通知设置
   */
  loadNotificationSetting() {
    // 模拟数据，实际应该调用API获取通知设置
    // 从本地存储获取设置（如果有）
    const savedNotificationSetting = wx.getStorageSync('notificationSetting')
    if (savedNotificationSetting) {
      this.setData(savedNotificationSetting)
    }
  },

  /**
   * 切换订单通知总开关
   */
  toggleOrderNotificationEnabled(e) {
    const enabled = e.detail.value
    this.setData({
      'orderNotification.enabled': enabled
    })
  },

  /**
   * 切换订单通知单项
   */
  toggleOrderNotificationItem(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    this.setData({
      [`orderNotification.${type}`]: checked
    })
  },

  /**
   * 改变订单通知渠道
   */
  changeOrderNotificationChannels(e) {
    const channels = e.detail.value
    this.setData({
      'orderNotification.channels': channels
    })
  },

  /**
   * 切换客户消息通知总开关
   */
  toggleCustomerNotificationEnabled(e) {
    const enabled = e.detail.value
    this.setData({
      'customerNotification.enabled': enabled
    })
  },

  /**
   * 切换客户消息通知单项
   */
  toggleCustomerNotificationItem(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    this.setData({
      [`customerNotification.${type}`]: checked
    })
  },

  /**
   * 改变客户消息通知渠道
   */
  changeCustomerNotificationChannels(e) {
    const channels = e.detail.value
    this.setData({
      'customerNotification.channels': channels
    })
  },

  /**
   * 切换财务通知总开关
   */
  toggleFinanceNotificationEnabled(e) {
    const enabled = e.detail.value
    this.setData({
      'financeNotification.enabled': enabled
    })
  },

  /**
   * 切换财务通知单项
   */
  toggleFinanceNotificationItem(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    this.setData({
      [`financeNotification.${type}`]: checked
    })
  },

  /**
   * 改变财务通知渠道
   */
  changeFinanceNotificationChannels(e) {
    const channels = e.detail.value
    this.setData({
      'financeNotification.channels': channels
    })
  },

  /**
   * 添加接收人
   */
  addRecipient() {
    wx.showToast({
      title: '添加接收人功能开发中',
      icon: 'none'
    })
  },

  /**
   * 编辑接收人
   */
  editRecipient(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: `编辑接收人 ${id} 功能开发中`,
      icon: 'none'
    })
  },

  /**
   * 删除接收人
   */
  deleteRecipient(e) {
    const id = e.currentTarget.dataset.id
    const recipients = this.data.recipients.filter(item => item.id !== id)
    
    this.setData({
      recipients: recipients
    })
  },

  /**
   * 检查是否有未保存的修改
   */
  hasUnsavedChanges() {
    const currentData = JSON.stringify({
      orderNotification: this.data.orderNotification,
      customerNotification: this.data.customerNotification,
      financeNotification: this.data.financeNotification,
      recipients: this.data.recipients
    })
    
    return this.initialData !== currentData
  },

  /**
   * 保存通知设置
   */
  saveNotificationSetting() {
    const notificationSetting = {
      notificationChannels: this.data.notificationChannels,
      orderNotification: this.data.orderNotification,
      customerNotification: this.data.customerNotification,
      financeNotification: this.data.financeNotification,
      recipients: this.data.recipients
    }
    
    wx.showLoading({
      title: '保存中..'
    })
    
    // 模拟API请求，实际应该调用API保存通知设置
    setTimeout(() => {
      wx.hideLoading()
      
      // 保存到本地存储
      wx.setStorageSync('notificationSetting', notificationSetting)
      
      // 更新初始数据副本，标记为已保存
      this.initialData = JSON.stringify(notificationSetting)
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
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
        content: '您有未保存的设置，是否确认返回？',
        confirmText: '确认',
        cancelText: '取消',
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