// pages/merchant/order/detail/detail.js
const app = getApp()
const globalUtils = require('../../../../utils/globalUtils')
const { logError } = globalUtils

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    order: null,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取订单ID，并转换为数字类型
    const orderId = parseInt(options.id)
    if (isNaN(orderId)) {
      wx.showToast({
        title: '无效的订单ID',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.setData({
      orderId: orderId
    })
    
    // 加载订单详情
    this.loadOrderDetail()
  },

  /**
   * 加载订单详情
   */
  loadOrderDetail() {
    this.setData({ isLoading: true })
    
    // 从本地存储中获取订单数据
    const order = wx.getStorageSync('currentOrder')
    
    // 模拟数据加载延迟
    setTimeout(() => {
      if (order && order.id == this.data.orderId) {
        // 使用本地存储中的真实订单数据
        this.setData({
          order: order,
          isLoading: false
        })
      } else {
        // 如果本地存储中没有订单数据，使用模拟数据
        const mockOrder = {
          id: this.data.orderId,
          orderNumber: `ORD${this.data.orderId}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          trackingNumber: '',
          customer: {
            name: '测试客户',
            phone: '13800138000',
            address: '测试地址'
          },
          products: [
            {
              id: 1,
              name: '宠物食品',
              spec: '1kg装',
              quantity: 2,
              price: 128,
              image: 'https://example.com/product1.jpg'
            }
          ],
          subtotal: 256,
          shippingFee: 10,
          total: 266
        }
        
        this.setData({
          order: mockOrder,
          isLoading: false
        })
      }
    }, 500)
  },

  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 确认付款
   */
  confirmPayment() {
    this.updateOrderStatus('processing', '确认付款成功')
  },

  /**
   * 发货
   */
  shipOrder() {
    // 实现发货逻辑
    wx.showToast({
      title: '发货功能开发中',
      icon: 'none'
    })
  },

  /**
   * 确认收货
   */
  confirmDelivery() {
    this.updateOrderStatus('completed', '确认收货成功')
  },

  /**
   * 取消订单
   */
  cancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      confirmText: '取消',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.updateOrderStatus('cancelled', '订单取消成功')
        }
      }
    })
  },

  /**
   * 更新订单状态
   */
  updateOrderStatus(newStatus, successMsg) {
    wx.showLoading({
      title: '处理中...'
    })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地订单状态
      const order = this.data.order
      order.status = newStatus
      order.updatedAt = new Date().toISOString()
      
      this.setData({
        order: order
      })
      
      // 更新本地存储中的订单数据
      wx.setStorageSync('currentOrder', order)
      
      // 触发订单列表页面的数据更新
      wx.eventChannel.emit('orderStatusChanged', {
        orderId: order.id,
        newStatus: newStatus
      })
      
      wx.showToast({
        title: successMsg,
        icon: 'success'
      })
    }, 1000)
  }
})