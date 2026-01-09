/**
 * 商家相关接口
 */
const request = require('../utils/request');

module.exports = {
  /**
   * 获取商家列表
   */
  getMerchantList: (params) => {
    return request.get('/api/merchant/list', params, {
      cache: true
    });
  },

  /**
   * 获取商家详情
   */
  getMerchantDetail: (id) => {
    return request.get(`/api/merchant/detail/${id}`, {}, {
      cache: true
    });
  },

  /**
   * 获取商家仪表盘统计数据
   */
  getDashboardStats: () => {
    return request.get('/api/merchant/dashboard', {}, {
        cache: true,
        cacheTime: 60 * 1000 // 缓存1分钟
    });
  },

  /**
   * 添加商家
   */
  addMerchant: (data) => {
    return request.post('/api/merchant/add', data);
  },

  /**
   * 更新商家
   */
  updateMerchant: (data) => {
    return request.put('/api/merchant/update', data);
  },

  /**
   * 删除商家
   */
  deleteMerchant: (id) => {
    return request.delete(`/api/merchant/delete/${id}`);
  }
};
