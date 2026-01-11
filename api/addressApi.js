/**
 * 地址相关接口
 */
const request = require('../utils/request');

module.exports = {
  /**
   * 获取用户地址列表
   */
  getAddressList: () => {
    return request.get('/api/address/list');
  },

  /**
   * 获取地址详情
   */
  getAddressDetail: (id) => {
    return request.get(`/api/address/detail/${id}`);
  },

  /**
   * 添加地址
   */
  addAddress: (data) => {
    return request.post('/api/address/add', data);
  },

  /**
   * 更新地址
   */
  updateAddress: (data) => {
    return request.put('/api/address/update', data);
  },

  /**
   * 删除地址
   */
  deleteAddress: (id) => {
    return request.delete(`/api/address/delete/${id}`);
  },

  /**
   * 设置默认地址
   */
  setDefaultAddress: (id) => {
    return request.post('/api/address/setDefault', { id });
  }
};
