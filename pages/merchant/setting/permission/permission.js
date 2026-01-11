// pages/merchant/setting/permission/permission.js
const app = getApp()
const merchantApi = require('../../../../api/merchantApi')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 角色列表
    roles: [],
    
    // 权限列表
    permissions: [
      { id: 'manage_merchant', name: '商家管理' },
      { id: 'manage_product', name: '商品管理' },
      { id: 'manage_service', name: '服务管理' },
      { id: 'manage_order', name: '订单管理' },
      { id: 'manage_customer', name: '客户管理' },
      { id: 'manage_finance', name: '财务管理' },
      { id: 'manage_setting', name: '系统设置' },
      { id: 'manage_permission', name: '权限管理' }
    ],
    
    // 加载状态
    isLoading: false
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
    if (!app.checkPermission('manage_permission')) {
      wx.showToast({
        title: '您没有权限访问此页面',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    // 加载角色列表
    this.loadRoles()
  },

  /**
   * 从数据库加载角色列表
   */
  async loadRoles() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getRoleList()
      console.log('获取角色列表成功:', res)
      
      if (res && res.data) {
        this.setData({
          roles: res.data || []
        })
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      wx.showToast({
        title: '加载角色列表失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 获取权限名称
   */
  getPermissionName(permissionId) {
    const permission = this.data.permissions.find(p => p.id === permissionId)
    return permission ? permission.name : permissionId
  },

  /**
   * 添加角色
   */
  addRole() {
    wx.navigateTo({
      url: '/pages/merchant/setting/permission/role-edit/role-edit'
    })
  },

  /**
   * 编辑角色
   */
  editRole(e) {
    const roleId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchant/setting/permission/role-edit/role-edit?id=${roleId}`
    })
  },

  /**
   * 删除角色
   */
  deleteRole(e) {
    const roleId = e.currentTarget.dataset.id
    const roleName = e.currentTarget.dataset.name
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除角色「${roleName}」吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.confirmDeleteRole(roleId)
        }
      }
    })
  },

  /**
   * 确认删除角色 - 调用数据库API
   */
  async confirmDeleteRole(roleId) {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.deleteRole(roleId)
      console.log('删除角色成功:', res)
      
      // 更新本地数据
      const updatedRoles = this.data.roles.filter(role => role.id !== roleId)
      
      this.setData({
        roles: updatedRoles,
        isLoading: false
      })
      
      wx.showToast({
        title: '角色删除成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('删除角色失败:', error)
      this.setData({ isLoading: false })
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    }
  },

  /**
   * 上一页
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1
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
  }
})