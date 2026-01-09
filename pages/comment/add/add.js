// pages/comment/add/add.js
Page({
  data: {
    orderId: null,
    // 订单信息
    order: {
      id: 1,
      orderNo: '20251218123456789'
    },
    // 商品信息
    product: {
      id: 1,
      name: '天然狗粮通用型金毛拉布拉多大型犬成犬粮',
      sku: '10kg装',
      price: 129,
      image: 'https://example.com/product1.jpg'
    },
    // 评分
    rating: 5,
    // 评分文本
    ratingText: '非常满意',
    // 评论内容
    content: '',
    // 上传图片
    uploadedImages: [],
    // 评分文本映射
    ratingTextMap: {
      1: '非常不满意',
      2: '不满意',
      3: '一般',
      4: '满意',
      5: '非常满意'
    }
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId })
    this.loadOrderInfo()
    this.loadProductInfo()
  },

  // 加载订单信息
  loadOrderInfo() {
    // 模拟从API获取订单信息
    // 这里使用模拟数据
    this.setData({ order: this.data.order })
  },

  // 加载商品信息
  loadProductInfo() {
    // 模拟从API获取商品信息
    // 这里使用模拟数据
    this.setData({ product: this.data.product })
  },

  // 设置评分
  setRating(e) {
    const rating = parseInt(e.currentTarget.dataset.rating)
    this.setData({
      rating: rating,
      ratingText: this.data.ratingTextMap[rating]
    })
  },

  // 评论内容输入
  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  // 选择图片
  chooseImage() {
    const maxImages = 9 - this.data.uploadedImages.length
    wx.chooseImage({
      count: maxImages,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        const uploadedImages = [...this.data.uploadedImages, ...tempFilePaths]
        this.setData({ uploadedImages })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const uploadedImages = this.data.uploadedImages
    uploadedImages.splice(index, 1)
    this.setData({ uploadedImages })
  },

  // 提交评论
  submitComment() {
    // 验证表单
    if (this.data.content.trim() === '') {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      })
      return
    }
    
    // TODO: 调用API提交评论
    console.log('提交评论:', {
      orderId: this.data.orderId,
      productId: this.data.product.id,
      rating: this.data.rating,
      content: this.data.content,
      images: this.data.uploadedImages
    })
    
    wx.showToast({
      title: '评论提交成功',
      icon: 'success'
    })
    
    // 订单列表页
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  // 上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})