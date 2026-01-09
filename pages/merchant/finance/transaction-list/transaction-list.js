// pages/merchant/finance/transaction-list/transaction-list.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 筛选条件
    filter: {
      type: 'all',
      timeRange: 'all',
      status: 'all',
      keyword: ''
    },
    
    // 筛选面板显示状态
    showFilterPanel: false,
    
    // 排序条件
    sortField: 'createdAt',
    sortOrder: 'desc',
    
    // 交易记录
    transactions: [],
    
    // 统计数据
    stats: {
      totalCount: 0,
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0
    },
    
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
    
    // 加载交易记录
    this.loadTransactions()
  },

  /**
   * 加载交易记录
   */
  loadTransactions() {
    this.setData({ isLoading: true })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      // 模拟交易数据
      const transactions = [
        {
          id: 1,
          type: 'income',
          description: '订单ORD202512190001',
          amount: 334,
          createdAt: '2025-12-19T10:30:00Z',
          status: 'completed',
          orderId: 'ORD202512190001',
          paymentMethod: '微信支付'
        },
        {
          id: 2,
          type: 'income',
          description: '订单ORD202512190002',
          amount: 213,
          createdAt: '2025-12-19T09:15:00Z',
          status: 'completed',
          orderId: 'ORD202512190002',
          paymentMethod: '支付宝'
        },
        {
          id: 3,
          type: 'expense',
          description: '提现到银行卡',
          amount: 5000,
          createdAt: '2025-12-18T16:45:00Z',
          status: 'completed',
          withdrawalId: 'WD202512180001',
          bankName: '招商银行'
        },
        {
          id: 4,
          type: 'income',
          description: '订单ORD202512180005',
          amount: 122,
          createdAt: '2025-12-18T14:20:00Z',
          status: 'completed',
          orderId: 'ORD202512180005',
          paymentMethod: '微信支付'
        },
        {
          id: 5,
          type: 'income',
          description: '订单ORD202512180004',
          amount: 214,
          createdAt: '2025-12-18T11:10:00Z',
          status: 'completed',
          orderId: 'ORD202512180004',
          paymentMethod: '支付宝'
        },
        {
          id: 6,
          type: 'income',
          description: '订单ORD202512170012',
          amount: 456,
          createdAt: '2025-12-17T15:30:00Z',
          status: 'completed',
          orderId: 'ORD202512170012',
          paymentMethod: '微信支付'
        },
        {
          id: 7,
          type: 'expense',
          description: '平台服务费',
          amount: 1200,
          createdAt: '2025-12-17T10:00:00Z',
          status: 'completed',
          feeType: '平台服务费'
        },
        {
          id: 8,
          type: 'income',
          description: '订单ORD202512170008',
          amount: 189,
          createdAt: '2025-12-17T09:20:00Z',
          status: 'processing',
          orderId: 'ORD202512170008',
          paymentMethod: '微信支付'
        }
      ]
      
      // 计算统计数据
      const stats = this.calculateStats(transactions)
      
      this.setData({
        transactions: transactions,
        stats: stats,
        isLoading: false
      })
    }, 1000)
  },

  /**
   * 计算统计数据
   */
  calculateStats(transactions) {
    const stats = {
      totalCount: transactions.length,
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0
    }
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        stats.totalIncome += transaction.amount
      } else {
        stats.totalExpense += transaction.amount
      }
    })
    
    stats.netIncome = stats.totalIncome - stats.totalExpense
    
    // 保留两位小数
    stats.totalIncome = stats.totalIncome.toFixed(2)
    stats.totalExpense = stats.totalExpense.toFixed(2)
    stats.netIncome = stats.netIncome.toFixed(2)
    
    return stats
  },

  /**
   * 搜索交易
   */
  onSearch(e) {
    const keyword = e.detail.value
    this.setData({
      'filter.keyword': keyword
    })
    // 这里可以添加防抖处理，避免频繁搜索
    this.loadTransactions()
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
        timeRange: 'all',
        status: 'all',
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
    // 加载筛选后的交易记录
    this.loadTransactions()
  },

  /**
   * 改变排序方式
   */
  changeSort(e) {
    const field = e.currentTarget.dataset.field
    const currentSortField = this.data.sortField
    const currentSortOrder = this.data.sortOrder
    
    let newSortOrder = 'desc'
    if (field === currentSortField) {
      newSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc'
    }
    
    this.setData({
      sortField: field,
      sortOrder: newSortOrder
    })
    
    // 重新排序交易记录
    this.sortTransactions()
  },

  /**
   * 排序交易记录
   */
  sortTransactions() {
    const { sortField, sortOrder, transactions } = this.data
    
    const sortedTransactions = [...transactions].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      // 处理日期类型
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
    
    this.setData({
      transactions: sortedTransactions
    })
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
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  },

  /**
   * 查看交易详情
   */
  viewTransactionDetail(e) {
    const transactionId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/finance/transaction-detail/transaction-detail?id=${transactionId}`
    })
  },

  /**
   * 导出交易记录
   */
  exportTransactions() {
    wx.showLoading({
      title: '导出中...'
    })
    
    // 模拟导出功能，实际应该调用后端API生成并下载文件
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '导出成功',
        icon: 'success'
      })
    }, 1500)
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
    // 重新加载交易记录
    this.loadTransactions()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  }
})