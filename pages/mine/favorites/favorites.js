// pages/mine/favorites/favorites.js
const { getAllFavorites, removeFromFavorites } = require('../../../utils/favorites');

Page({
  data: {
    activeTab: 'services', // services, products, pets
    sortType: 'time', // time, name
    page: 1,
    pageSize: 10,
    services: [],
    products: [],
    pets: [],
    hasMore: true
  },

  onLoad() {
    this.loadFavorites(true);
  },

  onShow() {
    // Refresh on show, reset pagination
    this.loadFavorites(true);
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadFavorites(false);
    }
  },

  // Load favorites with pagination and sorting
  loadFavorites(reset = false) {
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

  navigateBack() {
    wx.navigateBack({ delta: 1 });
  }
});