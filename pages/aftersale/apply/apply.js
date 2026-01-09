// pages/aftersale/apply/apply.js
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
    // 售后类型
    aftersaleType: 'refund', // refund: 仅退款, exchange: 换货, refund_exchange: 退款退货
    // 售后原因
    reasons: [
      { id: 1, name: '商品质量问题' },
      { id: 2, name: '商品描述不符' },
      { id: 3, name: '商品破损' },
      { id: 4, name: '错发漏发' },
      { id: 5, name: '不想要了' },
      { id: 6, name: '其他原因' }
    ],
    selectedReasonIndex: 0,
    selectedReason: { id: 1, name: '商品质量问题' },
    // 退款金额
    refundAmount: '',
    // 售后说明
    description: '',
    // 上传图片
    uploadedImages: []
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
    // 初始化退款金额为商品价格
    this.setData({ refundAmount: this.data.product.price })
  },

  // 选择售后类型
  selectAftersaleType(e) {
    this.setData({ aftersaleType: e.currentTarget.dataset.type })
  },

  // 选择售后原因
  onReasonChange(e) {
    const index = e.detail.value
    this.setData({
      selectedReasonIndex: index,
      selectedReason: this.data.reasons[index]
    })
  },

  // 输入退款金额
  onAmountInput(e) {
    this.setData({ refundAmount: e.detail.value })
  },

  // 设置全额退款
  setFullAmount() {
    this.setData({ refundAmount: this.data.product.price })
  },

  // 输入售后说明
  onDescriptionInput(e) {
    this.setData({ description: e.detail.value })
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

  // 提交售后申请
  submitAftersale() {
    // 验证表单
    if (this.data.aftersaleType === 'refund' || this.data.aftersaleType === 'refund_exchange') {
      if (!this.data.refundAmount || parseFloat(this.data.refundAmount) <= 0 || parseFloat(this.data.refundAmount) > this.data.product.price) {
        wx.showToast({
          title: '请输入正确的退款金额',
          icon: 'none'
        })
        return
      }
    }
    
    if (this.data.description.trim() === '') {
      wx.showToast({
        title: '请输入售后说明',
        icon: 'none'
      })
      return
    }
    
    // TODO: 调用API提交售后申请
    console.log('提交售后申请:', {
      orderId: this.data.orderId,
      productId: this.data.product.id,
      aftersaleType: this.data.aftersaleType,
      reason: this.data.selectedReason,
      refundAmount: this.data.refundAmount,
      description: this.data.description,
      images: this.data.uploadedImages
    })
    
    wx.showToast({
      title: '售后申请提交成功',
      icon: 'success'
    })
    
    // 订单详情页
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