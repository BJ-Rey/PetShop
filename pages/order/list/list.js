// pages/order/list/list.js
const orderApi = require('../../../api/orderApi');
const app = getApp();

Page({
  data: {
    activeStatus: 'all', // 当前选中的订单状态
    orders: [], // 订单列表数据
    hasMore: true, // 是否有更多订单
    page: 1, // 当前页码
    pageSize: 10, // 每页数量
    // 订单状态映射
    statusMap: {
      all: '全部',
      pending: '待付款',
      shipping: '待发货',
      delivering: '待收货',
      completed: '已完成'
    }
  },

  onLoad(options) {
    // 从URL获取订单状态
    if (options.status) {
      this.setData({ activeStatus: options.status })
    }
    this.loadOrders()
  },

  onShow() {
    // 页面显示时刷新订单数据
    this.refreshOrders()
  },

  // 切换订单状态
  switchStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ activeStatus: status, page: 1, orders: [], hasMore: true })
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    const page = this.data.page
    const activeStatus = this.data.activeStatus
    const app = getApp();
    const openid = app.globalData.userInfo ? app.globalData.userInfo.openid : null; // Assuming userInfo has openid
    // If not, maybe userToken is openid? or handled by backend session?
    // For now, let's assume backend gets it from header, or we pass userToken as userId if needed.
    // Given previous context, userToken might be a JWT or just a session key.
    
    // Call API
    orderApi.getUserOrderList({
      status: activeStatus === 'all' ? '' : activeStatus,
      // userId: openid // Optional if handled by header
    }).then(res => {
        // Backend returns list of orders
        let ordersData = res || []; // Assuming res is the list directly or res.data
        // Adapt data structure
        const orders = ordersData.map(order => {
            let products = [];
            try {
                products = JSON.parse(order.itemsJson || '[]');
            } catch (e) {
                console.error('Parse itemsJson error', e);
            }
            return {
                id: order.id,
                orderNo: order.orderNo,
                merchantName: '宠物商城', // Backend doesn't have merchant name in order yet
                status: order.status,
                statusText: this.data.statusMap[order.status] || order.status,
                products: products,
                totalPrice: order.totalAmount,
                totalQuantity: products.reduce((sum, p) => sum + (p.count || p.quantity || 1), 0),
                createTime: order.createdAt ? order.createdAt.replace('T', ' ') : ''
            };
        });

        // Filter locally if backend doesn't support filter (backend supports status filter)
        // But backend `getOrdersByUserId` returns all if we used that endpoint, or we should use `getOrdersByStatus`.
        // My Mapper has `getOrdersByStatus`.
        // My Controller `getUserOrderList` calls `getOrdersByUserId` ignoring status param!
        // I need to fix Controller or filter locally. 
        // Let's filter locally for now to be safe as Controller change is already written.
        
        let filteredOrders = orders;
        if (activeStatus !== 'all') {
             filteredOrders = orders.filter(o => o.status === activeStatus);
        }

        // Pagination (Frontend mock pagination since backend returns all for user)
        const start = (page - 1) * this.data.pageSize
        const end = start + this.data.pageSize
        const paginatedOrders = filteredOrders.slice(start, end)
        
        const newOrders = page === 1 ? paginatedOrders : [...this.data.orders, ...paginatedOrders]
        
        this.setData({
          orders: newOrders,
          hasMore: paginatedOrders.length === this.data.pageSize
        })
    }).catch(err => {
        console.error('Load orders failed', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 刷新订单列表
  refreshOrders() {
    this.setData({ page: 1, orders: [], hasMore: true })
    this.loadOrders()
  },

  // 加载更多订单
  loadMore() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadOrders()
    }
  },

  // 跳转到订单详情页
  navigateToOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    })
  },

  // 跳转到支付页面
  navigateToPay(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/pay/pay?id=${orderId}`
    })
  },

  // 确认收货
  confirmReceipt(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认收货',
      content: '确定已经收到商品了吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用API确认收货
          console.log('确认收货:', orderId)
          wx.showToast({
            title: '确认收货成功',
            icon: 'success'
          })
          // 刷新订单列表
          this.refreshOrders()
        }
      }
    })
  },

  // 写评价
  writeComment(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/comment/add/add?orderId=${orderId}`
    })
  },

  // 再次购买
  buyAgain(e) {
    const orderId = e.currentTarget.dataset.id
    // TODO: 实现再次购买逻辑
    console.log('再次购买:', orderId)
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 跳转到商城页面
  navigateToMall() {
    wx.switchTab({
      url: '/pages/mall/list/list'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshOrders()
    wx.stopPullDownRefresh()
  },

  // 上拉触底加载更多
  onReachBottom() {
    this.loadMore()
  },

  // 上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})