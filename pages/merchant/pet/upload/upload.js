// pages/merchant/pet/upload/upload.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 宠物信息
    petInfo: {
      name: '',
      breed: '',
      ageMonths: '',
      gender: 'male',
      color: '',
      description: '',
      personalities: [],
      healthStatus: 'healthy',
      healthIssues: '',
      images: [],
      isOnSale: true
    },
    
    // 下拉选择选项
    breedOptions: [
      '英国短毛猫', '美国短毛猫', '波斯猫', '布偶猫', '暹罗猫',
      '加菲猫', '金渐层', '银渐层', '缅因猫', '中华田园猫', 
      '无毛猫', '德文卷毛猫', '孟加拉豹猫', '其他'
    ],
    breedIndex: 0,
    
    // 性格选项
    personalityOptions: [
      { id: 1, name: '活泼', value: 'active' },
      { id: 2, name: '安静', value: 'quiet' },
      { id: 3, name: '友好', value: 'friendly' },
      { id: 4, name: '黏人', value: 'affectionate' },
      { id: 5, name: '独立', value: 'independent' },
      { id: 6, name: '聪明', value: 'intelligent' },
      { id: 7, name: '温顺', value: 'gentle' },
      { id: 8, name: '勇敢', value: 'brave' }
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
    
    // 如果是编辑模式，加载宠物信息
    if (options.id) {
      this.loadPetInfo(options.id)
    }
  },
  
  /**
   * 加载宠物信息
   */
  loadPetInfo(id) {
    wx.showLoading({
      title: '加载中...'
    })
    
    // 模拟加载宠物信息，实际应该调用API
    setTimeout(() => {
      const mockPetInfo = {
        id: id,
        name: '可爱的英短',
        breed: '英国短毛猫',
        ageMonths: '12',
        gender: 'male',
        color: '蓝白',
        description: '这是一只非常可爱的英国短毛猫，性格温顺，喜欢与人互动。',
        personalities: ['friendly', 'gentle', 'active'],
        healthStatus: 'healthy',
        healthIssues: '',
        images: ['https://example.com/pet1.jpg', 'https://example.com/pet2.jpg'],
        isOnSale: true
      }
      
      // 找到品种索引
      const breedIndex = this.data.breedOptions.indexOf(mockPetInfo.breed)
      
      this.setData({
        petInfo: mockPetInfo,
        breedIndex: breedIndex !== -1 ? breedIndex : 0
      })
      
      wx.hideLoading()
    }, 1000)
  },
  
  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`petInfo.${field}`]: value
    })
  },
  
  /**
   * 宠物品种变化
   */
  onBreedChange(e) {
    const index = e.detail.value
    const breed = this.data.breedOptions[index]
    
    this.setData({
      breedIndex: index,
      [`petInfo.breed`]: breed
    })
  },
  
  /**
   * 宠物性别变化
   */
  onGenderChange(e) {
    this.setData({
      [`petInfo.gender`]: e.detail.value
    })
  },
  
  /**
   * 宠物性格变化
   */
  onPersonalityChange(e) {
    this.setData({
      [`petInfo.personalities`]: e.detail.value
    })
  },
  
  /**
   * 健康状况变化
   */
  onHealthStatusChange(e) {
    this.setData({
      [`petInfo.healthStatus`]: e.detail.value
    })
  },
  
  /**
   * 上架状态变化
   */
  onSaleStatusChange(e) {
    this.setData({
      [`petInfo.isOnSale`]: e.detail.value
    })
  },
  
  /**
   * 选择图片
   */
  chooseImage() {
    const that = this
    wx.chooseImage({
      count: 9 - that.data.petInfo.images.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        // 获取临时文件路径
        const tempFilePaths = res.tempFilePaths
        
        // 上传图片
        const uploadPromises = tempFilePaths.map(filePath => {
            // 使用自定义的 request.upload 方法
            // 假设 request 已经挂载在 app 上，或者重新引入
            // 这里我们直接使用 require 引入的 catApi 中的 request (需要确认 catApi 是否暴露 request 或者直接引入 request)
            const request = require('../../../../utils/request');
            return request.upload('/api/upload', filePath);
        });

        Promise.all(uploadPromises).then(urls => {
            // 更新宠物图片列表
            const images = [...that.data.petInfo.images, ...urls]
            that.setData({
              [`petInfo.images`]: images
            })
            wx.showToast({
                title: '上传成功',
                icon: 'success'
            });
        }).catch(err => {
            console.error('图片上传失败', err);
            wx.showToast({
                title: '部分图片上传失败',
                icon: 'none'
            });
        });
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
      [`petInfo.images`]: images
    })
  },
  
  /**
   * 提交宠物信息
   */
  submitPet(e) {
    const { petInfo } = this.data
    
    // 表单验证
    if (!this.validateForm(petInfo)) {
      return
    }
    
    wx.showLoading({
      title: '保存中...'
    })
    
    // 准备提交的数据
    const submitData = {
        ...petInfo,
        // 如果后端需要字符串格式的图片列表
        // images: petInfo.images.join(',') 
        // 暂时假设后端接受数组，或者根据接口文档调整
    };
    
    // 区分添加和更新
    const request = petInfo.id ? catApi.updateCat(submitData) : catApi.addCat(submitData);
    
    request.then(res => {
        wx.hideLoading();
        
        // 保存操作日志
        this.saveOperationLog(petInfo.id ? 'edit' : 'add', petInfo.id || (res.data ? res.data.id : 0));
        
        wx.showToast({
            title: petInfo.id ? '宠物信息已更新' : '宠物信息已保存',
            icon: 'success'
        });
        
        // 上一页
        setTimeout(() => {
            wx.navigateBack();
        }, 1500);
    }).catch(err => {
        wx.hideLoading();
        console.error('保存失败:', err);
        wx.showToast({
            title: '保存失败',
            icon: 'error'
        });
    });
  },
  
  /**
   * 表单验证
   */
  validateForm(petInfo) {
    // 验证必填字段
    if (!petInfo.name.trim()) {
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      })
      return false
    }
    
    if (!petInfo.breed) {
      wx.showToast({
        title: '请选择宠物品种',
        icon: 'none'
      })
      return false
    }
    
    if (!petInfo.ageMonths || parseInt(petInfo.ageMonths) < 0 || parseInt(petInfo.ageMonths) > 240) {
      wx.showToast({
        title: '请输入有效的月龄（0-240个月）',
        icon: 'none'
      })
      return false
    }
    
    if (!petInfo.images || petInfo.images.length === 0) {
      wx.showToast({
        title: '请至少上传一张宠物图片',
        icon: 'none'
      })
      return false
    }
    
    // 验证健康状况描述
    if (petInfo.healthStatus === 'unhealthy' && !petInfo.healthIssues.trim()) {
      wx.showToast({
        title: '请描述宠物健康问题',
        icon: 'none'
      })
      return false
    }
    
    return true
  },
  
  /**
   * 重置表单
   */
  resetForm() {
    this.setData({
      petInfo: {
        name: '',
        breed: '',
        ageMonths: '',
        gender: 'male',
        color: '',
        description: '',
        personalities: [],
        healthStatus: 'healthy',
        healthIssues: '',
        images: [],
        isOnSale: true
      },
      breedIndex: 0
    })
  },
  
  /**
   * 批量上传宠物信息
   */
  batchUpload() {
    wx.showActionSheet({
      itemList: ['从Excel导入', '从CSV导入'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 从Excel导入
          this.importFromExcel()
        } else if (res.tapIndex === 1) {
          // 从CSV导入
          this.importFromCSV()
        }
      }
    })
  },
  
  /**
   * 从Excel导入
   */
  importFromExcel() {
    wx.showLoading({
      title: '导入中...'
    })
    
    // 模拟导入过程，实际应该调用API
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: 'Excel导入成功',
        icon: 'success'
      })
    }, 1500)
  },
  
  /**
   * 从CSV导入
   */
  importFromCSV() {
    wx.showLoading({
      title: '导入中...'
    })
    
    // 模拟导入过程，实际应该调用API
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: 'CSV导入成功',
        icon: 'success'
      })
    }, 1500)
  },
  
  /**
   * 保存操作日志
   */
  saveOperationLog(action, petId) {
    // 模拟保存操作日志，实际应该调用API
    console.log(`保存操作日志：${action} 宠物 ${petId}`)
  },
  
  /**
   * 上一页
   */
  navigateBack() {
    wx.navigateBack()
  }
})
