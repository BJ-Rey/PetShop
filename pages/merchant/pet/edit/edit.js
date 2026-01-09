// pages/merchant/pet/edit/edit.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 宠物ID
    petId: null,
    // 宠物信息
    petInfo: {
      name: '',
      breed: '',
      age: '',
      gender: 'male',
      color: '',
      status: 'published',
      images: [],
      description: '',
      price: 0,
      deposit: 0
    },
    // 原始宠物信息，用于比较是否有修改
    originalPetInfo: null,
    // 加载状态
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('Edit page onLoad called')
    console.log('Options:', options)
    // 获取宠物ID，并转换为数字类型
    const petId = parseInt(options.id)
    console.log('Pet ID from options:', petId)
    if (isNaN(petId)) {
      wx.showToast({
        title: '无效的宠物ID',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.setData({
      petId: petId
    })
    console.log('Set petId to data:', this.data.petId)
    
    // 加载宠物信息
    this.loadPetInfo()
  },

  /**
   * 加载宠物信息
   */
  loadPetInfo() {
    console.log('loadPetInfo called')
    // 显示加载状态
    this.setData({
      isLoading: true
    })
    console.log('Set isLoading to true')
    
    // 从本地存储中获取宠物数据
    const currentPet = wx.getStorageSync('currentPet')
    console.log('Current pet from local storage:', currentPet)
    console.log('Current petId:', this.data.petId)
    console.log('Current pet exists:', !!currentPet)
    console.log('Current pet id type:', typeof currentPet?.id)
    console.log('this.data.petId type:', typeof this.data.petId)
    console.log('Current pet.id:', currentPet?.id)
    console.log('Current petId:', this.data.petId)
    console.log('Current pet exists and matches ID:', currentPet && currentPet.id == this.data.petId)
    
    // 模拟API请求延迟
    setTimeout(() => {
      console.log('Timeout finished, setting data')
      
      // 强制使用模拟数据，确保页面能显示内容
      const mockPet = {
        id: this.data.petId,
        name: '小黑',
        breed: '金毛犬',
        age: '2岁',
        gender: 'male',
        color: '黄色',
        status: 'published',
        images: [
          'https://example.com/pet1.jpg',
          'https://example.com/pet1-2.jpg'
        ],
        description: '性格温顺，非常听话，喜欢玩耍。',
        price: 3000,
        deposit: 1000,
        createdAt: '2025-12-18T10:00:00Z',
        updatedAt: '2025-12-18T10:00:00Z'
      }
      
      this.setData({
        petInfo: mockPet,
        originalPetInfo: { ...mockPet }, // 保存原始数据用于比较
        isLoading: false
      })
      
      console.log('Set petInfo to mock data:', mockPet)
      console.log('Final data:', this.data)
      console.log('PetInfo after setData:', this.data.petInfo)
      console.log('IsLoading after setData:', this.data.isLoading)
    }, 500)
  },

  /**
   * 输入框变化处理
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`petInfo.${field}`]: value
    })
  },

  /**
   * 性别选择变化
   */
  onGenderChange(e) {
    const value = e.detail.value
    this.setData({
      'petInfo.gender': value
    })
  },

  /**
   * 上架状态变化
   */
  onStatusChange(e) {
    const checked = e.detail.value
    this.setData({
      'petInfo.status': checked ? 'published' : 'unpublished'
    })
  },

  /**
   * 选择图片
   */
  chooseImage() {
    // 计算还能上传多少张图片
    const maxImages = 9 - this.data.petInfo.images.length
    if (maxImages <= 0) {
      wx.showToast({
        title: '最多只能上传9张图片',
        icon: 'none'
      })
      return
    }
    
    wx.chooseImage({
      count: maxImages,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        
        // 更新宠物图片
        const updatedImages = [...this.data.petInfo.images, ...tempFilePaths]
        this.setData({
          'petInfo.images': updatedImages
        })
      }
    })
  },

  /**
   * 删除图片
   */
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.petInfo.images]
    images.splice(index, 1)
    
    this.setData({
      'petInfo.images': images
    })
  },

  /**
   * 保存宠物信息
   */
  savePet() {
    // 表单验证
    if (!this.validateForm()) {
      return
    }
    
    // 检查是否有修改
    if (this.isFormUnchanged()) {
      wx.showToast({
        title: '没有进行任何修改',
        icon: 'none'
      })
      return
    }
    
    // 显示加载状态
    this.setData({
      isLoading: true
    })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      // 保存成功
      this.setData({
        isLoading: false
      })
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 1500)
  },

  /**
   * 表单验证
   * @returns {boolean} 是否通过验证
   */
  validateForm() {
    const { name, breed, age, images, price } = this.data.petInfo
    
    // 验证宠物名称
    if (!name.trim()) {
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      })
      return false
    }
    
    // 验证宠物品种
    if (!breed.trim()) {
      wx.showToast({
        title: '请输入宠物品种',
        icon: 'none'
      })
      return false
    }
    
    // 验证宠物年龄
    if (!age.trim()) {
      wx.showToast({
        title: '请输入宠物年龄',
        icon: 'none'
      })
      return false
    }
    
    // 验证宠物价格
    if (price <= 0 || isNaN(price)) {
      wx.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      })
      return false
    }
    
    // 验证至少有一张图片
    if (images.length === 0) {
      wx.showToast({
        title: '请至少上传一张宠物图片',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  /**
   * 检查表单是否有修改
   * @returns {boolean} 是否没有修改
   */
  isFormUnchanged() {
    const { petInfo, originalPetInfo } = this.data
    
    // 比较基本信息
    if (petInfo.name !== originalPetInfo.name) return false
    if (petInfo.breed !== originalPetInfo.breed) return false
    if (petInfo.age !== originalPetInfo.age) return false
    if (petInfo.gender !== originalPetInfo.gender) return false
    if (petInfo.color !== originalPetInfo.color) return false
    if (petInfo.status !== originalPetInfo.status) return false
    if (petInfo.description !== originalPetInfo.description) return false
    if (petInfo.price !== originalPetInfo.price) return false
    if (petInfo.deposit !== originalPetInfo.deposit) return false
    
    // 比较图片数量
    if (petInfo.images.length !== originalPetInfo.images.length) return false
    
    // 比较图片内容（简单比较，实际应该比较图片URL或MD5）
    for (let i = 0; i < petInfo.images.length; i++) {
      if (petInfo.images[i] !== originalPetInfo.images[i]) return false
    }
    
    return true
  },

  /**
   * 上一页
   */
  navigateBack() {
    wx.navigateBack()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时可以执行的操作
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏时可以执行的操作
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时可以执行的操作
  }
})