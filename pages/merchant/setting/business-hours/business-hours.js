// pages/merchant/setting/business-hours/business-hours.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 设置模式：same（统一设置）， differentiated（差异化设置）
    selectedMode: 'same',
    
    // 统一设置模式状态
    sameModeStatus: 'open', // open, closed
    sameModeTimeSlots: [
      { start: '09:00', end: '21:00' }
    ],
    
    // 差异化设置模式
    selectedWorkdayType: 'weekday', // weekday, weekend, holiday
    workdaySettings: {
      weekday: {
        status: 'open',
        timeSlots: [{ start: '09:00', end: '21:00' }]
      },
      weekend: {
        status: 'open',
        timeSlots: [{ start: '10:00', end: '22:00' }]
      },
      holiday: {
        status: 'open',
        timeSlots: [{ start: '10:00', end: '20:00' }]
      }
    },
    
    // 节假日列表
    holidayList: [
      { date: '2025-01-01', name: '元旦' },
      { date: '2025-02-01', name: '春节' },
      { date: '2025-04-04', name: '清明节' },
      { date: '2025-05-01', name: '劳动节' },
      { date: '2025-06-01', name: '儿童节' },
      { date: '2025-10-01', name: '国庆节' }
    ],
    
    // 预览数据
    previewDays: [
      { day: '周一', status: 'open', time: '09:00-21:00' },
      { day: '周二', status: 'open', time: '09:00-21:00' },
      { day: '周三', status: 'open', time: '09:00-21:00' },
      { day: '周四', status: 'open', time: '09:00-21:00' },
      { day: '周五', status: 'open', time: '09:00-21:00' },
      { day: '周六', status: 'open', time: '10:00-22:00' },
      { day: '周日', status: 'open', time: '10:00-22:00' }
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
    
    // 鍔犺浇钀ヤ笟鏃堕棿璁剧疆
    this.loadBusinessHours()
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow() {
    // 淇濆瓨鍒濆鏁版嵁鍓湰锛岀敤浜庢娴嬫槸鍚︽湁鏈繚瀛樼殑淇敼
    this.initialData = JSON.stringify({
      selectedMode: this.data.selectedMode,
      sameModeStatus: this.data.sameModeStatus,
      sameModeTimeSlots: this.data.sameModeTimeSlots,
      selectedWorkdayType: this.data.selectedWorkdayType,
      workdaySettings: this.data.workdaySettings,
      holidayList: this.data.holidayList
    })
  },

  /**
   * 鍔犺浇钀ヤ笟鏃堕棿璁剧疆
   */
  loadBusinessHours() {
    // 妯℃嫙鏁版嵁锛屽疄闄呭簲璇ヨ皟鐢ˋPI鑾峰彇钀ヤ笟鏃堕棿璁剧疆
    // 杩欓噷浣跨敤鍒濆鏁版嵁浣滀负妯℃嫙
    
    // 浠庢湰鍦板瓨鍌ㄨ幏鍙栬缃紙濡傛灉鏈夛級
    const savedBusinessHours = wx.getStorageSync('businessHours')
    if (savedBusinessHours) {
      this.setData(savedBusinessHours)
      this.updatePreview()
    }
  },

  /**
   * 閫夋嫨璁剧疆妯″紡
   */
  selectMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      selectedMode: mode
    })
    this.updatePreview()
  },

  /**
   * 閫夋嫨宸ヤ綔鏃ョ被鍨?   */
  selectWorkdayType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedWorkdayType: type
    })
  },

  /**
   * 鍒囨崲缁熶竴妯″紡钀ヤ笟鐘舵€?   */
  toggleSameModeStatus(e) {
    const checked = e.detail.value
    this.setData({
      sameModeStatus: checked ? 'open' : 'closed'
    })
    this.updatePreview()
  },

  /**
   * 鍒囨崲宸ヤ綔鏃ヨ惀涓氱姸鎬?   */
  toggleWorkdayStatus(e) {
    const checked = e.detail.value
    const type = this.data.selectedWorkdayType
    
    this.setData({
      [`workdaySettings.${type}.status`]: checked ? 'open' : 'closed'
    })
    this.updatePreview()
  },

  /**
   * 鏇存柊缁熶竴妯″紡鏃堕棿娈?   */
  updateSameModeTimeSlot(e) {
    const index = e.currentTarget.dataset.index
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    const sameModeTimeSlots = [...this.data.sameModeTimeSlots]
    sameModeTimeSlots[index][field] = value
    
    this.setData({
      sameModeTimeSlots: sameModeTimeSlots
    })
    this.updatePreview()
  },

  /**
   * 娣诲姞缁熶竴妯″紡鏃堕棿娈?   */
  addSameModeTimeSlot() {
    const sameModeTimeSlots = [...this.data.sameModeTimeSlots]
    sameModeTimeSlots.push({ start: '09:00', end: '18:00' })
    
    this.setData({
      sameModeTimeSlots: sameModeTimeSlots
    })
  },

  /**
   * 鍒犻櫎缁熶竴妯″紡鏃堕棿娈?   */
  deleteSameModeTimeSlot(e) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该营业时段吗？',
      success: (res) => {
        if (res.confirm) {
          const index = e.currentTarget.dataset.index
          const sameModeTimeSlots = [...this.data.sameModeTimeSlots]
          sameModeTimeSlots.splice(index, 1)
          
          this.setData({
            sameModeTimeSlots: sameModeTimeSlots
          })
          this.updatePreview()
        }
      }
    })
  },

  /**
   * 鏇存柊宸ヤ綔鏃ユ椂闂存
   */
  updateWorkdayTimeSlot(e) {
    const index = e.currentTarget.dataset.index
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    const type = this.data.selectedWorkdayType
    
    const workdaySettings = { ...this.data.workdaySettings }
    workdaySettings[type].timeSlots[index][field] = value
    
    this.setData({
      workdaySettings: workdaySettings
    })
    this.updatePreview()
  },

  /**
   * 娣诲姞宸ヤ綔鏃ユ椂闂存
   */
  addWorkdayTimeSlot() {
    const type = this.data.selectedWorkdayType
    const workdaySettings = { ...this.data.workdaySettings }
    workdaySettings[type].timeSlots.push({ start: '09:00', end: '18:00' })
    
    this.setData({
      workdaySettings: workdaySettings
    })
  },

  /**
   * 鍒犻櫎宸ヤ綔鏃ユ椂闂存
   */
  deleteWorkdayTimeSlot(e) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该营业时段吗？',
      success: (res) => {
        if (res.confirm) {
          const index = e.currentTarget.dataset.index
          const type = this.data.selectedWorkdayType
          const workdaySettings = { ...this.data.workdaySettings }
          workdaySettings[type].timeSlots.splice(index, 1)
          
          this.setData({
            workdaySettings: workdaySettings
          })
          this.updatePreview()
        }
      }
    })
  },

  /**
   * 绠＄悊鑺傚亣鏃?   */
  manageHolidays() {
    wx.showToast({
      title: '鑺傚亣鏃ョ鐞嗗姛鑳藉紑鍙戜腑',
      icon: 'none'
    })
  },

  /**
   * 更新预览
   */
  updatePreview() {
    const { selectedMode, sameModeStatus, sameModeTimeSlots, workdaySettings } = this.data
    
    // 生成预览数据
    const previewDays = [
      { day: '周一', type: 'weekday' },
      { day: '周二', type: 'weekday' },
      { day: '周三', type: 'weekday' },
      { day: '周四', type: 'weekday' },
      { day: '周五', type: 'weekday' },
      { day: '周六', type: 'weekend' },
      { day: '周日', type: 'weekend' }
    ]
    
    // 格式化预览数据
    const formattedPreviewDays = previewDays.map(day => {
      let status, timeSlots
      
      if (selectedMode === 'same') {
        status = sameModeStatus
        timeSlots = sameModeTimeSlots
      } else {
        status = workdaySettings[day.type].status
        timeSlots = workdaySettings[day.type].timeSlots
      }
      
      // 格式化时间段文本
      const timeText = timeSlots.map(slot => `${slot.start}-${slot.end}`).join(', ')
      
      return {
        day: day.day,
        status: status,
        time: timeText
      }
    })
    
    this.setData({
      previewDays: formattedPreviewDays
    })
  },

  /**
   * 检查是否有未保存的修改
   */
  hasUnsavedChanges() {
    const currentData = JSON.stringify({
      selectedMode: this.data.selectedMode,
      sameModeStatus: this.data.sameModeStatus,
      sameModeTimeSlots: this.data.sameModeTimeSlots,
      selectedWorkdayType: this.data.selectedWorkdayType,
      workdaySettings: this.data.workdaySettings,
      holidayList: this.data.holidayList
    })
    
    return this.initialData !== currentData
  },

  /**
   * 保存营业时间设置
   */
  saveBusinessHours() {
    if (this.isSaving) return
    this.isSaving = true

    const { 
      selectedMode, 
      sameModeStatus, 
      sameModeTimeSlots, 
      selectedWorkdayType, 
      workdaySettings, 
      holidayList 
    } = this.data
    
    // 验证营业时间设置
    if (!this.validateBusinessHours()) {
      this.isSaving = false
      return
    }
    
    const businessHours = {
      selectedMode,
      sameModeStatus,
      sameModeTimeSlots,
      selectedWorkdayType,
      workdaySettings,
      holidayList
    }
    
    wx.showLoading({
      title: '保存中..',
      mask: true
    })
    
    // 模拟API请求，实际应该调用API保存营业时间设置
    setTimeout(() => {
      wx.hideLoading()
      
      // 保存到本地存储
      wx.setStorageSync('businessHours', businessHours)
      
      // 更新初始数据副本，标记为已保存
      this.initialData = JSON.stringify(businessHours)
      
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
   * 验证营业时间设置
   */
  validateBusinessHours() {
    const { selectedMode, sameModeStatus, sameModeTimeSlots, workdaySettings } = this.data
    
    // 验证统一模式
    if (selectedMode === 'same' && sameModeStatus === 'open') {
      if (sameModeTimeSlots.length === 0) {
        wx.showToast({
          title: '请至少设置一个营业时间段',
          icon: 'none'
        })
        return false
      }
      
      // 验证时间段
      for (const slot of sameModeTimeSlots) {
        if (!this.validateTimeSlot(slot)) {
          return false
        }
      }
    }
    
    // 验证差异化模式
    if (selectedMode === 'differentiated') {
      for (const type in workdaySettings) {
        const setting = workdaySettings[type]
        if (setting.status === 'open') {
          if (setting.timeSlots.length === 0) {
            wx.showToast({
              title: `${this.getWorkdayTypeName(type)}请至少设置一个营业时间段`,
              icon: 'none'
            })
            return false
          }
          
          // 验证时间段
          for (const slot of setting.timeSlots) {
            if (!this.validateTimeSlot(slot)) {
              return false
            }
          }
        }
      }
    }
    
    return true
  },

  /**
   * 验证时间段
   */
  validateTimeSlot(slot) {
    const start = slot.start
    const end = slot.end
    
    if (!start || !end) {
      wx.showToast({
        title: '请完整设置时间段',
        icon: 'none'
      })
      return false
    }
    
    if (start >= end) {
      wx.showToast({
        title: '开始时间必须早于结束时间',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  /**
   * 获取工作日类型名称
   */
  getWorkdayTypeName(type) {
    const typeNames = {
      weekday: '工作日',
      weekend: '周末',
      holiday: '节假日'
    }
    return typeNames[type] || ''
  },

  /**
   * 返回上一页
   */
  goBack() {
    // 检查是否有未保存的修改
    if (this.hasUnsavedChanges()) {
      wx.showModal({
        title: '确认返回',
        content: '您有未保存的修改，是否确定返回？',
        confirmText: '确定返回',
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