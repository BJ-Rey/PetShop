// pages/merchant/setting/edit-basic-info/edit-basic-info.js
const app = getApp()
const merchantApi = require('../../../../api/merchantApi')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 商家信息
    merchantInfo: {
      name: '',
      phone: '',
      address: '',
      businessLicense: '',
      description: '',
      contactPerson: '',
      email: '',
      status: 'open' // open, closed
    },
    
    // 初始商家信息，用于比较是否有修改
    initialMerchantInfo: null,
    
    // 错误信息
    errors: {
      name: '',
      phone: '',
      address: '',
      businessLicense: '',
      email: ''
    },
    
    // 保存状态
    saveStatus: 'saved', // saved, saving, unsaved
    showSaveStatus: false,
    
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
    
    // 加载商家信息
    this.loadMerchantInfo()
    
    // 显示保存状态
    this.setData({
      showSaveStatus: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时不再从本地存储恢复草稿
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 页面隐藏时不再保存草稿到本地存储
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时不再保存草稿到本地存储
  },

  /**
   * 从数据库加载商家信息
   */
  async loadMerchantInfo() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getBasicInfo()
      console.log('获取商家基本信息成功:', res)
      
      if (res && res.data) {
        const merchantInfo = {
          name: res.data.name || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          businessLicense: res.data.businessLicense || '',
          description: res.data.description || '',
          contactPerson: res.data.contactPerson || '',
          email: res.data.email || '',
          status: res.data.status || 'open'
        }
        
        this.setData({
          merchantInfo: merchantInfo,
          initialMerchantInfo: JSON.parse(JSON.stringify(merchantInfo))
        })
      }
    } catch (error) {
      console.error('获取商家基本信息失败:', error)
      wx.showToast({
        title: '加载商家信息失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 输入框变化事件
   */
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`merchantInfo.${field}`]: value,
      [`errors.${field}`]: '' // 清除对应字段的错误信息
    });
    
    // 实时验证部分字段
    if (field === 'phone' || field === 'email') {
      this.validateField(field, value);
    }
    
    // 更新保存状态
    this.updateSaveStatus();
  },

  /**
   * 字段级验证
   */
  validateField(field, value) {
    let error = '';
    
    switch (field) {
      case 'phone':
        if (value) {
          const phoneRegex = /^1[3-9]\d{9}$/;
          if (!phoneRegex.test(value)) {
            error = '请输入有效的手机号码';
          }
        }
        break;
      case 'email':
        if (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = '请输入有效的邮箱地址';
          }
        }
        break;
    }
    
    if (error) {
      this.setData({
        [`errors.${field}`]: error
      });
    }
    
    return error;
  },

  /**
   * 切换店铺状态
   */
  toggleStatus(e) {
    const checked = e.detail.value;
    this.setData({
      'merchantInfo.status': checked ? 'open' : 'closed'
    });
    
    // 更新保存状态
    this.updateSaveStatus();
  },

  /**
   * 数据验证
   */
  validateForm() {
    const { merchantInfo } = this.data;
    const errors = {
      name: '',
      phone: '',
      address: '',
      businessLicense: '',
      email: ''
    };
    
    // 验证商家名称
    if (!merchantInfo.name.trim()) {
      errors.name = '商家名称不能为空';
    } else if (merchantInfo.name.length > 50) {
      errors.name = '商家名称不能超过50个字符';
    }
    
    // 验证手机号码
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!merchantInfo.phone.trim()) {
      errors.phone = '联系方式不能为空';
    } else if (!phoneRegex.test(merchantInfo.phone)) {
      errors.phone = '请输入有效的手机号码';
    }
    
    // 验证商家地址
    if (!merchantInfo.address.trim()) {
      errors.address = '商家地址不能为空';
    } else if (merchantInfo.address.length > 100) {
      errors.address = '商家地址不能超过100个字符';
    }
    
    // 验证营业执照
    if (!merchantInfo.businessLicense.trim()) {
      errors.businessLicense = '营业执照编号不能为空';
    } else if (merchantInfo.businessLicense.length > 20) {
      errors.businessLicense = '营业执照编号不能超过20个字符';
    }
    
    // 验证邮箱格式
    if (merchantInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(merchantInfo.email)) {
        errors.email = '请输入有效的邮箱地址';
      }
    }
    
    this.setData({ errors });
    
    // 检查是否有错误
    return !Object.values(errors).some(error => error);
  },

  /**
   * 保存商家信息 - 调用数据库API
   */
  async saveMerchantInfo() {
    // 防止重复点击
    if (this.data.saveStatus === 'saving') {
      return;
    }

    // 表单验证
    if (!this.validateForm()) {
      return;
    }
    
    // 更新保存状态
    this.setData({
      saveStatus: 'saving'
    });
    
    wx.showLoading({
      title: '保存中...',
      mask: true
    });
    
    const { merchantInfo } = this.data;
    
    try {
      const res = await merchantApi.updateBasicInfo({
        name: merchantInfo.name,
        phone: merchantInfo.phone,
        address: merchantInfo.address,
        businessLicense: merchantInfo.businessLicense,
        description: merchantInfo.description,
        contactPerson: merchantInfo.contactPerson,
        email: merchantInfo.email,
        status: merchantInfo.status
      })
      
      console.log('保存商家基本信息成功:', res)
      
      wx.hideLoading();

      // 保存成功
      this.setData({
        saveStatus: 'saved',
        initialMerchantInfo: JSON.parse(JSON.stringify(merchantInfo))
      });
      
      // 显示保存成功提示
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    } catch (error) {
      console.error('保存商家基本信息失败:', error)
      wx.hideLoading();
      
      this.setData({
        saveStatus: 'unsaved'
      });
      
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 检查是否有未保存的修改
   */
  hasUnsavedChanges() {
    const { merchantInfo, initialMerchantInfo } = this.data;
    return JSON.stringify(merchantInfo) !== JSON.stringify(initialMerchantInfo);
  },

  /**
   * 更新保存状态
   */
  updateSaveStatus() {
    if (this.hasUnsavedChanges()) {
      this.setData({
        saveStatus: 'unsaved'
      });
    } else {
      this.setData({
        saveStatus: 'saved'
      });
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    if (this.hasUnsavedChanges()) {
      wx.showModal({
        title: '确认返回',
        content: '您有未保存的修改，是否确认返回？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
})
