// pages/mall/detail/detail.js
const auth = require('../../../utils/auth');

Page({
  data: {
    productId: null,
    product: {
      id: 1,
      name: '天然狗粮通用型金毛拉布拉多大型犬成犬粮',
      price: 129,
      originalPrice: 199,
      rating: 4.8,
      sales: 1256,
      stock: 500,
      description: '天然狗粮，采用优质食材，富含蛋白质和维生素，适合金毛、拉布拉多等大型犬成犬食用。',
      images: [
        'https://example.com/product1.jpg',
        'https://example.com/product1_1.jpg',
        'https://example.com/product1_2.jpg'
      ],
      detailImages: [
        'https://example.com/product1_detail1.jpg',
        'https://example.com/product1_detail2.jpg',
        'https://example.com/product1_detail3.jpg'
      ],
      specs: [
        {
          id: 1,
          name: '规格',
          options: [
            { value: '10kg', name: '10kg' },
            { value: '20kg', name: '20kg' }
          ]
        },
        {
          id: 2,
          name: '口味',
          options: [
            { value: 'chicken', name: '鸡肉味' },
            { value: 'beef', name: '牛肉味' },
            { value: 'fish', name: '鱼肉味' }
          ]
        }
      ]
    },
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    // 规格选择
    selectedSpecs: {},
    // 数量选择
    quantity: 1,
    // 购物车数量
    cartCount: 0,
    // 加载状态
    loading: false,
    // 防止重复点击
    buyNowDisabled: false,
    // 规格弹窗控制
    showSpecModal: false
  },

  onLoad(options) {
    this.setData({ productId: options.id })
    this.loadProductDetail()
    this.loadCartCount()
    
    // 获取系统信息用于自定义导航栏
    const sysInfo = wx.getSystemInfoSync()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    
    const statusBarHeight = sysInfo.statusBarHeight
    // 导航栏内容高度 = (胶囊按钮上边界 - 状态栏高度) * 2 + 胶囊按钮高度
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height
    const navBarTotalHeight = statusBarHeight + navBarHeight
    
    this.setData({
      statusBarHeight,
      navBarHeight,
      navBarTotalHeight
    })
  },

  onShow() {
    // 页面显示时刷新商品详情和购物车数量
    this.loadProductDetail()
    this.loadCartCount()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    // 模拟网络请求刷新数据
    setTimeout(() => {
      this.loadProductDetail();
      this.loadCartCount();
      
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'none'
      });
    }, 500);
  },

  // 加载商品详情
  loadProductDetail() {
    const productId = this.data.productId
    this.setData({ loading: true })
    
    const productApi = require('../../../api/productApi')
    productApi.getProductDetail(productId).then(product => {
        // 初始化规格选择
        const selectedSpecs = {}
        if (product.specs) {
            product.specs.forEach(spec => {
                selectedSpecs[spec.id] = spec.options[0].value
            })
        }
        
        this.setData({ 
            product: product,
            selectedSpecs,
            loading: false
        })
    }).catch(err => {
        console.error('Failed to load product detail', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
        this.setData({ loading: false })
    })
  },

  // 加载购物车数量
  loadCartCount() {
    // 从本地存储获取购物车数量
    const cartItems = wx.getStorageSync('cartItems') || []
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    this.setData({ cartCount })
  },

  // 上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 切换收藏状态
  toggleFavorite() {
    if (!auth.checkPermission(() => {
        this.toggleFavorite();
    })) return;

    const newIsFavorite = toggleFavorite('products', this.data.product);
    this.setData({ isFavorite: newIsFavorite });
  },

  // 分享商品
  shareProduct() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 选择规格
  selectSpec(e) {
    const specId = e.currentTarget.dataset.specId
    const optionValue = e.currentTarget.dataset.optionValue
    const selectedSpecs = { ...this.data.selectedSpecs }
    selectedSpecs[specId] = optionValue
    this.setData({ selectedSpecs })
  },

  // 减少数量
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },

  // 增加数量
  increaseQuantity() {
    if (this.data.quantity < this.data.product.stock) {
      this.setData({ quantity: this.data.quantity + 1 })
    }
  },

  // 加入购物车
  addToCart() {
    if (this.data.product.stock <= 0) {
      wx.showToast({
        title: '商品已售罄',
        icon: 'none'
      })
      return
    }
    
    const product = this.data.product
    const selectedSpecs = this.data.selectedSpecs
    const quantity = this.data.quantity
    
    // 获取当前购物车数据
    const cartItems = wx.getStorageSync('cartItems') || []
    
    // 构建商品SKU字符串
    const skuArray = Object.values(selectedSpecs)
    const sku = skuArray.join(', ')
    
    // 检查商品是否已存在于购物车
    const existingItemIndex = cartItems.findIndex(item => 
      item.id === product.id && item.sku === sku
    )
    
    if (existingItemIndex >= 0) {
      // 商品已存在，更新数量
      cartItems[existingItemIndex].quantity += quantity
      // 确保数量不超过库存
      if (cartItems[existingItemIndex].quantity > product.stock) {
        cartItems[existingItemIndex].quantity = product.stock
        wx.showToast({
          title: '已达到最大库存',
          icon: 'none'
        })
        return
      }
    } else {
      // 商品不存在，添加到购物车
      const cartItem = {
        id: product.id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        sku: sku,
        quantity: quantity,
        checked: true, // 默认选中
        stock: product.stock
      }
      cartItems.push(cartItem)
    }
    
    // 保存到本地存储
    wx.setStorageSync('cartItems', cartItems)
    
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success'
    })
    
    // 更新购物车数量
    this.setData({ cartCount: this.data.cartCount + quantity })
  },

  // 显示规格弹窗
  showSpecModal() {
    this.setData({ showSpecModal: true });
  },

  hideSpecModal() {
    this.setData({ showSpecModal: false });
  },

  // 确认下单
  confirmBuy() {
    const specs = this.data.product.specs || [];
    const selectedSpecs = this.data.selectedSpecs || {};
    
    if (Object.keys(selectedSpecs).length < specs.length) {
      wx.showToast({ title: '请选择规格', icon: 'none' });
      return;
    }
    this.hideSpecModal();
    this.buyNow();
  },

  // 立即购买
  buyNow() {
    // 防止重复点击
    if (this.data.buyNowDisabled || this.data.loading) {
      return
    }

    if (!auth.checkPermission(() => {
        this.buyNow();
    })) return;
    
    if (this.data.product.stock <= 0) {
      wx.showToast({
        title: '商品已售罄',
        icon: 'none'
      })
      return
    }

    // 检查规格
    const specs = this.data.product.specs || [];
    const selectedSpecs = this.data.selectedSpecs || {};
    
    // 如果未选择规格，先弹出选择
    if (Object.keys(selectedSpecs).length < specs.length) {
        this.showSpecModal();
        return;
    }
    
    // 设置加载状态和防重复点击
    this.setData({
      loading: true,
      buyNowDisabled: true
    })
    
    try {
      const app = getApp()
      
      const product = this.data.product
      const quantity = this.data.quantity
      
      // 构建商品SKU字符串
      const skuArray = Object.values(selectedSpecs)
      const sku = skuArray.join(', ')
      
      // 构建订单商品信息
      const orderItem = {
        id: product.id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        sku: sku,
        quantity: quantity,
        checked: true,
        stock: product.stock
      }
      
      // 保存当前订单商品到全局数据，用于跳转到确认订单页面
      app.globalData.currentOrderItems = [orderItem]
      
      // 跳转到确认订单页面
      wx.navigateTo({
        url: '/pages/order/create/create',
        fail: () => {
          // 跳转失败时恢复状态
          this.setData({
            loading: false,
            buyNowDisabled: false
          })
        }
      })
    } catch (error) {
      console.error('立即购买失败:', error)
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
      this.setData({
        loading: false,
        buyNowDisabled: false
      })
    }
  },

  // 跳转到购物车
  navigateToCart() {
    wx.switchTab({
      url: '/pages/cart/cart'
    })
  }
})
