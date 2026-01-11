// pages/merchant/setting/category/category.js
const app = getApp()
const globalUtils = require('../../../../utils/globalUtils')
const merchantApi = require('../../../../api/merchantApi')
const { preventReclick } = globalUtils

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    showModal: false,
    modalTitle: '添加分类',
    editingCategory: null,
    categoryName: '',
    isLoading: true
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
    
    this.loadCategories()
  },

  /**
   * 从数据库加载分类数据
   */
  async loadCategories() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getCategorySetting()
      console.log('获取分类设置成功:', res)
      
      this.setData({
        categories: res.data || [],
        isLoading: false
      })
    } catch (error) {
      console.error('获取分类设置失败:', error)
      this.setData({ isLoading: false })
      wx.showToast({
        title: '加载分类失败',
        icon: 'none'
      })
    }
  },

  /**
   * 显示添加分类弹窗
   */
  showAddModal() {
    this.setData({
      showModal: true,
      modalTitle: '添加分类',
      editingCategory: null,
      categoryName: ''
    })
  },

  /**
   * 显示编辑分类弹窗
   */
  showEditModal(e) {
    const id = e.currentTarget.dataset.id
    const category = this.data.categories.find(c => c.id === id)
    
    if (category) {
      this.setData({
        showModal: true,
        modalTitle: '编辑分类',
        editingCategory: category,
        categoryName: category.name
      })
    }
  },

  /**
   * 隐藏弹窗
   */
  hideModal() {
    this.setData({
      showModal: false,
      editingCategory: null,
      categoryName: ''
    })
  },

  /**
   * 输入分类名称
   */
  onNameInput(e) {
    this.setData({
      categoryName: e.detail.value
    })
  },

  /**
   * 确认保存分类 - 调用数据库API
   */
  confirmSave: async function() {
    // 防止重复点击逻辑封装在方法内部，因为是模态框操作
    if (this.isSaving) return
    this.isSaving = true
    
    const { categoryName, editingCategory, categories } = this.data
    
    if (!categoryName.trim()) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none'
      })
      this.isSaving = false
      return
    }
    
    // 检查名称是否重复
    const isDuplicate = categories.some(c => 
      c.name === categoryName.trim() && 
      (!editingCategory || c.id !== editingCategory.id)
    )
    
    if (isDuplicate) {
      wx.showToast({
        title: '分类名称已存在',
        icon: 'none'
      })
      this.isSaving = false
      return
    }
    
    wx.showLoading({
      title: '保存中...'
    })
    
    try {
      let newCategories = [...categories]
      
      if (editingCategory) {
        // 编辑模式
        const index = newCategories.findIndex(c => c.id === editingCategory.id)
        if (index !== -1) {
          newCategories[index] = {
            ...editingCategory,
            name: categoryName.trim()
          }
        }
      } else {
        // 添加模式
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1
        newCategories.push({
          id: newId,
          name: categoryName.trim(),
          count: 0
        })
      }
      
      // 调用数据库API保存分类
      await merchantApi.updateCategorySetting(newCategories)
      console.log('保存分类成功')
      
      this.setData({
        categories: newCategories,
        showModal: false
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('保存分类失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    } finally {
      this.isSaving = false
    }
  },

  /**
   * 删除分类
   */
  deleteCategory(e) {
    const id = e.currentTarget.dataset.id
    const category = this.data.categories.find(c => c.id === id)
    
    if (!category) return
    
    if (category.count > 0) {
      wx.showToast({
        title: '该分类下有商品，无法删除',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除分类「${category.name}」吗？`,
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(id)
        }
      }
    })
  },

  /**
   * 执行删除操作 - 调用数据库API
   */
  async performDelete(id) {
    wx.showLoading({
      title: '删除中...'
    })
    
    try {
      const newCategories = this.data.categories.filter(c => c.id !== id)
      
      // 调用数据库API保存分类
      await merchantApi.updateCategorySetting(newCategories)
      console.log('删除分类成功')
      
      this.setData({
        categories: newCategories
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('删除分类失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack()
  }
})
