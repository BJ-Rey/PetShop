// pages/merchant/finance/finance.js
const app = getApp()
const orderApi = require('../../../api/orderApi');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 财务概览数据
    todayIncome: 0,
    todayIncomeChange: 0,
    monthIncome: 0,
    monthIncomeChange: 0,
    totalIncome: 0,
    totalIncomeChange: 0,
    pendingSettlement: 0,
    
    // 数据可视化相关
    timeDimension: 'day', // 时间维度：day, week, month, quarter, year
    yearOnYearGrowth: 0, // 同比增长率
    monthOnMonthGrowth: 0, // 环比增长率
    
    // 销量数据
    salesData: [], // 销量趋势数据
    businessLines: [], // 业务线数据
    
    // 异常数据预警
    hasAlerts: true,
    alerts: [],
    
    // 自定义查询
    startDate: '',
    endDate: '',
    businessLineOptions: [[]],
    businessLineIndex: [0],
    selectedBusinessLines: [],
    
    // 交易记录
    transactions: [],
    
    // 结算记录
    settlements: [],
    
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
    
    // 初始化日期
    this.initDates()
    
    // 加载财务数据
    this.loadFinanceData()
    
    // 加载销量数据
    this.loadSalesData()
    
    // 加载业务线数据
    this.loadBusinessLineData()
    
    // 加载异常数据
    this.loadAlerts()
    
    // 初始化业务线选项
    this.initBusinessLineOptions()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重新加载财务数据
    this.loadFinanceData()
    
    // 重新加载销量数据
    this.loadSalesData()
    
    // 重新加载业务线数据
    this.loadBusinessLineData()
    
    // 重新加载异常数据
    this.loadAlerts()
  },
  
  /**
   * 初始化日期
   */
  initDates() {
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0]
    
    this.setData({
      startDate: startDate,
      endDate: endDate
    })
  },
  
  /**
   * 初始化业务线选项
   */
  initBusinessLineOptions() {
    const businessLines = ['宠物食品', '宠物玩具', '宠物用品', '宠物医疗', '宠物美容', '宠物寄养', '宠物训练', '宠物婚配']
    this.setData({
      businessLineOptions: [businessLines]
    })
  },

  /**
   * 加载财务数据
   */
  loadFinanceData() {
    this.setData({ isLoading: true })
    
    // 保存this上下文
    const that = this;
    
    // 调用真实API获取订单数据来计算财务数据
    orderApi.getMerchantOrderList().then(res => {
        const orders = res || [];
        
        // 计算收入
        let todayIncome = 0;
        let monthIncome = 0;
        let totalIncome = 0;
        let pendingSettlement = 0;
        
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const thisMonthStr = todayStr.substring(0, 7); // YYYY-MM

        const transactions = [];

        orders.forEach(order => {
            const amount = parseFloat(order.totalAmount || 0);
            const createTime = order.createdAt ? new Date(order.createdAt) : new Date();
            const dateStr = createTime.toISOString().split('T')[0];
            const monthStr = dateStr.substring(0, 7);

            // 只统计已支付/已完成/已发货的订单作为收入 (pending/cancelled exclude)
            if (['paid', 'shipped', 'completed'].includes(order.status)) {
                totalIncome += amount;
                if (dateStr === todayStr) {
                    todayIncome += amount;
                }
                if (monthStr === thisMonthStr) {
                    monthIncome += amount;
                }
                
                // Add to transactions list (limit to recent 5)
                if (transactions.length < 5) {
                    transactions.push({
                        id: order.id,
                        type: 'income',
                        description: `订单${order.orderNo}`,
                        amount: amount,
                        createdAt: order.createdAt,
                        status: 'completed'
                    });
                }
            }
            
            // 待结算: 假设 shipped 但未 completed
            if (order.status === 'shipped') {
                pendingSettlement += amount;
            }
        });

        that.setData({
            todayIncome: todayIncome.toFixed(2),
            todayIncomeChange: 0, // 暂无历史对比
            monthIncome: monthIncome.toFixed(2),
            monthIncomeChange: 0,
            totalIncome: totalIncome.toFixed(2),
            totalIncomeChange: 0,
            pendingSettlement: pendingSettlement.toFixed(2),
            transactions: transactions,
            settlements: [], // 暂无结算API
            isLoading: false
        });

    }).catch(err => {
        console.error('Load finance data failed', err);
        that.setData({ isLoading: false });
        // Fallback to mock if API fails? No, keep it real or empty.
    });
  },
  
  /**
   * 加载销量数据
   */
  loadSalesData() {
    // 模拟销量数据，实际应该调用API获取
    const salesData = []
    const now = new Date()
    
    // 根据时间维度生成不同的数据
    let days = 30
    if (this.data.timeDimension === 'day') {
      days = 30
    } else if (this.data.timeDimension === 'week') {
      days = 90
    } else if (this.data.timeDimension === 'month') {
      days = 365
    } else if (this.data.timeDimension === 'quarter') {
      days = 730
    } else if (this.data.timeDimension === 'year') {
      days = 1825
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // 生成随机销量数据
      const sales = Math.floor(Math.random() * 500) + 100
      salesData.push({
        date: date.toISOString().split('T')[0],
        sales: sales
      })
    }
    
    // 计算同比和环比增长率
    const yearOnYearGrowth = (Math.random() * 20 - 5).toFixed(1)
    const monthOnMonthGrowth = (Math.random() * 15 - 3).toFixed(1)
    
    this.setData({
      salesData: salesData,
      yearOnYearGrowth: parseFloat(yearOnYearGrowth),
      monthOnMonthGrowth: parseFloat(monthOnMonthGrowth)
    })
    
    // 绘制销量趋势图
    this.drawSalesTrendChart()
  },
  
  /**
   * 加载业务线数据
   */
  loadBusinessLineData() {
    // 模拟业务线数据，实际应该调用API获取
    const businessLines = [
      { id: 1, name: '宠物食品', sales: 125000, percentage: 42.1, color: '#52c41a' },
      { id: 2, name: '宠物玩具', sales: 68000, percentage: 22.8, color: '#1890ff' },
      { id: 3, name: '宠物用品', sales: 52000, percentage: 17.5, color: '#faad14' },
      { id: 4, name: '宠物医疗', sales: 38000, percentage: 12.8, color: '#f5222d' },
      { id: 5, name: '其他服务', sales: 14000, percentage: 4.8, color: '#722ed1' }
    ]
    
    this.setData({
      businessLines: businessLines
    })
    
    // 绘制业务线占比图
    this.drawBusinessLineChart()
  },
  
  /**
   * 加载异常数据
   */
  loadAlerts() {
    // 模拟异常数据，实际应该调用API获取
    const alerts = [
      {
        id: 1,
        title: '宠物食品销量异常下降',
        description: '宠物食品销量相比昨日下降了35%，请及时关注',
        level: 'high',
        time: '2025-12-19T09:30:00Z'
      },
      {
        id: 2,
        title: '宠物医疗收入异常增长',
        description: '宠物医疗收入相比上周增长了58%，请核实数据',
        level: 'medium',
        time: '2025-12-18T16:45:00Z'
      },
      {
        id: 3,
        title: '宠物玩具库存不足',
        description: '宠物玩具库存不足，请及时补充',
        level: 'low',
        time: '2025-12-17T14:20:00Z'
      }
    ]
    
    this.setData({
      alerts: alerts,
      hasAlerts: alerts.length > 0
    })
  },
  
  /**
   * 绘制销量趋势图
   */
  drawSalesTrendChart() {
    const ctx = wx.createCanvasContext('salesTrendChart')
    const { salesData } = this.data
    
    // 设置画布尺寸
    const canvasWidth = 375 * 2 // 适配不同设备
    const canvasHeight = 400 * 2
    const padding = 40
    const chartWidth = canvasWidth - 2 * padding
    const chartHeight = canvasHeight - 2 * padding
    
    // 计算最大值和最小值
    const salesValues = salesData.map(item => item.sales)
    const maxSales = Math.max(...salesValues)
    const minSales = Math.min(...salesValues)
    const salesRange = maxSales - minSales || 1
    
    // 绘制背景
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // 绘制坐标轴
    ctx.strokeStyle = '#e8e8e8'
    ctx.lineWidth = 2
    
    // X轴
    ctx.beginPath()
    ctx.moveTo(padding, canvasHeight - padding)
    ctx.lineTo(canvasWidth - padding, canvasHeight - padding)
    ctx.stroke()
    
    // Y轴
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvasHeight - padding)
    ctx.stroke()
    
    // 绘制网格线
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    
    // 水平网格线
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvasWidth - padding, y)
      ctx.stroke()
    }
    
    // 绘制折线
    ctx.strokeStyle = '#1890ff'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    salesData.forEach((item, index) => {
      const x = padding + (chartWidth / (salesData.length - 1)) * index
      const y = padding + chartHeight - ((item.sales - minSales) / salesRange) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      // 绘制数据点
      ctx.fillStyle = '#1890ff'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fill()
    })
    
    ctx.stroke()
    
    // 绘制填充区域
    ctx.fillStyle = 'rgba(24, 144, 255, 0.1)'
    ctx.beginPath()
    ctx.moveTo(padding, canvasHeight - padding)
    
    salesData.forEach((item, index) => {
      const x = padding + (chartWidth / (salesData.length - 1)) * index
      const y = padding + chartHeight - ((item.sales - minSales) / salesRange) * chartHeight
      ctx.lineTo(x, y)
    })
    
    ctx.lineTo(canvasWidth - padding, canvasHeight - padding)
    ctx.closePath()
    ctx.fill()
    
    ctx.draw()
  },
  
  /**
   * 绘制业务线占比图
   */
  drawBusinessLineChart() {
    const ctx = wx.createCanvasContext('businessLineChart')
    const { businessLines } = this.data
    
    // 设置画布尺寸
    const canvasWidth = 375 * 2
    const canvasHeight = 300 * 2
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radius = Math.min(centerX, centerY) - 40
    
    // 绘制背景
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // 计算总销售额
    const totalSales = businessLines.reduce((sum, line) => sum + line.sales, 0)
    
    // 绘制饼图
    let startAngle = -Math.PI / 2
    businessLines.forEach((line, index) => {
      const angle = (line.sales / totalSales) * 2 * Math.PI
      const endAngle = startAngle + angle
      
      // 绘制扇形
      ctx.fillStyle = line.color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()
      
      // 更新起始角度
      startAngle = endAngle
    })
    
    ctx.draw()
  },
  
  /**
   * 切换时间维度
   */
  changeTimeDimension(e) {
    const dimension = e.currentTarget.dataset.dimension
    this.setData({
      timeDimension: dimension
    })
    
    // 重新加载销量数据
    this.loadSalesData()
  },
  
  /**
   * 导出数据
   */
  exportData() {
    wx.showActionSheet({
      itemList: ['导出Excel', '导出PDF'],
      success: (res) => {
        const index = res.tapIndex
        if (index === 0) {
          // 导出Excel
          this.exportExcel()
        } else if (index === 1) {
          // 导出PDF
          this.exportPDF()
        }
      }
    })
  },
  
  /**
   * 导出Excel
   */
  exportExcel() {
    wx.showLoading({
      title: '导出中...'
    })
    
    // 模拟导出过程，实际应该调用API
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: 'Excel导出成功',
        icon: 'success'
      })
    }, 1500)
  },
  
  /**
   * 导出PDF
   */
  exportPDF() {
    wx.showLoading({
      title: '导出中...'
    })
    
    // 模拟导出过程，实际应该调用API
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: 'PDF导出成功',
        icon: 'success'
      })
    }, 1500)
  },
  
  /**
   * 刷新数据
   */
  refreshData() {
    wx.showLoading({
      title: '刷新中...'
    })
    
    // 重新加载所有数据
    this.loadSalesData()
    this.loadBusinessLineData()
    this.loadAlerts()
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '数据已刷新',
        icon: 'success'
      })
    }, 1000)
  },
  
  /**
   * 图表触摸事件开始
   */
  onChartTouchStart(e) {
    // 可以在这里实现图表交互，比如显示数据详情
  },
  
  /**
   * 图表触摸事件移动
   */
  onChartTouchMove(e) {
    // 可以在这里实现图表交互，比如跟随手指显示数据详情
  },
  
  /**
   * 图表触摸事件结束
   */
  onChartTouchEnd(e) {
    // 可以在这里实现图表交互，比如隐藏数据详情
  },
  
  /**
   * 开始日期变化
   */
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  
  /**
   * 结束日期变化
   */
  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    })
  },
  
  /**
   * 业务线选择变化
   */
  onBusinessLineChange(e) {
    const index = e.detail.value[0]
    const businessLines = this.data.businessLineOptions[0]
    const selectedBusinessLines = index === 0 ? [] : [businessLines[index]]
    
    this.setData({
      businessLineIndex: [index],
      selectedBusinessLines: selectedBusinessLines
    })
  },
  
  /**
   * 执行自定义查询
   */
  executeQuery() {
    const { startDate, endDate, selectedBusinessLines } = this.data
    
    wx.showLoading({
      title: '查询中...'
    })
    
    // 模拟查询过程，实际应该调用API
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '查询完成',
        icon: 'success'
      })
      
      // 重新加载数据
      this.loadSalesData()
      this.loadBusinessLineData()
    }, 1500)
  },

  /**
   * 查看全部交易记录
   */
  viewAllTransactions() {
    wx.navigateTo({
      url: '/pages/merchant/finance/transaction-list/transaction-list'
    })
  },

  /**
   * 查看全部结算记录
   */
  viewAllSettlements() {
    wx.navigateTo({
      url: '/pages/merchant/finance/settlement-list/settlement-list'
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
  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  onPullDownRefresh() {
    // 重新加载财务数据
    this.loadFinanceData()
    // 停止下拉刷新
    wx.stopPullDownRefresh()
  }
})
