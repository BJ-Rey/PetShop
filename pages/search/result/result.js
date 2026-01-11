// 搜索结果页面
const logger = require('../../../utils/logger');
const cache = require('../../../utils/cache');
const { preventReclick } = require('../../../utils/globalUtils');

Page({
  data: {
    keyword: '',
    fromPage: '',
    results: {
      pets: [],
      products: [],
      services: [],
      merchants: []
    },
    totalResults: 0,
    isLoading: false,
    hasMore: true,
    currentPage: 1,
    pageSize: 10,
    activeType: 'all',
    originalState: null
  },

  onLoad(options) {
    logger.info('搜索结果页面加载', { options });
    const keyword = options.keyword ? decodeURIComponent(options.keyword) : '';
    const originalStateStr = options.originalState ? decodeURIComponent(options.originalState) : '{}';

    this.setData({
      keyword: keyword,
      fromPage: options.fromPage || 'index',
      originalState: JSON.parse(originalStateStr)
    });
    if (this.data.keyword) {
      this.loadSearchResults();
    }
  },

  // 加载搜索结果
  loadSearchResults: preventReclick(function() {
    const { keyword, currentPage, pageSize, activeType } = this.data;
    
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({ isLoading: true });
    
    // 从后端API获取搜索结果
    const catApi = require('../../../api/catApi');
    const productApi = require('../../../api/productApi');
    const serviceApi = require('../../../api/serviceApi');
    const merchantApi = require('../../../api/merchantApi');
    
    logger.info('加载搜索结果', { keyword, currentPage, pageSize, activeType });
    
    // 并行请求各类数据
    Promise.all([
      catApi.getCatList({ keyword, page: currentPage, size: pageSize }).catch(() => []),
      productApi.getProductList({ keyword, page: currentPage, size: pageSize }).catch(() => []),
      serviceApi.getServiceList({ keyword, page: currentPage, size: pageSize }).catch(() => []),
      merchantApi.getMerchantList({ keyword, page: currentPage, size: pageSize }).catch(() => [])
    ]).then(([petsRes, productsRes, servicesRes, merchantsRes]) => {
      // 处理返回数据
      const pets = petsRes.list || petsRes.data || petsRes || [];
      const products = productsRes.list || productsRes.data || productsRes || [];
      const services = servicesRes.list || servicesRes.data || servicesRes || [];
      const merchants = merchantsRes.list || merchantsRes.data || merchantsRes || [];
      
      // 判断是否还有更多数据
      const hasMore = pets.length >= pageSize || products.length >= pageSize || 
                      services.length >= pageSize || merchants.length >= pageSize;
      
      // 计算总结果数
      const totalResults = pets.length + products.length + services.length + merchants.length;
      
      // 更新结果（分页追加）
      const updatedResults = {
        pets: currentPage === 1 ? pets : [...this.data.results.pets, ...pets],
        products: currentPage === 1 ? products : [...this.data.results.products, ...products],
        services: currentPage === 1 ? services : [...this.data.results.services, ...services],
        merchants: currentPage === 1 ? merchants : [...this.data.results.merchants, ...merchants]
      };
      
      this.setData({
        results: updatedResults,
        totalResults: currentPage === 1 ? totalResults : this.data.totalResults + totalResults,
        isLoading: false,
        hasMore,
        currentPage: currentPage + 1
      });
    }).catch(err => {
      console.error('[Search] loadSearchResults failed:', err);
      this.setData({ isLoading: false });
      wx.showToast({ title: '搜索失败', icon: 'none' });
    });
  }),

  // 切换结果类型
  switchResultType(e) {
    const activeType = e.currentTarget.dataset.type;
    this.setData({
      activeType,
      currentPage: 1,
      hasMore: true
    });
    this.loadSearchResults();
  },

  // 返回原页面
  goBack: preventReclick(function() {
    logger.info('返回原页面', { fromPage: this.data.fromPage, originalState: this.data.originalState });
    
    // 将原页面状态保存到缓存，供返回后恢复使用
    cache.set('search_original_state', this.data.originalState, 300); // 5分钟过期
    
    // 返回上一页
    wx.navigateBack({
      delta: 1,
      success: () => {
        logger.info('返回成功');
      },
      fail: (err) => {
        logger.error('返回失败', err);
      }
    });
  }),

  // 搜索输入事件处理
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    
    if (!keyword.trim()) {
      this.setData({ suggestions: [], showSuggestions: false });
      return;
    }

    // Generate suggestions
    const suggestions = this.getSuggestions(keyword);
    this.setData({ suggestions, showSuggestions: true });
  },

  // 清除搜索关键词
  clearSearch() {
    this.setData({ keyword: '' });
  },

  // 搜索按钮点击事件
  onSearch() {
    const { keyword } = this.data;
    if (!keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    // 重置搜索状态
    this.setData({
      currentPage: 1,
      hasMore: true,
      results: {
        pets: [],
        products: [],
        services: [],
        merchants: []
      }
    });
    
    // 保存搜索历史
    this.saveSearchHistory();
    
    // 加载搜索结果
    this.loadSearchResults();
  },

  // 切换结果类型
  switchResultType(e) {
    const activeType = e.currentTarget.dataset.type;
    this.setData({
      activeType,
      currentPage: 1,
      hasMore: true
    });
    this.loadSearchResults();
  },

  // 加载更多数据
  loadMore() {
    if (!this.data.isLoading && this.data.hasMore) {
      this.loadSearchResults();
    }
  },

  // 跳转到宠物详情页
  navigateToPetDetail(e) {
    const petId = e.currentTarget.dataset.id;
    if (!petId || petId === 'undefined' || petId === 'null') {
      logger.warn('跳转宠物详情页失败，无效的ID:', petId);
      return;
    }
    
    // 确保ID是数字或有效字符串，如果包含 'pet-' 前缀需要处理（模拟数据带前缀，实际数据可能不带）
    // 这里假设模拟数据的ID格式是 'pet-123'，而真实详情页可能需要纯数字ID，或者详情页能处理前缀
    // 为兼容模拟数据，这里不做处理，但在真实环境中应确保ID格式一致
    
    wx.navigateTo({
      url: `/pages/pet/detail/detail?id=${petId}`,
      fail: (err) => {
        logger.error('跳转宠物详情页失败', err);
        wx.showToast({ title: '无法打开详情页', icon: 'none' });
      }
    });
  },

  // 跳转到商品详情页
  navigateToProductDetail(e) {
    const productId = e.currentTarget.dataset.id;
    if (!productId || productId === 'undefined' || productId === 'null') {
        logger.warn('跳转商品详情页失败，无效的ID:', productId);
        return;
    }

    wx.navigateTo({
      url: `/pages/mall/detail/detail?id=${productId}`,
      fail: (err) => {
          logger.error('跳转商品详情页失败', err);
          wx.showToast({ title: '无法打开详情页', icon: 'none' });
      }
    });
  },

  // 跳转到服务详情页
  navigateToServiceDetail(e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/service/detail/detail?id=${serviceId}`
    });
  },

  // 跳转到商家详情页
  navigateToMerchantDetail(e) {
    const merchantId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/merchant/detail/detail?id=${merchantId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      hasMore: true,
      results: {
        pets: [],
        products: [],
        services: [],
        merchants: []
      }
    });
    
    // 加载搜索结果
    this.loadSearchResults();
    
    // 停止下拉刷新动画
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.isLoading && this.data.hasMore) {
      this.loadSearchResults();
    }
  },

  // 保存搜索历史
  saveSearchHistory() {
    const { keyword } = this.data;
    if (!keyword.trim()) return;
    
    // 获取现有搜索历史
    let history = cache.get('search_history') || [];
    
    // 去重并添加到历史记录最前面
    history = history.filter(item => item !== keyword);
    history.unshift(keyword);
    
    // 限制历史记录数量为10条
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    cache.set('search_history', history, 86400); // 1天过期
  }
});