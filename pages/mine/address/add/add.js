// pages/mine/address/add/add.js
Page({
  data: {
    address: {
      name: '',
      phone: '',
      province: '请选择',
      city: '',
      district: '',
      address: '',
      isDefault: false
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

  // 保存地址
  saveAddress: function() {
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
    
    // 生成唯一ID
    address.id = Date.now();
    
    // 保存到本地存储
    let addresses = wx.getStorageSync('addresses') || [];
    
    // 如果是默认地址，取消其他默认地址
    if (address.isDefault) {
      addresses = addresses.map(item => ({ ...item, isDefault: false }));
    } else if (addresses.length === 0) {
      // 如果是第一个地址，强制设为默认
      address.isDefault = true;
    }

    addresses.push(address);
    wx.setStorageSync('addresses', addresses);
    
    // 显示成功提示
    wx.showToast({
      title: '地址添加成功',
      icon: 'success',
      duration: 2000
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    });
  }
});