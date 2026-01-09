// pages/merchant/setting/edit-basic-info/edit-basic-info.js
const app = getApp()

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
    
    // 本地存储键名
    storageKey: 'merchant_basic_info_draft'
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
    // 从本地存储恢复草稿数据
    this.restoreDraftData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 保存草稿数据到本地存储
    this.saveDraftData()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 保存草稿数据到本地存储
    this.saveDraftData()
  },

  /**
   * 加载商家信息
   */
  loadMerchantInfo() {
    // 模拟数据，实际应该调用API获取商家信息
    const mockMerchantInfo = {
      name: '宠物乐园',
      phone: '13800138000',
      address: '北京市朝阳区宠物大街123号',
      businessLicense: '123456789012345678',
      description: '专业的宠物服务提供商，提供宠物美容、寄养、训练等服务',
      contactPerson: '张三',
      email: 'contact@petpark.com',
      status: 'open'
    }
    
    this.setData({
      merchantInfo: mockMerchantInfo,
      initialMerchantInfo: JSON.parse(JSON.stringify(mockMerchantInfo))
    })
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
    
    // 防抖保存草稿数据
    this.debounceSaveDraft();
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
    
    // 防抖保存草稿数据
    this.debounceSaveDraft();
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
   * 保存商家信息
   */
  saveMerchantInfo() {
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
    
    // 模拟API请求，实际应该调用API保存商家信息
    setTimeout(() => {
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
      
      // 清除本地草稿数据
      this.clearDraftData();
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }, 1000);
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
   * 保存草稿数据到本地存储
   */
  saveDraftData() {
    const { merchantInfo, storageKey } = this.data;
    
    try {
      wx.setStorageSync(storageKey, {
        data: merchantInfo,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  },

  /**
   * 从本地存储恢复草稿数据
   */
  restoreDraftData() {
    const { storageKey } = this.data;
    
    try {
      const draft = wx.getStorageSync(storageKey);
      
      if (draft && draft.data) {
        // 检查草稿是否在24小时内
        const now = Date.now();
        const isWithin24Hours = (now - draft.timestamp) < 24 * 60 * 60 * 1000;
        
        if (isWithin24Hours) {
          // 显示恢复提示
          wx.showModal({
            title: '恢复草稿',
            content: '检测到您有未完成的编辑，是否恢复上次编辑的数据？',
            success: (res) => {
              if (res.confirm) {
                this.setData({
                  merchantInfo: draft.data
                });
                
                // 更新保存状态
                this.updateSaveStatus();
              } else {
                // 用户选择不恢复，清除草稿
                this.clearDraftData();
              }
            }
          });
        } else {
          // 草稿超过24小时，自动清除
          this.clearDraftData();
        }
      }
    } catch (error) {
      console.error('恢复草稿失败:', error);
    }
  },

  /**
   * 清除本地草稿数据
   */
  clearDraftData() {
    const { storageKey } = this.data;
    
    try {
      wx.removeStorageSync(storageKey);
    } catch (error) {
      console.error('清除草稿失败:', error);
    }
  },

  /**
   * 防抖函数，延迟保存草稿
   */
  debounceSaveDraft() {
    // 清除之前的定时器
    if (this.draftTimer) {
      clearTimeout(this.draftTimer);
    }
    
    // 设置新的定时器，延迟1秒保存草稿
    this.draftTimer = setTimeout(() => {
      this.saveDraftData();
    }, 1000);
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
            // 保存草稿数据
            this.saveDraftData();
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
})
