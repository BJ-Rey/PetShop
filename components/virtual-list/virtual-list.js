// components/virtual-list/virtual-list.js
Component({
  properties: {
    list: {
      type: Array,
      value: [],
      observer: function(newVal) {
        this.updateList(newVal);
      }
    },
    height: {
      type: Number,
      value: 1000 // 容器高度 rpx
    },
    itemHeight: {
      type: Number,
      value: 200 // 单项高度 px
    },
    type: {
      type: String,
      value: 'cat' // cat, product, service
    }
  },

  data: {
    visibleData: [],
    totalHeight: 0,
    offset: 0,
    bufferSize: 5 // 缓冲区大小
  },

  methods: {
    updateList(list) {
      if (!list) return;
      this.setData({
        totalHeight: list.length * this.data.itemHeight
      });
      this.updateVisibleData(0);
    },

    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      this.updateVisibleData(scrollTop);
    },

    updateVisibleData(scrollTop) {
      const { list, itemHeight, height, bufferSize } = this.data;
      const windowHeight = wx.getSystemInfoSync().windowWidth / 750 * height; // rpx -> px
      
      const visibleCount = Math.ceil(windowHeight / itemHeight);
      const start = Math.floor(scrollTop / itemHeight);
      const end = start + visibleCount + bufferSize;
      
      const realStart = Math.max(0, start - bufferSize);
      const realEnd = Math.min(list.length, end);
      
      this.setData({
        visibleData: list.slice(realStart, realEnd),
        offset: realStart * itemHeight
      });
    },
    
    onItemClick(e) {
      this.triggerEvent('itemClick', e.detail);
    }
  }
});
