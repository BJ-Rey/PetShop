//pet/detail/detail.js
const auth = require('../../../utils/auth');
const petStore = require('../../../utils/petStore');

Page({
  data: {
    petId: null,
    pet: null, // Remove hardcoded "Xiao Hei" data
    isLoading: true, // Loading state
    hasError: false, // Error state
    errorMsg: '', // Error message
    
    isMyPet: false,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    cartCount: 0, // 购物车商品数量
    
    // 联系商家相关
    showContactModal: false,
    merchantInfo: {
      phone: '13800138000', // 预设电话号码
      wechatQrcode: 'https://via.placeholder.com/200' // 微信二维码
    },
    
    // 价格调整相关
    showPriceAdjustModal: false,
    newPrice: 0,
    newDeposit: 0,
    depositPercentage: 0.3, // 定金比例
    
    // 导航栏相关
    statusBarHeight: 20,
    navBarHeight: 44,
    navBarTotalHeight: 64,
    capsuleWidth: 87,
    capsuleRight: 0,
    similarPets: [] // 类似推荐
  },

  onUnload: function() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },

  onPetStatusChange: function(allStates) {
    if (!this.data.petId || !this.data.pet) return;
    
    const status = allStates[this.data.petId];
    if (status) {
      const currentPet = this.data.pet;
      // 仅当状态不一致时更新
      if (currentPet.status !== status.status || currentPet.isOrdered !== status.isOrdered) {
        this.setData({
          'pet.status': status.status,
          'pet.statusText': status.statusText,
          'pet.isOrdered': status.isOrdered
        });
      }
    }
  },

  onLoad: function(options) {
    // 订阅状态变更
    this.unsubscribe = petStore.subscribe(this.onPetStatusChange.bind(this));

    // 获取系统信息用于自定义导航栏
    const sysInfo = wx.getSystemInfoSync()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    
    const statusBarHeight = sysInfo.statusBarHeight
    // 导航栏内容高度 = (胶囊按钮上边界 - 状态栏高度) * 2 + 胶囊按钮高度
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height
    const navBarTotalHeight = statusBarHeight + navBarHeight
    const capsuleWidth = menuButtonInfo.width
    const capsuleRight = sysInfo.windowWidth - menuButtonInfo.right
    
    this.setData({
      statusBarHeight,
      navBarHeight,
      navBarTotalHeight,
      capsuleWidth,
      capsuleRight
    })

    const petId = options.id
    const app = getApp()
    
    // 检查是否为商家，如果是则跳转到商家专属详情页
    if (app.globalData.isMerchant) {
      wx.redirectTo({
        url: `/pages/merchant/pet/detail/detail?id=${petId}`
      })
      return
    }

    this.setData({
      petId: petId
    })
    this.loadPetDetail()
    // 检查用户权限
    this.checkPermissions()
    // 计算购物车数量
    this.calculateCartCount()
    if (options.id) {
      this.loadSimilarPets(options.id)
    }
  },

  // 加载类似推荐
  loadSimilarPets(currentId) {
    const catApi = require('../../../api/catApi');
    // Fetch random pets or by same breed
    // API might not support 'similar', so we just fetch a list
    catApi.getCatList({ page: 1, pageSize: 3 }).then(res => {
        if (res && res.data) {
            // Filter out current pet if possible, or just take 3
            const similar = res.data.filter(p => p.id != currentId).slice(0, 3);
            this.setData({ similarPets: similar });
        }
    }).catch(err => {
        console.error('Load similar pets failed', err);
    });
  },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/pet/detail/detail?id=${id}`
    });
  },

  onShow: function() {
    // 再次检查商家权限，确保跳转
    const app = getApp()
    if (app.globalData.isMerchant) {
        // 如果当前页面已经在商家页面栈中，避免死循环（这里是用户端页面，所以直接跳转）
        // 但需要注意，如果是通过 navigateTo 进入的，redirectTo 是正确的
        if (this.data.petId) {
             wx.redirectTo({
                url: `/pages/merchant/pet/detail/detail?id=${this.data.petId}`
             })
             return
        }
    }

    // 页面显示时重新计算购物车数量
    this.calculateCartCount()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    // 模拟网络请求刷新数据
    setTimeout(() => {
      this.loadPetDetail();
      this.calculateCartCount();
      this.checkPermissions();
      
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'none'
      });
    }, 500);
  },

  // 检查用户权限
  checkPermissions: function() {
    const app = getApp()
    const isMerchant = app.globalData.isMerchant
    // 模拟判断是否是商家自己的宠物
    const isOwnPet = isMerchant // 这里简化处理，实际应该根据宠物的商家ID和当前用户ID判断
    this.setData({
      isMyPet: isOwnPet,
      isMerchant: isMerchant
    })
  },

  // 加载宠物详情
  loadPetDetail: function() {
    const petId = this.data.petId
    const catApi = require('../../../api/catApi');
    
    this.setData({ isLoading: true, hasError: false, errorMsg: '' });
    // wx.showLoading({ title: '加载中...' }); // Use page loading state instead

    catApi.getCatDetail(petId).then(pet => {
        // wx.hideLoading();
        
        // 数据处理
        if (pet) {
            // 计算定金（30%）
            pet.deposit = parseFloat((pet.price * 0.3).toFixed(2));
            // 格式化价格显示
            pet.price = parseFloat(pet.price).toFixed(2);
            
            // 检查宠物状态
            if (pet.status === 'booked' || pet.isOrdered) {
                pet.status = 'booked';
                pet.statusText = '已定';
                pet.isOrdered = true;
                pet.balanceStatus = 'pending'; 
                pet.balanceStatusText = '尾款待支付';
            } else if (pet.status === 'sold') {
                pet.status = 'sold';
                pet.statusText = '已售出';
                pet.isOrdered = true;
            } else {
                pet.status = 'available';
                pet.statusText = '可预订';
            }
            
            // 检查宠物是否已收藏
            // const isFav = isFavorite('pets', pet.id); // Need import or check logic
            
            this.setData({ 
              pet: pet, 
              isLoading: false,
              // isFavorite: isFav 
            });
        } else {
            this.setData({ 
                isLoading: false, 
                hasError: true, 
                errorMsg: '未找到该宠物信息' 
            });
        }
    }).catch(err => {
        // wx.hideLoading();
        console.error('Failed to load pet detail', err);
        // wx.showToast({ title: '加载失败', icon: 'none' });
        this.setData({ 
            isLoading: false, 
            hasError: true, 
            errorMsg: err.message || '加载失败，请检查网络' 
        });
    });
  },

  onRetry: function() {
      this.loadPetDetail();
  },

  // 上一页
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 编辑宠物
  editPet: function() {
    const app = getApp()
    // 检查权限
    if (app.checkPermission('edit_pet')) {
      wx.navigateTo({
        url: `/pages/pet/add/add?id=${this.data.petId}`
      })
    } else {
      wx.showToast({
        title: '您没有权限执行此操作',
        icon: 'none'
      })
    }
  },

  // 删除宠物
  deletePet: function() {
    const app = getApp()
    // 检查权限
    if (app.checkPermission('delete_pet')) {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除宠物「${this.data.pet.name}」吗？此操作不可恢复。`,
        confirmText: '删除',
        confirmColor: '#ff3b30',
        success: (res) => {
          if (res.confirm) {
            // 模拟API请求，实际应该调用后端API
            wx.showLoading({
              title: '删除中...'
            })
            
            setTimeout(() => {
              wx.hideLoading()
              // TODO: 调用API删除宠物
              console.log('删除宠物:', this.data.petId)
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            }, 1000)
          }
        }
      })
    } else {
      wx.showToast({
        title: '您没有权限执行此操作',
        icon: 'none'
      })
    }
  },

  // 分享宠物
  sharePet: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 跳转到亲属详情
  navigateToRelativeDetail: function(e) {
    const relativeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/pet/detail/detail?id=${relativeId}`
    })
  },

  // 添加亲属
  addRelative: function() {
    const app = getApp()
    // 检查权限
    if (app.checkPermission('add_pet')) {
      wx.navigateTo({
        url: `/pages/pet/add/relative?id=${this.data.petId}`
      })
    } else {
      wx.showToast({
        title: '您没有权限执行此操作',
        icon: 'none'
      })
    }
  },

  // 计算购物车数量
  calculateCartCount: function() {
    // 从本地存储获取购物车数据
    const cartItems = wx.getStorageSync('cartItems') || []
    // 计算购物车中商品的总数量
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)
    // 更新购物车数量
    this.setData({
      cartCount: cartCount
    })
  },

  // 跳转到购物车
  navigateToCart: function() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  },
  
  /**
   * 预约看宠
   */
  bookAppointment() {
    console.log('bookAppointment clicked');
    auth.checkPermission(() => {
        console.log('checkPermission callback executed');
        // 直接显示联系商家弹窗
        this.setData({
            showContactModal: true
        });
    });
  },

  /**
   * 显示联系商家模态框
   */
  showContactModal: function() {
    this.setData({
      showContactModal: true
    })
  },
  
  /**
   * 隐藏联系商家模态框
   */
  hideContactModal: function() {
    this.setData({
      showContactModal: false
    })
  },
  
  /**
   * 拨打商家电话
   */
  callMerchant: function() {
    const phone = this.data.merchantInfo.phone
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone,
        fail: function() {
          wx.showToast({
            title: '拨打失败，请检查电话号码',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '商家未设置电话号码',
        icon: 'none'
      })
    }
  },

  /**
   * 添加宠物到购物车
   */
  addToCart: function() {
    const pet = this.data.pet
    
    // 检查宠物状态
    if (pet.status !== 'available' || pet.isOrdered) {
      wx.showToast({
        title: '该宠物已被预订或售出',
        icon: 'none'
      })
      return
    }
    
    // 获取当前购物车数据
    const cartItems = wx.getStorageSync('cartItems') || []
    
    // 检查宠物是否已在购物车中
    const existingItemIndex = cartItems.findIndex(item => item.id === pet.id && item.type === 'pet')
    
    if (existingItemIndex >= 0) {
      // 宠物已在购物车中
      wx.showToast({
        title: '该宠物已在购物车中',
        icon: 'none'
      })
      return
    }
    
    // 构建宠物购物车项（使用定金价格）
    const cartItem = {
      id: pet.id,
      type: 'pet', // 区分宠物和普通商品
      name: pet.name,
      image: pet.images[0],
      price: pet.deposit, // 使用定金价格
      originalPrice: pet.price, // 显示原价
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      quantity: 1,
      checked: true,
      status: pet.status,
      statusText: pet.statusText
    }
    
    // 添加到购物车
    cartItems.push(cartItem)
    
    // 保存到本地存储
    wx.setStorageSync('cartItems', cartItems)
    
    // 显示添加成功提示
    wx.showToast({
      title: '添加到购物车成功',
      icon: 'success'
    })
  },
  
  /**
   * 直接下定，启动支付流程
   */
  directOrder: function() {
    auth.checkPermission(() => {
        const pet = this.data.pet
        
        // 检查宠物状态
        if (pet.status !== 'available' || pet.isOrdered) {
          wx.showToast({
            title: '该宠物已被预订或售出',
            icon: 'none'
          })
          return
        }
    
        // 显示订单确认弹窗
        wx.showModal({
            title: '确认下定',
            content: `您正在预定「${pet.name}」，定金金额 ¥${pet.deposit}。\n确定要继续吗？`,
            confirmText: '确认支付',
            confirmColor: '#1aad19',
            success: (res) => {
                if (res.confirm) {
                    this.processOrder(pet);
                }
            }
        });
    });
  },

  /**
   * 处理订单逻辑
   */
  processOrder: function(pet) {
    // 记录订单状态变更日志
    console.log(`[Order] Creating order for pet ${pet.id}. Price: ${pet.deposit}`);
    
    // 更新全局状态为已下定 (模拟下单成功)
    petStore.updateStatus(pet.id, 'booked', '已定', true);
    
    // 构建宠物购物车项（使用定金价格）
    const cartItem = {
      id: pet.id,
      type: 'pet', // 区分宠物和普通商品
      name: pet.name,
      image: pet.images[0],
      price: pet.deposit, // 使用定金价格
      originalPrice: pet.price, // 显示原价
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      quantity: 1,
      checked: true,
      status: 'booked',
      statusText: '已定'
    }
    
    // 直接跳转到订单创建页面，传入宠物信息
    wx.navigateTo({
      url: `/pages/order/create/create?items=${JSON.stringify([cartItem])}&directOrder=true`
    })
  },
  
  /**
   * 显示价格调整模态框
   */
  showPriceAdjustModal: function() {
    const pet = this.data.pet
    const depositPercentage = this.data.depositPercentage
    const newDeposit = parseFloat((pet.price * depositPercentage).toFixed(2))
    this.setData({
      showPriceAdjustModal: true,
      newPrice: pet.price,
      newDeposit: newDeposit
    })
  },
  
  /**
   * 隐藏价格调整模态框
   */
  hidePriceAdjustModal: function() {
    this.setData({
      showPriceAdjustModal: false
    })
  },
  
  /**
   * 监听价格输入变化
   */
  onPriceInputChange: function(e) {
    const newPrice = parseFloat(e.detail.value) || 0
    const depositPercentage = this.data.depositPercentage
    const newDeposit = parseFloat((newPrice * depositPercentage).toFixed(2))
    this.setData({
      newPrice: newPrice,
      newDeposit: newDeposit
    })
  },
  
  /**
   * 更新宠物价格和定金
   */
  updatePetPrice: function() {
    const newPrice = this.data.newPrice
    const depositPercentage = this.data.depositPercentage
    
    // 验证价格有效性
    if (newPrice <= 0 || isNaN(newPrice)) {
      wx.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      })
      return
    }
    
    // 计算定金（30%），保留两位小数
    const newDeposit = parseFloat((newPrice * depositPercentage).toFixed(2))
    
    // 更新宠物数据
    const pet = this.data.pet
    pet.price = newPrice
    pet.deposit = newDeposit
    
    // 保存更新到本地存储，用于在宠物管理列表页面同步显示
    let updatedPets = wx.getStorageSync('updatedPets') || []
    const existingIndex = updatedPets.findIndex(item => item.id === pet.id)
    
    if (existingIndex >= 0) {
      // 更新已存在的宠物数据
      updatedPets[existingIndex] = pet
    } else {
      // 添加新的宠物数据
      updatedPets.push(pet)
    }
    
    wx.setStorageSync('updatedPets', updatedPets)
    
    // 保存更新
    this.setData({
      pet: pet,
      showPriceAdjustModal: false
    })
    
    // 显示更新成功提示
    wx.showToast({
      title: '价格更新成功',
      icon: 'success'
    })
  }
})
