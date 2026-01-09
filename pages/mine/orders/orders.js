// pages/mine/orders/orders.js
const ordersUtil = require('../../../utils/orders');

Page({
  data: {
    status: '', // 当前订单状态筛选
    orderStatusMap: {
      pending: '待付款',
      shipping: '待发货',
      delivering: '待收货',
      completed: '已完成'
    },
    orders: [] // 订单列表数据
  },

  onLoad(options) {
    // 获取订单状态参数
    const status = options.status || ''
    this.setData({
      status: status
    })
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadOrders()
  },

  // 加载订单数据
  loadOrders() {
    const orders = ordersUtil.getOrdersByStatus(this.data.status);
    this.setData({ orders });
  },

  // 切换订单状态筛选
  switchOrderStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      status: status
    })
    // 重新加载订单数据
    this.loadOrders()
  },

  // 立即付款
  payOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showLoading({ title: '支付中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      ordersUtil.updateOrderStatus(orderId, 'shipping');
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      });
      this.loadOrders();
    }, 1000);
  },

  // 确认收货
  confirmReceive(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认收货',
      content: '请确认您已收到商品',
      success: (res) => {
        if (res.confirm) {
          ordersUtil.updateOrderStatus(orderId, 'completed');
          wx.showToast({
            title: '确认收货成功',
            icon: 'success'
          });
          this.loadOrders();
        }
      }
    })
  },

  // 评价订单
  evaluateOrder(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/comment/add/add?orderId=${orderId}`
    })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${orderId}`
    })
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})