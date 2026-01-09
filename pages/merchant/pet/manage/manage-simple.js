// pages/merchant/pet/manage/manage-simple.js
Page({
  data: {
    pets: [],
    isLoading: false,
    // 筛选条件
    filters: {
      keyword: '',
      status: 'all',
      hasOrder: 'all'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('简化版宠物管理页面加载');
    this.loadPets();
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 搜索输入事件
   */
  onSearchInput(e) {
    this.setData({
      'filters.keyword': e.detail.value
    });
  },

  /**
   * 搜索确认事件
   */
  onSearchConfirm() {
    this.loadPets();
  },

  /**
   * 切换筛选条件
   */
  changeFilter(e) {
    const type = e.currentTarget.dataset.type;
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      [`filters.${type}`]: value
    });
    
    this.loadPets();
  },

  /**
   * 加载宠物列表
   */
  loadPets() {
    this.setData({ isLoading: true });
    
    // 模拟API请求
    setTimeout(() => {
      // 生成模拟数据
      let pets = [];
      for (let i = 1; i <= 10; i++) {
        // 生成随机状态
        let status = Math.random() > 0.5 ? 'published' : 'unpublished';
        // 生成随机下定状态
        let hasOrder = Math.random() > 0.7;
        
        pets.push({
          id: i,
          name: `宠物${i}`,
          breed: ['金毛', '泰迪', '柯基', '萨摩耶', '比熊'][Math.floor(Math.random() * 5)],
          age: `${Math.floor(Math.random() * 3) + 1}岁`,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          color: ['棕色', '白色', '黑色', '花色', '灰色'][Math.floor(Math.random() * 5)],
          avatar: `https://example.com/pet${Math.floor(Math.random() * 10) + 1}.jpg`,
          price: (Math.random() * 2000 + 500).toFixed(2),
          deposit: ((Math.random() * 2000 + 500) * 0.3).toFixed(2),
          status: status,
          hasOrder: hasOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // 应用筛选条件
      const filteredPets = this.filterPets(pets);
      
      this.setData({
        pets: filteredPets,
        isLoading: false
      });
    }, 500);
  },
  
  /**
   * 筛选宠物列表
   */
  filterPets(pets) {
    const { filters } = this.data;
    
    return pets.filter(pet => {
      // 关键词过滤
      if (filters.keyword && !pet.name.includes(filters.keyword) && !pet.breed.includes(filters.keyword)) {
        return false;
      }
      
      // 状态过滤
      if (filters.status !== 'all' && pet.status !== filters.status) {
        return false;
      }
      
      // 下定状态过滤
      if (filters.hasOrder !== 'all') {
        if (filters.hasOrder === 'true' && !pet.hasOrder) {
          return false;
        }
        if (filters.hasOrder === 'false' && pet.hasOrder) {
          return false;
        }
      }
      
      return true;
    });
  },

  /**
   * 添加宠物
   */
  addPet() {
    wx.navigateTo({
      url: '/pages/pet/add/add'
    });
  },

  /**
   * 编辑宠物
   */
  editPet(e) {
    const petId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/pet/add/add?id=${petId}`
    });
  },

  /**
   * 查看宠物详情
   */
  viewPetDetail(e) {
    const petId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/merchant/pet/detail/detail?id=${petId}`
    });
  }
});
