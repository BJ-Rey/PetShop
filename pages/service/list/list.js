// pages/service/list/list.js
Page({
  data: {
    activeCategory: 'all', // 当前选中的服务分类
    viewMode: 'grid', // 视图模式：grid（网格）或list（列表）
    sortIndex: 0, // 当前排序索引
    searchKeyword: '', // 搜索关键词
    services: [], // 服务列表数据
    hotServices: [], // 热门服务数据
    // 排序选项
    sortOptions: [
      { id: 1, name: '综合排序' },
      { id: 2, name: '价格从低到高' },
      { id: 3, name: '价格从高到低' },
      { id: 4, name: '销量最高' },
      { id: 5, name: '评分最高' }
    ],
    // 分类选项
    categories: [
      { id: 'all', name: '全部' },
      { id: 'vaccine', name: '疫苗接种' },
      { id: 'grooming', name: '宠物美容' },
      { id: 'boarding', name: '宠物寄养' },
      { id: 'consultation', name: '宠物咨询' },
      { id: 'training', name: '宠物训练' }
    ]
  },

  // 原始服务数据 - 将由API加载
  originalServices: [],

  onLoad: function() {
    // 加载服务数据
    this.loadServices()
    this.loadHotServices()
  },

  // 加载服务列表数据
  loadServices: function() {
    wx.showLoading({ title: '加载中...' });
    const serviceApi = require('../../../api/serviceApi');
    
    serviceApi.getServiceList({
        page: 1,
        size: 50 // 获取足够多的服务用于前端筛选
    }).then(services => {
        wx.hideLoading();
        this.originalServices = services; // 保存原始数据用于筛选
        this.setData({
            services: [...services]
        });
        // 初始化时应用筛选和排序
        this.filterAndSortServices();
    }).catch(err => {
        wx.hideLoading();
        console.error('Failed to load services', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
        // 发生错误时使用空数组
        this.originalServices = [];
        this.setData({ services: [] });
    });
  },

  // 加载热门服务数据
  loadHotServices: function() {
    // 暂时置空或调用API（如果有）
    // const hotServices = [...]
    this.setData({
      hotServices: [] // 等待后端接口或暂时不显示
    })
  },

  // 筛选和排序服务列表
  filterAndSortServices: function() {
    let filteredServices = [...this.originalServices]
    const { activeCategory, searchKeyword, sortIndex } = this.data
    
    // 1. 按分类筛选
    if (activeCategory !== 'all') {
      filteredServices = filteredServices.filter(service => service.category === activeCategory)
    }
    
    // 2. 按关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filteredServices = filteredServices.filter(service => 
        service.name.toLowerCase().includes(keyword) || 
        service.description.toLowerCase().includes(keyword) ||
        service.merchantName.toLowerCase().includes(keyword)
      )
    }
    
    // 3. 排序
    const sortTypes = [
      // 综合排序（销量*0.6 + 评分*0.4）
      (a, b) => {
        const scoreA = a.sales * 0.6 + a.rating * 0.4
        const scoreB = b.sales * 0.6 + b.rating * 0.4
        return scoreB - scoreA
      },
      // 价格从低到高
      (a, b) => a.price - b.price,
      // 价格从高到低
      (a, b) => b.price - a.price,
      // 销量最高
      (a, b) => b.sales - a.sales,
      // 评分最高
      (a, b) => b.rating - a.rating
    ]
    
    filteredServices.sort(sortTypes[sortIndex])
    
    this.setData({
      services: filteredServices
    })
  },

  // 选择分类
  selectCategory: function(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      activeCategory: category
    })
    this.filterAndSortServices()
  },

  // 切换视图模式
  switchViewMode: function(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      viewMode: mode
    })
  },

  // 搜索输入
  onSearchInput: function(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
  },

  // 搜索按钮点击事件处理
  onSearch: function() {
    const { searchKeyword } = this.data
    if (!searchKeyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    
    // 保存当前页面状态，用于返回时恢复
    const originalState = {
      scrollTop: 0,
      searchKeyword: searchKeyword,
      activeCategory: this.data.activeCategory,
      viewMode: this.data.viewMode,
      sortIndex: this.data.sortIndex,
      fromPage: 'service-list'
    }
    
    // 跳转到搜索结果页面
    wx.navigateTo({
      url: `/pages/search/result/result?keyword=${encodeURIComponent(searchKeyword)}&fromPage=service-list&originalState=${encodeURIComponent(JSON.stringify(originalState))}`
    })
  },

  // 排序方式改变
  onSortChange: function(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      sortIndex: index
    })
    this.filterAndSortServices()
  },

  // 跳转到服务详情页
  navigateToServiceDetail: function(e) {
    const serviceId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/service/detail/detail?id=${serviceId}`
    })
  },

  // 跳转到服务预约页
  navigateToServiceAppointment: function(e) {
    const serviceId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/service/appointment/appointment?id=${serviceId}`
    })
  },

  // 上一页
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 下拉刷新事件处理
  onPullDownRefresh: function() {
    // 重新加载所有数据
    setTimeout(() => {
      this.loadServices()
      this.loadHotServices()
      // 停止下拉刷新动画
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 页面显示时触发，用于恢复从搜索结果返回时的状态
  onShow: function() {
    const cache = require('../../../utils/cache')
    const originalState = cache.get('search_original_state')
    
    if (originalState && originalState.fromPage === 'service-list') {
      // 恢复搜索关键词
      if (originalState.searchKeyword) {
        this.setData({ searchKeyword: originalState.searchKeyword })
      }
      
      // 恢复其他状态
      if (originalState.activeCategory) {
        this.setData({ activeCategory: originalState.activeCategory })
      }
      if (originalState.viewMode) {
        this.setData({ viewMode: originalState.viewMode })
      }
      if (originalState.sortIndex !== undefined) {
        this.setData({ sortIndex: originalState.sortIndex })
      }
      
      // 触发页面刷新，确保展示最新数据
      this.loadServices()
      this.loadHotServices()
      
      // 清除缓存的状态
      cache.remove('search_original_state')
    }
  }
})