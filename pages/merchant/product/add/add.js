// pages/merchant/product/add/add.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 商品信息
    product: {
      name: '',
      category: 'food',
      price: '',
      originalPrice: '',
      stock: 0,
      status: 'unpublished',
      image: '',
      description: ''
    },
    
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
    selectedCategoryIndex: 0,
    selectedCategory: '食品',
    
    // SKU相关数据
    specNames: ['', ''], // 规格名称，最多支持2个规格
    specOptions: ['', ''], // 规格选项，用逗号分隔
    skuTable: [], // 生成的SKU表格
    
    // 上传图片相关
    imageList: []
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
   * 商品名称输入
   */
  onNameInput(e) {
    this.setData({
      'product.name': e.detail.value
    })
  },

  /**
   * 商品分类选择
   */
  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    
    this.setData({
      selectedCategoryIndex: index,
      selectedCategory: category.name,
      'product.category': category.id
    })
  },

  /**
   * 商品原价输入
   */
  onOriginalPriceInput(e) {
    this.setData({
      'product.originalPrice': parseFloat(e.detail.value) || ''
    })
  },

  /**
   * 商品现价输入
   */
  onPriceInput(e) {
    this.setData({
      'product.price': parseFloat(e.detail.value) || ''
    })
  },

  /**
   * 商品库存输入
   */
  onStockInput(e) {
    this.setData({
      'product.stock': parseInt(e.detail.value) || 0
    })
  },

  /**
   * 商品描述输入
   */
  onDescriptionInput(e) {
    this.setData({
      'product.description': e.detail.value
    })
  },

  /**
   * 商品状态切换
   */
  onStatusChange(e) {
    this.setData({
      'product.status': e.detail.value ? 'published' : 'unpublished'
    })
  },

  /**
   * 上传商品图片
   */
  uploadImage() {
    const that = this;
    wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            const request = require('../../../../utils/request');
            
            request.upload('/api/upload', tempFilePath).then(url => {
                that.setData({
                    'product.image': url
                });
                wx.showToast({
                    title: '上传成功',
                    icon: 'success'
                });
            }).catch(err => {
                console.error('上传失败', err);
                wx.showToast({
                    title: '上传失败',
                    icon: 'error'
                });
            });
        }
    });
  },

  /**
   * 规格名称输入
   */
  onSpecNameInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const specNames = [...this.data.specNames]
    specNames[index] = value
    
    this.setData({
      specNames: specNames
    })
  },

  /**
   * 规格选项输入
   */
  onSpecOptionsInput(e) {
    const index = e.currentTarget.dataset.index
    const value = e.detail.value
    const specOptions = [...this.data.specOptions]
    specOptions[index] = value
    
    this.setData({
      specOptions: specOptions
    })
  },

  /**
   * 生成SKU表格
   */
  generateSkuTable() {
    const specNames = this.data.specNames.filter(name => name.trim() !== '')
    const specOptions = this.data.specOptions
    
    if (specNames.length === 0 || specOptions[0].trim() === '') {
      wx.showToast({
        title: '请至少填写一个规格名称和对应的选项',
        icon: 'none'
      })
      return
    }
    
    // 解析规格选项
    const parsedOptions = specOptions.map(options => {
      return options.split(',').map(option => option.trim()).filter(option => option !== '')
    }).filter(options => options.length > 0)
    
    if (parsedOptions.length === 0) {
      wx.showToast({
        title: '请填写有效的规格选项',
        icon: 'none'
      })
      return
    }
    
    // 生成所有规格组合
    const skuCombinations = this.generateCombinations(parsedOptions)
    
    // 生成SKU表格数据
    const skuTable = skuCombinations.map((specs, index) => {
      return {
        id: index + 1,
        specs: specs,
        stock: 0,
        price: ''
      }
    })
    
    this.setData({
      skuTable: skuTable
    })
    
    wx.showToast({
      title: 'SKU表格生成成功',
      icon: 'success'
    })
  },

  /**
   * 生成规格组合
   */
  generateCombinations(options) {
    if (options.length === 0) {
      return []
    }
    
    if (options.length === 1) {
      return options[0].map(option => [option])
    }
    
    const result = []
    const firstOptions = options[0]
    const remainingOptions = options.slice(1)
    const remainingCombinations = this.generateCombinations(remainingOptions)
    
    firstOptions.forEach(option => {
      remainingCombinations.forEach(combination => {
        result.push([option, ...combination])
      })
    })
    
    return result
  },

  /**
   * SKU库存输入
   */
  onSkuStockInput(e) {
    const index = e.currentTarget.dataset.index
    const value = parseInt(e.detail.value) || 0
    const skuTable = [...this.data.skuTable]
    skuTable[index].stock = value
    
    this.setData({
      skuTable: skuTable
    })
  },

  /**
   * SKU价格输入
   */
  onSkuPriceInput(e) {
    const index = e.currentTarget.dataset.index
    const value = parseFloat(e.detail.value) || ''
    const skuTable = [...this.data.skuTable]
    skuTable[index].price = value
    
    this.setData({
      skuTable: skuTable
    })
  },

  /**
   * 删除SKU
   */
  deleteSku(e) {
    const index = e.currentTarget.dataset.index
    const skuTable = [...this.data.skuTable]
    skuTable.splice(index, 1)
    
    this.setData({
      skuTable: skuTable
    })
  },

  /**
   * 保存商品
   */
  saveProduct() {
    // 验证商品信息
    if (!this.validateProduct()) {
      return
    }
    
    // 构建商品数据
    const productData = {
      ...this.data.product,
      sales: 0
    }
    
    // 添加SKU信息（如果有）
    if (this.data.skuTable.length > 0) {
      productData.skus = this.data.skuTable.map(sku => ({
          ...sku,
          specs: JSON.stringify(sku.specs) // 将数组转为字符串存储，或者后端支持数组
      }));
      // 保存规格定义，以便回显
      productData.specNames = JSON.stringify(this.data.specNames);
      productData.specOptions = JSON.stringify(this.data.specOptions);
    }
    
    wx.showLoading({
      title: '保存中...'
    })
    
    productApi.addProduct(productData).then(res => {
        wx.hideLoading();
        wx.showToast({
            title: '商品保存成功',
            icon: 'success'
        });
        
        // 跳转到商品管理页面
        setTimeout(() => {
            wx.navigateTo({
                url: '/pages/merchant/product/manage/manage'
            });
        }, 1500);
    }).catch(err => {
        wx.hideLoading();
        console.error('保存商品失败:', err);
        wx.showToast({
            title: '保存失败',
            icon: 'error'
        });
    });
  },

  /**
   * 验证商品信息
   */
  validateProduct() {
    const product = this.data.product
    
    if (!product.name.trim()) {
      wx.showToast({
        title: '请输入商品名称',
        icon: 'none'
      })
      return false
    }
    
    if (!product.price) {
      wx.showToast({
        title: '请输入商品现价',
        icon: 'none'
      })
      return false
    }
    
    if (!product.originalPrice) {
      wx.showToast({
        title: '请输入商品原价',
        icon: 'none'
      })
      return false
    }
    
    if (product.stock < 0) {
      wx.showToast({
        title: '库存不能为负数',
        icon: 'none'
      })
      return false
    }
    
    // 如果有SKU表格，验证SKU信息
    if (this.data.skuTable.length > 0) {
      for (let i = 0; i < this.data.skuTable.length; i++) {
        const sku = this.data.skuTable[i]
        if (sku.stock < 0) {
          wx.showToast({
            title: `SKU ${i + 1} 库存不能为负数`,
            icon: 'none'
          })
          return false
        }
        if (!sku.price) {
          wx.showToast({
            title: `请输入SKU ${i + 1} 的价格`,
            icon: 'none'
          })
          return false
        }
      }
    }
    
    return true
  },

  /**
   * 上一页
   */
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})
