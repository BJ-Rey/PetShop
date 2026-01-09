// pages/pet/add/add.js
const auth = require('../../../utils/auth');

Page({
  data: {
    images: [],
    formData: {
      name: '',
      gender: 'male',
      age: ''
    },
    breeds: ['英短', '美短', '布偶', '加菲', '中华田园猫', '其他'],
    breedIndex: null,
    isSubmitting: false
  },

  onLoad(options) {
    if (options.id) {
        // Edit mode (Mock)
        wx.setNavigationBarTitle({ title: '编辑宠物' });
        // Load data...
    }
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 3 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 验证大小 < 2MB
        const validFiles = res.tempFiles.filter(file => file.size <= 2 * 1024 * 1024);
        if (validFiles.length < res.tempFiles.length) {
            wx.showToast({ title: '部分图片超过2MB未添加', icon: 'none' });
        }
        const tempFilePaths = validFiles.map(file => file.path);
        this.setData({
          images: this.data.images.concat(tempFilePaths)
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.images
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 输入处理
  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value });
  },
  
  onAgeInput(e) {
    this.setData({ 'formData.age': e.detail.value });
  },

  bindBreedChange(e) {
    this.setData({ breedIndex: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ 'formData.gender': e.detail.value });
  },

  // 提交
  submitForm() {
    const { name } = this.data.formData;
    const { breedIndex, images } = this.data;

    // 验证
    if (!name || name.length < 2 || name.length > 10) {
      wx.showToast({ title: '名称需2-10个字符', icon: 'none' });
      return;
    }
    if (breedIndex === null) {
      wx.showToast({ title: '请选择品种', icon: 'none' });
      return;
    }
    // if (images.length === 0) {
    //   wx.showToast({ title: '请至少上传一张照片', icon: 'none' });
    //   return;
    // }

    this.setData({ isSubmitting: true });

    // 模拟后端API提交
    setTimeout(() => {
      const userInfo = auth.getUserInfo() || { id: 'mock_user_id' };
      const newPet = {
        id: Date.now(),
        userId: userInfo.id,
        name: name,
        breed: this.data.breeds[breedIndex],
        gender: this.data.formData.gender,
        age: this.data.formData.age,
        avatar: images[0] || 'https://placehold.co/200x200/FFA726/ffffff?text=Pet',
        images: images
      };

      // 保存到本地存储 (模拟数据库)
      const myPets = wx.getStorageSync('myPets') || [];
      myPets.unshift(newPet);
      wx.setStorageSync('myPets', myPets);

      wx.showToast({ title: '保存成功', icon: 'success' });
      this.setData({ isSubmitting: false });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },
  
  navigateBack() {
      wx.navigateBack();
  }
})
