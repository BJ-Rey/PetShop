// pages/order/detail/detail.js
const ordersUtil = require('../../../utils/orders');

Page({
  data: {
    orderId: null,
    order: null
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
    this.loadOrderDetail()
  },

  onShow() {
    // 页面显示时刷新订单详情
    this.loadOrderDetail()
  },

  // 加载订单详情
  loadOrderDetail() {
    const order = ordersUtil.getOrderById(this.data.orderId);
    this.setData({ order });
  },

  // 跳转到支付页面
  navigateToPay() {
    wx.showLoading({ title: '支付中...' });
    setTimeout(() => {
        wx.hideLoading();
        ordersUtil.updateOrderStatus(this.data.orderId, 'shipping');
        wx.showToast({ title: '支付成功' });
        this.loadOrderDetail();
    }, 1000);
  },

  // 取消订单
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          ordersUtil.updateOrderStatus(this.data.orderId, 'cancelled');
          wx.showToast({
            title: '取消订单成功',
            icon: 'success'
          })
          // 刷新详情
          this.loadOrderDetail();
        }
      }
    })
  },

  // 查看物流
  viewLogistics() {
    wx.showModal({
      title: '物流信息',
      content: this.data.order.logisticsInfo || '暂无物流信息',
      showCancel: false
    })
  },

  // 确认收货
  confirmReceipt() {
    wx.showModal({
      title: '确认收货',
      content: '确定已经收到商品了吗？',
      success: (res) => {
        if (res.confirm) {
          ordersUtil.updateOrderStatus(this.data.orderId, 'completed');
          wx.showToast({
            title: '确认收货成功',
            icon: 'success'
          })
          // 刷新订单详情
          this.loadOrderDetail()
        }
      }
    })
  },

  // 写评价
  writeComment() {
    wx.navigateTo({
      url: `/pages/comment/add/add?orderId=${this.data.orderId}`
    })
  },

  // 再次购买
  buyAgain() {
    // TODO: 实现再次购买逻辑
    console.log('再次购买:', this.data.orderId)
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 售后申请
  afterSale() {
    wx.navigateTo({
      url: `/pages/aftersale/apply/apply?orderId=${this.data.orderId}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrderDetail()
    wx.stopPullDownRefresh()
  },

  // 上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})