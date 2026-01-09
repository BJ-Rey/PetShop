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
    
    // 模拟API请求，实际项目中替换为真实接口调用
    setTimeout(() => {
      logger.info('加载搜索结果', { keyword, currentPage, pageSize, activeType });
      
      // 模拟搜索结果数据
      const newResults = this.generateMockResults(currentPage, pageSize);
      const hasMore = currentPage < 3; // 模拟只有3页数据
      
      // 计算总结果数
      const totalResults = Object.values(newResults).reduce((sum, items) => sum + items.length, 0);
      
      // 更新结果
      const updatedResults = {
        pets: currentPage === 1 ? newResults.pets : [...this.data.results.pets, ...newResults.pets],
        products: currentPage === 1 ? newResults.products : [...this.data.results.products, ...newResults.products],
        services: currentPage === 1 ? newResults.services : [...this.data.results.services, ...newResults.services],
        merchants: currentPage === 1 ? newResults.merchants : [...this.data.results.merchants, ...newResults.merchants]
      };
      
      this.setData({
        results: updatedResults,
        totalResults,
        isLoading: false,
        hasMore,
        currentPage: currentPage + 1
      });
    }, 500);
  }),

  // 生成模拟搜索结果
  generateMockResults(page, pageSize) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // 生成不同类型的模拟数据
    const pets = [];
    const products = [];
    const services = [];
    const merchants = [];
    
    // 根据页码生成不同类型的数据
    for (let i = startIndex; i < endIndex; i++) {
      // 宠物数据
      if (i % 2 === 0) {
        pets.push({
          id: i + 1, // 使用纯数字ID以匹配详情页逻辑，原为 `pet-${i}`
          name: `${this.data.keyword} 宠物 ${i + 1}`,
          breed: ['金毛', '布偶', '哈士奇', '英短'][Math.floor(Math.random() * 4)],
          age: `${Math.floor(Math.random() * 5) + 1}岁`,
          gender: i % 3 === 0 ? 'male' : 'female',
          price: Math.floor(Math.random() * 3000) + 1000,
          avatar: `/images/default.png`
        });
      }
      
      // 商品数据
      if (i % 3 === 0) {
        products.push({
          id: i + 1, // 使用纯数字ID以匹配详情页逻辑，原为 `product-${i}`
          name: `${this.data.keyword} 商品 ${i + 1}`,
          price: Math.floor(Math.random() * 1000) + 100,
          sales: Math.floor(Math.random() * 5000),
          image: `/images/default.png`
        });
      }
      
      // 服务数据
      if (i % 4 === 0) {
        services.push({
          id: i + 1, // 使用纯数字ID
          name: `${this.data.keyword} 服务 ${i + 1}`,
          description: `这是与"${this.data.keyword}"相关的服务描述，提供专业的宠物服务。`,
          price: Math.floor(Math.random() * 500) + 50,
          merchantName: `宠物服务商家 ${Math.floor(Math.random() * 10) + 1}`,
          image: `/images/default.png`
        });
      }
      
      // 商家数据
      if (i % 5 === 0) {
        merchants.push({
          id: i + 1, // 使用纯数字ID
          name: `${this.data.keyword} 商家 ${i + 1}`,
          logo: `/images/default.png`,
          rating: (Math.random() * 5).toFixed(1),
          address: '北京市朝阳区宠物大街123号',
          services: ['宠物美容', '疫苗接种', '宠物寄养', '宠物咨询'].slice(0, Math.floor(Math.random() * 4) + 1)
        });
      }
    }
    
    return { pets, products, services, merchants };
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