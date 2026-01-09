// pages/merchant/pet/manage/manage.js
const auth = require('../../../../utils/auth');
const globalUtils = require('../../../../utils/globalUtils');
const { logError } = globalUtils;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pets: [],
    filteredPets: [],
    isLoading: false,
    error: null, // 错误信息
    editingPetId: null, // 当前正在编辑的宠物ID
    sortField: 'createdAt', // 排序字段
    sortOrder: 'desc', // 排序顺序，desc降序，asc升序
    // 筛选条件
    filters: {
      status: 'all', // all, published, unpublished
      isOrdered: 'all', // all, yes, no
      category: 'all',
      gender: 'all',
      ageRange: 'all',
      personality: 'all',
      keyword: ''
    },
    // 批量操作
    selectedPetIds: [],
    isAllSelected: false,
    // 批量操作按钮状态
    batchActionsEnabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 使用权限管理工具检查登录状态和商家角色权限
    const that = this;
    auth.permissionInterceptor('merchant', 
      function() {
        // 登录且有权限，加载宠物列表
        that.loadPets();
      },
      function() {
        // 登录失败或无权限，上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    );
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重新加载宠物列表，确保数据最新
    this.loadPets()
  },

  /**
   * 加载宠物列表
   */
  loadPets() {
    console.log('开始加载宠物列表');
    this.setData({ isLoading: true, error: null })
    
    try {
      // 保存this上下文
      const that = this;
      // 模拟API请求，实际应该调用后端API
      setTimeout(() => {
        try {
          // 模拟API请求成功，返回宠物数据
          const pets = [
            {
              id: 1,
              name: '小黑',
              breed: '金毛犬',
              age: '2岁',
              gender: 'male',
              color: '黄色',
              avatar: 'https://example.com/pet1.jpg',
              status: 'published', // published: 上架, unpublished: 下架
              isOrdered: true, // 是否有人下定
              category: '狗',
              personality: '温顺',
              sort: 1,
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
              isOrdered: false,
              category: '猫',
              personality: '活泼',
              sort: 2,
              createdAt: '2025-12-17T14:30:00Z',
              updatedAt: '2025-12-17T14:30:00Z'
            },
            {
              id: 3,
              name: '可乐',
              breed: '柯基',
              age: '2岁',
              gender: 'male',
              color: '黄色',
              avatar: 'https://example.com/pet3.jpg',
              status: 'unpublished',
              isOrdered: false,
              category: '狗',
              personality: '调皮',
              sort: 3,
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
              isOrdered: true,
              category: '猫',
              personality: '安静',
              sort: 4,
              createdAt: '2025-12-15T16:45:00Z',
              updatedAt: '2025-12-15T16:45:00Z'
            }
          ]
          
          // 根据排序字段和顺序排序
          const sortedPets = that.sortPets(pets)
          
          that.setData({
            pets: sortedPets,
            isLoading: false,
            error: null
          }, () => {
            // 初始筛选
            that.filterPets()
          })
        } catch (error) {
          console.error('处理宠物数据时出错:', error);
          logError('ProcessPetData', error);
          that.setData({
            isLoading: false,
            error: '数据处理失败，请稍后重试',
            pets: [],
            filteredPets: []
          });
          wx.showToast({
            title: '数据处理失败',
            icon: 'error',
            duration: 2000
          });
        }
      }, 1000)
      
      // 模拟API请求失败情况（可选：取消注释下面的代码来测试错误处理）
      // setTimeout(() => {
      //   throw new Error('API请求失败');
      // }, 500);
      
    } catch (error) {
      console.error('加载宠物列表时出错:', error);
      logError('LoadPets', error);
      this.setData({
        isLoading: false,
        error: '加载失败，请检查网络连接',
        pets: [],
        filteredPets: []
      });
      wx.showToast({
        title: '加载失败，请检查网络',
        icon: 'error',
        duration: 2000
      });
    }
  },

  /**
   * 排序宠物列表
   */
  sortPets(pets) {
    const { sortField, sortOrder } = this.data
    
    return [...pets].sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortOrder === 'asc' ? -1 : 1
      }
      if (a[sortField] > b[sortField]) {
        return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })
  },

  /**
   * 切换宠物上下架状态
   */
  togglePetStatus(e) {
    const petId = e.currentTarget.dataset.id
    const pets = this.data.pets
    const petIndex = pets.findIndex(pet => pet.id === petId)
    
    if (petIndex === -1) return
    
    const pet = pets[petIndex]
    const newStatus = pet.status === 'published' ? 'unpublished' : 'published'
    
    // 模拟API请求，实际应该调用后端API
    wx.showLoading({
      title: '更新中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedPets = [...pets]
      updatedPets[petIndex].status = newStatus
      updatedPets[petIndex].updatedAt = new Date().toISOString()
      
      this.setData({
        pets: updatedPets
      })
      
      wx.showToast({
        title: newStatus === 'published' ? '上架成功' : '下架成功',
        icon: 'success'
      })
    }, 1000)
  },

  /**
   * 跳转到编辑宠物页面
   */
  editPet(e) {
    const petId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/pet/add/add?id=${petId}`
    })
  },

  /**
   * 删除宠物
   */
  deletePet(e) {
    const petId = e.currentTarget.dataset.id
    const petName = e.currentTarget.dataset.name
    
    // 显示确认对话框
    wx.showModal({
      title: '确认删除',
      content: `确定要删除宠物「${petName}」吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          // 执行删除操作
          this.confirmDeletePet(petId)
        }
      }
    })
  },

  /**
   * 确认删除宠物
   */
  confirmDeletePet(petId) {
    const pets = this.data.pets
    
    // 模拟API请求，实际应该调用后端API
    wx.showLoading({
      title: '删除中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedPets = pets.filter(pet => pet.id !== petId)
      
      this.setData({
        pets: updatedPets
      })
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    }, 1000)
  },

  /**
   * 跳转到添加宠物页面
   */
  addPet() {
    wx.navigateTo({
      url: '/pages/pet/add/add'
    })
  },

  /**
   * 开始编辑宠物排序
   */
  startEditSort(e) {
    const petId = e.currentTarget.dataset.id
    this.setData({
      editingPetId: petId
    })
  },

  /**
   * 更新宠物排序
   */
  updateSort(e) {
    const petId = this.data.editingPetId
    const sortValue = parseInt(e.detail.value) || 0
    
    if (!petId) return
    
    // 模拟API请求，实际应该调用后端API
    wx.showLoading({
      title: '更新中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const pets = this.data.pets
      const updatedPets = pets.map(pet => {
        if (pet.id === petId) {
          return {
            ...pet,
            sort: sortValue,
            updatedAt: new Date().toISOString()
          }
        }
        return pet
      })
      
      // 重新排序
      const sortedPets = this.sortPets(updatedPets)
      
      this.setData({
        pets: sortedPets,
        editingPetId: null
      })
      
      wx.showToast({
        title: '排序更新成功',
        icon: 'success'
      })
    }, 1000)
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
   * 取消编辑排序
   */
  cancelEditSort() {
    this.setData({
      editingPetId: null
    })
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
    const sortedPets = this.sortPets(this.data.pets)
    this.setData({
      pets: sortedPets
    })
  },

  /**
   * 跳转到宠物详情页
   */
  viewPetDetail(e) {
    const petId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/pet/detail/detail?id=${petId}`
    })
  },

  /**
   * 筛选宠物列表
   */
  filterPets() {
    const { pets, filters } = this.data
    
    let filteredPets = [...pets]
    
    // 按状态筛选
    if (filters.status !== 'all') {
      filteredPets = filteredPets.filter(pet => pet.status === filters.status)
    }
    
    // 按是否有人下定筛选
    if (filters.isOrdered !== 'all') {
      const isOrdered = filters.isOrdered === 'yes'
      filteredPets = filteredPets.filter(pet => pet.isOrdered === isOrdered)
    }
    
    // 按品类筛选
    if (filters.category !== 'all') {
      filteredPets = filteredPets.filter(pet => pet.category === filters.category)
    }
    
    // 按性别筛选
    if (filters.gender !== 'all') {
      filteredPets = filteredPets.filter(pet => pet.gender === filters.gender)
    }
    
    // 按性格筛选
    if (filters.personality !== 'all') {
      filteredPets = filteredPets.filter(pet => pet.personality === filters.personality)
    }
    
    // 按关键词搜索
    if (filters.keyword.trim()) {
      const keyword = filters.keyword.trim().toLowerCase()
      filteredPets = filteredPets.filter(pet => 
        pet.name.toLowerCase().includes(keyword) ||
        pet.breed.toLowerCase().includes(keyword) ||
        pet.age.toLowerCase().includes(keyword)
      )
    }
    
    this.setData({
      filteredPets
    })
  },
  
  /**
   * 筛选条件变化处理
   */
  onFilterChange(e) {
    const { type, value } = e.currentTarget.dataset
    
    this.setData({
      [`filters.${type}`]: value
    }, () => {
      this.filterPets()
    })
  },
  
  /**
   * 关键词输入处理
   */
  onKeywordInput(e) {
    const keyword = e.detail.value
    
    this.setData({
      'filters.keyword': keyword
    }, () => {
      this.filterPets()
    })
  },
  
  /**
   * 选择宠物
   */
  selectPet(e) {
    const petId = e.currentTarget.dataset.id
    const { selectedPetIds } = this.data
    
    let newSelectedPetIds
    if (selectedPetIds.includes(petId)) {
      // 取消选择
      newSelectedPetIds = selectedPetIds.filter(id => id !== petId)
    } else {
      // 添加选择
      newSelectedPetIds = [...selectedPetIds, petId]
    }
    
    this.setData({
      selectedPetIds: newSelectedPetIds,
      isAllSelected: newSelectedPetIds.length === this.data.filteredPets.length
    }, () => {
      this.updateBatchActionsStatus()
    })
  },
  
  /**
   * 全选/取消全选
   */
  selectAllPets() {
    const { isAllSelected, filteredPets } = this.data
    const newIsAllSelected = !isAllSelected
    
    const newSelectedPetIds = newIsAllSelected 
      ? filteredPets.map(pet => pet.id)
      : []
    
    this.setData({
      isAllSelected: newIsAllSelected,
      selectedPetIds: newSelectedPetIds
    }, () => {
      this.updateBatchActionsStatus()
    })
  },
  
  /**
   * 更新批量操作按钮状态
   */
  updateBatchActionsStatus() {
    const { selectedPetIds } = this.data
    this.setData({
      batchActionsEnabled: selectedPetIds.length > 0
    })
  },
  
  /**
   * 批量上下架
   */
  batchToggleStatus() {
    const { selectedPetIds, pets } = this.data
    
    wx.showModal({
      title: '确认批量操作',
      content: `确定要更新选中的 ${selectedPetIds.length} 个宠物的状态吗？`,
      confirmText: '确定',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '更新中...'
          })
          
          setTimeout(() => {
            wx.hideLoading()
            
            // 更新本地数据
            const updatedPets = pets.map(pet => {
              if (selectedPetIds.includes(pet.id)) {
                return {
                  ...pet,
                  status: pet.status === 'published' ? 'unpublished' : 'published',
                  updatedAt: new Date().toISOString()
                }
              }
              return pet
            })
            
            // 重新排序
            const sortedPets = this.sortPets(updatedPets)
            
            this.setData({
              pets: sortedPets,
              selectedPetIds: [],
              isAllSelected: false
            }, () => {
              this.filterPets()
              this.updateBatchActionsStatus()
              
              wx.showToast({
                title: '批量操作成功',
                icon: 'success'
              })
            })
          }, 1000)
        }
      }
    })
  },
  
  /**
   * 批量删除
   */
  batchDelete() {
    const { selectedPetIds, pets } = this.data
    
    wx.showModal({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedPetIds.length} 个宠物吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ff3b30',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          })
          
          setTimeout(() => {
            wx.hideLoading()
            
            // 更新本地数据
            const updatedPets = pets.filter(pet => !selectedPetIds.includes(pet.id))
            
            this.setData({
              pets: updatedPets,
              selectedPetIds: [],
              isAllSelected: false
            }, () => {
              this.filterPets()
              this.updateBatchActionsStatus()
              
              wx.showToast({
                title: '批量删除成功',
                icon: 'success'
              })
            })
          }, 1000)
        }
      }
    })
  },

  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新，重新加载数据
    this.loadPets()
    wx.stopPullDownRefresh()
  }
})
