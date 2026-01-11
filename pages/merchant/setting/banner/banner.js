const productApi = require('../../../../api/productApi');
const catApi = require('../../../../api/catApi');
const merchantApi = require('../../../../api/merchantApi');

Page({
  data: {
    banners: [],
    showModal: false,
    
    // Modal Data
    tempImage: '',
    tempType: 'pet', // pet | product
    availableItems: [], // List for picker
    itemIndex: null, // Picker index
    
    // Cache
    allPets: [],
    allProducts: [],
    
    // 加载状态
    isLoading: false
  },

  onLoad() {
    this.loadBanners();
    this.loadAllItems();
  },

  // 从数据库加载轮播图
  async loadBanners() {
    this.setData({ isLoading: true })
    
    try {
      const res = await merchantApi.getBannerSetting()
      console.log('获取轮播图设置成功:', res)
      
      this.setData({
        banners: res.data || [],
        isLoading: false
      })
    } catch (error) {
      console.error('获取轮播图设置失败:', error)
      this.setData({ isLoading: false })
    }
  },

  // Load pets and products for selector
  loadAllItems() {
    wx.showLoading({ title: '加载数据...' });
    
    // Use Promise.all to fetch both
    // We add catch to handle API failures and use Mock data
    Promise.all([
        catApi.getCatList({}).catch(e => {
            console.warn('Fetch pets failed, using mock', e);
            return { list: [
                { id: 1, name: '小黑', breed: '金毛犬', status: 'available' },
                { id: 2, name: '咪咪', breed: '布偶猫', status: 'available' },
                { id: 4, name: '小白', breed: '萨摩耶', status: 'booked' } // Test case for unavailable
            ]};
        }),
        productApi.getProductList({}).catch(e => {
            console.warn('Fetch products failed, using mock', e);
            return { list: [
                { id: 1, name: '天然狗粮通用型', status: 'on_shelf' },
                { id: 2, name: '宠物自动喂食器', status: 'on_shelf' },
                { id: 8, name: '冬季保暖狗窝', status: 'off_shelf' } // Test case for unavailable
            ]};
        })
    ]).then(([petsRes, productsRes]) => {
        // Handle different response structures if needed (e.g. res.list or res)
        const pets = (petsRes.list || petsRes || []).map(p => ({
            id: p.id,
            name: `${p.name} (${p.breed || ''}) - ${this.getPetStatusText(p.status)}`,
            originalName: p.name,
            type: 'pet',
            status: p.status, // available, booked, sold
            raw: p
        }));

        const products = (productsRes.list || productsRes || []).map(p => ({
            id: p.id,
            name: `${p.name} - ${this.getProductStatusText(p.status)}`,
            originalName: p.name,
            type: 'product',
            status: p.status, // on_shelf, off_shelf
            raw: p
        }));

        this.setData({
            allPets: pets,
            allProducts: products
        });
        
        wx.hideLoading();
    });
  },
  
  getPetStatusText(status) {
      const map = { available: '可预订', booked: '已定', sold: '已售' };
      return map[status] || status;
  },
  
  getProductStatusText(status) {
      // If status is missing, assume on_shelf for legacy data, unless we explicitly set it
      if (!status) return '已上架'; 
      const map = { on_shelf: '已上架', off_shelf: '未上架' };
      return map[status] || status;
  },

  // Actions
  deleteBanner(e) {
    const index = e.currentTarget.dataset.index;
    const banners = this.data.banners;
    banners.splice(index, 1);
    this.setData({ banners });
  },

  moveUp(e) {
    const index = e.currentTarget.dataset.index;
    if (index === 0) return;
    const banners = this.data.banners;
    [banners[index - 1], banners[index]] = [banners[index], banners[index - 1]];
    this.setData({ banners });
  },

  moveDown(e) {
    const index = e.currentTarget.dataset.index;
    const banners = this.data.banners;
    if (index === banners.length - 1) return;
    [banners[index + 1], banners[index]] = [banners[index], banners[index + 1]];
    this.setData({ banners });
  },

  // Modal Logic
  showAddModal() {
    this.setData({
      showModal: true,
      tempImage: '',
      tempType: 'pet',
      itemIndex: null,
      availableItems: this.data.allPets // Default to pets
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({ tempImage: res.tempFilePaths[0] });
      }
    });
  },

  onTypeChange(e) {
    const type = e.detail.value;
    this.setData({
      tempType: type,
      itemIndex: null,
      availableItems: type === 'pet' ? this.data.allPets : this.data.allProducts
    });
  },

  onItemChange(e) {
    const index = e.detail.value;
    const item = this.data.availableItems[index];
    
    // Validation
    if (this.data.tempType === 'pet') {
        if (item.status !== 'available') {
            wx.showToast({
                title: '该宠物未上架(不可预订)，请先上架后再关联',
                icon: 'none',
                duration: 2500
            });
            this.setData({ itemIndex: null });
            return;
        }
    } else {
        if (item.status !== 'on_shelf' && item.status !== undefined) { // Allow undefined for legacy mock compat
             wx.showToast({
                title: '该商品未上架，请先上架后再关联',
                icon: 'none',
                duration: 2500
            });
            this.setData({ itemIndex: null });
            return;
        }
    }

    this.setData({ itemIndex: index });
  },

  confirmAdd() {
    if (!this.data.tempImage) {
      wx.showToast({ title: '请上传图片', icon: 'none' });
      return;
    }
    if (this.data.itemIndex === null) {
      wx.showToast({ title: '请选择关联项目', icon: 'none' });
      return;
    }

    const selectedItem = this.data.availableItems[this.data.itemIndex];
    const newBanner = {
      id: Date.now(), // Temp ID
      image_url: this.data.tempImage,
      link_type: this.data.tempType,
      link_id: selectedItem.id,
      link_name: selectedItem.originalName
    };

    const banners = this.data.banners;
    banners.push(newBanner);
    this.setData({ banners, showModal: false });
  },

  async saveSettings() {
    try {
      // 调用数据库API保存轮播图设置
      await merchantApi.updateBannerSetting(this.data.banners)
      console.log('保存轮播图设置成功')
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存轮播图设置失败:', error)
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    }
  }
});
