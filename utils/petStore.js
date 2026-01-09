const globalUtils = require('./globalUtils');

// 存储猫咪状态 { [id]: { status: 'available', statusText: '可预订', isOrdered: false } }
let petStates = {};
const listeners = [];

// 防抖计时器
let notifyTimer = null;

/**
 * 通知所有监听者
 */
const notify = () => {
  if (notifyTimer) clearTimeout(notifyTimer);
  
  notifyTimer = setTimeout(() => {
    console.log('[PetStore] Notifying listeners. Count:', listeners.length);
    listeners.forEach(listener => {
      try {
        listener(petStates);
      } catch (e) {
        console.error('[PetStore] Listener error:', e);
      }
    });
  }, 50); // 50ms防抖
};

module.exports = {
  /**
   * 初始化或更新猫咪状态
   * @param {Array} pets 猫咪列表
   */
  initPets: (pets) => {
    let changed = false;
    pets.forEach(pet => {
      if (!petStates[pet.id]) {
        petStates[pet.id] = {
          status: pet.status,
          statusText: pet.statusText,
          isOrdered: pet.isOrdered
        };
        changed = true;
      }
    });
    // 初始化通常不触发通知，除非需要
    // if (changed) notify();
  },

  /**
   * 更新单个猫咪状态
   * @param {number|string} id 猫咪ID
   * @param {string} status 状态 code
   * @param {string} statusText 状态文本
   * @param {boolean} isOrdered 是否已下定
   */
  updateStatus: (id, status, statusText, isOrdered) => {
    // 检查是否真的变化
    const current = petStates[id];
    if (current && current.status === status && current.isOrdered === isOrdered) {
      return;
    }

    petStates[id] = { status, statusText, isOrdered };
    
    // 日志记录
    console.log(`[PetStore] Status Update: Pet ${id} -> ${status} (${statusText})`);
    if (globalUtils && globalUtils.logInfo) {
        globalUtils.logInfo('PetStatusChange', { id, status, isOrdered });
    }

    notify();
  },

  /**
   * 获取单个猫咪状态
   * @param {number|string} id 
   */
  getStatus: (id) => {
    return petStates[id];
  },

  /**
   * 获取所有猫咪状态
   */
  getAll: () => {
    return { ...petStates };
  },

  /**
   * 订阅状态变更
   * @param {Function} listener 回调函数 (allStates) => void
   * @returns {Function} 取消订阅函数
   */
  subscribe: (listener) => {
    listeners.push(listener);
    // 立即回调一次当前状态
    listener(petStates);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
};
