// pages/order/create/create.js
const payment = require('../../../utils/payment');
const globalUtils = require('../../../utils/globalUtils');

Page({
  data: {
    orderItems: [],
    totalPrice: 0,
    freight: 0,
    actualPrice: 0,
    address: null,
    isSubmitting: false,
    directOrder: false
  },

  onLoad(options) {
    if (options.items) {
      try {
        const items = JSON.parse(options.items);
        this.setData({
          orderItems: items,
          directOrder: options.directOrder === 'true'
        });
        this.calculateCost();
      } catch (e) {
        console.error('Parse items failed', e);
      }
    }
    
    // 模拟加载默认地址
    this.setData({
      address: {
        userName: '张三',
        telNumber: '13800138000',
        provinceName: '北京市',
        cityName: '北京市',
        countyName: '朝阳区',
        detailInfo: '三里屯SOHO'
      }
    });
  },

  calculateCost() {
    let total = 0;
    this.data.orderItems.forEach(item => {
      total += parseFloat(item.price) * item.quantity;
    });
    
    this.setData({
      totalPrice: total.toFixed(2),
      actualPrice: (total + this.data.freight).toFixed(2)
    });
  },

  chooseAddress() {
    wx.chooseAddress({
      success: (res) => {
        this.setData({ address: res });
      },
      fail: (err) => {
        console.error(err);
        // 模拟选择
        wx.showToast({
            title: '模拟选择地址成功',
            icon: 'none'
        });
      }
    });
  },

  async submitOrder() {
    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });

    try {
      // 1. 创建订单 (模拟)
      const orderInfo = {
        items: this.data.orderItems,
        address: this.data.address,
        totalPrice: this.data.actualPrice,
        createTime: new Date().toISOString()
      };
      
      console.log('[Order] Creating order:', orderInfo);

      // 2. 获取支付参数 (模拟)
      const payParams = await payment.unifiedOrder(orderInfo);

      // 3. 发起支付 (模拟)
      // 在开发工具中 wx.requestPayment 会失败，这里我们模拟成功
      // await payment.requestPayment(payParams);
      
      // 模拟支付成功
      wx.showLoading({ title: '支付中...' });
      setTimeout(() => {
          wx.hideLoading();
          this.onPaySuccess();
      }, 1500);

    } catch (err) {
      console.error(err);
      wx.showToast({
        title: err.message || '支付失败',
        icon: 'none'
      });
      this.setData({ isSubmitting: false });
    }
  },

  onPaySuccess() {
    this.setData({ isSubmitting: false });
    
    // 记录日志
    if (globalUtils && globalUtils.logInfo) {
        globalUtils.logInfo('OrderPaySuccess', { amount: this.data.actualPrice });
    }
    
    wx.showToast({
      title: '支付成功',
      icon: 'success'
    });

    // 延迟跳转
    setTimeout(() => {
        // 跳转到订单列表或详情 (这里简单返回上一页或首页)
        wx.navigateBack({ delta: 1 });
    }, 1500);
  }
});
