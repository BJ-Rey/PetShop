// pages/mine/favorites/favorites.js
const { getAllFavorites, removeFromFavorites } = require('../../../utils/favorites');
const auth = require('../../../utils/auth');

Page({
  data: {
    activeTab: 'services', // services, products, pets
    sortType: 'time', // time, name
    page: 1,
    pageSize: 10,
    services: [],
    products: [],
    pets: [],
    hasMore: true,
    isLoggedIn: false
  },

  onLoad() {
    // 页面加载无需立即加载，交由onShow统一检查
  },

  onShow() {
    // 检查登录状态
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
        // Refresh on show, reset pagination
        this.loadFavorites(true);
    } else {
        // Clear data
        this.setData({
            services: [],
            products: [],
            pets: []
        });
    }
  },

  onReachBottom() {
    if (this.data.isLoggedIn && this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadFavorites(false);
    }
  },

  // Load favorites with pagination and sorting
  loadFavorites(reset = false) {
    if (!this.data.isLoggedIn) return;

    if (reset) {
      this.setData({ page: 1, hasMore: true, services: [], products: [], pets: [] });
    }

    const allFavorites = getAllFavorites();
    const type = this.data.activeTab;
    let list = allFavorites[type] || [];

    // Sorting
    list.sort((a, b) => {
      if (this.data.sortType === 'time') {
        return (b.savedAt || 0) - (a.savedAt || 0);
      } else {
        return (a.name || '').localeCompare(b.name || '');
      }
    });

    // Pagination
    const { page, pageSize } = this.data;
    const start = 0;
    const end = page * pageSize;
    const pagedList = list.slice(start, end);

    const updateData = {};
    updateData[type] = pagedList;
    updateData.hasMore = list.length > end;

    this.setData(updateData);
  },

  // Switch tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
    this.loadFavorites(true);
  },

  // Switch sort
  switchSort(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.sortType) return;
    this.setData({ sortType: type });
    this.loadFavorites(true);
  },

  // Remove favorite
  handleRemove(e) {
    const id = e.currentTarget.dataset.id;
    const type = this.data.activeTab;
    
    wx.showModal({
      title: '提示',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          removeFromFavorites(type, id);
          wx.showToast({
            title: '已取消',
            icon: 'none'
          });
          this.loadFavorites(true);
        }
      }
    });
  },

  // Navigation functions
  navigateToServiceDetail(e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/service/detail/detail?id=${serviceId}` });
  },

  navigateToProductDetail(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/mall/detail/detail?id=${productId}` });
  },

  navigateToPetDetail(e) {
    const petId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/pet/detail/detail?id=${petId}` });
  },

  navigateToServiceList() {
    wx.navigateTo({ url: '/pages/service/list/list' });
  },

  navigateToMallList() {
    wx.navigateTo({ url: '/pages/mall/list/list' });
  },

  navigateToPetList() {
    wx.navigateTo({ url: '/pages/pet/list/list' });
  },
  
  // 跳转到登录页
  navigateToLogin() {
      wx.navigateTo({
          url: '/pages/login/login'
      });
  },

  navigateBack() {
    wx.navigateBack({ delta: 1 });
  }
});