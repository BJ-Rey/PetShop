// pages/merchant/setting/log/log.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 筛选条件
    filter: {
      type: 'all',
      module: 'all',
      keyword: ''
    },
    
    // 筛选面板显示状态
    showFilterPanel: false,
    
    // 日志列表
    logs: [],
    
    // 加载状态
    isLoading: false
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
    if (!app.checkPermission('manage_setting')) {
      wx.showToast({
        title: '您没有权限访问此页面',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    // 加载操作日志
    this.loadLogs()
  },

  /**
   * 加载操作日志
   */
  loadLogs() {
    this.setData({ isLoading: true })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      // 模拟日志数据
      const logs = [
        {
          id: 1,
          operator: 'admin',
          type: 'login',
          module: 'system',
          description: '管理员admin登录系统',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T10:30:00Z',
          extra: '登录设备：微信开发者工具'
        },
        {
          id: 2,
          operator: 'admin',
          type: 'add',
          module: 'product',
          description: '添加商品：宠物食品大礼包',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T10:25:00Z'
        },
        {
          id: 3,
          operator: 'admin',
          type: 'edit',
          module: 'service',
          description: '编辑服务：宠物美容',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T10:20:00Z'
        },
        {
          id: 4,
          operator: 'admin',
          type: 'publish',
          module: 'product',
          description: '上架商品：宠物玩具球',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T10:15:00Z'
        },
        {
          id: 5,
          operator: 'admin',
          type: 'delete',
          module: 'product',
          description: '删除商品：过期宠物零食',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T10:10:00Z'
        },
        {
          id: 6,
          operator: 'admin',
          type: 'edit',
          module: 'setting',
          description: '更新通知设置',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T10:05:00Z'
        },
        {
          id: 7,
          operator: 'admin',
          type: 'add',
          module: 'service',
          description: '添加服务：宠物寄养',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T10:00:00Z'
        },
        {
          id: 8,
          operator: 'admin',
          type: 'login',
          module: 'system',
          description: '管理员admin退出系统',
          ip: '192.168.1.1',
          createdAt: '2025-12-19T09:55:00Z'
        }
      ]
      
      this.setData({
        logs: logs,
        isLoading: false
      })
    }, 1000)
  },

  /**
   * 搜索日志
   */
  onSearch(e) {
    const keyword = e.detail.value
    this.setData({
      'filter.keyword': keyword
    })
    // 这里可以添加防抖处理，避免频繁搜索
    this.loadLogs()
  },

  /**
   * 切换筛选面板显示状态
   */
  toggleFilterPanel() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    })
  },

  /**
   * 改变筛选条件
   */
  changeFilter(e) {
    const type = e.currentTarget.dataset.type
    const value = e.currentTarget.dataset.value
    
    this.setData({
      [`filter.${type}`]: value
    })
  },

  /**
   * 重置筛选条件
   */
  resetFilter() {
    this.setData({
      filter: {
        type: 'all',
        module: 'all',
        keyword: ''
      }
    })
  },

  /**
   * 应用筛选条件
   */
  applyFilter() {
    this.setData({
      showFilterPanel: false
    })
    // 加载筛选后的日志
    this.loadLogs()
  },

  /**
   * 获取操作类型文本
   */
  getTypeText(type) {
    const typeMap = {
      'add': '添加',
      'edit': '编辑',
      'delete': '删除',
      'publish': '上架/下架',
      'login': '登录/退出',
      'other': '其他'
    }
    return typeMap[type] || type
  },

  /**
   * 获取模块文本
   */
  getModuleText(module) {
    const moduleMap = {
      'product': '商品管理',
      'service': '服务管理',
      'order': '订单管理',
      'finance': '财务管理',
      'setting': '系统设置',
      'system': '系统',
      'other': '其他'
    }
    return moduleMap[module] || module
  },

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 重新加载操作日志
    this.loadLogs()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  }
})