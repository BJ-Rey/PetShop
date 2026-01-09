const request = require('../utils/request');

module.exports = {
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
