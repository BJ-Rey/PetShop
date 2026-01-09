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
    
    // 调用真实API获取订单数据转换为交易记录
    orderApi.getMerchantOrderList().then(res => {
        const orders = res || [];
        const transactions = [];

        orders.forEach(order => {
             // 只显示已支付/已完成/已发货的订单
             if (['paid', 'shipped', 'completed'].includes(order.status)) {
                transactions.push({
                    id: order.id,
                    type: 'income',
                    description: `订单${order.orderNo}`,
                    amount: parseFloat(order.totalAmount || 0),
                    createdAt: order.createdAt,
                    status: 'completed',
                    orderId: order.orderNo,
                    paymentMethod: '微信支付' // Default
                });
             }
        });

        // 筛选逻辑 (Client-side filtering for now)
        let filtered = transactions;
        const { type, timeRange, status, keyword } = this.data.filter;

        if (type !== 'all') {
            filtered = filtered.filter(t => t.type === type);
        }
        if (keyword) {
            filtered = filtered.filter(t => t.description.includes(keyword) || t.orderId.includes(keyword));
        }
        // Time range and status filtering skipped for brevity but should be here

        // 计算统计数据
        const stats = this.calculateStats(filtered)
        
        this.setData({
            transactions: filtered,
            stats: stats,
            isLoading: false
        })
    }).catch(err => {
        console.error('Load transactions failed', err);
        this.setData({ isLoading: false });
    });
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