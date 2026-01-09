// pages/merchant/setting/store-setting/store-setting.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 店铺信息
    storeInfo: {
      name: '',
      description: '',
      announcement: '',
      mainCategory: '',
      status: 'open' // open, closed
    },
    
    // 错误信息
    errors: {
      name: '',
      mainCategory: ''
    },
    
    // 主营类目列表
    categories: [
      '宠物食品',
      '宠物用品',
      '宠物医疗',
      '宠物用具',
      '宠物美容',
      '宠物寄养',
      '宠物训练',
      '宠物娱乐',
      '宠物保险',
      '其他'
    ],
    
    // 选中的类目索引
    selectedCategoryIndex: 0,
    
    // 营业时间文本
    businessHoursText: '周一至周日 9:00-21:00'
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
    
    // 加载店铺信息
    this.loadStoreInfo()
  },

  /**
   * 加载店铺信息
   */
  loadStoreInfo() {
    // 模拟数据，实际应该调用API获取店铺信息
    const mockStoreInfo = {
      name: '宠物乐园宠物店',
      description: '专业的宠物服务提供商，提供宠物食品、寄养、训练等服务',
      announcement: '新店开业，全场商品8折优惠，欢迎惠顾！',
      mainCategory: '宠物美容',
      status: 'open'
    }
    
    // 计算选中的类目索引
    const selectedCategoryIndex = this.data.categories.indexOf(mockStoreInfo.mainCategory)
    
    this.setData({
      storeInfo: mockStoreInfo,
      initialStoreInfo: JSON.parse(JSON.stringify(mockStoreInfo)),
      selectedCategoryIndex: selectedCategoryIndex >= 0 ? selectedCategoryIndex : 0
    })
  },

  /**
   * 输入框变化事件
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`storeInfo.${field}`]: value,
      [`errors.${field}`]: '' // 清除对应字段的错误信息
    })
  },

  /**
   * 选择主营类目
   */
  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    
    this.setData({
      selectedCategoryIndex: index,
      'storeInfo.mainCategory': category,
      'errors.mainCategory': ''
    })
  },

  /**
   * 切换店铺状态
   */
  toggleStatus(e) {
    const checked = e.detail.value
    this.setData({
      'storeInfo.status': checked ? 'open' : 'closed'
    })
  },

  /**
   * 编辑营业时间
   */
  editBusinessHours() {
    wx.navigateTo({
      url: '/pages/merchant/setting/business-hours/business-hours'
    })
  },

  /**
   * 数据验证
   */
  validateForm() {
    const { storeInfo } = this.data
    const errors = {
      name: '',
      mainCategory: ''
    }
    
    // 验证店铺名称
    if (!storeInfo.name.trim()) {
      errors.name = '店铺名称不能为空'
    } else if (storeInfo.name.length > 50) {
      errors.name = '店铺名称不能超过50个字符'
    }
    
    // 验证主营类目
    if (!storeInfo.mainCategory.trim()) {
      errors.mainCategory = '请选择主营类目'
    }
    
    this.setData({ errors })
    
    // 检查是否有错误
    return !Object.values(errors).some(error => error)
  },

  /**
   * 保存店铺设置
   */
  saveStoreSetting() {
    // 表单验证
    if (!this.validateForm()) {
      return
    }
    
    const { storeInfo } = this.data
    
    wx.showLoading({
      title: '保存中..'
    })
    
    // 模拟API请求，实际应该调用API保存店铺设置
    setTimeout(() => {
      wx.hideLoading()
      
      // 保存成功
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
  },

  /**
   * 检查是否有未保存的修改
   */
  hasUnsavedChanges() {
    const { storeInfo, initialStoreInfo } = this.data
    return JSON.stringify(storeInfo) !== JSON.stringify(initialStoreInfo)
  },

  /**
   * 返回上一页
   */
  goBack() {
    if (this.hasUnsavedChanges()) {
      wx.showModal({
        title: '确认返回',
        content: '您有未保存的修改，是否确认返回？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  }
})