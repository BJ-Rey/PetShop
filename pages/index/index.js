//index.js
const globalUtils = require('../../utils/globalUtils');

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 5000, // 自动轮播间隔为5秒
    duration: 1000,
    keyword: '',
    imgUrls: [
      'https://placehold.co/600x400/FFA726/ffffff?text=Cat+Mall',
      'https://placehold.co/600x400/e64340/ffffff?text=Cute+Cats',
      'https://placehold.co/600x400/4FC3F7/ffffff?text=Pet+Services'
    ],
    recommendedPets: [
      {
        id: 1,
        name: '小黑',
        breed: '英国短毛猫',
        age: '2岁',
        avatar: 'https://placehold.co/200x200/333333/ffffff?text=Cat1'
      },
      {
        id: 2,
        name: '咪咪',
        breed: '布偶猫',
        age: '1岁',
        avatar: 'https://placehold.co/200x200/ff99cc/ffffff?text=Cat2',
        merchantName: '爱心宠物医院'
      },
      {
        id: 3,
        name: '花花',
        breed: '三花猫',
        age: '3岁',
        avatar: 'https://placehold.co/200x200/ffcc00/ffffff?text=Cat3'
      },
      {
        id: 4,
        name: '雪球',
        breed: '英短',
        age: '1.5岁',
        avatar: 'https://placehold.co/200x200/eeeeee/333333?text=Cat4',
        merchantName: '宠物乐园'
      }
    ],
    hotServices: [
      {
        id: 1,
        name: '猫咪疫苗接种',
        price: 198,
        image: 'https://placehold.co/400x300/FFA726/ffffff?text=Vaccine'
      },
      {
        id: 2,
        name: '猫咪美容',
        price: 128,
        image: 'https://placehold.co/400x300/F57C00/ffffff?text=Grooming'
      },
      {
        id: 3,
        name: '猫咪寄养',
        price: 80,
        image: 'https://placehold.co/400x300/4FC3F7/ffffff?text=Hotel'
      },
      {
        id: 4,
        name: '猫咪洗澡',
        price: 68,
        image: 'https://placehold.co/400x300/99cc33/ffffff?text=Bath'
      }
    ],
    selectedProducts: [
      {
        id: 1,
        name: '天然猫粮通用型英短美短成猫粮',
        price: 129,
        sales: 1256,
        image: 'https://placehold.co/400x400/ff9900/ffffff?text=Cat+Food'
      },
      {
        id: 2,
        name: '猫砂膨润土除臭结团猫砂10kg',
        price: 59,
        sales: 2341,
        image: 'https://placehold.co/400x400/cccccc/333333?text=Litter'
      },
      {
        id: 3,
        name: '猫咪逗猫棒玩具',
        price: 39,
        sales: 892,
        image: 'https://placehold.co/400x400/ff3333/ffffff?text=Toy'
      },
      {
        id: 4,
        name: '猫咪牵引绳',
        price: 49,
        sales: 1567,
        image: 'https://placehold.co/400x400/3399ff/ffffff?text=Leash'
      }
    ]
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
    console.log('index页面加载')
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
    // 模拟数据刷新
    setTimeout(() => {
      // 重置数据（这里可以替换为实际的API调用）
      this.setData({
        // 可以在这里重新加载数据
        recommendedPets: [...this.data.recommendedPets],
        hotServices: [...this.data.hotServices],
        selectedProducts: [...this.data.selectedProducts]
      })
      // 停止下拉刷新动画
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'none'
      })
    }, 1000)
  },

  // 页面显示时触发
  onShow: function() {
    try {
      const cache = require('../../utils/cache')
      // 触发页面刷新，确保展示最新数据
      this.onPullDownRefresh()
    } catch (e) {
      console.error('index onShow failed', e)
    }
  }
})