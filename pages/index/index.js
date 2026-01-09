//index.js
const globalUtils = require('../../utils/globalUtils');
const catApi = require('../../api/catApi');
const serviceApi = require('../../api/serviceApi');
const productApi = require('../../api/productApi');
const auth = require('../../utils/auth');

Page({
  data: {
    loading: true, // 添加加载状态
    indicatorDots: true,
    autoplay: true,
    interval: 5000, 
    duration: 1000,
    keyword: '',
    imgUrls: [
      { id: 1, url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', type: 'cat' },
      { id: 2, url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', type: 'service' },
      { id: 3, url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', type: 'product' }
    ],
    recommendedPets: [],
    hotServices: [],
    selectedProducts: []
  },

  // 轮播图点击事件
  onSwiperTap(e) {
    const item = e.currentTarget.dataset.item;
    if (item.type === 'cat') {
      this.navigateToPetList();
    } else if (item.type === 'service') {
      this.navigateToServiceList();
    } else if (item.type === 'product') {
      this.navigateToMallList();
    }
  },

  // 轮播图触摸开始，暂停自动播放
  onSwiperTouchStart() {
    this.setData({
      autoplay: false
    });
  },

  // 轮播图触摸结束，恢复自动播放
  onSwiperTouchEnd() {
    this.setData({
      autoplay: true
    });
  },

  onLoad: function() {
    // 页面加载时的初始化逻辑
    console.log('index页面加载');
    this.loadData();
  },

  loadData: function() {
    this.setData({ loading: true });
    
    Promise.all([
      catApi.getCatList({ page: 1, pageSize: 5, recommend: true }).catch(err => {
        console.error('获取推荐猫咪失败', err);
        return { list: [] };
      }),
      serviceApi.getServiceList({ page: 1, pageSize: 4, hot: true }).catch(err => {
        console.error('获取热门服务失败', err);
        return { list: [] };
      }),
      productApi.getProductList({ page: 1, pageSize: 4, recommend: true }).catch(err => {
        console.error('获取精选商品失败', err);
        return { list: [] };
      })
    ]).then(([catRes, serviceRes, productRes]) => {
      // 兼容直接返回数组或返回包含list对象的结构
      const recommendedPets = Array.isArray(catRes) ? catRes : (catRes.list || []);
      const hotServices = Array.isArray(serviceRes) ? serviceRes : (serviceRes.list || []);
      const selectedProducts = Array.isArray(productRes) ? productRes : (productRes.list || []);

      this.setData({
        recommendedPets,
        hotServices,
        selectedProducts,
        loading: false
      });
      wx.stopPullDownRefresh();
    });
  },

  onSearchInput: function(e) {
    // 搜索输入事件处理
    const keyword = e.detail.value
    this.setData({ keyword })
  },

  onSearch: function() {
    // 搜索按钮点击事件处理
    const { keyword } = this.data
    if (!keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    
    // 保存当前页面状态，用于返回时恢复
    const originalState = {
      scrollTop: 0,
      keyword: keyword,
      fromPage: 'index'
    }
    
    // 跳转到搜索结果页面
    wx.navigateTo({
      url: `/pages/search/result/result?keyword=${encodeURIComponent(keyword)}&fromPage=index&originalState=${encodeURIComponent(JSON.stringify(originalState))}`
    })
  },

  navigateToPetList: function() {
    // 跳转到商城列表页（筛选猫咪）
    globalUtils.safeNavigate('/pages/mall/list/list?filter=cat')
  },

  navigateToServiceList: function() {
    // 跳转到服务列表页（带错误捕获）
    globalUtils.safeNavigate('/pages/service/list/list')
  },

  navigateToMallList: function() {
    // 跳转到商城列表页（带错误捕获）
    globalUtils.safeNavigate('/pages/mall/list/list')
  },

  navigateToMine: function() {
    // 跳转到个人中心页
    wx.switchTab({
      url: '/pages/mine/mine'
    })
  },

  navigateToPetDetail: function(e) {
    // 跳转到宠物详情页（带错误捕获）
    const petId = e.currentTarget.dataset.id
    globalUtils.safeNavigate(`/pages/pet/detail/detail?id=${petId}`)
  },

  navigateToServiceDetail: function(e) {
    const serviceId = e.currentTarget.dataset.id
    // 跳转到服务详情页
    globalUtils.safeNavigate(`/pages/service/detail/detail?id=${serviceId}`)
  },

  navigateToServiceAppointment: function(e) {
    // 跳转到服务预约页（带错误捕获）
    if (!auth.checkPermission(() => {
        this.navigateToServiceAppointment(e);
    })) return;

    const serviceId = e.currentTarget.dataset.id
    globalUtils.safeNavigate(`/pages/service/appointment/appointment?id=${serviceId}`)
  },

  navigateToProductDetail: function(e) {
    // 跳转到商品详情页（带错误捕获）
    const productId = e.currentTarget.dataset.id
    globalUtils.safeNavigate(`/pages/mall/detail/detail?id=${productId}`)
  },

  // 下拉刷新事件处理
  onPullDownRefresh: function() {
    this.loadData();
  },

  // 页面显示时触发
  onShow: function() {
    // 可以在这里做一些轻量级的状态检查，避免每次都全量刷新
  }
})