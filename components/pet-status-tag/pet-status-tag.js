// components/pet-status-tag/pet-status-tag.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    status: {
      type: String,
      value: 'available'
    },
    statusText: {
      type: String,
      value: '可预订'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap() {
      // 阻止冒泡
    }
  }
})
