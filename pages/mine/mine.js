// pages/mine/mine.js
const auth = require('../../utils/auth');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true, // 添加加载状态
    userInfo: null,
    isLoggedIn: false,
    orderStats: [
      { status: 'pendingPayment', name: '待付款', count: 0, icon: '💳' },
      { status: 'pendingShipment', name: '待发货', count: 0, icon: '📦' },
      { status: 'pendingReceipt', name: '待收货', count: 0, icon: '🚚' },
      { status: 'completed', name: '已完成', count: 0, icon: '✅' }
    ],
    menuItems: [
      { id: 1, name: '我的宠物', icon: '🐱', url: '/pages/pet/list/list?tab=my' },
      { id: 3, name: '收货地址', icon: '📍', url: '/pages/mine/address/address' },
      { id: 5, name: '联系客服', icon: '🎧', url: 'contact' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时的逻辑
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时检查登录状态并刷新数据
    this.checkLoginStatus();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    // 重新加载所有数据
    this.checkLoginStatus().then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'none'
      });
    }).catch(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
    });
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    this.setData({ loading: true });
    return new Promise((resolve) => {
      const isLoggedIn = auth.isLoggedIn();
      this.setData({ isLoggedIn });
      
      if (isLoggedIn) {
        const userInfo = auth.getUserInfo();
        this.setData({ userInfo });
        // 使用 Promise.all 确保所有数据加载完成
        Promise.all([
          this.loadOrderStats(),
          // this.loadUserBalance()
        ]).then(() => {
          this.setData({ loading: false });
          resolve();
        });
      } else {
        this.setData({
          userInfo: null,
          loading: false,
          orderStats: [
            { status: 'pendingPayment', name: '待付款', count: 0, icon: '💳' },
            { status: 'pendingShipment', name: '待发货', count: 0, icon: '📦' },
            { status: 'pendingReceipt', name: '待收货', count: 0, icon: '🚚' },
            { status: 'completed', name: '已完成', count: 0, icon: '✅' }
          ]
        });
        resolve();
      }
    });
  },

  /**
   * 加载订单统计数据
   */
  loadOrderStats() {
    return new Promise((resolve) => {
      // 模拟从服务器获取订单统计数据
      setTimeout(() => {
        this.setData({
          orderStats: [
            { status: 'pendingPayment', name: '待付款', count: 2, icon: '💳' },
            { status: 'pendingShipment', name: '待发货', count: 1, icon: '📦' },
            { status: 'pendingReceipt', name: '待收货', count: 1, icon: '🚚' },
            { status: 'completed', name: '已完成', count: 5, icon: '✅' }
          ]
        });
        resolve();
      }, 300);
    });
  },

  /**
   * 加载用户余额 (已移除)
   */
  /* loadUserBalance() {
    return new Promise((resolve) => {
      // 模拟刷新余额
      setTimeout(() => {
        const currentInfo = this.data.userInfo;
        if (currentInfo) {
          const updatedInfo = auth.getUserInfo();
          this.setData({ userInfo: updatedInfo });
        }
        resolve();
      }, 300);
    });
  }, */

  /**
   * 导航到菜单功能
   */
  navigateToMenu(e) {
    const url = e.currentTarget.dataset.url;
    
    if (url === 'contact') {
      if (!auth.checkPermission(() => {
        wx.navigateTo({
          url: '/pages/service/contact/contact'
        });
      })) return;

      wx.navigateTo({
        url: '/pages/service/contact/contact'
      });
      return;
    }

    if (!auth.checkPermission(() => {
        // 重新构建事件对象或直接调用逻辑
        if (url) {
            wx.navigateTo({
                url: url,
                fail: (err) => {
                    console.error('Navigation failed:', err);
                    wx.showToast({
                        title: '功能开发中',
                        icon: 'none'
                    });
                }
            });
        }
    })) return;
    
    if (url) {
      wx.navigateTo({
        url: url,
        fail: (err) => {
          console.error('Navigation failed:', err);
          wx.showToast({
            title: '功能开发中',
            icon: 'none'
          });
        }
      });
    }
  },

  /**
   * 导航到编辑资料页面
   */
  navigateToEditProfile() {
    if (!auth.checkPermission(() => {
        this.navigateToEditProfile();
    })) return;

    wx.navigateTo({
      url: '/pages/mine/edit-profile/edit-profile'
    });
  },

  /**
   * 导航到订单列表页面
   */
  navigateToOrders(e) {
    const status = e ? (e.currentTarget.dataset.status || 'all') : 'all';
    
    if (!auth.checkPermission(() => {
        wx.navigateTo({
            url: `/pages/mine/orders/orders?status=${status}`
        });
    })) return;

    wx.navigateTo({
      url: `/pages/mine/orders/orders?status=${status}`
    });
  },

  navigateToAllOrders() {
      this.navigateToOrders({ currentTarget: { dataset: { status: 'all' } } });
  },
  
  navigateToOrderList(e) {
      this.navigateToOrders(e);
  },

  /**
   * 导航到我的宠物页面
   */
  navigateToMyPets() {
    if (!auth.checkPermission(() => {
        this.navigateToMyPets();
    })) return;

    wx.navigateTo({
      url: '/pages/pet/list/list?tab=my'
    });
  },

  /**
   * 导航到收货地址页面
   */
  navigateToAddress() {
    if (!auth.checkPermission(() => {
        this.navigateToAddress();
    })) return;

    wx.navigateTo({
      url: '/pages/mine/address/address'
    });
  },

  /**
   * 导航到登录页面
   */
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            orderStats: {
              pendingPayment: 0,
              pendingShipment: 0,
              pendingReceipt: 0,
              completed: 0
            }
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'none'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login'
            });
          }, 1000);
        }
      }
    });
  },

  /**
   * 充值
   */
  recharge() {
    auth.checkPermission(() => {
        wx.showToast({
          title: '充值功能开发中',
          icon: 'none'
        });
    });
  },

  /**
   * 测试云托管服务 (Template)
   * 这是一个调用云托管接口的标准模板
   */
  testCloudService() {
    wx.showLoading({ title: '请求中...' });
    
    // 基础模板代码
    wx.cloud.callContainer({
      "config": {
        "env": "prod-2g8xmr3r62fda42b"
      },
      "path": "/api/count",
      "header": {
        "X-WX-SERVICE": "springboot-o551"
      },
      "method": "POST",
      "data": {
        "action": "inc"
      },
      success: (res) => {
        console.log('Cloud call success:', res);
        wx.hideLoading();
        if (res.statusCode === 200) {
            wx.showModal({
                title: '调用成功',
                content: '返回数据: ' + JSON.stringify(res.data),
                showCancel: false
            });
        } else {
            wx.showToast({ title: '调用失败: ' + res.statusCode, icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('Cloud call failed:', err);
        wx.hideLoading();
        wx.showToast({ title: '调用出错', icon: 'none' });
      }
    })
  }
});
