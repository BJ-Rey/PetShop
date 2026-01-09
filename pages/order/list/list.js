// pages/order/list/list.js
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
    // 模拟从API获取订单数据
    const page = this.data.page
    const activeStatus = this.data.activeStatus
    
    // 模拟订单数据
    const mockOrders = [
      {
        id: 1,
        merchantName: '猫咪专属商城',
        status: 'pending',
        statusText: '待付款',
        products: [
          {
            productId: 1,
            name: '天然猫粮通用型英短美短成猫粮',
            sku: '10kg装',
            price: 129,
            quantity: 2,
            image: 'https://placehold.co/400x400/FFA726/ffffff?text=Food'
          }
        ],
        totalPrice: 258,
        totalQuantity: 2,
        createTime: '2025-12-18 10:30:00'
      },
      {
        id: 2,
        merchantName: '猫咪专属商城',
        status: 'shipping',
        statusText: '待发货',
        products: [
          {
            productId: 2,
            name: '猫砂膨润土除臭结团猫砂10kg',
            sku: '10kg装',
            price: 59,
            quantity: 1,
            image: 'https://placehold.co/400x400/FFA726/ffffff?text=Sand'
          },
          {
            productId: 3,
            name: '猫咪逗猫棒玩具',
            sku: '常规款',
            price: 39,
            quantity: 1,
            image: 'https://placehold.co/400x400/FFA726/ffffff?text=Toy'
          }
        ],
        totalPrice: 98,
        totalQuantity: 2,
        createTime: '2025-12-17 15:20:00'
      },
      {
        id: 3,
        merchantName: '猫咪专属商城',
        status: 'delivering',
        statusText: '待收货',
        products: [
          {
            productId: 4,
            name: '猫咪牵引绳防挣脱',
            sku: '红色',
            price: 49,
            quantity: 1,
            image: 'https://placehold.co/400x400/FFA726/ffffff?text=Leash'
          }
        ],
        totalPrice: 49,
        totalQuantity: 1,
        createTime: '2025-12-16 09:45:00'
      },
      {
        id: 4,
        merchantName: '猫咪专属商城',
        status: 'completed',
        statusText: '已完成',
        products: [
          {
            productId: 1,
            name: '天然猫粮通用型英短美短成猫粮',
            sku: '10kg装',
            price: 129,
            quantity: 1,
            image: 'https://placehold.co/400x400/FFA726/ffffff?text=Food'
          },
          {
            productId: 5,
            name: '猫咪疫苗妙三多疫苗',
            sku: '单支',
            price: 198,
            quantity: 1,
            image: 'https://placehold.co/400x400/FFA726/ffffff?text=Vaccine'
          }
        ],
        totalPrice: 327,
        totalQuantity: 2,
        createTime: '2025-12-15 14:10:00'
      },
      {
        id: 5,
        merchantName: '猫咪专属商城',
        status: 'completed',
        statusText: '已完成',
        products: [
          {
            productId: 6,
            name: '猫咪专用香波沐浴露',
            sku: '500ml',
            price: 69,
            quantity: 1,
            image: 'https://placehold.co/400x400/FFA726/ffffff?text=Shampoo'
          }
        ],
        totalPrice: 69,
        totalQuantity: 1,
        createTime: '2025-12-14 11:25:00'
      }
    ]
    
    // 根据状态筛选订单
    let filteredOrders = mockOrders
    if (this.data.activeStatus !== 'all') {
      filteredOrders = mockOrders.filter(order => order.status === this.data.activeStatus)
    }
    
    // 模拟分页
    const start = (page - 1) * this.data.pageSize
    const end = start + this.data.pageSize
    const paginatedOrders = filteredOrders.slice(start, end)
    
    // 合并订单列表
    const orders = page === 1 ? paginatedOrders : [...this.data.orders, ...paginatedOrders]
    
    this.setData({
      orders: orders,
      hasMore: paginatedOrders.length === this.data.pageSize
    })
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