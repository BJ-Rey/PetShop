// pages/service/detail/detail.js
const serviceApi = require('../../../api/serviceApi');
const auth = require('../../../utils/auth');

Page({
  data: {
    service: {},
    processList: [], // 服务流程
    noticeList: [], // 购买须知
    isFavorited: false
  },

  onLoad: function(options) {
    const id = options.id;
    if (id) {
      this.loadServiceDetail(id);
      this.loadProcessList();
      this.loadNoticeList();
      this.checkFavoriteStatus(id);
    }
  },

  // 加载服务详情
  loadServiceDetail: function(id) {
    wx.showLoading({ title: '加载中...' });

    // 尝试调用API（兼容真实后端）
    serviceApi.getServiceDetail(id).then(res => {
      this.setData({
        service: res
      });
      wx.hideLoading();
    }).catch(err => {
      console.error('加载服务详情失败', err);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      // 兜底数据，防止页面空白
      this.setData({
          service: {
              id: id,
              name: '未知服务',
              price: 0,
              description: '暂无详细信息'
          }
      });
    });
  },

  // 加载服务流程 (模拟)
  loadProcessList: function() {
    this.setData({
        processList: [
            { title: '在线预约', desc: '选择服务项目和时间' },
            { title: '到店核销', desc: '出示预约码核销' },
            { title: '享受服务', desc: '专业人员为您服务' },
            { title: '评价反馈', desc: '服务完成后评价' }
        ]
    });
  },

  // 加载购买须知 (模拟)
  loadNoticeList: function() {
    this.setData({
        noticeList: [
            { title: '有效期', desc: '购买后90天内有效' },
            { title: '预约信息', desc: '请提前1天预约' },
            { title: '退款规则', desc: '未消费随时退' }
        ]
    });
  },

  // 检查收藏状态
  checkFavoriteStatus(id) {
     // 模拟检查
     const favorites = wx.getStorageSync('favorites_services') || [];
     const isFavorited = favorites.some(item => item.id == id);
     this.setData({ isFavorited });
  },

  // 切换收藏状态
  toggleFavorite() {
    if (!auth.checkPermission()) return;

    const { service, isFavorited } = this.data;
    let favorites = wx.getStorageSync('favorites_services') || [];

    if (isFavorited) {
        favorites = favorites.filter(item => item.id != service.id);
        wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
        favorites.push(service);
        wx.showToast({ title: '收藏成功', icon: 'success' });
    }

    wx.setStorageSync('favorites_services', favorites);
    this.setData({ isFavorited: !isFavorited });
  },

  // 跳转到预约页面
  navigateToAppointment: function() {
    if (!auth.checkPermission()) return;
    
    wx.navigateTo({
      url: `/pages/service/appointment/appointment?id=${this.data.service.id}`
    });
  },
  
  // 联系商家
  contactMerchant() {
      wx.makePhoneCall({
          phoneNumber: '13800138000' // Mock phone
      });
  },

  // 分享
  onShareAppMessage() {
      return {
          title: this.data.service.name,
          path: `/pages/service/detail/detail?id=${this.data.service.id}`
      };
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
});