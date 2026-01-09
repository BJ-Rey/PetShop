// components/cat-card/cat-card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cat: {
      type: Object,
      value: null
    },
    isSkeleton: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap() {
      if (this.data.isSkeleton) return;
      this.triggerEvent('click', { id: this.data.cat.id });
    },
    
    onImageError() {
      // 图片加载失败，使用默认图
      this.setData({
        'cat.image': 'https://cdn.catmall.com/default/cat_placeholder.png'
      });
    }
  }
});
