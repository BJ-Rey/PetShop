// pages/merchant/pet/detail/detail.js
const app = getApp()

Page({
  data: {
    petId: null,
    pet: null,
    isLoading: true,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    
    // 价格修改相关
    showPriceModal: false,
    newPrice: 0,
    newDeposit: 0,
    depositPercentage: 0.3,
    
    // 状态管理相关
    statusOptions: ['available', 'booked', 'sold', 'off_shelf'],
    statusLabels: ['上架中', '已预订', '已售出', '已下架'],
    statusIndex: 0
  },

  onLoad(options) {
    const petId = options.id
    this.setData({ petId })
    
    // 权限验证
    if (!this.checkMerchantPermission()) {
      return
    }
    
    this.loadPetDetail()
  },

  onShow() {
    // 每次显示时刷新数据，确保编辑后数据同步
    if (this.data.petId) {
      this.loadPetDetail()
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadPetDetail();
    
    // 模拟等待数据加载完成
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'none'
      });
    }, 800);
  },

  /**
   * 商家权限验证
   */
  checkMerchantPermission() {
    const isMerchant = app.globalData.isMerchant
    if (!isMerchant) {
      wx.showToast({
        title: '无权访问此页面',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
      return false
    }
    return true
  },

  /**
   * 加载宠物详情
   */
  loadPetDetail() {
    this.setData({ isLoading: true })
    const petId = this.data.petId
    
    // 模拟API请求
    setTimeout(() => {
      // 优先从本地存储获取最新数据（模拟数据库）
      let updatedPets = wx.getStorageSync('updatedPets') || []
      let pet = updatedPets.find(p => p.id == petId)
      
      if (!pet) {
        // 如果本地没有更新记录，则使用模拟数据
        // 这里为了演示，直接构造一个数据对象
        // 实际开发中应调用后端接口 /api/merchant/pet/{id}
        pet = {
          id: petId,
          name: '小黑',
          breed: '金毛犬',
          age: '2岁',
          price: 3000,
          gender: 'male',
          color: '黄色',
          description: '这是一只非常活泼可爱的金毛犬，喜欢玩耍，对人友善。',
          images: [
            'https://example.com/pet1.jpg',
            'https://example.com/pet1_1.jpg'
          ],
          hasDisease: false,
          diseases: [],
          vaccineRecords: [
            { id: 1, name: '犬瘟热疫苗', date: '2025-01-15', institution: '爱心宠物医院' }
          ],
          dewormingRecords: [],
          status: 'available',
          isOrdered: false,
          rating: 4.8,
          sales: 123
        }
      }
      
      // 计算定金和格式化
      this.processPetData(pet)
      
      // 设置当前状态索引
      const statusIndex = this.data.statusOptions.indexOf(pet.status)
      
      this.setData({
        pet: pet,
        statusIndex: statusIndex >= 0 ? statusIndex : 0,
        isLoading: false
      })
    }, 500)
  },

  /**
   * 处理宠物数据格式
   */
  processPetData(pet) {
    // 格式化价格
    pet.priceStr = parseFloat(pet.price).toFixed(2)
    // 计算定金
    pet.deposit = parseFloat((pet.price * 0.3).toFixed(2))
    
    // 状态文本
    if (pet.status === 'booked' || pet.isOrdered) {
        pet.statusText = '已定'
        pet.balanceStatusText = '尾款待支付'
    } else if (pet.status === 'sold') {
        pet.statusText = '已售出'
    } else if (pet.status === 'off_shelf') {
        pet.statusText = '已下架'
    } else {
        pet.statusText = '未定'
    }
  },

  /**
   * 显示修改价格弹窗
   */
  showPriceModal() {
    const { pet, depositPercentage } = this.data
    this.setData({
      showPriceModal: true,
      newPrice: pet.price,
      newDeposit: parseFloat((pet.price * depositPercentage).toFixed(2))
    })
  },

  /**
   * 隐藏修改价格弹窗
   */
  hidePriceModal() {
    this.setData({
      showPriceModal: false
    })
  },

  /**
   * 监听价格输入
   */
  onPriceInput(e) {
    const price = parseFloat(e.detail.value) || 0
    const { depositPercentage } = this.data
    
    this.setData({
      newPrice: price,
      newDeposit: parseFloat((price * depositPercentage).toFixed(2))
    })
  },

  /**
   * 确认修改价格
   */
  confirmUpdatePrice() {
    const { newPrice, pet } = this.data
    
    if (newPrice <= 0) {
      wx.showToast({
        title: '价格必须大于0',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({ title: '保存中...' })
    
    // 模拟API调用
    setTimeout(() => {
      // 更新本地数据
      pet.price = newPrice
      this.processPetData(pet)
      
      // 同步到本地存储以便列表页也能看到更新（模拟后端）
      let updatedPets = wx.getStorageSync('updatedPets') || []
      const index = updatedPets.findIndex(p => p.id == pet.id)
      if (index > -1) {
        updatedPets[index] = pet
      } else {
        updatedPets.push(pet)
      }
      wx.setStorageSync('updatedPets', updatedPets)
      
      this.setData({
        pet: pet,
        showPriceModal: false
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '修改成功',
        icon: 'success'
      })
    }, 500)
  },

  /**
   * 跳转到编辑页面
   */
  navigateToEdit() {
    wx.navigateTo({
      url: `/pages/merchant/pet/edit/edit?id=${this.data.petId}`
    })
  },

  /**
   * 状态改变
   */
  onStatusChange(e) {
    const index = e.detail.value
    const status = this.data.statusOptions[index]
    const pet = this.data.pet
    
    // 更新状态
    pet.status = status
    if (status === 'booked') {
        pet.isOrdered = true
    } else {
        pet.isOrdered = false
    }
    
    this.processPetData(pet)
    
    this.setData({
      statusIndex: index,
      pet: pet
    })
    
    // 模拟保存
    wx.showToast({
      title: '状态更新成功',
      icon: 'success'
    })
    
    // 同步到存储
    let updatedPets = wx.getStorageSync('updatedPets') || []
    const idx = updatedPets.findIndex(p => p.id == pet.id)
    if (idx > -1) {
      updatedPets[idx] = pet
    } else {
      updatedPets.push(pet)
    }
    wx.setStorageSync('updatedPets', updatedPets)
  },

  /**
   * 跳转到促销设置
   */
  navigateToPromotion() {
    wx.navigateTo({
      url: `/pages/merchant/setting/promotion/promotion` // 假设有这个页面，或者跳转到统一的促销设置
    })
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack()
  }
})
