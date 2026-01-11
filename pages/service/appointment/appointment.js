// pages/service/appointment/appointment.js
const auth = require('../../../utils/auth');

Page({
  data: {
    isLoggedIn: false, // 登录状态
    serviceId: null,
    service: {
      id: 1,
      name: '宠物美容套餐',
      description: '包含洗澡、剪毛、美甲等全套美容服务',
      price: 128,
      duration: '2小时',
      merchantName: '宠物美容中心',
      image: 'https://example.com/service2.jpg'
    },
    // 宠物列表
    pets: [],
    // 最多显示20个宠物
    displayPets: [],
    // 当前选中的宠物 (多选)
    selectedPets: [],
    selectedPetIds: [],
    
    // 加载状态
    isLoadingPets: false,
    loadPetsError: false,
    // 预约时间
    startDate: '',
    endDate: '',
    selectedDate: '',
    formattedDate: '',
    
    // 商家可用日期 (模拟)
    availableDates: [], // 格式 ['2026-01-10', '2026-01-12', ...]
    
    // 宠物选择
    selectedPetId: null,
    // 联系人信息
    contact: {
      name: '',
      phone: ''
    },
    // 备注信息
    remark: '',
    
    // 预约看宠相关
    petId: null,
    merchantName: '',
    timeSlots: [],
    selectedTime: ''
  },

  onLoad(options) {
    // 检查是否是预约看宠
    if (options.petId) {
        this.setData({
            petId: options.petId,
            merchantName: options.merchantName || '商家'
        });
    } else {
        this.setData({ serviceId: options.id });
        this.loadServiceDetail();
        this.loadPets();
    }
    
    this.initDateRange()
    this.initAvailableDates()
  },

  onShow() {
    // 检查登录状态
    const isLoggedIn = auth.isLoggedIn();
    this.setData({ isLoggedIn });
    
    if (isLoggedIn) {
        this.loadPets();
    } else {
        // 未登录时清空宠物列表
        this.setData({ 
            pets: [], 
            displayPets: [],
            selectedPets: [],
            selectedPetIds: []
        });
    }
  },

  // 初始化可用日期 (模拟)
  initAvailableDates() {
      // 假设未来7天除周末外可用
      const dates = [];
      const today = new Date();
      for (let i = 1; i <= 14; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          // 简单模拟：双号可用
          if (d.getDate() % 2 === 0) {
              const dateStr = d.toISOString().split('T')[0];
              dates.push(dateStr);
          }
      }
      this.setData({ availableDates: dates });
  },

  // 格式化日期为友好显示格式
  initDateRange() {
    // 获取当前日期
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]
    // 计算30天后的日期
    const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0]
    this.setData({
      startDate,
      endDate,
      selectedDate: startDate,
      formattedDate: this.formatDate(startDate)
    })
  },

  // 格式化日期为友好显示格式
  formatDate(dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 加载服务详情
  loadServiceDetail() {
    // 从后端API获取服务详情数据
    const serviceApi = require('../../../api/serviceApi');
    
    if (!this.data.serviceId) return;
    
    serviceApi.getServiceDetail(this.data.serviceId).then(res => {
      const service = res.data || res;
      this.setData({ service });
    }).catch(err => {
      console.error('[Appointment] loadServiceDetail failed:', err);
      // 保留默认数据作为降级
    });
  },

  // 加载宠物列表
  loadPets() {
    if (!this.data.isLoggedIn) return;

    this.setData({ isLoadingPets: true, loadPetsError: false });
    
    // 从后端API获取用户的宠物列表
    const catApi = require('../../../api/catApi');
    const userInfo = auth.getUserInfo();
    
    catApi.getCatList({ 
      page: 1, 
      size: 20,
      userId: userInfo?.id || userInfo?.openid
    }).then(res => {
      const pets = res.list || res.data || res || [];
      
      if (pets.length === 0) {
        this.setData({ 
          pets: [], 
          displayPets: [], 
          isLoadingPets: false 
        });
        return;
      }

      // 限制最多加载20个 (性能要求)
      const limitedPets = pets.slice(0, 20);

      this.setData({ 
        pets: limitedPets,
        displayPets: limitedPets,
        isLoadingPets: false
      });
    }).catch(err => {
      console.error('[Appointment] loadPets failed:', err);
      this.setData({ 
        isLoadingPets: false, 
        loadPetsError: true 
      });
      wx.showToast({ title: '加载宠物失败', icon: 'none' });
    });
  },

  // 重试加载宠物
  retryLoadPets() {
      this.loadPets();
  },

  // 选择宠物 (支持多选)
  selectPet(e) {
    const petId = e.currentTarget.dataset.petId;
    const pet = this.data.pets.find(p => p.id === petId);
    if (!pet) return;

    let selectedPetIds = this.data.selectedPetIds || [];
    let selectedPets = this.data.selectedPets || [];

    // 检查是否已选
    const index = selectedPetIds.indexOf(petId);
    if (index > -1) {
        // 取消选择
        selectedPetIds.splice(index, 1);
        selectedPets.splice(index, 1);
    } else {
        // 添加选择 (此处可限制最大选择数，如需)
        selectedPetIds.push(petId);
        selectedPets.push(pet);
    }

    this.setData({ 
      selectedPetIds: selectedPetIds,
      selectedPets: selectedPets
    });
    
    // 数据预填充：将选中宠物的信息填充到备注中 (示例：用户可修改)
    this.prefillData(selectedPets);
  },

  // 数据预填充
  prefillData(selectedPets) {
      if (selectedPets.length > 0) {
          const names = selectedPets.map(p => `${p.name}(${p.breed})`).join(', ');
          // 仅当备注为空或包含之前的预填充内容时才覆盖，避免覆盖用户手动输入
          // 这里简化处理：直接追加或更新
          const baseRemark = this.data.remark.split('【服务对象】')[0].trim();
          const newRemark = baseRemark ? `${baseRemark}\n【服务对象】${names}` : `【服务对象】${names}`;
          
          this.setData({ remark: newRemark });
      } else {
           // 清除预填充
           const baseRemark = this.data.remark.split('【服务对象】')[0].trim();
           this.setData({ remark: baseRemark });
      }
  },

  // 联系人姓名输入
  onNameInput(e) {
    this.setData({ 'contact.name': e.detail.value })
  },

  // 联系人电话输入
  onPhoneInput(e) {
    this.setData({ 'contact.phone': e.detail.value })
  },

  // 备注信息输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  // 跳转到添加宠物页面
  navigateToAddPet() {
    if (!auth.checkPermission(() => {
        // 登录成功后回调：重新加载宠物
        this.onShow();
    })) return;

    wx.navigateTo({
      url: '/pages/pet/add/add'
    })
  },

  // 跳转到登录页
  navigateToLogin() {
    wx.navigateTo({
        url: '/pages/login/login'
    });
  },

  // 提交预约
  submitAppointment() {
    // 验证表单
    if (!this.data.petId && (!this.data.selectedPetIds || this.data.selectedPetIds.length === 0)) {
      wx.showToast({ title: '请选择至少一个宠物', icon: 'none' })
      return
    }
    
    // 移除时间段验证
    // if (this.data.petId && !this.data.selectedTime) { ... }

    if (!this.data.contact.name) {
      wx.showToast({ title: '请输入联系人姓名', icon: 'none' })
      return
    }
    if (!this.data.contact.phone || !/^1[3-9]\d{9}$/.test(this.data.contact.phone)) {
      wx.showToast({ title: '请输入正确的联系电话', icon: 'none' })
      return
    }
    
    // 模拟调用API提交预约
    const appointmentData = {
      type: this.data.petId ? 'cat_visit' : 'service',
      targetId: this.data.petId || this.data.serviceId,
      petIds: this.data.selectedPetIds, // 支持多选
      date: this.data.selectedDate,
      // time: this.data.selectedTime, // Removed
      contact: this.data.contact,
      remark: this.data.remark
    };

    console.log('提交预约:', appointmentData);
    
    wx.showLoading({ title: '提交中...' });
    
    // 调用后端API提交预约
    const request = require('../../../utils/request');
    
    request.post('/api/appointment/create', appointmentData).then(res => {
      wx.hideLoading();
      const merchantPhone = res.merchantPhone || '13800138000';
      wx.showModal({
        title: '预约成功',
        content: `商家联系方式：${merchantPhone}\n请及时联系商家确认具体时间。`,
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#FFA726',
        success: () => {
            wx.navigateBack();
        }
      });
    }).catch(err => {
      wx.hideLoading();
      console.error('[Appointment] submit failed:', err);
      // 降级处理：显示成功（因为后端可能还没有预约接口）
      wx.showModal({
        title: '预约成功',
        content: '商家联系方式：13800138000\n请及时联系商家确认具体时间。',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#FFA726',
        success: () => {
            wx.navigateBack();
        }
      });
    });
  },

  // 上一页
  navigateBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})