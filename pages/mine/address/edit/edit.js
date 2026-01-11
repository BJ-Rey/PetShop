// pages/mine/address/edit/edit.js
const addressApi = require('../../../api/addressApi');

Page({
  data: {
    address: {
      id: '',
      name: '',
      phone: '',
      province: '请选择',
      city: '',
      district: '',
      address: '',
      isDefault: false
    },
    isLoading: false,
    isSubmitting: false
  },

  onLoad: function(options) {
    const addressId = options.id;
    if (addressId) {
      this.loadAddress(addressId);
    }
  },

  // 从数据库加载地址数据
  loadAddress: async function(addressId) {
    this.setData({ isLoading: true });

    try {
      const res = await addressApi.getAddressDetail(addressId);
      console.log('获取地址详情成功:', res);
      
      if (res && res.data) {
        this.setData({
          address: {
            id: res.data.id,
            name: res.data.name || '',
            phone: res.data.phone || '',
            province: res.data.province || '请选择',
            city: res.data.city || '',
            district: res.data.district || '',
            address: res.data.address || '',
            isDefault: res.data.isDefault || false
          }
        });
      }
    } catch (error) {
      console.error('获取地址详情失败:', error);
      wx.showToast({
        title: '加载地址失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  // 输入框内容变化事件
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`address.${field}`]: value
    });
  },

  // 显示区域选择器
  showRegionPicker: function() {
    wx.chooseLocation({
      success: (res) => {
        // 解析地区信息，这里简化处理，实际应该使用更精确的解析
        const region = res.address.split(' ')[0];
        this.setData({
          'address.province': region,
          'address.city': region,
          'address.district': region
        });
      }
    });
  },

  // 切换默认地址
  toggleDefault: function() {
    this.setData({
      'address.isDefault': !this.data.address.isDefault
    });
  },

  // 保存地址 - 调用数据库API
  saveAddress: async function() {
    const address = this.data.address;
    
    // 表单验证
    if (!address.name) {
      wx.showToast({
        title: '请输入收货人姓名',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (!address.phone) {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (address.province === '请选择') {
      wx.showToast({
        title: '请选择所在地区',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    if (!address.address) {
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 防止重复提交
    if (this.data.isSubmitting) {
      return;
    }

    this.setData({ isSubmitting: true });

    try {
      // 调用数据库API更新地址
      const res = await addressApi.updateAddress({
        id: address.id,
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        address: address.address,
        isDefault: address.isDefault
      });

      console.log('更新地址成功:', res);
      
      // 显示成功提示
      wx.showToast({
        title: '地址更新成功',
        icon: 'success',
        duration: 2000
      });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('更新地址失败:', error);
      wx.showToast({
        title: error.message || '更新地址失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    });
  }
});