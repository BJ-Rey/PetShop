/**
 * 服务相关接口
 */
const request = require('../utils/request');

module.exports = {
  /**
   * 获取服务列表
   */
  getServiceList: (params) => {
    return request.get('/api/service/list', params, {
      cache: true,
      cacheTime: 5 * 60 * 1000
    });
  },

  /**
   * 获取服务详情
   */
  getServiceDetail: (id) => {
    return request.get(`/api/service/detail/${id}`, {}, {
      cache: true
    });
  },

  /**
   * 添加服务
   */
  addService: (data) => {
    return request.post('/api/service/add', data);
  },

  /**
   * 更新服务
   */
  updateService: (data) => {
    return request.put('/api/service/update', data);
  },

  /**
   * 删除服务
   */
  deleteService: (id) => {
    return request.delete(`/api/service/delete/${id}`);
  }
};
