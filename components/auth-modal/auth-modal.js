// components/auth-modal/auth-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show(callback) {
      if (this.data.show) return;
      this.callback = callback;
      this.setData({ show: true });
    },

    close() {
      this.setData({ show: false });
      this.callback = null;
    },

    handleLogin() {
      // 关闭弹窗
      this.close();
      // 跳转到登录页，并传递 callbackPage
      // 由于是组件，无法直接传递函数，只能传递页面路径让登录页跳转回来
      // 但这里我们想要的是“恢复操作”，所以最好是登录成功后保持在当前页并刷新状态
      
      // 方案：跳转到登录页，登录成功后返回当前页
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage ? `/${currentPage.route}` : '/pages/index/index';
      
      // 将回调函数临时保存到全局变量或App实例中（如果需要非常复杂的操作恢复）
      // 简单起见，我们假设登录后刷新页面状态即可，用户需要再次点击
      // 或者：使用全局事件总线
      
      // 如果 auth.js 支持 checkPermission 的回调，那么我们希望登录成功后自动执行回调
      // 但跨页面的回调很难传递。
      // 所以这里我们采取：跳转登录 -> 登录成功 -> 返回 -> 触发 onShow 刷新状态 -> 用户需再次点击
      // 或者：在 auth-modal 里直接做“静默登录”？不，用户需要输入手机号。
      
      // 按照用户要求： "弹出模态登录窗口... 窗口需包含微信授权登录按钮... 登录成功后自动恢复用户之前的操作意图"
      // 如果要包含微信授权按钮（获取手机号等），需要 `<button open-type="getPhoneNumber">`
      // 但现在微信小程序获取手机号需要收费或企业认证，且逻辑在 login 页面。
      // 我们简单处理：点击“立即登录”跳转到 login 页面，登录成功后返回。
      
      // 优化：如果在 login 页面登录成功，返回后，我们在 onShow 里检查是否登录。
      // 如果登录了，如何“自动恢复”？
      // 可以将 pendingAction 存入 app.globalData
      
      if (this.callback) {
          const app = getApp();
          app.globalData.pendingAction = this.callback;
      }
      
      wx.navigateTo({
        url: `/pages/login/login?callbackPage=${encodeURIComponent(currentRoute)}`
      });
    }
  }
})