const request = require('../utils/request');

module.exports = {
  /**
   * 获取用户订单列表
   */
  getUserOrderList: (params) => {
    // Pass params directly, user identity handled by header or app.js logic
    return request.get('/api/order/user/list', params);
  },

  /**
   * 获取商家订单列表
   */
  getMerchantOrderList: (params) => {
    return request.get('/api/order/merchant/list', params);
  },

  /**
   * 获取订单详情
   */
  getOrderDetail: (id) => {
    return request.get(`/api/order/detail/${id}`);
  },

  /**
   * 创建订单
   */
  createOrder: (orderData) => {
    return request.post('/api/order/create', orderData);
  },

  /**
   * 更新订单状态 (发货、确认付款、取消等)
   */
  updateOrderStatus: (id, status) => {
    return request.post('/api/order/status', { id, status });
  },

  /**
   * 更新运单号
   */
  updateTrackingNumber: (id, trackingNumber) => {
    return request.post('/api/order/tracking', { id, trackingNumber });
  }
};
