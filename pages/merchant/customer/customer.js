// pages/merchant/customer/customer.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    customers: [],
    isLoading: false,
    keyword: '',
    filteredCustomers: []
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
    
    // 加载客户数据
    this.loadCustomers()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重新加载客户数据
    this.loadCustomers()
  },

  /**
   * 加载客户数据
   */
  loadCustomers() {
    this.setData({ isLoading: true })
    
    // 模拟数据，实际应该调用API获取客户数据
    setTimeout(() => {
      const customers = [
        {
          id: 1,
          name: '张三',
          phone: '13800138001',
          email: 'zhangsan@example.com',
          avatar: 'https://example.com/avatar1.jpg',
          type: 'vip',
          orderCount: 12,
          totalSpent: 2890,
          lastOrderDate: '2025-12-18',
          createdAt: '2025-10-01T10:00:00Z',
          updatedAt: '2025-12-18T15:30:00Z'
        },
        {
          id: 2,
          name: '李四',
          phone: '13800138002',
          email: 'lisi@example.com',
          avatar: 'https://example.com/avatar2.jpg',
          type: 'regular',
          orderCount: 5,
          totalSpent: 1230,
          lastOrderDate: '2025-12-15',
          createdAt: '2025-10-15T14:20:00Z',
          updatedAt: '2025-12-15T09:10:00Z'
        },
        {
          id: 3,
          name: '王五',
          phone: '13800138003',
          email: '',
          avatar: '',
          type: 'regular',
          orderCount: 3,
          totalSpent: 890,
          lastOrderDate: '2025-12-10',
          createdAt: '2025-11-05T16:45:00Z',
          updatedAt: '2025-12-10T11:20:00Z'
        },
        {
          id: 4,
          name: '赵六',
          phone: '13800138004',
          email: 'zhaoliu@example.com',
          avatar: 'https://example.com/avatar4.jpg',
          type: 'vip',
          orderCount: 18,
          totalSpent: 4560,
          lastOrderDate: '2025-12-19',
          createdAt: '2025-09-20T09:30:00Z',
          updatedAt: '2025-12-19T10:15:00Z'
        },
        {
          id: 5,
          name: '孙七',
          phone: '13800138005',
          email: 'sunqi@example.com',
          avatar: 'https://example.com/avatar5.jpg',
          type: 'regular',
          orderCount: 7,
          totalSpent: 1670,
          lastOrderDate: '2025-12-12',
          createdAt: '2025-11-12T11:50:00Z',
          updatedAt: '2025-12-12T16:25:00Z'
        }
      ]
      
      this.setData({
        customers: customers,
        isLoading: false
      })
      
      // 应用筛选
      this.filterCustomers()
    }, 1000)
  },

  /**
   * 搜索客户
   */
  onSearch(e) {
    const keyword = e.detail.value
    this.setData({
      keyword: keyword
    })
    // 应用筛选
    this.filterCustomers()
  },

  /**
   * 筛选客户
   */
  filterCustomers() {
    const { customers, keyword } = this.data
    
    let filteredCustomers = customers
    
    // 按关键词筛选
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.name.toLowerCase().includes(lowerKeyword) ||
        customer.phone.includes(keyword)
      )
    }
    
    this.setData({
      filteredCustomers: filteredCustomers
    })
  },

  /**
   * 查看客户详情
   */
  viewCustomerDetail(e) {
    const customerId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/customer/detail/detail?id=${customerId}`
    })
  },

  /**
   * 编辑客户信息
   */
  editCustomer(e) {
    const customerId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/customer/edit/edit?id=${customerId}`
    })
  },

  /**
   * 发送消息给客户
   */
  sendMessage(e) {
    const customerId = e.currentTarget.dataset.id
    wx.showToast({
      title: '发送消息功能开发中',
      icon: 'none'
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
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 重新加载客户数据
    this.loadCustomers()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  }
})
