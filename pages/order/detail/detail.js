// pages/order/detail/detail.js
// const ordersUtil = require('../../../utils/orders'); // 移除不存在的引用
const orderApi = require('../../../api/orderApi');
const auth = require('../../../utils/auth');

Page({
  data: {
    orderId: null,
    order: null
  },

  onLoad(options) {
    if (!auth.checkPermission(() => {
        this.onShow();
    })) return;

    this.setData({ orderId: options.id })
    this.loadOrderDetail()
  },

  onShow() {
    // 检查登录
    if (!auth.isLoggedIn()) return;

    // 页面显示时刷新订单详情
    if (this.data.orderId) {
        this.loadOrderDetail()
    }
  },

  // 加载订单详情
  loadOrderDetail() {
    const orderId = this.data.orderId;
    
    // Try API first
    wx.showLoading({ title: '加载中...' });
    
    orderApi.getOrderDetail(orderId).then(res => {
        let order = res;
        
        if (order) {
            // Parse JSON fields if they are strings
            if (typeof order.addressSnapshot === 'string') {
                try { order.addressSnapshot = JSON.parse(order.addressSnapshot); } catch(e){}
            }
            if (typeof order.itemsJson === 'string') {
                try { order.products = JSON.parse(order.itemsJson); } catch(e){}
            } else if (order.items) {
                 order.products = order.items;
            }
            
            // Status text mapping
            const statusMap = {
                pending: '待付款',
                shipping: '待发货',
                delivering: '待收货',
                completed: '已完成',
                cancelled: '已取消'
            };
            order.statusText = statusMap[order.status] || order.status;
            
            this.setData({ order });
        }
        wx.hideLoading();
    }).catch(err => {
        console.warn('API Load failed', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        wx.hideLoading();
    });
  },

  // 跳转到支付页面
  navigateToPay() {
    wx.showLoading({ title: '支付中...' });
    // TODO: 实现真实支付逻辑，这里暂时只更新状态
    orderApi.updateOrderStatus(this.data.orderId, 'shipping').then(() => {
        wx.hideLoading();
        this.updateLocalStatus('shipping');
        wx.showToast({ title: '支付成功' });
    }).catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '支付失败', icon: 'none' });
    });
  },

  // 取消订单
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          orderApi.updateOrderStatus(this.data.orderId, 'cancelled').then(() => {
              this.updateLocalStatus('cancelled');
              wx.showToast({
                title: '取消订单成功',
                icon: 'success'
              })
          }).catch(err => {
              wx.showToast({ title: '取消失败', icon: 'none' });
          });
        }
      }
    })
  },
  
  // Helper to update local data for mock feeling
  updateLocalStatus(status) {
      const statusMap = {
            pending: '待付款',
            shipping: '待发货',
            delivering: '待收货',
            completed: '已完成',
            cancelled: '已取消'
      };
      this.setData({
          'order.status': status,
          'order.statusText': statusMap[status]
      });
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
          // orderApi.updateOrderStatus(this.data.orderId, 'completed');
          this.updateLocalStatus('completed');
          wx.showToast({
            title: '确认收货成功',
            icon: 'success'
          })
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