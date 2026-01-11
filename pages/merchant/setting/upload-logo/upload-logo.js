// pages/merchant/setting/upload-logo/upload-logo.js
const app = getApp()
const merchantApi = require('../../../../api/merchantApi')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // LOGO路径
    logoPath: '',
    
    // 默认LOGO
    defaultLogo: 'https://example.com/default-logo.png',
    
    // 裁剪状态
    cropping: false,
    
    // 临时图片路径
    tempImagePath: '',
    
    // 裁剪参数
    cropSize: 300, // 裁剪区域大小
    imageWidth: 300,
    imageHeight: 300,
    imageLeft: 0,
    imageTop: 0,
    scale: 1,
    scaledValue: '1.00',
    
    // 最大图片大小(2MB)
    maxSize: 2 * 1024 * 1024,
    
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
    
    // 加载现有LOGO
    this.loadCurrentLogo()
  },

  /**
   * 从数据库加载现有LOGO
   */
  async loadCurrentLogo() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getCurrentMerchant()
      console.log('获取商家信息成功:', res)
      
      if (res && res.data && res.data.logoUrl) {
        this.setData({
          logoPath: res.data.logoUrl,
          initialLogoPath: res.data.logoUrl
        })
      }
    } catch (error) {
      console.error('获取商家LOGO失败:', error)
      // 不显示错误提示，允许用户上传新LOGO
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 选择图片
   */
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        const size = res.tempFiles[0].size
        
        // 检查图片大小
        if (size > this.data.maxSize) {
          wx.showToast({
            title: '图片大小不能超过2MB',
            icon: 'none'
          })
          return
        }
        
        // 检查图片格式
        const ext = tempFilePath.split('.').pop().toLowerCase()
        if (!['jpg', 'jpeg', 'png'].includes(ext)) {
          wx.showToast({
            title: '只支持JPG、PNG格式',
            icon: 'none'
          })
          return
        }
        
        // 获取图片信息
        wx.getImageInfo({
          src: tempFilePath,
          success: (imageInfo) => {
            this.setData({
              tempImagePath: tempFilePath,
              imageWidth: imageInfo.width,
              imageHeight: imageInfo.height,
              cropping: true,
              scale: 1,
              imageLeft: 0,
              imageTop: 0
            })
            
            // 初始化裁剪区域
            this.initCropArea()
          },
          fail: (err) => {
            wx.showToast({
              title: '获取图片信息失败',
              icon: 'none'
            })
            console.error('获取图片信息失败', err)
          }
        })
      },
      fail: (err) => {
        console.error('选择图片失败', err)
      }
    })
  },

  /**
   * 初始化裁剪区域
   */
  initCropArea() {
    const { cropSize, imageWidth, imageHeight } = this.data
    
    // 计算图片缩放比例，确保图片能够覆盖裁剪区域
    const scale = Math.max(cropSize / imageWidth, cropSize / imageHeight)
    const newWidth = imageWidth * scale
    const newHeight = imageHeight * scale
    
    // 计算图片居中位置
    const left = (cropSize - newWidth) / 2
    const top = (cropSize - newHeight) / 2
    
    this.setData({
      imageWidth: newWidth,
      imageHeight: newHeight,
      imageLeft: left,
      imageTop: top,
      scale: 1,
      scaledValue: '1.00'
    })
  },

  /**
   * 调整缩放比例
   */
  onScaleChange(e) {
    const scale = parseFloat(e.detail.value)
    const scaledValue = scale.toFixed(2)
    this.setData({ scale, scaledValue })
  },

  /**
   * 确认裁剪
   */
  confirmCrop() {
    const { tempImagePath, cropSize, imageLeft, imageTop, scale } = this.data
    
    wx.showLoading({
      title: '裁剪中..'
    })
    
    // 创建画布上下文
    const ctx = wx.createCanvasContext('cropperCanvas')
    
    // 绘制裁剪区域
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, cropSize, cropSize)
    
    // 绘制裁剪后的图片
    ctx.drawImage(
      tempImagePath,
      imageLeft, 
      imageTop, 
      this.data.imageWidth, 
      this.data.imageHeight,
      0, 0, cropSize, cropSize
    )
    
    // 执行绘制
    ctx.draw(false, () => {
      // 延迟执行，确保画布绘制完成
      setTimeout(() => {
        // 保存画布到临时文件
        wx.canvasToTempFilePath({
          canvasId: 'cropperCanvas',
          success: (res) => {
            this.setData({
              logoPath: res.tempFilePath,
              cropping: false
            })
            
            wx.hideLoading()
            wx.showToast({
              title: '裁剪成功',
              icon: 'success'
            })
          },
          fail: (err) => {
            wx.hideLoading()
            wx.showToast({
              title: '裁剪失败',
              icon: 'none'
            })
            console.error('裁剪失败', err)
          }
        })
      }, 500)
    })
  },

  /**
   * 取消裁剪
   */
  cancelCrop() {
    this.setData({
      cropping: false,
      tempImagePath: ''
    })
  },

  /**
   * 重置裁剪
   */
  resetCrop() {
    this.initCropArea()
  },

  /**
   * 保存LOGO - 调用数据库API
   */
  async saveLogo() {
    const { logoPath } = this.data
    
    if (!logoPath) {
        wx.showToast({
            title: '请先选择图片',
            icon: 'none'
        });
        return;
    }

    // 检查是否是网络图片（未修改）
    if (logoPath.startsWith('http')) {
        wx.navigateBack();
        return;
    }
    
    const request = require('../../../../utils/request');
    
    try {
      // 上传图片
      const uploadedUrl = await request.upload('/api/upload', logoPath)
      console.log('上传LOGO成功:', uploadedUrl)
      
      // 调用API保存LOGO URL到数据库
      const res = await merchantApi.updateLogo(uploadedUrl)
      console.log('保存LOGO到数据库成功:', res)
      
      wx.showToast({
          title: 'LOGO保存成功',
          icon: 'success'
      });
      
      // 返回上一页
      setTimeout(() => {
          wx.navigateBack()
      }, 1500);
    } catch (error) {
      console.error('保存LOGO失败:', error);
      wx.showToast({
          title: error.message || '保存失败',
          icon: 'error'
      });
    }
  },

  /**
   * 删除LOGO - 调用数据库API
   */
  removeLogo() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除当前LOGO吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中..'
          })
          
          try {
            const result = await merchantApi.deleteLogo()
            console.log('删除LOGO成功:', result)
            
            wx.hideLoading()
            
            this.setData({
              logoPath: ''
            })
            
            wx.showToast({
              title: 'LOGO删除成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('删除LOGO失败:', error)
            wx.hideLoading()
            wx.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  /**
   * 检查是否有未保存的修改
   */
  hasUnsavedChanges() {
    const { logoPath, initialLogoPath } = this.data
    return logoPath !== initialLogoPath
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
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  }
})