// pages/service/contact/contact.js
const auth = require('../../../utils/auth');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPhone: false,
    phoneNumber: '400-123-4567',
    history: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!auth.checkPermission(() => {
        // If not logged in, go back or redirect
        wx.navigateBack();
    })) return;

    this.loadHistory();
  },

  /**
   * 加载联系记录
   */
  loadHistory() {
    const history = wx.getStorageSync('contact_history') || [];
    this.setData({ history });
  },

  /**
   * 处理紧急联系点击
   */
  handleEmergency() {
    this.setData({ showPhone: true });
  },

  /**
   * 拨打电话
   */
  makeCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNumber,
      success: () => {
        this.addHistory();
      }
    });
  },

  /**
   * 添加联系记录
   */
  addHistory() {
    const now = new Date();
    // Simple format if util is not available or different
    const timeStr = now.toLocaleString(); 
    
    const newRecord = {
      time: timeStr,
      action: '拨打商家电话'
    };

    const history = [newRecord, ...this.data.history];
    this.setData({ history });
    wx.setStorageSync('contact_history', history);
  }
});