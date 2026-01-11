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
   * 获取当前商家信息（登录商家）
   */
  getCurrentMerchant: () => {
    return request.get('/api/merchant/current');
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
  },

  /**
   * 获取店铺设置
   */
  getStoreSetting: () => {
    return request.get('/api/merchant/store-setting');
  },

  /**
   * 更新店铺设置
   */
  updateStoreSetting: (data) => {
    return request.put('/api/merchant/store-setting', data);
  },

  /**
   * 获取商家基本信息
   */
  getBasicInfo: () => {
    return request.get('/api/merchant/basic-info');
  },

  /**
   * 更新商家基本信息
   */
  updateBasicInfo: (data) => {
    return request.put('/api/merchant/basic-info', data);
  },

  /**
   * 更新商家LOGO
   */
  updateLogo: (logoUrl) => {
    return request.put('/api/merchant/logo', { logoUrl });
  },

  /**
   * 删除商家LOGO
   */
  deleteLogo: () => {
    return request.delete('/api/merchant/logo');
  },

  /**
   * 获取角色列表
   */
  getRoleList: () => {
    return request.get('/api/merchant/roles');
  },

  /**
   * 添加角色
   */
  addRole: (data) => {
    return request.post('/api/merchant/role', data);
  },

  /**
   * 更新角色
   */
  updateRole: (data) => {
    return request.put('/api/merchant/role', data);
  },

  /**
   * 删除角色
   */
  deleteRole: (id) => {
    return request.delete(`/api/merchant/role/${id}`);
  },

  /**
   * 获取操作日志
   */
  getOperationLogs: (params) => {
    return request.get('/api/merchant/logs', params);
  },

  /**
   * 获取通知设置
   */
  getNotificationSetting: () => {
    return request.get('/api/merchant/notification-setting');
  },

  /**
   * 更新通知设置
   */
  updateNotificationSetting: (data) => {
    return request.put('/api/merchant/notification-setting', data);
  },

  /**
   * 获取支付设置
   */
  getPaymentSetting: () => {
    return request.get('/api/merchant/payment-setting');
  },

  /**
   * 更新支付设置
   */
  updatePaymentSetting: (data) => {
    return request.put('/api/merchant/payment-setting', data);
  },

  /**
   * 获取配送设置
   */
  getDeliverySetting: () => {
    return request.get('/api/merchant/delivery-setting');
  },

  /**
   * 更新配送设置
   */
  updateDeliverySetting: (data) => {
    return request.put('/api/merchant/delivery-setting', data);
  },

  /**
   * 获取营业时间设置
   */
  getBusinessHours: () => {
    return request.get('/api/merchant/business-hours');
  },

  /**
   * 更新营业时间设置
   */
  updateBusinessHours: (data) => {
    return request.put('/api/merchant/business-hours', data);
  },

  /**
   * 获取分类设置
   */
  getCategorySetting: () => {
    return request.get('/api/merchant/category-setting');
  },

  /**
   * 更新分类设置
   */
  updateCategorySetting: (data) => {
    return request.put('/api/merchant/category-setting', data);
  },

  /**
   * 获取轮播图设置
   */
  getBannerSetting: () => {
    return request.get('/api/merchant/banner-setting');
  },

  /**
   * 更新轮播图设置
   */
  updateBannerSetting: (data) => {
    return request.put('/api/merchant/banner-setting', data);
  },

  /**
   * 获取促销设置
   */
  getPromotionSetting: () => {
    return request.get('/api/merchant/promotion-setting');
  },

  /**
   * 更新促销设置
   */
  updatePromotionSetting: (data) => {
    return request.put('/api/merchant/promotion-setting', data);
  }
};
