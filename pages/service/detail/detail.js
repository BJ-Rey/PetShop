// pages/service/detail/detail.js
const auth = require('../../../utils/auth');

Page({
  data: {
    service: null,
    merchantInfo: null,
    calendarDays: [],
    selectedDate: '',
    timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    selectedTime: ''
  },

  onLoad: function(options) {
    if (options.id) {
      this.loadServiceDetail(options.id)
    }
    this.initCalendar();
  },

  initCalendar() {
      const days = [];
      const weeks = ['日', '一', '二', '三', '四', '五', '六'];
      for(let i=0; i<7; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const month = d.getMonth() + 1;
          const day = d.getDate();
          const dateStr = `${d.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          days.push({
              week: i === 0 ? '今天' : '周' + weeks[d.getDay()],
              day: `${month}/${day}`,
              date: dateStr
          });
      }
      this.setData({ calendarDays: days, selectedDate: days[0].date });
  },

  selectDate(e) {
      this.setData({ selectedDate: e.currentTarget.dataset.date, selectedTime: '' });
  },

  selectTime(e) {
      this.setData({ selectedTime: e.currentTarget.dataset.time });
  },

  /**
   * 立即预约
   */
  bookAppointment() {
    auth.checkPermission(() => {
        if (!this.data.selectedTime) {
            wx.showToast({ title: '请选择预约时间', icon: 'none' });
            return;
        }
    
        const service = this.data.service
        wx.navigateTo({
          url: `/pages/appointment/create/create?serviceId=${service.id}&merchantName=${this.data.merchantInfo.name}&date=${this.data.selectedDate}&time=${this.data.selectedTime}`
        })
    });
  },

  // 加载服务详情数据
  loadServiceDetail: function(serviceId) {
    wx.showLoading({ title: '加载中...' });
    const serviceApi = require('../../../api/serviceApi');
    
    serviceApi.getServiceDetail(serviceId).then(service => {
        wx.hideLoading();
        this.setData({
            service: service
        });
    }).catch(err => {
        wx.hideLoading();
        console.error('Failed to load service detail', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  // 加载服务流程数据
  loadProcessList: function() {
    const processData = [
      {
        title: '预约到店',
        desc: '提前预约，按时到店，避免等待'
      },
      {
        title: '健康检查',
        desc: '专业兽医进行接种前健康检查，确保宠物适合接种'
      },
      {
        title: '疫苗接种',
        desc: '使用进口疫苗，由专业兽医进行接种操作'
      },
      {
        title: '观察留观',
        desc: '接种后留观30分钟，确保无不良反应'
      },
      {
        title: '发放证明',
        desc: '发放疫苗接种证明，记录接种信息'
      }
    ]
    
    this.setData({
      processList: processData
    })
  },

  // 加载预约须知数据
  loadNoticeList: function() {
    const noticeData = [
      '接种前24小时内，宠物需保持健康状态，无发热、呕吐、腹泻等症状',
      '接种前7天内，未使用过抗生素、免疫抑制剂等药物',
      '接种后24小时内，避免洗澡、剧烈运动',
      '接种后可能出现轻微发热、食欲不振等症状，属于正常反应，一般2-3天恢复',
      '如出现严重不良反应，请及时联系医院',
      '建议提前1-3天预约，避免高峰时段等待'
    ]
    
    this.setData({
      noticeList: noticeData
    })
  },

  // 跳转到服务预约页面
  navigateToAppointment: function(e) {
    const serviceId = this.data.service.id
    wx.navigateTo({
      url: `/pages/service/appointment/appointment?id=${serviceId}`
    })
  },

  // 上一页
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  }
})