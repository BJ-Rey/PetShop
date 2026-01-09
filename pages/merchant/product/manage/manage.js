// pages/merchant/product/manage/manage.js
const app = getApp()
const productApi = require('../../../../api/productApi');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    products: [],
    isLoading: false,
    // 筛选条件
    filter: {
      status: 'all', // all, published, unpublished
      category: 'all',
      keyword: ''
    },
    // 展开的筛选器
    expandedFilter: '',
    // 排序条件
    sortField: 'createdAt',
    sortOrder: 'desc',
    // 批量操作
    selectedProductIds: [],
    isAllSelected: false,
    
    // 更多批量操作
    showMoreActions: false,
    
    // 商品分类列表
    categories: [
      { id: 'food', name: '食品' },
      { id: 'toys', name: '玩具' },
      { id: 'medicine', name: '药品' },
      { id: 'daily', name: '日用品' },
      { id: 'clothing', name: '服饰' },
      { id: 'grooming', name: '洗护' },
      { id: 'equipment', name: '器材' }
    ],
    
    // 批量更新分类弹窗
    showUpdateCategoryModal: false,
    selectedUpdateCategoryIndex: 0,
    selectedUpdateCategory: '食品',
    
    // 批量更新价格弹窗
    showUpdatePriceModal: false,
    priceUpdateType: 'percentage',
    priceUpdateValue: '',
    
    // 批量更新库存弹窗
    showUpdateStockModal: false,
    stockUpdateType: 'set',
    stockUpdateValue: ''
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
    
    // 加载商品列表
    this.loadProducts()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 重新加载商品列表
    this.loadProducts()
  },

  /**
   * 加载商品列表
   */
  loadProducts() {
    this.setData({ isLoading: true })
    
    // 保存this上下文
    const that = this;
    
    const params = {
        keyword: this.data.filter.keyword,
        category: this.data.filter.category === 'all' ? '' : this.data.filter.category,
        status: this.data.filter.status === 'all' ? '' : this.data.filter.status,
        sortField: this.data.sortField,
        sortOrder: this.data.sortOrder
    };

    productApi.getProductList(params).then(res => {
        const products = res.data || [];
        // 格式化数据
        const formattedProducts = products.map(p => ({
            ...p,
            status: p.status || (p.isOnSale ? 'published' : 'unpublished')
        }));
        
        that.setData({
            products: formattedProducts,
            isLoading: false
        });
    }).catch(err => {
        console.error('加载商品列表失败:', err);
        that.setData({ isLoading: false });
        wx.showToast({
            title: '加载失败',
            icon: 'error'
        });
    });
  },

  /**
   * 切换商品状态（上下架）
   */
  toggleProductStatus(e) {
    const productId = e.currentTarget.dataset.id
    const products = this.data.products
    const productIndex = products.findIndex(product => product.id === productId)
    
    if (productIndex === -1) return
    
    const product = products[productIndex]
    const newStatus = product.status === 'published' ? 'unpublished' : 'published'
    const statusText = newStatus === 'published' ? '上架' : '下架'
    
    // 显示确认模态框
    wx.showModal({
      title: '确认操作',
      content: `确定要将商品「${product.name}」${statusText}吗？`,
      confirmText: statusText,
      confirmColor: newStatus === 'published' ? '#07c160' : '#ff3b30',
      success: res => {
        if (res.confirm) {
          // 执行状态变更操作
          this.confirmToggleStatus(productId, productIndex, newStatus)
        }
      }
    })
  },
  
  /**
   * 确认切换商品状态
   */
  confirmToggleStatus(productId, productIndex, newStatus) {
    const products = this.data.products
    
    // 保存this上下文
    const that = this;
    
    wx.showLoading({
      title: '更新中...'
    })
    
    productApi.updateProduct({ id: productId, status: newStatus }).then(res => {
        wx.hideLoading();
        
        // 更新本地数据
        const updatedProducts = [...products];
        updatedProducts[productIndex].status = newStatus;
        updatedProducts[productIndex].updatedAt = new Date().toISOString();
        
        that.setData({
            products: updatedProducts
        });
        
        wx.showToast({
            title: newStatus === 'published' ? '上架成功' : '下架成功',
            icon: 'success'
        });
    }).catch(err => {
        wx.hideLoading();
        console.error('更新状态失败:', err);
        wx.showToast({
            title: '更新失败',
            icon: 'error'
        });
    });
  },

  /**
   * 跳转到编辑商品页面
   */
  editProduct(e) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/product/edit/edit?id=${productId}`
    })
  },

  /**
   * 删除商品
   */
  deleteProduct(e) {
    const productId = e.currentTarget.dataset.id
    const productName = e.currentTarget.dataset.name
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除商品「${productName}」吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          // 执行删除操作
          this.confirmDeleteProduct(productId)
        }
      }
    })
  },

  /**
   * 确认删除商品
   */
  confirmDeleteProduct(productId) {
    const products = this.data.products
    
    wx.showLoading({
      title: '删除中...'
    })
    
    productApi.deleteProduct(productId).then(res => {
        wx.hideLoading();
        
        // 更新本地数据
        const updatedProducts = products.filter(product => product.id !== productId);
        
        this.setData({
            products: updatedProducts
        });
        
        wx.showToast({
            title: '删除成功',
            icon: 'success'
        });
    }).catch(err => {
        wx.hideLoading();
        console.error('删除商品失败:', err);
        wx.showToast({
            title: '删除失败',
            icon: 'error'
        });
    });
  },

  /**
   * 跳转到添加商品页面
   */
  addProduct() {
    wx.navigateTo({
      url: '/pages/merchant/product/add/add'
    })
  },

  /**
   * 搜索商品
   */
  onSearch(e) {
    const keyword = e.detail.value
    this.setData({
      'filter.keyword': keyword
    })
    // 模拟搜索，实际应该调用API
    this.loadProducts()
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
   * 切换筛选条件
   */
  changeFilter(e) {
    const type = e.currentTarget.dataset.type
    const value = e.currentTarget.dataset.value
    this.setData({
      [`filter.${type}`]: value,
      expandedFilter: '' // 选择后关闭筛选器
    })
    this.loadProducts()
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
    this.loadProducts()
  },

  /**
   * 单个商品选择
   */
  toggleSelect(e) {
    const productId = e.currentTarget.dataset.id
    const selectedProductIds = [...this.data.selectedProductIds]
    const index = selectedProductIds.indexOf(productId)
    
    if (index === -1) {
      // 添加到已选列表
      selectedProductIds.push(productId)
    } else {
      // 从已选列表移除
      selectedProductIds.splice(index, 1)
    }
    
    this.setData({
      selectedProductIds,
      isAllSelected: selectedProductIds.length === this.data.products.length
    })
  },
  
  /**
   * 全选/取消全选
   */
  toggleAllSelect(e) {
    const isAllSelected = e.detail.value.includes('all')
    const selectedProductIds = isAllSelected ? this.data.products.map(product => product.id) : []
    
    this.setData({
      isAllSelected,
      selectedProductIds
    })
  },
  
  /**
   * 批量上架
   */
  batchPublish() {
    const selectedProductIds = this.data.selectedProductIds
    if (selectedProductIds.length === 0) {
      wx.showToast({
        title: '请选择要上架的商品',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量上架',
      content: `确定要将选中的${selectedProductIds.length}个商品上架吗？`,
      confirmText: '上架',
      confirmColor: '#07c160',
      success: res => {
        if (res.confirm) {
          this.confirmBatchPublish(selectedProductIds)
        }
      }
    })
  },
  
  /**
   * 确认批量上架
   */
  confirmBatchPublish(selectedProductIds) {
    const products = this.data.products
    
    wx.showLoading({
      title: '上架中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedProducts = products.map(product => {
        if (selectedProductIds.includes(product.id)) {
          return {
            ...product,
            status: 'published',
            updatedAt: new Date().toISOString()
          }
        }
        return product
      })
      
      this.setData({
        products: updatedProducts,
        selectedProductIds: [],
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
    const selectedProductIds = this.data.selectedProductIds
    if (selectedProductIds.length === 0) {
      wx.showToast({
        title: '请选择要下架的商品',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量下架',
      content: `确定要将选中的${selectedProductIds.length}个商品下架吗？`,
      confirmText: '下架',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.confirmBatchUnpublish(selectedProductIds)
        }
      }
    })
  },
  
  /**
   * 确认批量下架
   */
  confirmBatchUnpublish(selectedProductIds) {
    const products = this.data.products
    
    wx.showLoading({
      title: '下架中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedProducts = products.map(product => {
        if (selectedProductIds.includes(product.id)) {
          return {
            ...product,
            status: 'unpublished',
            updatedAt: new Date().toISOString()
          }
        }
        return product
      })
      
      this.setData({
        products: updatedProducts,
        selectedProductIds: [],
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
    const selectedProductIds = this.data.selectedProductIds
    if (selectedProductIds.length === 0) {
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量删除',
      content: `确定要删除选中的${selectedProductIds.length}个商品吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.confirmBatchDelete(selectedProductIds)
        }
      }
    })
  },
  
  /**
   * 确认批量删除
   */
  confirmBatchDelete(selectedProductIds) {
    const products = this.data.products
    
    wx.showLoading({
      title: '删除中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedProducts = products.filter(product => !selectedProductIds.includes(product.id))
      
      this.setData({
        products: updatedProducts,
        selectedProductIds: [],
        isAllSelected: false
      })
      
      wx.showToast({
        title: '批量删除成功',
        icon: 'success'
      })
    }, 1000)
  },
  
  /**
   * 切换更多操作菜单显示状态
   */
  toggleMoreActions() {
    this.setData({
      showMoreActions: !this.data.showMoreActions
    })
  },
  
  /**
   * 批量更新分类
   */
  batchUpdateCategory() {
    this.setData({
      showMoreActions: false,
      showUpdateCategoryModal: true
    })
  },
  
  /**
   * 关闭批量更新分类弹窗
   */
  closeUpdateCategoryModal() {
    this.setData({
      showUpdateCategoryModal: false
    })
  },
  
  /**
   * 选择更新分类
   */
  onUpdateCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    this.setData({
      selectedUpdateCategoryIndex: index,
      selectedUpdateCategory: category.name
    })
  },
  
  /**
   * 确认批量更新分类
   */
  confirmBatchUpdateCategory() {
    const selectedProductIds = this.data.selectedProductIds
    const selectedCategoryIndex = this.data.selectedUpdateCategoryIndex
    const selectedCategory = this.data.categories[selectedCategoryIndex]
    
    if (selectedProductIds.length === 0) {
      wx.showToast({
        title: '请选择要更新的商品',
        icon: 'none'
      })
      return
    }
    
    const categoryKey = selectedCategory.id
    
    wx.showModal({
      title: '确认批量更新分类',
      content: `确定要将选中的${selectedProductIds.length}个商品的分类更新为「${selectedCategory.name}」吗？`,
      confirmText: '更新',
      confirmColor: '#07c160',
      success: res => {
        if (res.confirm) {
          this.executeBatchUpdateCategory(selectedProductIds, categoryKey)
        }
      }
    })
  },
  
  /**
   * 执行批量更新分类
   */
  executeBatchUpdateCategory(selectedProductIds, categoryKey) {
    const products = this.data.products
    
    wx.showLoading({
      title: '更新中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedProducts = products.map(product => {
        if (selectedProductIds.includes(product.id)) {
          return {
            ...product,
            category: categoryKey,
            updatedAt: new Date().toISOString()
          }
        }
        return product
      })
      
      this.setData({
        products: updatedProducts,
        selectedProductIds: [],
        isAllSelected: false,
        showUpdateCategoryModal: false
      })
      
      wx.showToast({
        title: '批量更新分类成功',
        icon: 'success'
      })
    }, 1000)
  },
  
  /**
   * 批量更新价格
   */
  batchUpdatePrice() {
    this.setData({
      showMoreActions: false,
      showUpdatePriceModal: true
    })
  },
  
  /**
   * 关闭批量更新价格弹窗
   */
  closeUpdatePriceModal() {
    this.setData({
      showUpdatePriceModal: false
    })
  },
  
  /**
   * 选择价格更新方式
   */
  onPriceUpdateTypeChange(e) {
    this.setData({
      priceUpdateType: e.detail.value
    })
  },
  
  /**
   * 输入价格更新值
   */
  onPriceUpdateValueInput(e) {
    this.setData({
      priceUpdateValue: e.detail.value
    })
  },
  
  /**
   * 确认批量更新价格
   */
  confirmBatchUpdatePrice() {
    const selectedProductIds = this.data.selectedProductIds
    const updateType = this.data.priceUpdateType
    const updateValue = parseFloat(this.data.priceUpdateValue)
    
    if (selectedProductIds.length === 0) {
      wx.showToast({
        title: '请选择要更新的商品',
        icon: 'none'
      })
      return
    }
    
    if (isNaN(updateValue)) {
      wx.showToast({
        title: '请输入有效的更新值',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量更新价格',
      content: `确定要将选中的${selectedProductIds.length}个商品${updateType === 'percentage' ? `按${updateValue > 0 ? '+' : ''}${updateValue}%` : `按${updateValue > 0 ? '+' : ''}${updateValue}元`}更新价格吗？`,
      confirmText: '更新',
      confirmColor: '#07c160',
      success: res => {
        if (res.confirm) {
          this.executeBatchUpdatePrice(selectedProductIds, updateType, updateValue)
        }
      }
    })
  },
  
  /**
   * 执行批量更新价格
   */
  executeBatchUpdatePrice(selectedProductIds, updateType, updateValue) {
    const products = this.data.products
    
    wx.showLoading({
      title: '更新中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedProducts = products.map(product => {
        if (selectedProductIds.includes(product.id)) {
          let newPrice = product.price
          if (updateType === 'percentage') {
            newPrice = product.price * (1 + updateValue / 100)
          } else {
            newPrice = product.price + updateValue
          }
          
          // 确保价格不小于0
          newPrice = Math.max(0, newPrice)
          
          return {
            ...product,
            price: parseFloat(newPrice.toFixed(2)),
            updatedAt: new Date().toISOString()
          }
        }
        return product
      })
      
      this.setData({
        products: updatedProducts,
        selectedProductIds: [],
        isAllSelected: false,
        showUpdatePriceModal: false,
        priceUpdateValue: ''
      })
      
      wx.showToast({
        title: '批量更新价格成功',
        icon: 'success'
      })
    }, 1000)
  },
  
  /**
   * 批量更新库存
   */
  batchUpdateStock() {
    this.setData({
      showMoreActions: false,
      showUpdateStockModal: true
    })
  },
  
  /**
   * 关闭批量更新库存弹窗
   */
  closeUpdateStockModal() {
    this.setData({
      showUpdateStockModal: false
    })
  },
  
  /**
   * 选择库存更新方式
   */
  onStockUpdateTypeChange(e) {
    this.setData({
      stockUpdateType: e.detail.value
    })
  },
  
  /**
   * 输入库存更新值
   */
  onStockUpdateValueInput(e) {
    this.setData({
      stockUpdateValue: e.detail.value
    })
  },
  
  /**
   * 确认批量更新库存
   */
  confirmBatchUpdateStock() {
    const selectedProductIds = this.data.selectedProductIds
    const updateType = this.data.stockUpdateType
    const updateValue = parseInt(this.data.stockUpdateValue)
    
    if (selectedProductIds.length === 0) {
      wx.showToast({
        title: '请选择要更新的商品',
        icon: 'none'
      })
      return
    }
    
    if (isNaN(updateValue)) {
      wx.showToast({
        title: '请输入有效的更新值',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认批量更新库存',
      content: `确定要将选中的${selectedProductIds.length}个商品${updateType === 'set' ? '设置库存为' : updateType === 'add' ? `增加${updateValue}个` : `减少${updateValue}个`}吗？`,
      confirmText: '更新',
      confirmColor: '#07c160',
      success: res => {
        if (res.confirm) {
          this.executeBatchUpdateStock(selectedProductIds, updateType, updateValue)
        }
      }
    })
  },
  
  /**
   * 执行批量更新库存
   */
  executeBatchUpdateStock(selectedProductIds, updateType, updateValue) {
    const products = this.data.products
    
    wx.showLoading({
      title: '更新中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新本地数据
      const updatedProducts = products.map(product => {
        if (selectedProductIds.includes(product.id)) {
          let newStock = product.stock
          if (updateType === 'set') {
            newStock = updateValue
          } else if (updateType === 'add') {
            newStock += updateValue
          } else if (updateType === 'reduce') {
            newStock -= updateValue
          }
          
          // 确保库存不小于0
          newStock = Math.max(0, newStock)
          
          return {
            ...product,
            stock: newStock,
            updatedAt: new Date().toISOString()
          }
        }
        return product
      })
      
      this.setData({
        products: updatedProducts,
        selectedProductIds: [],
        isAllSelected: false,
        showUpdateStockModal: false,
        stockUpdateValue: ''
      })
      
      wx.showToast({
        title: '批量更新库存成功',
        icon: 'success'
      })
    }, 1000)
  },
  
  /**
   * 批量导出
   */
  batchExport() {
    const selectedProductIds = this.data.selectedProductIds
    
    if (selectedProductIds.length === 0) {
      wx.showToast({
        title: '请选择要导出的商品',
        icon: 'none'
      })
      return
    }
    
    wx.showToast({
      title: '商品导出功能开发中',
      icon: 'none'
    })
    
    this.setData({
      showMoreActions: false
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
          // 清除登录状态
          app.logout()
          // 跳转到登录页面
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新，重新加载数据
    this.loadProducts()
    wx.stopPullDownRefresh()
  }
})
