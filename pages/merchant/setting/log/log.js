// pages/merchant/setting/log/log.js
const app = getApp()
const merchantApi = require('../../../../api/merchantApi')

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
   * 从数据库加载操作日志
   */
  async loadLogs() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getOperationLogs({
        type: this.data.filter.type,
        module: this.data.filter.module,
        keyword: this.data.filter.keyword
      })
      console.log('获取操作日志成功:', res)
      
      this.setData({
        logs: res.data || []
      })
    } catch (error) {
      console.error('获取操作日志失败:', error)
      wx.showToast({
        title: '加载日志失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
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