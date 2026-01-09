// pages/merchant/service/add/add.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    service: {
      name: '',
      category: '',
      duration: '',
      price: '',
      stock: '',
      image: '',
      description: '',
      status: 'published'
    },
    categories: [
      { id: 'vaccine', name: '疫苗接种' },
      { id: 'grooming', name: '宠物美容' },
      { id: 'boarding', name: '宠物寄养' },
      { id: 'training', name: '宠物训练' }
    ],
    categoryIndex: 0
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
  },

  /**
   * 输入框内容变化处理
   */
  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`service.${field}`]: value
    })
  },

  /**
   * 选择器变化处理
   */
  onPickerChange(e) {
    const field = e.currentTarget.dataset.field
    const index = e.detail.value
    const category = this.data.categories[index]
    
    this.setData({
      [`service.${field}`]: category.id,
      categoryIndex: index
    })
  },

  /**
   * 单选框变化处理
   */
  onRadioChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`service.${field}`]: value
    })
  },

  /**
   * 选择图片
   */
  chooseImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        that.uploadImage(tempFilePath);
      }
    })
  },

  /**
   * 上传图片
   */
  uploadImage(tempFilePath) {
    const request = require('../../../../utils/request');
    
    request.upload('/api/upload', tempFilePath).then(url => {
        this.setData({
            'service.image': url
        });
        wx.showToast({
            title: '图片上传成功',
            icon: 'success'
        });
    }).catch(err => {
        console.error('上传失败', err);
        wx.showToast({
            title: '上传失败',
            icon: 'error'
        });
    });
  },

  /**
   * 获取分类名称
   */
  getCategoryName(categoryId) {
    const category = this.data.categories.find(cat => cat.id === categoryId)
    return category ? category.name : ''
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { service } = this.data
    
    if (!service.name.trim()) {
      wx.showToast({
        title: '请输入服务名称',
        icon: 'none'
      })
      return false
    }
    
    if (!service.category) {
      wx.showToast({
        title: '请选择服务分类',
        icon: 'none'
      })
      return false
    }
    
    if (!service.duration.trim()) {
      wx.showToast({
        title: '请输入服务时长',
        icon: 'none'
      })
      return false
    }
    
    if (!service.price || parseFloat(service.price) <= 0) {
      wx.showToast({
        title: '请输入有效的服务价格',
        icon: 'none'
      })
      return false
    }
    
    if (!service.stock || parseInt(service.stock) < 0) {
      wx.showToast({
        title: '请输入有效的服务库存',
        icon: 'none'
      })
      return false
    }
    
    if (!service.image) {
      wx.showToast({
        title: '请上传服务封面图片',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  /**
   * 提交表单
   */
  submitForm(e) {
    if (!this.validateForm()) {
      return
    }
    
    const { service } = this.data
    
    // 构建提交数据
    const submitData = {
        ...service,
        sales: 0
    };
    
    wx.showLoading({
      title: '保存中...'
    })
    
    serviceApi.addService(submitData).then(res => {
        wx.hideLoading();
        
        wx.showToast({
            title: '服务添加成功',
            icon: 'success'
        });
        
        // 跳转到服务管理页面
        setTimeout(() => {
            wx.navigateBack();
        }, 1500);
    }).catch(err => {
        wx.hideLoading();
        console.error('添加服务失败:', err);
        wx.showToast({
            title: '添加失败',
            icon: 'error'
        });
    });
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
          // 清除登录状态
          app.logout()
          // 跳转到登录页面
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})