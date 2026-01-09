// pages/cart/cart.js
const auth = require('../../utils/auth');

Page({
  data: {
    cartItems: [],
    allChecked: true,
    totalPrice: 0,
    selectedCount: 0,
    startX: 0, // 开始滑动的X坐标
    startY: 0  // 开始滑动的Y坐标
  },

  onLoad() {
    this.refreshCart()
  },

  onShow() {
    // 页面显示时刷新购物车数据
    this.refreshCart()
  },

  // 刷新购物车数据
  refreshCart() {
    // 从本地存储获取购物车数据
    const cartItems = wx.getStorageSync('cartItems') || []
    
    // 数据清洗：修复价格字段可能包含'¥'的问题，并补充缺失图片
    const cleanCartItems = cartItems.map(item => {
        // 清洗价格
        let price = item.price;
        if (typeof price === 'string') {
            price = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
        }
        
        // 补充图片
        let image = item.image;
        if (!image || image.includes('example.com')) {
            image = `https://placehold.co/200x200/e0e0e0/ffffff?text=${encodeURIComponent(item.name.substring(0,4))}`;
        }
        
        return {
            ...item,
            price: price,
            image: image,
            translateX: 0
        };
    });

    this.setData({ cartItems: cleanCartItems })
    this.calculateTotal()
    this.checkAllChecked()
    
    // 更新本地存储（可选，但推荐）
    wx.setStorageSync('cartItems', cleanCartItems);
  },

  // 触摸开始事件
  touchStart(e) {
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    })
    // 关闭其他已打开的滑动项
    const cartItems = this.data.cartItems.map(item => ({
      ...item,
      translateX: 0
    }))
    this.setData({ cartItems })
  },

  // 触摸移动事件
  touchMove(e) {
    const index = e.currentTarget.dataset.index
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const startX = this.data.startX
    const startY = this.data.startY
    const cartItems = this.data.cartItems
    
    // 计算滑动距离
    let translateX = currentX - startX
    // 限制滑动范围
    if (translateX < -120) translateX = -120
    if (translateX > 0) translateX = 0
    
    cartItems[index].translateX = translateX
    this.setData({ cartItems })
  },

  // 触摸结束事件
  touchEnd(e) {
    const index = e.currentTarget.dataset.index
    const currentX = e.changedTouches[0].clientX
    const startX = this.data.startX
    const cartItems = this.data.cartItems
    
    // 计算滑动距离
    const translateX = currentX - startX
    // 如果滑动距离超过阈值，打开删除按钮
    if (translateX < -60) {
      cartItems[index].translateX = -120
    } else {
      // 否则关闭
      cartItems[index].translateX = 0
    }
    this.setData({ cartItems })
  },

  // 切换商品选中状态
  toggleItem(e) {
    const index = e.currentTarget.dataset.index
    const cartItems = this.data.cartItems
    cartItems[index].checked = !cartItems[index].checked
    this.setData({ cartItems })
    // 保存到本地存储
    wx.setStorageSync('cartItems', cartItems)
    this.calculateTotal()
    this.checkAllChecked()
  },

  // 全选/取消全选
  toggleAll(e) {
    const allChecked = e.detail.value.length > 0
    const cartItems = this.data.cartItems.map(item => ({
      ...item,
      checked: allChecked
    }))
    this.setData({ cartItems, allChecked })
    // 保存到本地存储
    wx.setStorageSync('cartItems', cartItems)
    this.calculateTotal()
  },

  // 检查是否全选
  checkAllChecked() {
    const allChecked = this.data.cartItems.every(item => item.checked)
    this.setData({ allChecked })
  },

  // 减少商品数量
  decreaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const cartItems = this.data.cartItems
    if (cartItems[index].quantity > 1) {
      cartItems[index].quantity--
      this.setData({ cartItems })
      // 保存到本地存储
      wx.setStorageSync('cartItems', cartItems)
      this.calculateTotal()
    }
  },

  // 增加商品数量
  increaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const cartItems = this.data.cartItems
    cartItems[index].quantity++
    this.setData({ cartItems })
    // 保存到本地存储
    wx.setStorageSync('cartItems', cartItems)
    this.calculateTotal()
  },

  // 删除商品
  deleteItem(e) {
    const index = e.currentTarget.dataset.index
    const cartItems = this.data.cartItems
    const deletedItem = cartItems[index]
    
    cartItems.splice(index, 1)
    this.setData({ cartItems })
    // 保存到本地存储
    wx.setStorageSync('cartItems', cartItems)
    this.calculateTotal()
    this.checkAllChecked()
    
    // 显示删除成功提示
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    })
  },

  // 显示清空购物车确认
  showEmptyConfirm() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空购物车吗？',
      success: res => {
        if (res.confirm) {
          this.emptyCart()
        }
      }
    })
  },

  // 清空购物车
  emptyCart() {
    this.setData({
      cartItems: [],
      totalPrice: 0,
      selectedCount: 0,
      allChecked: false
    })
    // 清空本地存储
    wx.setStorageSync('cartItems', [])
    
    // 显示清空成功提示
    wx.showToast({
      title: '购物车已清空',
      icon: 'success'
    })
  },

  // 计算总价和选中数量
  calculateTotal() {
    const cartItems = this.data.cartItems
    let totalPrice = 0
    let selectedCount = 0
    
    cartItems.forEach(item => {
      if (item.checked) {
        // 确保price是数字类型，避免出现异常字符
        const priceStr = String(item.price).replace(/[^\d.]/g, '');
        const itemPrice = parseFloat(priceStr) || 0
        totalPrice += itemPrice * item.quantity
        selectedCount += item.quantity
      }
    })
    
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      selectedCount
    })
  },

  // 跳转到商城页面
  navigateToMall() {
    wx.switchTab({
      url: '/pages/mall/list/list'
    })
  },

  // 结算
  checkout() {
    // 获取选中的商品
    const selectedItems = this.data.cartItems.filter(item => item.checked)
    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }
    
    // 使用新的登录验证工具检查登录状态
    auth.loginInterceptor(
      () => {
        // 登录成功，跳转到结算页面
        const itemsStr = JSON.stringify(selectedItems);
        wx.navigateTo({
          url: `/pages/order/create/create?items=${encodeURIComponent(itemsStr)}`
        })
      },
      () => {
        // 登录失败，不做额外处理
      }
    );
  },

  // 上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})