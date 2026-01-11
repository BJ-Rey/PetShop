// pages/merchant/setting/promotion/promotion.js
const app = getApp()
const globalUtils = require('../../../../utils/globalUtils')
const merchantApi = require('../../../../api/merchantApi')
const { preventReclick } = globalUtils

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'active', // active, scheduled, ended
    promotions: [],
    filteredPromotions: [],
    isLoading: true,
    
    // 表单状态
    showForm: false,
    formTitle: '创建活动',
    editingId: null,
    
    // 表单数据
    formData: {
      title: '',
      type: 'discount', // discount, amount
      value: '', // 8.5 or 20
      startTime: '',
      endTime: '',
      minSpend: '', // 满多少可用
      description: ''
    },
    
    // 类型选项
    typeOptions: [
      { value: 'discount', name: '折扣券' },
      { value: 'amount', name: '满减券' }
    ]
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
    
    // 设置默认时间
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 7)
    
    this.setData({
      'formData.startTime': this.formatDate(now),
      'formData.endTime': this.formatDate(tomorrow)
    })
    
    this.loadPromotions()
  },

  /**
   * 格式化日期 YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  /**
   * 从数据库加载活动数据
   */
  async loadPromotions() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getPromotionSetting()
      console.log('获取促销活动成功:', res)
      
      if (res && res.data) {
        this.processPromotions(res.data)
      } else {
        this.setData({ promotions: [], filteredPromotions: [] })
      }
    } catch (error) {
      console.error('获取促销活动失败:', error)
      wx.showToast({
        title: '加载活动失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 处理活动状态和筛选
   */
  processPromotions(promotions) {
    const now = new Date().toISOString().split('T')[0]
    
    // 更新状态
    const processed = promotions.map(p => {
      let status = 'active'
      if (p.endTime < now) {
        status = 'ended'
      } else if (p.startTime > now) {
        status = 'scheduled'
      } else {
        status = 'active' // 强制手动结束的逻辑暂不处理，简单通过时间判断
      }
      // 如果手动标记为结束
      if (p.manualEnded) status = 'ended'
      
      return { ...p, status }
    })
    
    this.setData({
      promotions: processed
    })
    
    this.filterPromotions()
  },

  /**
   * 筛选活动
   */
  filterPromotions() {
    const { promotions, activeTab } = this.data
    const filtered = promotions.filter(p => p.status === activeTab)
    this.setData({
      filteredPromotions: filtered
    })
  },

  /**
   * 切换标签
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.filterPromotions()
  },

  /**
   * 显示添加表单
   */
  showAddForm() {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 7)
    
    this.setData({
      showForm: true,
      formTitle: '创建活动',
      editingId: null,
      formData: {
        title: '',
        type: 'discount',
        value: '',
        startTime: this.formatDate(now),
        endTime: this.formatDate(tomorrow),
        minSpend: '',
        description: ''
      }
    })
  },

  /**
   * 显示编辑表单
   */
  showEditForm(e) {
    const id = e.currentTarget.dataset.id
    const promotion = this.data.promotions.find(p => p.id === id)
    
    if (promotion) {
      this.setData({
        showForm: true,
        formTitle: '编辑活动',
        editingId: id,
        formData: { ...promotion }
      })
    }
  },

  /**
   * 隐藏表单
   */
  hideForm() {
    this.setData({ showForm: false })
  },

  /**
   * 表单输入
   */
  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  /**
   * 日期选择
   */
  onDateChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { title, value, startTime, endTime } = this.data.formData
    if (!title) return '请输入活动名称'
    if (!value) return '请输入优惠力度'
    if (!startTime) return '请选择开始时间'
    if (!endTime) return '请选择结束时间'
    if (startTime > endTime) return '开始时间不能晚于结束时间'
    return null
  },

  /**
   * 保存活动 - 调用数据库API
   */
  savePromotion: async function() {
    // 防止重复点击逻辑封装
    if (this.isSaving) return
    this.isSaving = true
    
    const error = this.validateForm()
    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      this.isSaving = false
      return
    }
    
    wx.showLoading({ title: '保存中...' })
    
    try {
      const { formData, editingId, promotions } = this.data
      let newPromotions = [...promotions]
      
      if (editingId) {
        const index = newPromotions.findIndex(p => p.id === editingId)
        if (index !== -1) {
          newPromotions[index] = { ...formData, id: editingId }
        }
      } else {
        const newId = promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1
        newPromotions.push({ ...formData, id: newId })
      }
      
      // 调用数据库API保存促销活动
      await merchantApi.updatePromotionSetting(newPromotions)
      console.log('保存促销活动成功')
      
      this.processPromotions(newPromotions)
      this.hideForm()
      
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
    } catch (error) {
      console.error('保存促销活动失败:', error)
      wx.hideLoading()
      wx.showToast({ title: error.message || '保存失败', icon: 'none' })
    } finally {
      this.isSaving = false
    }
  },

  /**
   * 结束活动
   */
  endPromotion(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认结束',
      content: '确定要提前结束该活动吗？',
      success: (res) => {
        if (res.confirm) {
          this.performEnd(id)
        }
      }
    })
  },

  async performEnd(id) {
    wx.showLoading({ title: '处理中...' })
    
    try {
      const promotions = this.data.promotions.map(p => {
        if (p.id === id) {
          return { ...p, manualEnded: true }
        }
        return p
      })
      
      // 调用数据库API保存
      await merchantApi.updatePromotionSetting(promotions)
      console.log('结束活动成功')
      
      this.processPromotions(promotions)
      
      wx.hideLoading()
      wx.showToast({ title: '活动已结束', icon: 'none' })
    } catch (error) {
      console.error('结束活动失败:', error)
      wx.hideLoading()
      wx.showToast({ title: error.message || '操作失败', icon: 'none' })
    }
  },

  /**
   * 删除活动
   */
  deletePromotion(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该活动记录吗？',
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(id)
        }
      }
    })
  },

  async performDelete(id) {
    wx.showLoading({ title: '删除中...' })
    
    try {
      const newPromotions = this.data.promotions.filter(p => p.id !== id)
      
      // 调用数据库API保存
      await merchantApi.updatePromotionSetting(newPromotions)
      console.log('删除活动成功')
      
      this.processPromotions(newPromotions)
      
      wx.hideLoading()
      wx.showToast({ title: '删除成功', icon: 'success' })
    } catch (error) {
      console.error('删除活动失败:', error)
      wx.hideLoading()
      wx.showToast({ title: error.message || '删除失败', icon: 'none' })
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }
})
