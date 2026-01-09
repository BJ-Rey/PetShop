// pages/mine/address/address.js
Page({
  data: {
    addresses: [] // 收货地址列表
  },

  onLoad() {
    // 页面加载时加载地址数据
    this.loadAddresses()
  },

  onShow() {
    // 页面显示时重新加载地址数据，确保数据最新
    this.loadAddresses()
  },

  // 加载地址数据
  loadAddresses() {
    // 从本地存储获取地址数据
    const addresses = wx.getStorageSync('addresses') || [];
    this.setData({
      addresses
    })
  },

  // 跳转到新增地址页面
  navigateToAddAddress() {
    if (this.data.addresses.length >= 3) {
      wx.showToast({
        title: '最多只能添加3个收货地址',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/mine/address/add/add'
    })
  },

  // 跳转到编辑地址页面
  editAddress(e) {
    const addressId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/mine/address/edit/edit?id=${addressId}`
    })
  },

  // 删除地址
  deleteAddress(e) {
    const addressId = e.currentTarget.dataset.id
    const that = this
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该收货地址吗？',
      success(res) {
        if (res.confirm) {
          // 从数组中删除地址
          const addresses = that.data.addresses.filter(item => item.id !== addressId)
          that.setData({ addresses })
          
          // 保存到本地存储
          wx.setStorageSync('addresses', addresses)
          
          // 显示删除成功提示
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 设置默认地址
  setDefaultAddress(e) {
    const addressId = e.currentTarget.dataset.id
    
    // 更新地址列表，将选中的地址设为默认，其他设为非默认
    const addresses = this.data.addresses.map(item => ({
      ...item,
      isDefault: item.id === addressId
    }))
    
    this.setData({ addresses })
    
    // 保存到本地存储
    wx.setStorageSync('addresses', addresses)
    
    // 显示设置成功提示
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })
  },

  // 上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})
