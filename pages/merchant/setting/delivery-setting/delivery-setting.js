// pages/merchant/setting/delivery-setting/delivery-setting.js
const app = getApp()
const merchantApi = require('../../../../api/merchantApi')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 配送方式
    deliveryMethods: {
      selfPickup: true,
      merchantDelivery: true,
      thirdPartyDelivery: false
    },
    
    // 配送范围类型 radius(半径), area(区域)
    deliveryRangeType: 'radius',
    deliveryRangeTypes: [
      { value: 'radius', name: '按半径配送' },
      { value: 'area', name: '按区域配送' }
    ],
    
    // 配送半径(公里)
    deliveryRadius: 5,
    
    // 配送区域列表
    deliveryAreaList: [],
    
    // 费用计算方式
    feeCalculationMethods: ['固定费用', '按距离计费', '按重量计费'],
    selectedFeeMethodIndex: 0,
    
    // 固定配送费 (元)
    fixedDeliveryFee: 5,
    
    // 距离费用规则
    distanceFeeRules: [
      { start: 0, end: 3, fee: 5 },
      { start: 3, end: 5, fee: 8 },
      { start: 5, end: 10, fee: 12 }
    ],
    
    // 重量费用规则
    firstWeight: 1,
    firstWeightFee: 8,
    addWeight: 0.5,
    addWeightFee: 3,
    
    // 免费配送门槛 (元)
    freeDeliveryThreshold: 50,
    
    // 预计配送时间(分钟)
    estimatedDeliveryTime: 30,
    
    // 配送时间段
    deliveryTimeSlots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '18:00' },
      { start: '19:00', end: '22:00' }
    ],
    
    // 预约配送
    supportScheduledDelivery: false,
    scheduledAdvanceTime: 2,
    
    // 自提设置
    selfPickupAddress: '',
    selfPickupTimeSlots: [
      { start: '09:00', end: '21:00' }
    ],
    selfPickupNote: '',
    
    // 加载状态
    isLoading: false,
    // 提交状态
    isSubmitting: false
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
    
    // 加载配送设置
    this.loadDeliverySetting()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 保存初始数据副本，用于检查是否有未保存的修改
    this.initialData = JSON.stringify({
      deliveryMethods: this.data.deliveryMethods,
      deliveryRangeType: this.data.deliveryRangeType,
      deliveryRadius: this.data.deliveryRadius,
      deliveryAreaList: this.data.deliveryAreaList,
      selectedFeeMethodIndex: this.data.selectedFeeMethodIndex,
      fixedDeliveryFee: this.data.fixedDeliveryFee,
      distanceFeeRules: this.data.distanceFeeRules,
      firstWeight: this.data.firstWeight,
      firstWeightFee: this.data.firstWeightFee,
      addWeight: this.data.addWeight,
      addWeightFee: this.data.addWeightFee,
      freeDeliveryThreshold: this.data.freeDeliveryThreshold,
      estimatedDeliveryTime: this.data.estimatedDeliveryTime,
      deliveryTimeSlots: this.data.deliveryTimeSlots,
      supportScheduledDelivery: this.data.supportScheduledDelivery,
      scheduledAdvanceTime: this.data.scheduledAdvanceTime,
      selfPickupAddress: this.data.selfPickupAddress,
      selfPickupTimeSlots: this.data.selfPickupTimeSlots,
      selfPickupNote: this.data.selfPickupNote
    })
  },

  /**
   * 从数据库加载配送设置
   */
  async loadDeliverySetting() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getDeliverySetting()
      console.log('获取配送设置成功:', res)
      
      if (res && res.data) {
        this.setData({
          deliveryMethods: res.data.deliveryMethods || this.data.deliveryMethods,
          deliveryRangeType: res.data.deliveryRangeType || this.data.deliveryRangeType,
          deliveryRadius: res.data.deliveryRadius || this.data.deliveryRadius,
          deliveryAreaList: res.data.deliveryAreaList || this.data.deliveryAreaList,
          selectedFeeMethodIndex: res.data.selectedFeeMethodIndex || this.data.selectedFeeMethodIndex,
          fixedDeliveryFee: res.data.fixedDeliveryFee || this.data.fixedDeliveryFee,
          distanceFeeRules: res.data.distanceFeeRules || this.data.distanceFeeRules,
          firstWeight: res.data.firstWeight || this.data.firstWeight,
          firstWeightFee: res.data.firstWeightFee || this.data.firstWeightFee,
          addWeight: res.data.addWeight || this.data.addWeight,
          addWeightFee: res.data.addWeightFee || this.data.addWeightFee,
          freeDeliveryThreshold: res.data.freeDeliveryThreshold || this.data.freeDeliveryThreshold,
          estimatedDeliveryTime: res.data.estimatedDeliveryTime || this.data.estimatedDeliveryTime,
          deliveryTimeSlots: res.data.deliveryTimeSlots || this.data.deliveryTimeSlots,
          supportScheduledDelivery: res.data.supportScheduledDelivery || this.data.supportScheduledDelivery,
          scheduledAdvanceTime: res.data.scheduledAdvanceTime || this.data.scheduledAdvanceTime,
          selfPickupAddress: res.data.selfPickupAddress || this.data.selfPickupAddress,
          selfPickupTimeSlots: res.data.selfPickupTimeSlots || this.data.selfPickupTimeSlots,
          selfPickupNote: res.data.selfPickupNote || this.data.selfPickupNote
        })
      }
    } catch (error) {
      console.error('获取配送设置失败:', error)
      wx.showToast({
        title: '加载配送设置失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 切换配送方式
   */
  toggleDeliveryMethod(e) {
    const type = e.currentTarget.dataset.type
    const checked = e.detail.value
    
    this.setData({
      [`deliveryMethods.${type}`]: checked
    })
  },

  /**
   * 切换配送范围类型
   */
  changeDeliveryRangeType(e) {
    const value = e.detail.value
    this.setData({
      deliveryRangeType: value
    })
  },

  /**
   * 切换配送半径
   */
  changeDeliveryRadius(e) {
    const value = e.detail.value
    this.setData({
      deliveryRadius: value
    })
  },

  /**
   * 管理配送区域
   */
  manageDeliveryArea() {
    wx.showToast({
      title: '配送区域管理功能开发中',
      icon: 'none'
    })
  },

  /**
   * 删除配送区域
   */
  deleteDeliveryArea(e) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该配送区域吗？',
      success: (res) => {
        if (res.confirm) {
          const id = e.currentTarget.dataset.id
          const deliveryAreaList = this.data.deliveryAreaList.filter(item => item.id !== id)
          
          this.setData({
            deliveryAreaList: deliveryAreaList
          })
        }
      }
    })
  },

  /**
   * 切换费用计算方式
   */
  changeFeeCalculationMethod(e) {
    const index = e.detail.value
    this.setData({
      selectedFeeMethodIndex: index
    })
  },

  /**
   * 管理距离费用规则
   */
  manageDistanceFeeRules() {
    wx.showToast({
      title: '距离费用规则管理功能开发中',
      icon: 'none'
    })
  },

  /**
   * 管理配送时间段
   */
  manageDeliveryTimeSlots() {
    wx.showToast({
      title: '配送时间段管理功能开发中',
      icon: 'none'
    })
  },

  /**
   * 切换预约配送
   */
  toggleScheduledDelivery(e) {
    const checked = e.detail.value
    this.setData({
      supportScheduledDelivery: checked
    })
  },

  /**
   * 管理自提时间
   */
  manageSelfPickupTime() {
    wx.showToast({
      title: '自提时间管理功能开发中',
      icon: 'none'
    })
  },

  /**
   * 输入框变化事件
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [field]: value
    })
  },

  /**
   * 检查是否有未保存的修改
   */
  hasUnsavedChanges() {
    const currentData = JSON.stringify({
      deliveryMethods: this.data.deliveryMethods,
      deliveryRangeType: this.data.deliveryRangeType,
      deliveryRadius: this.data.deliveryRadius,
      deliveryAreaList: this.data.deliveryAreaList,
      selectedFeeMethodIndex: this.data.selectedFeeMethodIndex,
      fixedDeliveryFee: this.data.fixedDeliveryFee,
      distanceFeeRules: this.data.distanceFeeRules,
      firstWeight: this.data.firstWeight,
      firstWeightFee: this.data.firstWeightFee,
      addWeight: this.data.addWeight,
      addWeightFee: this.data.addWeightFee,
      freeDeliveryThreshold: this.data.freeDeliveryThreshold,
      estimatedDeliveryTime: this.data.estimatedDeliveryTime,
      deliveryTimeSlots: this.data.deliveryTimeSlots,
      supportScheduledDelivery: this.data.supportScheduledDelivery,
      scheduledAdvanceTime: this.data.scheduledAdvanceTime,
      selfPickupAddress: this.data.selfPickupAddress,
      selfPickupTimeSlots: this.data.selfPickupTimeSlots,
      selfPickupNote: this.data.selfPickupNote
    })
    
    return this.initialData !== currentData
  },

  /**
   * 保存配送设置 - 调用数据库API
   */
  async saveDeliverySetting() {
    // 防止重复提交
    if (this.data.isSubmitting) {
      return
    }

    const deliverySetting = {
      deliveryMethods: this.data.deliveryMethods,
      deliveryRangeType: this.data.deliveryRangeType,
      deliveryRadius: this.data.deliveryRadius,
      deliveryAreaList: this.data.deliveryAreaList,
      selectedFeeMethodIndex: this.data.selectedFeeMethodIndex,
      fixedDeliveryFee: this.data.fixedDeliveryFee,
      distanceFeeRules: this.data.distanceFeeRules,
      firstWeight: this.data.firstWeight,
      firstWeightFee: this.data.firstWeightFee,
      addWeight: this.data.addWeight,
      addWeightFee: this.data.addWeightFee,
      freeDeliveryThreshold: this.data.freeDeliveryThreshold,
      estimatedDeliveryTime: this.data.estimatedDeliveryTime,
      deliveryTimeSlots: this.data.deliveryTimeSlots,
      supportScheduledDelivery: this.data.supportScheduledDelivery,
      scheduledAdvanceTime: this.data.scheduledAdvanceTime,
      selfPickupAddress: this.data.selfPickupAddress,
      selfPickupTimeSlots: this.data.selfPickupTimeSlots,
      selfPickupNote: this.data.selfPickupNote
    }
    
    this.setData({ isSubmitting: true })
    
    wx.showLoading({
      title: '保存中..',
      mask: true
    })
    
    try {
      const res = await merchantApi.updateDeliverySetting(deliverySetting)
      console.log('保存配送设置成功:', res)
      
      wx.hideLoading()
      
      // 更新初始数据副本，标记为已保存
      this.initialData = JSON.stringify(deliverySetting)
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存配送设置失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    // 检查是否有未保存的修改
    if (this.hasUnsavedChanges()) {
      wx.showModal({
        title: '确认返回',
        content: '您有未保存的修改，是否确认返回？',
        confirmText: '确认返回',
        cancelText: '继续编辑',
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