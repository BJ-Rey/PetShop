// pages/pet/list/list.js
const auth = require('../../../utils/auth');

Page({
  data: {
    pets: [],
    isMyPetsMode: false,
    startX: 0,
    startY: 0,
    isLoggedIn: false
  },

  onLoad(options) {
    if (options.tab === 'my') {
      this.setData({ isMyPetsMode: true });
      // this.loadMyPets(); // 移至onShow加载，避免重复
    } else {
        this.loadPublicPets();
    }
  },

  // 加载公共宠物列表
  loadPublicPets() {
      const catApi = require('../../../api/catApi');
      catApi.getCatList({ page: 1, size: 20 }).then(pets => {
          // 添加translateX用于滑动
          const petsWithSlide = pets.map(p => ({ ...p, translateX: 0 }));
          this.setData({ pets: petsWithSlide });
      }).catch(err => {
          console.error('Failed to load public pets', err);
          wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  onShow() {
    // 检查登录状态
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });

    if (this.data.isMyPetsMode) {
      // 检查登录状态
      if (!isLoggedIn) {
          this.setData({ pets: [] });
          // 可选：引导登录或显示空状态（WXML已处理）
          return;
      }
      this.loadMyPets();
    }
  },

  // 加载我的宠物
  loadMyPets() {
    if (!auth.isLoggedIn()) return;
    
    // 从后端API获取用户的宠物列表
    const catApi = require('../../../api/catApi');
    const userInfo = auth.getUserInfo();
    
    catApi.getCatList({ 
      page: 1, 
      size: 50,
      userId: userInfo?.id || userInfo?.openid  // 按用户ID筛选
    }).then(res => {
      const pets = res.list || res.data || res || [];
      // 添加translateX用于滑动
      const petsWithSlide = pets.map(p => ({ ...p, translateX: 0 }));
      this.setData({ pets: petsWithSlide });
    }).catch(err => {
      console.error('[PetList] loadMyPets failed:', err);
      // 失败时尝试从本地缓存获取（降级方案）
      const myPets = wx.getStorageSync('myPets') || [];
      const petsWithSlide = myPets.map(p => ({ ...p, translateX: 0 }));
      this.setData({ pets: petsWithSlide });
    });
  },

  // 跳转添加
  navigateToAdd() {
    if (!auth.checkPermission(() => {
        this.onShow();
    })) return;

    wx.navigateTo({ url: '/pages/pet/add/add' });
  },

  navigateBack() {
    wx.navigateBack();
  },

  // 跳转到登录页
  navigateToLogin() {
      wx.navigateTo({
          url: '/pages/login/login'
      });
  },

  // 编辑宠物
  editPet(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({ url: `/pages/pet/add/add?id=${id}` });
  },

  // 删除宠物
  deletePet(e) {
      const index = e.currentTarget.dataset.index;
      const id = e.currentTarget.dataset.id;
      
      wx.showModal({
          title: '确认删除',
          content: '确定要删除这只宠物吗？',
          success: (res) => {
              if (res.confirm) {
                  const pets = this.data.pets;
                  pets.splice(index, 1);
                  this.setData({ pets });
                  
                  // 更新存储
                  const myPets = wx.getStorageSync('myPets') || [];
                  const newMyPets = myPets.filter(p => p.id !== id);
                  wx.setStorageSync('myPets', newMyPets);
                  
                  wx.showToast({ title: '删除成功', icon: 'success' });
              } else {
                  // Reset slide
                  const pets = this.data.pets;
                  pets[index].translateX = 0;
                  this.setData({ pets });
              }
          }
      });
  },

  // 滑动逻辑
  touchStart(e) {
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    });
    // Close others
    const pets = this.data.pets.map(p => ({ ...p, translateX: 0 }));
    this.setData({ pets });
  },

  touchMove(e) {
    const index = e.currentTarget.dataset.index;
    const moveX = e.touches[0].clientX;
    const diffX = moveX - this.data.startX;
    
    let translateX = diffX;
    if (translateX < -120) translateX = -120;
    if (translateX > 0) translateX = 0;
    
    const pets = this.data.pets;
    pets[index].translateX = translateX;
    this.setData({ pets });
  },

  touchEnd(e) {
    const index = e.currentTarget.dataset.index;
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - this.data.startX;
    
    const pets = this.data.pets;
    if (diffX < -60) {
        pets[index].translateX = -120;
    } else {
        pets[index].translateX = 0;
    }
    this.setData({ pets });
  }
})
