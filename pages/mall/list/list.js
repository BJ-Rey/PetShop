const globalUtils = require('../../../utils/globalUtils');
const auth = require('../../../utils/auth');
const petStore = require('../../../utils/petStore');
const catApi = require('../../../api/catApi');
const productApi = require('../../../api/productApi');

Page({
  data: {
    searchKeyword: '', // 搜索关键词
    isSearching: false, // 是否处于搜索状态
    currentFilter: 'cat', // 当前筛选: 'cat' | 'product'
    
    products: [], // 商品列表数据
    filteredProducts: [], // 搜索后的商品
    
    pets: [], // 猫咪列表数据 (当前页)
    // allPets: [], // 移除本地全量数据
    filteredPets: [], // 搜索后的猫咪
    
    // 分页相关
    pageSize: 10,
    currentPage: 1,
    hasMore: true,
    isLoading: false,

    hotProducts: [], // 热门商品数据
    bannerList: [], // 轮播图数据
    
    // 轮播图配置
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,

    // 联系商家相关
    showContactModal: false,
    merchantInfo: {
      phone: '13800138000',
      wechatQrcode: 'https://via.placeholder.com/200'
    }
  },

  onLoad: function() {
    // 订阅状态变更
    this.unsubscribe = petStore.subscribe(this.onPetStatusChange.bind(this));
    
    // 加载数据
    this.loadProducts()
    this.loadPets()
    this.loadHotProducts()
    this.loadBannerList()
  },

  onUnload: function() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },

  onShow: function() {
    // 页面显示时不需要单独刷新购物车数量，全局购物车组件会自动更新
  },

  /**
   * 监听猫咪状态变更
   * @param {Object} allStates 所有猫咪状态
   */
  onPetStatusChange: function(allStates) {
    // 更新 pets
    const updatedPets = this.data.pets.map(pet => {
      const state = allStates[pet.id];
      if (state) {
        return { ...pet, ...state };
      }
      return pet;
    });

    this.setData({
      pets: updatedPets
    });
  },

  // 切换筛选
  switchFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter,
      isSearching: false,
      searchKeyword: ''
    });
    // 切换tab时如果数据为空，可以触发加载
    if (filter === 'product' && this.data.products.length === 0) {
        this.loadProducts();
    } else if (filter === 'cat' && this.data.pets.length === 0) {
        this.loadPets();
    }
  },

  // 加载商品列表数据
  loadProducts: function() {
    productApi.getProductList({
        page: 1,
        size: 20
    }).then(products => {
        this.setData({
            products: products
        });
    }).catch(err => {
        console.error('Failed to load products', err);
        wx.showToast({ title: '加载商品失败', icon: 'none' });
    });
  },

  // 加载猫咪列表数据
  loadPets: function(isLoadMore = false) {
      if (this.data.isLoading) return;
      
      this.setData({ isLoading: true });
      
      const page = isLoadMore ? this.data.currentPage + 1 : 1;

      catApi.getCatList({
          page: page,
          size: this.data.pageSize
      }).then(pets => {
          // 处理状态逻辑
          const processedPets = pets.map(pet => {
            let status = 'available';
            let statusText = '可预订';
            let isOrdered = false;

            if (pet.status === 'booked') {
                status = 'booked';
                statusText = '已定';
                isOrdered = true;
            } else if (pet.status === 'sold') {
                status = 'sold';
                statusText = '已售出';
                isOrdered = true;
            }

            return {
                ...pet,
                price: parseFloat(pet.price).toFixed(2),
                deposit: parseFloat(pet.deposit).toFixed(2),
                isOrdered: isOrdered,
                status: status,
                statusText: statusText
            };
          });

          // 初始化 Store (仅第一页)
          if (!isLoadMore && processedPets.length > 0) {
              petStore.initPets(processedPets);
          }
          
          // 使用 Store 中的最新状态覆盖
          const currentStates = petStore.getAll();
          const finalPets = processedPets.map(pet => {
             const state = currentStates[pet.id];
             if (state) {
                 return { ...pet, ...state };
             }
             return pet;
          });

          this.setData({
              pets: isLoadMore ? [...this.data.pets, ...finalPets] : finalPets,
              currentPage: page,
              hasMore: pets.length >= this.data.pageSize,
              isLoading: false
          });

      }).catch(err => {
          console.error('Failed to load pets', err);
          wx.showToast({ title: '加载猫咪失败', icon: 'none' });
          this.setData({ isLoading: false });
      });
  },

  // 触底加载更多
  onReachBottom: function() {
      if (this.data.currentFilter === 'cat' && this.data.hasMore && !this.data.isSearching) {
          this.loadPets(true);
      }
  },

  // 加载热门商品数据 (暂时取前3个商品)
  loadHotProducts: function() {
    productApi.getProductList({
        page: 1,
        size: 3
    }).then(products => {
        this.setData({
            hotProducts: products
        });
    });
  },

  // 加载轮播图数据
  loadBannerList: function() {
    const bannerList = [
      {
        id: 1,
        image: 'https://placehold.co/800x400/FFA726/ffffff?text=Banner1',
        link: '/pages/mall/detail/detail?id=1'
      },
      {
        id: 2,
        image: 'https://placehold.co/800x400/FFA726/ffffff?text=Banner2',
        link: '/pages/mall/list/list'
      },
      {
        id: 3,
        image: 'https://placehold.co/800x400/FFA726/ffffff?text=Banner3',
        link: '/pages/mall/list/list'
      }
    ]
    this.setData({
      bannerList: bannerList
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
    
    // 跳转到全局搜索结果页
    wx.navigateTo({
      url: `/pages/search/result/result?keyword=${encodeURIComponent(searchKeyword)}&fromPage=mall`
    })
  },

  // 跳转到商品详情页
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/mall/detail/detail?id=${productId}`
    })
  },

  // 跳转到宠物详情页
  navigateToPetDetail: function(e) {
    const petId = e.currentTarget.dataset.id
    const app = getApp()
    const url = app.globalData.isMerchant 
      ? `/pages/merchant/pet/detail/detail?id=${petId}`
      : `/pages/pet/detail/detail?id=${petId}`;
    
    wx.navigateTo({
        url: url,
        fail: (err) => {
             console.error('Navigate failed', err);
             // 如果普通用户尝试访问商家页面失败，回退到普通页面
             if (app.globalData.isMerchant) {
                 wx.navigateTo({ 
                     url: `/pages/pet/detail/detail?id=${petId}`,
                     fail: (err2) => {
                         wx.showToast({ title: '无法打开详情页', icon: 'none' });
                     }
                 });
             } else {
                 wx.showToast({ title: '无法打开详情页', icon: 'none' });
             }
        }
    });
  },

  // 跳转到全部商品页
  navigateToAllProducts: function() {
    this.setData({ currentFilter: 'product', isSearching: false, searchKeyword: '' });
  },

  // 跳转到轮播图链接
  navigateToBannerLink: function(e) {
    const link = e.currentTarget.dataset.link
    if (link) {
      wx.navigateTo({
        url: link
      })
    }
  },

  // 上一页
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 下拉刷新事件处理
  onPullDownRefresh: function() {
    setTimeout(() => {
      this.loadProducts()
      this.loadPets()
      this.loadHotProducts()
      this.loadBannerList()
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 联系商家
  showContactModal: function(e) {
    if (!auth.checkPermission()) return;
    this.setData({ showContactModal: true })
  },
  
  hideContactModal: function() {
    this.setData({ showContactModal: false })
  },
  
  callMerchant: function() {
    const phone = this.data.merchantInfo.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    }
  }
})