// components/filter/filter.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 筛选标题
    filterTitle: {
      type: String,
      value: '筛选条件'
    },
    // 筛选条件配置
    filterConfig: {
      type: Object,
      value: {},
      observer: function(newVal) {
        this.initFilterConditions(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isExpanded: false, // 是否展开
    filterConditions: [], // 动态生成的筛选条件
    originalConditions: [] // 原始筛选条件，用于重置
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化筛选条件
    initFilterConditions: function(config) {
      if (!config || !config.conditions) return;
      
      const filterConditions = config.conditions.map(condition => {
        let selectedIndex = 0;
        let selectedValues = [];
        let selectedRange = condition.defaultRange || [condition.min || 0, condition.max || 100];
        let value = condition.defaultValue || '';
        
        // 设置默认值
        if (condition.type === 'select' && condition.options && condition.options.length > 0) {
          selectedIndex = condition.defaultIndex || 0;
        } else if (condition.type === 'checkbox' && condition.options && condition.options.length > 0) {
          selectedValues = condition.defaultValues || [];
        }
        
        return {
          id: condition.id,
          label: condition.label,
          type: condition.type,
          options: condition.options || [],
          selectedIndex: selectedIndex,
          selectedValues: selectedValues,
          selectedRange: selectedRange,
          min: condition.min,
          max: condition.max,
          value: value,
          placeholder: condition.placeholder || ''
        };
      });
      
      this.setData({
        filterConditions: filterConditions,
        originalConditions: JSON.parse(JSON.stringify(filterConditions))
      });
    },
    
    // 切换筛选器展开/收起状态
    toggleFilter: function() {
      this.setData({
        isExpanded: !this.data.isExpanded
      });
    },
    
    // 选择条件改变
    onConditionChange: function(e) {
      const conditionId = e.currentTarget.dataset.conditionId;
      const selectedIndex = e.detail.value;
      
      const updatedConditions = this.data.filterConditions.map(condition => {
        if (condition.id === conditionId) {
          return {
            ...condition,
            selectedIndex: selectedIndex
          };
        }
        return condition;
      });
      
      this.setData({
        filterConditions: updatedConditions
      });
    },
    
    // 复选框选择改变
    onCheckboxChange: function(e) {
      const conditionId = e.currentTarget.dataset.conditionId;
      const selectedValues = e.detail.value;
      
      const updatedConditions = this.data.filterConditions.map(condition => {
        if (condition.id === conditionId) {
          return {
            ...condition,
            selectedValues: selectedValues
          };
        }
        return condition;
      });
      
      this.setData({
        filterConditions: updatedConditions
      });
    },
    
    // 滑块范围改变
    onRangeChange: function(e) {
      const conditionId = e.currentTarget.dataset.conditionId;
      const selectedRange = e.detail.value;
      
      const updatedConditions = this.data.filterConditions.map(condition => {
        if (condition.id === conditionId) {
          return {
            ...condition,
            selectedRange: selectedRange
          };
        }
        return condition;
      });
      
      this.setData({
        filterConditions: updatedConditions
      });
    },
    
    // 输入框内容改变
    onInputChange: function(e) {
      const conditionId = e.currentTarget.dataset.conditionId;
      const value = e.detail.value;
      
      const updatedConditions = this.data.filterConditions.map(condition => {
        if (condition.id === conditionId) {
          return {
            ...condition,
            value: value
          };
        }
        return condition;
      });
      
      this.setData({
        filterConditions: updatedConditions
      });
    },
    
    // 重置筛选条件
    resetFilter: function() {
      this.setData({
        filterConditions: JSON.parse(JSON.stringify(this.data.originalConditions))
      });
    },
    
    // 确认筛选条件
    confirmFilter: function() {
      // 收起筛选面板
      this.setData({
        isExpanded: false
      });
      
      // 构建筛选结果
      const filterResult = {};
      this.data.filterConditions.forEach(condition => {
        if (condition.type === 'select') {
          filterResult[condition.id] = condition.options[condition.selectedIndex].value;
        } else if (condition.type === 'checkbox') {
          filterResult[condition.id] = condition.selectedValues;
        } else if (condition.type === 'range') {
          filterResult[condition.id] = condition.selectedRange;
        } else if (condition.type === 'input') {
          filterResult[condition.id] = condition.value;
        }
      });
      
      // 触发筛选确认事件，将结果传递给父页面
      this.triggerEvent('filterconfirm', {
        conditions: filterResult
      });
    }
  }
});
