// pages/merchant/service/manage/manage.js
const auth = require('../../../../utils/auth');
const globalUtils = require('../../../../utils/globalUtils');
const serviceApi = require('../../../../api/serviceApi');
const { logError } = globalUtils;
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    services: [],
    isLoading: false,
    error: null,
    
    // 筛选条件
    filter: {
      status: 'all', // all, published, unpublished
      category: 'all', // all, grooming, boarding, training, medical
      keyword: ''
    },
    // 展开的筛选器
    expandedFilter: '',
    
    // 排序条件
    sortField: 'createdAt',
    sortOrder: 'desc',
    
    // 批量操作
    selectedServiceIds: [],
    isAllSelected: false,
    
    // 更多批量操作
    showMoreActions: false,
    
    // 服务分类列表
    categories: [
      { id: 'grooming', name: '美容' },
      { id: 'boarding', name: '寄养' },
      { id: 'training', name: '训练' },
      { id: 'medical', name: '医疗' },
      { id: 'photography', name: '摄影' },
      { id: 'foster', name: '领养' },
      { id: 'other', name: '其他' }
    ],
    
    // 批量更新分类弹窗
    showUpdateCategoryModal: false,
    selectedUpdateCategoryIndex: 0,
    selectedUpdateCategory: '美容',
    
    // 批量更新价格弹窗
    showUpdatePriceModal: false,
    priceUpdateType: 'percentage',
    priceUpdateValue: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!app.checkLogin()) {
      return;
    }
    
    // 检查权限
    const that = this;
    auth.permissionInterceptor('merchant', 
      function() {
        that.loadServices();
      },
      function() {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    );
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadServices();
  },

  /**
   * 加载服务列表
   */
  loadServices() {
    this.setData({ isLoading: true, error: null });
    
    const that = this;
    
    const params = {
        keyword: this.data.filter.keyword,
        category: this.data.filter.category === 'all' ? '' : this.data.filter.category,
        status: this.data.filter.status === 'all' ? '' : this.data.filter.status,
        sortField: this.data.sortField,
        sortOrder: this.data.sortOrder
    };

    serviceApi.getServiceList(params).then(res => {
        const services = res.data || [];
        // 格式化数据
        const formattedServices = services.map(s => ({
            ...s,
            status: s.status || (s.isOnSale ? 'published' : 'unpublished')
        }));
        
        that.setData({
            services: formattedServices,
            isLoading: false,
            error: null
        });
    }).catch(err => {
        console.error('加载服务列表失败:', err);
        logError('LoadServices', err);
        that.setData({
            isLoading: false,
            error: '加载失败'
        });
    });
  },

  /**
   * 切换服务状态（上下架）
   */
  toggleServiceStatus(e) {
    const serviceId = e.currentTarget.dataset.id;
    const services = this.data.services;
    const index = services.findIndex(s => s.id === serviceId);
    
    if (index === -1) return;
    
    const service = services[index];
    const newStatus = service.status === 'published' ? 'unpublished' : 'published';
    const statusText = newStatus === 'published' ? '上架' : '下架';
    
    wx.showModal({
      title: '确认操作',
      content: `确定要将服务「${service.name}」${statusText}吗？`,
      confirmText: statusText,
      confirmColor: newStatus === 'published' ? '#07c160' : '#ff3b30',
      success: res => {
        if (res.confirm) {
          this.confirmToggleStatus(serviceId, index, newStatus);
        }
      }
    });
  },
  
  /**
   * 确认切换状态
   */
  confirmToggleStatus(serviceId, index, newStatus) {
    const services = this.data.services;
    
    wx.showLoading({ title: '更新中...' });
    
    serviceApi.updateService({ id: serviceId, status: newStatus }).then(res => {
        wx.hideLoading();
        const updatedServices = [...services];
        updatedServices[index].status = newStatus;
        updatedServices[index].updatedAt = new Date().toISOString();
        
        this.setData({ services: updatedServices });
        
        wx.showToast({
            title: newStatus === 'published' ? '上架成功' : '下架成功',
            icon: 'success'
        });
    }).catch(err => {
        wx.hideLoading();
        console.error('更新状态失败:', err);
        wx.showToast({
            title: '更新失败',
            icon: 'error'
        });
    });
  },

  /**
   * 搜索
   */
  onSearch(e) {
    this.setData({ 'filter.keyword': e.detail.value });
    this.loadServices(); // 实际应防抖
  },

  /**
   * 切换筛选
   */
  changeFilter(e) {
    const type = e.currentTarget.dataset.type;
    const value = e.currentTarget.dataset.value;
    this.setData({
      [`filter.${type}`]: value,
      expandedFilter: ''
    });
    this.loadServices();
  },
  
  toggleFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      expandedFilter: this.data.expandedFilter === type ? '' : type
    });
  },

  /**
   * 切换排序
   */
  changeSort(e) {
    const field = e.currentTarget.dataset.field;
    let newOrder = 'desc';
    if (field === this.data.sortField) {
      newOrder = this.data.sortOrder === 'desc' ? 'asc' : 'desc';
    }
    
    this.setData({
      sortField: field,
      sortOrder: newOrder,
      expandedFilter: ''
    });
    this.loadServices();
  },

  /**
   * 批量选择逻辑
   */
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    const selectedIds = [...this.data.selectedServiceIds];
    const index = selectedIds.indexOf(id);
    
    if (index === -1) selectedIds.push(id);
    else selectedIds.splice(index, 1);
    
    this.setData({
      selectedServiceIds: selectedIds,
      isAllSelected: selectedIds.length === this.data.services.length && this.data.services.length > 0
    });
  },
  
  toggleAllSelect(e) {
    const isAll = e.detail.value.includes('all');
    this.setData({
      isAllSelected: isAll,
      selectedServiceIds: isAll ? this.data.services.map(s => s.id) : []
    });
  },

  /**
   * 批量操作
   */
  batchPublish() {
    this.executeBatchAction('published', '上架');
  },
  
  batchUnpublish() {
    this.executeBatchAction('unpublished', '下架');
  },
  
  executeBatchAction(status, text) {
    const ids = this.data.selectedServiceIds;
    if (ids.length === 0) return wx.showToast({ title: '请选择服务', icon: 'none' });
    
    wx.showModal({
      title: `确认批量${text}`,
      content: `确定要将选中的${ids.length}个服务${text}吗？`,
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          setTimeout(() => {
            wx.hideLoading();
            const updatedServices = this.data.services.map(s => {
              if (ids.includes(s.id)) {
                return { ...s, status, updatedAt: new Date().toISOString() };
              }
              return s;
            });
            this.setData({
              services: updatedServices,
              selectedServiceIds: [],
              isAllSelected: false
            });
            wx.showToast({ title: `批量${text}成功`, icon: 'success' });
          }, 500);
        }
      }
    });
  },

  batchDelete() {
    const ids = this.data.selectedServiceIds;
    if (ids.length === 0) return wx.showToast({ title: '请选择服务', icon: 'none' });
    
    wx.showModal({
      title: '确认批量删除',
      content: `确定要删除选中的${ids.length}个服务吗？不可恢复。`,
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          setTimeout(() => {
            wx.hideLoading();
            const updatedServices = this.data.services.filter(s => !ids.includes(s.id));
            this.setData({
              services: updatedServices,
              selectedServiceIds: [],
              isAllSelected: false
            });
            wx.showToast({ title: '批量删除成功', icon: 'success' });
          }, 500);
        }
      }
    });
  },

  /**
   * 更多操作菜单
   */
  toggleMoreActions() {
    this.setData({ showMoreActions: !this.data.showMoreActions });
  },

  // 批量更新分类
  batchUpdateCategory() {
    this.setData({ showMoreActions: false, showUpdateCategoryModal: true });
  },
  
  closeUpdateCategoryModal() {
    this.setData({ showUpdateCategoryModal: false });
  },
  
  onUpdateCategoryChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedUpdateCategoryIndex: index,
      selectedUpdateCategory: this.data.categories[index].name
    });
  },
  
  confirmBatchUpdateCategory() {
    const ids = this.data.selectedServiceIds;
    const category = this.data.categories[this.data.selectedUpdateCategoryIndex];
    
    if (ids.length === 0) return;
    
    wx.showLoading({ title: '更新中...' });
    setTimeout(() => {
      wx.hideLoading();
      const updatedServices = this.data.services.map(s => {
        if (ids.includes(s.id)) return { ...s, category: category.id };
        return s;
      });
      this.setData({
        services: updatedServices,
        showUpdateCategoryModal: false,
        selectedServiceIds: [],
        isAllSelected: false
      });
      wx.showToast({ title: '更新成功', icon: 'success' });
    }, 500);
  },

  // 批量更新价格
  batchUpdatePrice() {
    this.setData({ showMoreActions: false, showUpdatePriceModal: true });
  },
  
  closeUpdatePriceModal() {
    this.setData({ showUpdatePriceModal: false });
  },
  
  onPriceUpdateTypeChange(e) {
    this.setData({ priceUpdateType: e.detail.value });
  },
  
  onPriceUpdateValueInput(e) {
    this.setData({ priceUpdateValue: e.detail.value });
  },
  
  confirmBatchUpdatePrice() {
    const ids = this.data.selectedServiceIds;
    const type = this.data.priceUpdateType;
    const val = parseFloat(this.data.priceUpdateValue);
    
    if (ids.length === 0 || isNaN(val)) return wx.showToast({ title: '请输入有效数值', icon: 'none' });
    
    wx.showLoading({ title: '更新中...' });
    setTimeout(() => {
      wx.hideLoading();
      const updatedServices = this.data.services.map(s => {
        if (ids.includes(s.id)) {
          let newPrice = s.price;
          if (type === 'percentage') newPrice *= (1 + val / 100);
          else newPrice += val;
          return { ...s, price: parseFloat(Math.max(0, newPrice).toFixed(2)) };
        }
        return s;
      });
      this.setData({
        services: updatedServices,
        showUpdatePriceModal: false,
        selectedServiceIds: [],
        isAllSelected: false,
        priceUpdateValue: ''
      });
      wx.showToast({ title: '更新成功', icon: 'success' });
    }, 500);
  },

  /**
   * 导航
   */
  navigateBack() {
    wx.navigateBack();
  },
  
  addService() {
    wx.navigateTo({ url: '/pages/merchant/service/add/add' });
  },
  
  editService(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/merchant/service/edit/edit?id=${id}` });
  },
  
  deleteService(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    
    wx.showModal({
      title: '确认删除',
      content: `确定删除服务「${name}」吗？`,
      confirmColor: '#ff3b30',
      success: res => {
        if (res.confirm) {
          // 模拟删除
          const updatedServices = this.data.services.filter(s => s.id !== id);
          this.setData({ services: updatedServices });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  onPullDownRefresh() {
    this.loadServices();
    wx.stopPullDownRefresh();
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          wx.redirectTo({ url: '/pages/login/login' });
        }
      }
    });
  }
});
