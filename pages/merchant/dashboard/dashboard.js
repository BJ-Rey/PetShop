// pages/merchant/dashboard/dashboard.js
const auth = require('../../../utils/auth')
const globalUtils = require('../../../utils/globalUtils')
const { logError, showErrorToast } = globalUtils

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 商家信息
    merchantInfo: null,
    // 功能菜单
    menuItems: [
      {
        id: 'pet-manage',
        name: '宠物管理',
        icon: '🐶',
        url: '/pages/merchant/pet/manage/manage-new',
        description: '管理您的宠物信息，包括添加、编辑和删除宠物'
      },
      { 
        id: 'order-manage', 
        name: '订单管理', 
        icon: '📋', 
        url: '/pages/merchant/order/order',
        description: '查看和处理您的订单，包括待付款、待发货、待收货等状态'
      },
      { 
        id: 'product-manage', 
        name: '商品管理', 
        icon: '🛍️', 
        url: '/pages/merchant/product/manage/manage',
        description: '管理您的商品信息，包括添加、编辑和删除商品'
      },
      { 
        id: 'service-manage', 
        name: '服务管理', 
        icon: '🏥', 
        url: '/pages/merchant/service/manage/manage',
        description: '管理您提供的服务，包括服务项目、价格和预约设置'
      },
      { 
        id: 'financial-manage', 
        name: '财务管理', 
        icon: '💰', 
        url: '/pages/merchant/finance/finance',
        description: '查看您的财务数据，包括收入、支出和订单统计'
      },
      { 
        id: 'setting', 
        name: '商家设置', 
        icon: '⚙️', 
        url: '/pages/merchant/setting/setting',
        description: '设置您的商家信息，包括基本信息、联系方式和店铺设置'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 使用权限管理工具检查登录状态和商家角色权限
    const that = this;
    auth.permissionInterceptor('merchant', 
      function() {
        // 登录且有权限，加载商家信息
        that.loadMerchantInfo();
      },
      function() {
        // 登录失败或无权限，上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    );
  },
  
  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重新加载商家信息
    this.loadMerchantInfo()
  },

  /**
   * 加载商家信息
   */
  loadMerchantInfo() {
    try {
      // 模拟数据，实际应该调用API获取商家信息
      const merchantInfo = {
        name: '宠物乐园',
        phone: '13800138000',
        address: '北京市朝阳区宠物大街123号',
        logo: 'https://example.com/logo.png',
        description: '专业的宠物服务提供商',
        stats: {
          pets: 15,
          orders: 28,
          products: 32,
          services: 8
        }
      }
      
      this.setData({
        merchantInfo: merchantInfo
      })
    } catch (error) {
      console.error('加载商家信息失败:', error);
      logError('LoadMerchantInfo', error);
      showErrorToast('加载商家信息失败，请稍后重试');
    }
  },

  /**
   * 跳转到指定页面
   */
  navigateToPage(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 重新加载商家信息
    this.loadMerchantInfo()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
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