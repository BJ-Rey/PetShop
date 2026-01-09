// pages/merchant/index/index.js
const auth = require('../../../utils/auth');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    merchantInfo: null,
    // 统计数据
    stats: {
      pets: 15,
      products: 32,
      orders: 28,
      customers: 125
    },
    // 功能菜单
    menuItems: [
      { id: 'pet-manage', name: '宠物管理', icon: '🐶', url: '/pages/merchant/pet/manage/manage', badge: 3 },
      { id: 'product-manage', name: '商品管理', icon: '🛍️', url: '/pages/merchant/product/manage/manage', badge: 0 },
      { id: 'order-manage', name: '订单管理', icon: '📋', url: '/pages/merchant/order/order', badge: 5 },
      { id: 'customer-manage', name: '客户管理', icon: '👥', url: '/pages/merchant/customer/customer', badge: 0 },
      { id: 'financial-manage', name: '财务管理', icon: '💰', url: '/pages/merchant/finance/finance', badge: 0 },
      { id: 'setting', name: '系统设置', icon: '⚙️', url: '/pages/merchant/setting/setting', badge: 0 }
    ],
    // 最近订单
    recentOrders: [
      { id: '1001', customerName: '张三', productName: '宠物食品', amount: 128,
        status: 'pending', date: '2025-01-15' },
      { id: '1002', customerName: '李四', productName: '宠物玩具', amount: 68,
        status: 'shipped', date: '2025-01-14' },
      { id: '1003', customerName: '王五', productName: '宠物用品', amount: 98,
        status: 'completed', date: '2025-01-13' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 使用权限管理工具检查登录状态和商家角色权限
    const that = this;
    auth.permissionInterceptor('merchant', 
      function(userInfo) {
        // 登录且有权限，加载商家信息
        that.loadMerchantInfo(userInfo);
        that.loadDashboardStats();
      },
      function() {
        // 登录失败或无权限，跳转到首页
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }, 1500);
      }
    );
  },

  /**
   * 加载商家仪表盘数据
   */
  loadDashboardStats() {
    merchantApi.getDashboardStats().then(res => {
        if (res.data) {
            this.setData({
                stats: res.data
            });
        }
    }).catch(err => {
        console.error('加载仪表盘数据失败', err);
        // 失败时保持默认值或显示错误
    });
  },

  /**
   * 加载商家信息
   */
  loadMerchantInfo(userInfo) {
    const that = this;
    // 尝试从 API 获取商家信息
    // 假设 userInfo 中包含 merchantId，或者是当前登录用户的关联商家
    const merchantId = userInfo.merchantId || (userInfo.id ? userInfo.id : '1');
    
    merchantApi.getMerchantDetail(merchantId).then(res => {
        if (res.data) {
            that.setData({
                merchantInfo: res.data
            });
        } else {
            that.loadMockMerchantInfo();
        }
    }).catch(err => {
        console.error('获取商家信息失败:', err);
        that.loadMockMerchantInfo();
    });
  },

  loadMockMerchantInfo() {
    // 模拟加载商家信息
    const merchantInfo = {
      id: 'merchant-001',
      name: '宠物家园',
      logo: 'https://example.com/merchant-logo.jpg',
      phone: '18812345678',
      address: '北京市朝阳区宠物大街123号',
      email: 'info@pet-home.com'
    };
    
    this.setData({
      merchantInfo
    });
  },

  /**
   * 跳转到指定页面
   */
  navigateToPage(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url
    });
  },

  /**
   * 跳转到订单详情页
   */
  navigateToOrderDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/merchant/order/detail/detail?id=${id}`
    });
  },

  /**
   * 退出登录
   */
  logout() {
    auth.logout();
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },
  
  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1,
      fail: (error) => {
        console.error('Navigate back error:', error);
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    });
  }
})