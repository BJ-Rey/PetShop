/**
 * 商品相关接口
 */
const request = require('../utils/request');

module.exports = {
  /**
   * 获取商品列表
   */
  getProductList: (params) => {
    return request.get('/api/product/list', params, {
      cache: true,
      cacheTime: 5 * 60 * 1000
    });
  },

  /**
   * 获取商品详情
   */
  getProductDetail: (id) => {
    return request.get(`/api/product/detail/${id}`, {}, {
      cache: true
    });
  },

  /**
   * 添加商品
   */
  addProduct: (data) => {
    return request.post('/api/product/add', data);
  },

  /**
   * 更新商品
   */
  updateProduct: (data) => {
    return request.put('/api/product/update', data);
  },

  /**
   * 删除商品
   */
  deleteProduct: (id) => {
    return request.delete(`/api/product/delete/${id}`);
  }
};
