// pages/merchant/product/edit/edit.js
const app = getApp()
const productApi = require('../../../../api/productApi');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    productId: null,
    product: {
      name: '',
      category: '',
      price: '',
      stock: '',
      image: '',
      description: '',
      status: 'published'
    },
    categories: [
      { id: 'food', name: '宠物食品' },
      { id: 'toy', name: '宠物玩具' },
      { id: 'clothing', name: '宠物服饰' },
      { id: 'accessory', name: '宠物配件' },
      { id: 'medicine', name: '宠物药品' },
      { id: 'hygiene', name: '宠物卫生' },
      { id: 'other', name: '其他' }
    ],
    categoryIndex: 0,
    isLoading: false,
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!app.checkLogin()) {
      return
    }
    
    // 检查权限
    if (!app.checkPermission('manage_merchant')) {
      wx.showToast({
        title: '您没有权限访问此页面',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    // 获取商品ID
    const productId = options.id
    if (!productId) {
      wx.showToast({
        title: '商品ID不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.setData({
      productId: productId
    })
    
    // 加载商品详情
    this.loadProductDetail(productId)
  },

  /**
   * 加载商品详情
   */
  loadProductDetail(productId) {
    this.setData({ isLoading: true })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      // 模拟商品数据，实际应该从API获取
      const product = {
        id: productId,
        name: '宠物食品大礼包',
        category: 'food',
        price: 99.99,
        stock: 100,
        sales: 50,
        rating: 4.8,
        status: 'published',
        createdAt: '2025-12-18T10:00:00Z',
        updatedAt: '2025-12-18T10:00:00Z',
        image: 'https://example.com/product1.jpg',
        description: '精选宠物食品大礼包，包含多种宠物爱吃的零食和主食，营养丰富，口感美味，适合各种宠物食用。'
      }
      
      // 计算分类索引
      const categoryIndex = this.data.categories.findIndex(cat => cat.id === product.category)
      
      this.setData({
        product: product,
        categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
        isLoading: false
      })
    }, 1000)
  },

  /**
   * 输入框内容变化处理
   */
  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`product.${field}`]: value
    })
  },

  /**
   * 选择器变化处理
   */
  onPickerChange(e) {
    const field = e.currentTarget.dataset.field
    const index = e.detail.value
    const category = this.data.categories[index]
    
    this.setData({
      [`product.${field}`]: category.id,
      categoryIndex: index
    })
  },

  /**
   * 单选框变化处理
   */
  onRadioChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`product.${field}`]: value
    })
  },

  /**
   * 选择图片
   */
  chooseImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        that.uploadImage(tempFilePath);
      }
    })
  },

  /**
   * 上传图片
   */
  uploadImage(tempFilePath) {
    const request = require('../../../../utils/request');
    
    request.upload('/api/upload', tempFilePath).then(url => {
        this.setData({
            'product.image': url
        });
        wx.showToast({
            title: '图片上传成功',
            icon: 'success'
        });
    }).catch(err => {
        console.error('上传失败', err);
        wx.showToast({
            title: '上传失败',
            icon: 'error'
        });
    });
  },

  /**
   * 获取分类名称
   */
  getCategoryName(categoryId) {
    const category = this.data.categories.find(cat => cat.id === categoryId)
    return category ? category.name : ''
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { product } = this.data
    
    if (!product.name.trim()) {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'none'
      })
      return false
    }
    
    if (!product.category) {
      wx.showToast({
        title: '请选择商品分类',
        icon: 'none'
      })
      return false
    }
    
    if (!product.price || parseFloat(product.price) <= 0) {
      wx.showToast({
        title: '请输入有效的商品价格',
        icon: 'none'
      })
      return false
    }
    
    if (!product.stock || parseInt(product.stock) < 0) {
      wx.showToast({
        title: '请输入有效的商品库存',
        icon: 'none'
      })
      return false
    }
    
    if (!product.image) {
      wx.showToast({
        title: '请上传商品封面图片',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  /**
   * 提交表单
   */
  submitForm(e) {
    if (!this.validateForm()) {
      return
    }
    
    this.setData({ isSubmitting: true })
    
    const { product, productId } = this.data
    
    // 构建更新数据
    const updateData = {
        ...product,
        id: productId // 确保 ID 存在
    };
    
    wx.showLoading({
      title: '保存中...'
    })
    
    productApi.updateProduct(updateData).then(res => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
        
        wx.showToast({
            title: '商品更新成功',
            icon: 'success'
        });
        
        // 跳转到商品管理页面
        setTimeout(() => {
            wx.navigateBack({
                delta: 1 // 只退回上一页（通常是详情页或列表页）
            });
        }, 1500);
    }).catch(err => {
        wx.hideLoading();
        this.setData({ isSubmitting: false });
        console.error('更新商品失败:', err);
        wx.showToast({
            title: '更新失败',
            icon: 'error'
        });
    });
  },

  /**
   * 上一页
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的登录状态信息
          wx.clearStorageSync()
          // 将页面重定向至登录页面
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})