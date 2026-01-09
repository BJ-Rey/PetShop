Component({
  data: {
    cartCount: 0,
    canAdd: true // 冷却状态
  },

  pageLifetimes: {
    show() {
      // 页面显示时更新购物车数量
      this.updateCartCount()
    }
  },

  lifetimes: {
    attached() {
      // 初始化时获取购物车数量
      this.updateCartCount()
      this.app = getApp()
    },
    detached() {
      // 组件移除时不需要特殊处理
    }
  },

  methods: {
    // 暴露给外部调用的添加动画方法
    addToCart(item) {
        if (!this.data.canAdd) {
            wx.showToast({ title: '操作太快了', icon: 'none' });
            return false;
        }

        // 1秒冷却
        this.setData({ canAdd: false });
        setTimeout(() => {
            this.setData({ canAdd: true });
        }, 1000);

        // 这里仅做数量更新和动画触发，实际添加逻辑在页面
        // 假设页面已经添加了 storage，这里刷新
        this.updateCartCount();
        
        // 触发动画反馈（简单震动）
        wx.vibrateShort();
        wx.showToast({ title: '已加入购物车', icon: 'success' });
        
        return true;
    },

    // 更新购物车数量
    updateCartCount() {
      try {
        const cartItems = wx.getStorageSync('cartItems') || []
        const count = cartItems.reduce((total, item) => total + item.quantity, 0)
        this.setData({
          cartCount: count
        })
        // 更新全局数据
        const app = getApp();
        if (app && app.globalData) {
            app.globalData.cartItemCount = count
            app.globalData.cartItems = cartItems
        }
      } catch (error) {
        console.error('Failed to update cart count:', error)
      }
    },

    // 跳转到购物车页面
    navigateToCart() {
      wx.navigateTo({
        url: '/pages/cart/cart'
      })
    }
  }
})