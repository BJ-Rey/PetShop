/**
 * 猫咪相关接口
 */
const request = require('../utils/request');

module.exports = {
  /**
   * 获取猫咪列表
   * 支持分页、筛选
   */
  getCatList: (params) => {
    return request.get('/api/cat/list', params, {
      cache: true,
      cacheTime: 5 * 60 * 1000 // 缓存5分钟
    });
  },

  /**
   * 获取猫咪详情
   */
  getCatDetail: (id) => {
    return request.get(`/api/cat/detail/${id}`, {}, {
      cache: true
    });
  },

  /**
   * 添加猫咪 (商家)
   */
  addCat: (data) => {
    return request.post('/api/cat/add', data, {
      encrypt: true, // 敏感数据加密
      throttle: 2000 // 节流
    });
  },

  /**
   * 更新猫咪信息 (商家)
   */
  updateCat: (data) => {
    return request.post('/api/cat/update', data, {
      throttle: 2000
    });
  },

  /**
   * 更新猫咪状态 (商家)
   */
  updateCatStatus: (id, status) => {
    return request.post('/api/cat/status', { id, status });
  },

  /**
   * 删除猫咪 (商家)
   */
  deleteCat: (id) => {
    return request.post(`/api/cat/delete/${id}`);
  },

  /**
   * 收藏猫咪
   */
  favoriteCat: (id) => {
    return request.post('/api/user/favorite', { type: 'cat', targetId: id }, {
      throttle: 1000
    });
  }
};
