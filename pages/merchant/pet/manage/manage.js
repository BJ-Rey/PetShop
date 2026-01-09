// pages/merchant/pet/manage/manage.js
const auth = require('../../../../utils/auth');
const globalUtils = require('../../../../utils/globalUtils');
const catApi = require('../../../../api/catApi');
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
    // 展开的筛选器
    expandedFilter: '',
    // 筛选条件
    filter: {
      status: 'all', // all, published, unpublished
      isOrdered: 'all', // all, yes, no
      category: 'all',
      keyword: ''
    },
    // 批量操作
    selectedPetIds: [],
    isAllSelected: false,
    // 批量操作按钮状态
    batchActionsEnabled: false,
    // 分页参数
    page: 1,
    pageSize: 10,
    hasMore: true
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
        that.loadPets(true);
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
    if (this.data.pets.length > 0) {
        this.loadPets(true);
    }
  },

  /**
   * 加载宠物列表
   * @param {boolean} refresh 是否刷新
   */
  loadPets(refresh = false) {
    if (this.data.isLoading) return;
    if (!refresh && !this.data.hasMore) return;

    const page = refresh ? 1 : this.data.page;
    
    console.log('开始加载宠物列表, page:', page);
    this.setData({ isLoading: true, error: null });
    
    const params = {
        page: page,
        limit: this.data.pageSize,
        keyword: this.data.filter.keyword,
        status: this.data.filter.status === 'all' ? '' : this.data.filter.status,
        sortField: this.data.sortField,
        sortOrder: this.data.sortOrder
    };

    catApi.getCatList(params).then(res => {
        const newPets = res.data || [];
        const hasMore = newPets.length === this.data.pageSize;
        
        // 处理数据，确保字段匹配
        const formattedPets = newPets.map(pet => ({
            ...pet,
            status: pet.status || (pet.isOnSale ? 'published' : 'unpublished'), // 兼容不同字段名
            createdAt: pet.createdAt || pet.createTime // 兼容
        }));

        this.setData({
            pets: refresh ? formattedPets : [...this.data.pets, ...formattedPets],
            filteredPets: refresh ? formattedPets : [...this.data.pets, ...formattedPets], // 前端筛选逻辑暂时保留，或者完全依赖后端
            page: page + 1,
            hasMore: hasMore,
            isLoading: false
        });
    }).catch(err => {
        console.error('加载宠物列表失败:', err);
        logError('LoadPets', err);
        this.setData({
            isLoading: false,
            error: '加载失败，请稍后重试'
        });
        wx.showToast({
            title: '加载失败',
            icon: 'error'
        });
    });
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
   * 切换宠物状态（上下架）
   */
  togglePetStatus(e) {
    const petId = e.currentTarget.dataset.id
    const pets = this.data.pets
    const petIndex = pets.findIndex(pet => pet.id === petId)
    
    if (petIndex === -1) return
    
    const pet = pets[petIndex]
    const newStatus = pet.status === 'published' ? 'unpublished' : 'published'
    const statusText = newStatus === 'published' ? '上架' : '下架'
    
    // 显示确认模态框
    wx.showModal({
      title: '确认操作',
      content: `确定要将宠物「${pet.name}」${statusText}吗？`,
      confirmText: statusText,
      confirmColor: newStatus === 'published' ? '#07c160' : '#ff3b30',
      success: res => {
        if (res.confirm) {
          // 执行状态变更操作
          this.confirmToggleStatus(petId, petIndex, newStatus)
        }
      }
    })
  },
  
  /**
   * 确认切换宠物状态
   */
  confirmToggleStatus(petId, petIndex, newStatus) {
    const pets = this.data.pets
    
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
    globalUtils.safeNavigate(`/pages/pet/add/add?id=${petId}`)
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
   * 切换排序方式
   */
  changeSort(e) {
    const field = e.currentTarget.dataset.field
    const currentSortField = this.data.sortField
    const currentSortOrder = this.data.sortOrder
    
    let newSortOrder = 'desc'
    if (field === currentSortField) {
      newSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc'
    }
    
    this.setData({
      sortField: field,
      sortOrder: newSortOrder
    })
    this.loadPets(true)
  },

  /**
   * 跳转到宠物详情页
   */
  viewPetDetail(e) {
    const petId = e.currentTarget.dataset.id
    globalUtils.safeNavigate(`/pages/merchant/pet/detail/detail?id=${petId}`)
  },

  /**
   * 筛选宠物列表
   */
  filterPets() {
    // 简单的本地筛选逻辑，主要还是靠API
    // 如果需要后端筛选，应调用 loadPets(true)
    this.loadPets(true);
  },
  
  /**
   * 搜索宠物
   */
  onSearch(e) {
    const keyword = e.detail.value
    this.setData({
      'filter.keyword': keyword
    })
    this.loadPets(true)
  },
  
  /**
   * 展开/折叠筛选器
   */
  toggleFilter(e) {
    const type = e.currentTarget.dataset.type
    const currentExpanded = this.data.expandedFilter
    this.setData({
      expandedFilter: currentExpanded === type ? '' : type
    })
  },
  
  /**
   * 切换筛选条件
   */
  changeFilter(e) {
    const type = e.currentTarget.dataset.type
    const value = e.currentTarget.dataset.value
    this.setData({
      [`filter.${type}`]: value,
      expandedFilter: '' // 选择后关闭筛选器
    })
    this.loadPets(true)
  },
  
  /**
   * 单个宠物选择
   */
  toggleSelect(e) {
    const petId = e.currentTarget.dataset.id
    const selectedPetIds = [...this.data.selectedPetIds]
    const index = selectedPetIds.indexOf(petId)
    
    if (index === -1) {
      // 添加到已选列表
      selectedPetIds.push(petId)
    } else {
      // 从已选列表移除
      selectedPetIds.splice(index, 1)
    }
    
    this.setData({
      selectedPetIds,
      isAllSelected: selectedPetIds.length === this.data.pets.length
    })
  },
  
  /**
   * 全选/取消全选
   */
  toggleAllSelect(e) {
    const isAllSelected = e.detail.value.includes('all')
    const selectedPetIds = isAllSelected ? this.data.pets.map(pet => pet.id) : []
    
    this.setData({
      isAllSelected,
      selectedPetIds
    })
  },
  
  /**
   * 批量上架
   */
  batchPublish() {
    const selectedPetIds = this.data.selectedPetIds
    if (selectedPetIds.length === 0) {
      wx.showToast({
        title: '请选择要上架的宠物',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量上架',
      content: `确定要将选中的${selectedPetIds.length}个宠物上架吗？`,
      confirmText: '上架',
      confirmColor: '#07c160',
      success: res => {
        if (res.confirm) {
          this.confirmBatchPublish(selectedPetIds)
        }
      }
    })
  },
  
  /**
   * 确认批量上架
   */
  confirmBatchPublish(selectedPetIds) {
    const pets = this.data.pets
    
    wx.showLoading({
      title: '上架中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedPets = pets.map(pet => {
        if (selectedPetIds.includes(pet.id)) {
          return {
            ...pet,
            status: 'published',
            updatedAt: new Date().toISOString()
          }
        }
        return pet
      })
      
      this.setData({
        pets: updatedPets,
        selectedPetIds: [],
        isAllSelected: false
      })
      
      wx.showToast({
        title: '批量上架成功',
        icon: 'success'
      })
    }, 1000)
  },
  
  /**
   * 批量下架
   */
  batchUnpublish() {
    const selectedPetIds = this.data.selectedPetIds
    if (selectedPetIds.length === 0) {
      wx.showToast({
        title: '请选择要下架的宠物',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量下架',
      content: `确定要将选中的${selectedPetIds.length}个宠物下架吗？`,
      confirmText: '下架',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.confirmBatchUnpublish(selectedPetIds)
        }
      }
    })
  },
  
  /**
   * 确认批量下架
   */
  confirmBatchUnpublish(selectedPetIds) {
    const pets = this.data.pets
    
    wx.showLoading({
      title: '下架中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedPets = pets.map(pet => {
        if (selectedPetIds.includes(pet.id)) {
          return {
            ...pet,
            status: 'unpublished',
            updatedAt: new Date().toISOString()
          }
        }
        return pet
      })
      
      this.setData({
        pets: updatedPets,
        selectedPetIds: [],
        isAllSelected: false
      })
      
      wx.showToast({
        title: '批量下架成功',
        icon: 'success'
      })
    }, 1000)
  },
  
  /**
   * 批量删除
   */
  batchDelete() {
    const selectedPetIds = this.data.selectedPetIds
    if (selectedPetIds.length === 0) {
      wx.showToast({
        title: '请选择要删除的宠物',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量删除',
      content: `确定要删除选中的${selectedPetIds.length}个宠物吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.confirmBatchDelete(selectedPetIds)
        }
      }
    })
  },
  
  /**
   * 确认批量删除
   */
  confirmBatchDelete(selectedPetIds) {
    const pets = this.data.pets
    
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
      })
      
      wx.showToast({
        title: '批量删除成功',
        icon: 'success'
      })
    }, 1000)
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
