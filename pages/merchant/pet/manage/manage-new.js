// pages/merchant/pet/manage/manage-new.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 宠物列表数据
    pets: [],
    // 加载状态
    isLoading: false,
    // 搜索关键词
    searchKeyword: '',
    // 状态筛选
    statusOptions: [
      { id: 'all', name: '全部' },
      { id: 'published', name: '已上架' },
      { id: 'unpublished', name: '已下架' }
    ],
    selectedStatusIndex: 0,
    // 排序配置
    sortField: 'sort', // 排序字段
    sortOrder: 'desc', // 排序顺序，desc降序，asc升序
    // 删除确认弹窗
    showDeleteModal: false,
    deletePetId: null,
    deletePetName: '',
    // 分页配置
    currentPage: 1,
    pageSize: 10,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('onLoad called')
    try {
      // 检查登录状态
      console.log('Checking login status...')
      const isLoggedIn = app.checkLogin()
      console.log('Login check result:', isLoggedIn)
      
      if (!isLoggedIn) {
        console.log('User not logged in, returning...')
        return
      }
      
      // 检查权限
      console.log('Checking permission...')
      const hasPermission = app.checkPermission('manage_pets')
      console.log('Permission check result:', hasPermission)
      
      if (!hasPermission) {
        wx.showToast({
          title: '您没有权限访问此页面',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        return
      }
      
      // 初始化数据
      console.log('Initializing data...')
      this.initData()
    } catch (error) {
      console.error('Error in onLoad:', error)
      wx.showToast({
        title: '页面加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('onShow called')
    // 重新加载宠物列表，确保数据最新
    this.loadPets(true)
  },

  /**
   * 初始化数据
   */
  initData() {
    this.loadPets(true)
  },

  /**
   * 加载宠物列表
   * @param {boolean} reset 是否重置分页
   */
  loadPets(reset = false) {
    // 重置分页
    if (reset) {
      this.setData({
        currentPage: 1,
        pets: [],
        hasMore: true
      })
    }
    
    // 如果没有更多数据，不再加载
    if (!this.data.hasMore) {
      return
    }
    
    this.setData({ isLoading: true })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      // 模拟宠物数据
    const mockPets = [
      {
        id: 1,
        name: '小黑',
        breed: '英国短毛猫',
        age: '2岁',
        gender: 'male',
        color: '蓝色',
        avatar: 'https://example.com/pet1.jpg',
        status: 'published', // published: 上架, unpublished: 下架
        sort: 100,
        price: 3000,
        deposit: 1000,
        createdAt: '2025-12-18T10:00:00Z',
        updatedAt: '2025-12-18T10:00:00Z'
      },
      {
        id: 2,
        name: '雪球',
        breed: '英短',
        age: '1.5岁',
        gender: 'female',
        color: '白色',
        avatar: 'https://example.com/pet2.jpg',
        status: 'published',
        sort: 90,
        price: 2500,
        deposit: 750,
        createdAt: '2025-12-17T14:30:00Z',
        updatedAt: '2025-12-17T14:30:00Z'
      },
      {
        id: 3,
        name: '可乐',
        breed: '加菲猫',
        age: '2岁',
        gender: 'male',
        color: '红虎斑',
        avatar: 'https://example.com/pet3.jpg',
        status: 'unpublished',
        sort: 80,
        price: 2800,
        deposit: 840,
        createdAt: '2025-12-16T09:15:00Z',
        updatedAt: '2025-12-16T09:15:00Z'
      },
      {
        id: 4,
        name: '咪咪',
        breed: '布偶猫',
        age: '1岁',
        gender: 'female',
        color: '白色',
        avatar: 'https://example.com/pet4.jpg',
        status: 'published',
        sort: 70,
        price: 3500,
        deposit: 1050,
        createdAt: '2025-12-15T16:45:00Z',
        updatedAt: '2025-12-15T16:45:00Z'
      },
      {
        id: 5,
        name: '旺财',
        breed: '中华田园猫',
        age: '3岁',
        gender: 'male',
        color: '狸花',
        avatar: 'https://example.com/pet5.jpg',
        status: 'published',
        sort: 60,
        price: 1500,
        deposit: 450,
        createdAt: '2025-12-14T11:20:00Z',
        updatedAt: '2025-12-14T11:20:00Z'
      },
      {
        id: 6,
        name: '橙子',
        breed: '橘猫',
        age: '1岁',
        gender: 'male',
        color: '橙色',
        avatar: 'https://example.com/pet6.jpg',
        status: 'unpublished',
        sort: 50,
        price: 2000,
        deposit: 600,
        createdAt: '2025-12-13T13:40:00Z',
        updatedAt: '2025-12-13T13:40:00Z'
      }
    ]
      
      // 模拟分页
      const start = (this.data.currentPage - 1) * this.data.pageSize
      const end = start + this.data.pageSize
      let paginatedPets = mockPets.slice(start, end)
      
      // 从本地存储获取更新后的宠物数据
      const updatedPets = wx.getStorageSync('updatedPets') || []
      
      // 合并更新的数据到模拟数据中
      if (updatedPets.length > 0) {
        paginatedPets = paginatedPets.map(pet => {
          const updatedPet = updatedPets.find(u => u.id === pet.id)
          return updatedPet || pet
        })
      }
      
      // 合并数据
      const finalPets = [...this.data.pets, ...paginatedPets]
      
      this.setData({
        pets: finalPets,
        isLoading: false,
        currentPage: this.data.currentPage + 1,
        hasMore: paginatedPets.length === this.data.pageSize
      })
      
      // 排序宠物列表
      this.sortPets()
    }, 1000)
  },

  /**
   * 排序宠物列表
   */
  sortPets() {
    const { sortField, sortOrder, pets } = this.data
    
    // 排序宠物列表
    const sortedPets = [...pets].sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortOrder === 'asc' ? -1 : 1
      }
      if (a[sortField] > b[sortField]) {
        return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })
    
    this.setData({
      pets: sortedPets
    })
  },

  /**
   * 切换宠物上下架状态
   */
  togglePetStatus(e) {
    const petId = e.currentTarget.dataset.id
    const currentStatus = e.currentTarget.dataset.status
    const newStatus = currentStatus === 'published' ? 'unpublished' : 'published'
    const statusText = newStatus === 'published' ? '上架' : '下架'
    
    // 显示加载状态
    wx.showLoading({
      title: `${statusText}中...`
    })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedPets = this.data.pets.map(pet => {
        if (pet.id === petId) {
          return {
            ...pet,
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        }
        return pet
      })
      
      this.setData({
        pets: updatedPets
      })
      
      // 显示成功提示
      wx.showToast({
        title: `${statusText}成功`,
        icon: 'success'
      })
    }, 1000)
  },

  /**
   * 跳转到添加宠物页面
   */
  navigateToAddPet: function() {
    // 简单的防抖处理，防止多次点击
    if (this._isNavigating) return;
    this._isNavigating = true;
    
    // 1秒后重置导航状态
    setTimeout(() => {
      this._isNavigating = false;
    }, 1000);

    const url = '/pages/pet/add/add';
    console.log('[Merchant] Navigating to add pet:', url);

    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error('[Merchant] Failed to navigate to add pet:', err);
        wx.showToast({
          title: '无法打开页面，请重试',
          icon: 'none'
        });
        this._isNavigating = false;
      }
    })
  },

  /**
   * 跳转到编辑宠物页面
   */
  navigateToEditPet(e) {
    const petId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/pet/edit/edit?id=${petId}`
    })
  },

  /**
   * 跳转到宠物详情页
   */
  navigateToPetDetail: function(e) {
    // 简单的防抖处理
    if (this._isNavigating) return;
    this._isNavigating = true;
    
    // 1秒后重置导航状态
    setTimeout(() => {
      this._isNavigating = false;
    }, 1000);

    const petId = e.currentTarget.dataset.id
    const url = `/pages/merchant/pet/detail/detail?id=${petId}`;
    
    console.log('[Merchant] Navigating to pet detail:', url);
    
    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error('[Merchant] Failed to navigate to pet detail:', err);
        wx.showToast({
          title: '无法打开详情页',
          icon: 'none'
        });
        this._isNavigating = false;
      }
    })
  },

  /**
   * 显示删除确认弹窗
   */
  showDeleteConfirm(e) {
    const petId = e.currentTarget.dataset.id
    const petName = e.currentTarget.dataset.name
    
    this.setData({
      showDeleteModal: true,
      deletePetId: petId,
      deletePetName: petName
    })
  },

  /**
   * 隐藏删除确认弹窗
   */
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deletePetId: null,
      deletePetName: ''
    })
  },

  /**
   * 确认删除宠物
   */
  confirmDeletePet() {
    const petId = this.data.deletePetId
    
    // 显示加载状态
    wx.showLoading({
      title: '删除中...'
    })
    
    // 模拟API请求，实际应该调用后端API
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedPets = this.data.pets.filter(pet => pet.id !== petId)
      
      this.setData({
        pets: updatedPets,
        showDeleteModal: false,
        deletePetId: null,
        deletePetName: ''
      })
      
      // 显示成功提示
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    }, 1000)
  },

  /**
   * 切换排序字段
   */
  changeSortField(e) {
    const field = e.currentTarget.dataset.field
    const currentSortField = this.data.sortField
    const currentSortOrder = this.data.sortOrder
    
    let newSortOrder = 'desc'
    if (field === currentSortField) {
      // 如果点击的是当前排序字段，切换排序顺序
      newSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc'
    }
    
    this.setData({
      sortField: field,
      sortOrder: newSortOrder
    })
    
    // 重新排序宠物列表
    this.sortPets()
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({
      searchKeyword: keyword
    })
    
    // 搜索防抖，500ms后执行搜索
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    
    this.searchTimeout = setTimeout(() => {
      this.loadPets(true)
    }, 500)
  },

  /**
   * 清除搜索
   */
  clearSearch() {
    this.setData({
      searchKeyword: ''
    })
    this.loadPets(true)
  },

  /**
   * 状态筛选变化
   */
  onStatusChange(e) {
    const index = e.detail.value
    this.setData({
      selectedStatusIndex: index
    })
    this.loadPets(true)
  },

  /**
   * 排序输入变化
   */
  onSortInput(e) {
    const petId = e.currentTarget.dataset.id
    const sortValue = parseInt(e.detail.value) || 0
    
    // 更新本地数据
    const updatedPets = this.data.pets.map(pet => {
      if (pet.id === petId) {
        return {
          ...pet,
          sort: sortValue,
          updatedAt: new Date().toISOString()
        }
      }
      return pet
    })
    
    this.setData({
      pets: updatedPets
    })
    
    // 重新排序
    this.sortPets()
    
    // 模拟保存到服务器
    this.saveSortToServer(petId, sortValue)
  },

  /**
   * 保存排序到服务器
   */
  saveSortToServer(petId, sortValue) {
    // 模拟API请求，实际应该调用后端API
    // 这里可以添加防抖处理，避免频繁请求
  },

  /**
   * 格式化日期
   * @param {string} dateString ISO格式的日期字符串
   * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
   */
  formatDate(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新，重新加载数据
    this.loadPets(true)
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 上拉加载更多
    this.loadPets()
  },

  /**
   * 返回上一级页面
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1,
      fail: (error) => {
        console.error('Navigate back error:', error);
        // 降级处理，跳转到商家控制台首页
        wx.reLaunch({
          url: '/pages/merchant/dashboard/dashboard'
        });
      }
    });
  }
})