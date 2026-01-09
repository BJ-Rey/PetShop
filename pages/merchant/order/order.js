// pages/merchant/order/order.js
const app = getApp()
const globalUtils = require('../../../utils/globalUtils')
const orderApi = require('../../../api/orderApi');
const { logError } = globalUtils

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: [],
    isLoading: true,
    keyword: '',
    activeTab: 'all', // all, pending, processing, shipped, completed, cancelled
    filteredOrders: []
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
    
    // 监听订单状态变化事件
    const eventChannel = this.getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.on('orderStatusChanged', (data) => {
        // 重新加载订单数据
        this.loadOrders()
      })
    }
    
    // 加载订单数据
    this.loadOrders()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重新加载订单数据
    this.loadOrders()
  },

  /**
   * 加载订单数据
   */
  loadOrders() {
    this.setData({ isLoading: true })
    
    // 保存this上下文
    const that = this;
    
    const params = {
        status: this.data.activeTab === 'all' ? '' : this.data.activeTab,
        keyword: this.data.keyword
    };

    orderApi.getMerchantOrderList(params).then(res => {
        const orders = res.data || [];
        
        that.setData({
            orders: orders,
            filteredOrders: orders, // 后端已筛选，前端直接使用
            isLoading: false
        });
    }).catch(err => {
        console.error('加载订单列表失败:', err);
        that.setData({ isLoading: false });
        wx.showToast({
            title: '加载失败',
            icon: 'error'
        });
    });
  },

  /**
   * 搜索订单
   */
  onSearch(e) {
    const keyword = e.detail.value
    this.setData({
      keyword: keyword
    })
    // 重新加载（后端筛选）
    this.loadOrders()
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab
    })
    // 重新加载（后端筛选）
    this.loadOrders()
  },

  /**
   * 筛选订单
   */
  filterOrders() {
    // 已改为后端筛选，前端仅保留此空方法以兼容可能的调用
    this.loadOrders();
  },

  /**
   * 查看订单详情
   */
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    const order = this.data.orders.find(item => item.id === orderId)
    
    if (order) {
      // 将订单数据存储到本地存储中，以便详情页面使用
      wx.setStorageSync('currentOrder', order)
    }
    
    wx.navigateTo({
      url: `/pages/merchant/order/detail/detail?id=${orderId}`
    })
  },

  /**
   * 确认付款
   */
  confirmPayment(e) {
    const orderId = e.currentTarget.dataset.id
    this.updateOrderStatus(orderId, 'processing', '确认付款成功')
  },

  /**
   * 发货
   */
  shipOrder(e) {
    const orderId = e.currentTarget.dataset.id
    const order = this.data.orders.find(item => item.id === orderId)
    
    if (!order) return
    
    // 复制收货信息
    const { name, phone, address } = order.customer
    const shippingInfo = `收件人：${name}\n联系电话：${phone}\n收货地址：${address}`
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: shippingInfo,
      success: () => {
        // 显示提示信息，提示用户手动访问顺丰官网
        wx.showModal({
          title: '发货提示',
          content: '收货信息已复制，请手动打开顺丰官网进行发货',
          showCancel: false,
          confirmText: '确定'
        })
        
        // 更新订单状态为已发货
        this.updateOrderStatus(orderId, 'shipped', '订单状态已更新为已发货')
      },
      fail: () => {
        wx.showToast({
          title: '复制失败，请手动复制',
          icon: 'none'
        })
      }
    })
  },
  
  /**
   * 复制运单号
   */
  copyTrackingNumber(e) {
    const trackingNumber = e.currentTarget.dataset.number
    
    wx.setClipboardData({
      data: trackingNumber,
      success: () => {
        wx.showToast({
          title: '运单号已复制',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  },
  
  /**
   * 运单号输入事件
   */
  onTrackingInput(e) {
    const orderId = e.currentTarget.dataset.id
    const trackingNumber = e.detail.value
    
    // 保存运单号到订单数据中
    const orders = this.data.orders
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          trackingNumber: trackingNumber
        }
      }
      return order
    })
    
    this.setData({
      orders: updatedOrders
    })
    
    // 重新应用筛选
    this.filterOrders()
  },
  
  /**
   * 保存运单号
   */
  saveTrackingNumber(e) {
    const orderId = e.currentTarget.dataset.id
    const order = this.data.orders.find(item => item.id === orderId)
    
    if (!order || !order.trackingNumber) {
      wx.showToast({
        title: '请输入运单号',
        icon: 'none'
      })
      return
    }
    
    // 模拟保存到服务器
    wx.showLoading({
      title: '保存中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      wx.showToast({
        title: '运单号已保存',
        icon: 'success'
      })
    }, 1000)
  },

  /**
   * 确认收货
   */
  confirmDelivery(e) {
    const orderId = e.currentTarget.dataset.id
    this.updateOrderStatus(orderId, 'completed', '确认收货成功')
  },

  /**
   * 取消订单
   */
  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      confirmText: '取消',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.updateOrderStatus(orderId, 'cancelled', '订单取消成功')
        }
      }
    })
  },

  /**
   * 退款
   */
  refundOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认退款',
      content: '确定要为该订单退款吗？',
      confirmText: '退款',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          wx.showToast({
            title: '退款功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  /**
   * 更新订单状态
   */
  updateOrderStatus(orderId, newStatus, successMsg) {
    wx.showLoading({
      title: '处理中...'
    })
    
    orderApi.updateOrderStatus(orderId, newStatus).then(res => {
        wx.hideLoading();
        
        // 更新本地列表
        const orders = this.data.orders.map(order => {
            if (order.id === orderId) {
                return {
                    ...order,
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                };
            }
            return order;
        });
        
        this.setData({
            orders: orders,
            filteredOrders: orders
        });
        
        wx.showToast({
            title: successMsg,
            icon: 'success'
        });
    }).catch(err => {
        wx.hideLoading();
        console.error('更新订单状态失败:', err);
        wx.showToast({
            title: '操作失败',
            icon: 'error'
        });
    });
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 重新加载订单数据
    this.loadOrders()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  }
})
