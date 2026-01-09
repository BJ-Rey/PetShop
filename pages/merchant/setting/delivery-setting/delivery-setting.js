// pages/merchant/setting/delivery-setting/delivery-setting.js
const app = getApp()

Page({

  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
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
    deliveryAreaList: [
      { id: 1, name: '朝阳区' },
      { id: 2, name: '海淀区' }
    ],
    
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
    selfPickupAddress: '北京市朝阳区宠物大街123号',
    selfPickupTimeSlots: [
      { start: '09:00', end: '21:00' }
    ],
    selfPickupNote: '请提前1小时预约自提'
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
   * 加载配送设置
   */
  loadDeliverySetting() {
    // 模拟数据，实际应该调用API获取配送设置
    // 从本地存储获取设置（如果有）
    const savedDeliverySetting = wx.getStorageSync('deliverySetting')
    if (savedDeliverySetting) {
      this.setData(savedDeliverySetting)
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
   * 保存配送设置
   */
  saveDeliverySetting() {
    if (this.isSaving) return
    this.isSaving = true

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
    
    wx.showLoading({
      title: '保存中..',
      mask: true
    })
    
    // 模拟API请求，实际应该调用API保存配送设置
    setTimeout(() => {
      wx.hideLoading()
      
      // 保存到本地存储
      wx.setStorageSync('deliverySetting', deliverySetting)
      
      // 更新初始数据副本，标记为已保存
      this.initialData = JSON.stringify(deliverySetting)
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      this.isSaving = false
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1000)
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