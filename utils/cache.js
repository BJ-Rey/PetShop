// 缓存管理工具

// 缓存键名前缀
const CACHE_PREFIX = 'pet_';

// 缓存有效期配置
const CACHE_EXPIRE = {
  // 页面数据缓存，默认5分钟
  PAGE_DATA: 5 * 60 * 1000,
  // 用户信息缓存，默认7天
  USER_INFO: 7 * 24 * 60 * 60 * 1000,
  // 临时数据缓存，默认30分钟
  TEMP_DATA: 30 * 60 * 1000,
  // 搜索历史缓存，默认30天
  SEARCH_HISTORY: 30 * 24 * 60 * 60 * 1000,
  // 商品缓存，默认1小时
  PRODUCT: 60 * 60 * 1000,
  // 宠物缓存，默认1小时
  PET: 60 * 60 * 1000,
  // 服务缓存，默认1小时
  SERVICE: 60 * 60 * 1000
};

/**
 * 生成带前缀的缓存键名
 * @param {string} key - 原始键名
 * @returns {string} - 带前缀的键名
 */
const getCacheKey = (key) => {
  return `${CACHE_PREFIX}${key}`;
};

/**
 * 检查缓存是否过期
 * @param {Object} cacheData - 缓存数据
 * @returns {boolean} - 是否过期
 */
const isExpired = (cacheData) => {
  if (!cacheData || !cacheData.expireTime) {
    return true;
  }
  return Date.now() > cacheData.expireTime;
};

/**
 * 设置缓存
 * @param {string} key - 缓存键名
 * @param {any} data - 缓存数据
 * @param {number} expire - 过期时间（毫秒）
 * @returns {boolean} - 是否成功
 */
const setCache = (key, data, expire = CACHE_EXPIRE.TEMP_DATA) => {
  try {
    const cacheKey = getCacheKey(key);
    const cacheData = {
      data,
      expireTime: Date.now() + expire,
      createTime: Date.now()
    };
    wx.setStorageSync(cacheKey, cacheData);
    return true;
  } catch (error) {
    console.error('Set cache error:', error);
    return false;
  }
};

/**
 * 获取缓存
 * @param {string} key - 缓存键名
 * @param {any} defaultValue - 默认值
 * @returns {any} - 缓存数据或默认值
 */
const getCache = (key, defaultValue = null) => {
  try {
    const cacheKey = getCacheKey(key);
    const cacheData = wx.getStorageSync(cacheKey);
    if (cacheData && !isExpired(cacheData)) {
      return cacheData.data;
    }
    // 缓存过期，删除缓存
    removeCache(key);
    return defaultValue;
  } catch (error) {
    console.error('Get cache error:', error);
    return defaultValue;
  }
};

/**
 * 删除缓存
 * @param {string} key - 缓存键名
 * @returns {boolean} - 是否成功
 */
const removeCache = (key) => {
  try {
    const cacheKey = getCacheKey(key);
    wx.removeStorageSync(cacheKey);
    return true;
  } catch (error) {
    console.error('Remove cache error:', error);
    return false;
  }
};

/**
 * 清除所有缓存
 * @returns {boolean} - 是否成功
 */
const clearCache = () => {
  try {
    const keys = wx.getStorageInfoSync().keys;
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        wx.removeStorageSync(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Clear cache error:', error);
    return false;
  }
};

/**
 * 设置页面数据缓存
 * @param {string} pagePath - 页面路径
 * @param {any} data - 页面数据
 * @param {number} expire - 过期时间（毫秒）
 * @returns {boolean} - 是否成功
 */
const setPageCache = (pagePath, data, expire = CACHE_EXPIRE.PAGE_DATA) => {
  return setCache(`page_${pagePath}`, data, expire);
};

/**
 * 获取页面数据缓存
 * @param {string} pagePath - 页面路径
 * @param {any} defaultValue - 默认值
 * @returns {any} - 缓存数据或默认值
 */
const getPageCache = (pagePath, defaultValue = null) => {
  return getCache(`page_${pagePath}`, defaultValue);
};

/**
 * 删除页面数据缓存
 * @param {string} pagePath - 页面路径
 * @returns {boolean} - 是否成功
 */
const removePageCache = (pagePath) => {
  return removeCache(`page_${pagePath}`);
};

/**
 * 设置用户信息缓存
 * @param {Object} userInfo - 用户信息
 * @param {number} expire - 过期时间（毫秒）
 * @returns {boolean} - 是否成功
 */
const setUserCache = (userInfo, expire = CACHE_EXPIRE.USER_INFO) => {
  return setCache('user_info', userInfo, expire);
};

/**
 * 获取用户信息缓存
 * @param {any} defaultValue - 默认值
 * @returns {any} - 缓存数据或默认值
 */
const getUserCache = (defaultValue = null) => {
  return getCache('user_info', defaultValue);
};

/**
 * 设置搜索历史缓存
 * @param {Array} history - 搜索历史数组
 * @param {number} expire - 过期时间（毫秒）
 * @returns {boolean} - 是否成功
 */
const setSearchHistoryCache = (history, expire = CACHE_EXPIRE.SEARCH_HISTORY) => {
  return setCache('search_history', history, expire);
};

/**
 * 获取搜索历史缓存
 * @param {any} defaultValue - 默认值
 * @returns {any} - 缓存数据或默认值
 */
const getSearchHistoryCache = (defaultValue = []) => {
  return getCache('search_history', defaultValue);
};

/**
 * 清除过期缓存
 * @returns {number} - 清除的缓存数量
 */
const clearExpiredCache = () => {
  try {
    const keys = wx.getStorageInfoSync().keys;
    let clearedCount = 0;
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const cacheData = wx.getStorageSync(key);
        if (isExpired(cacheData)) {
          wx.removeStorageSync(key);
          clearedCount++;
        }
      }
    });
    return clearedCount;
  } catch (error) {
    console.error('Clear expired cache error:', error);
    return 0;
  }
};

/**
 * 获取缓存大小
 * @returns {number} - 缓存大小（字节）
 */
const getCacheSize = () => {
  try {
    const info = wx.getStorageInfoSync();
    return info.currentSize;
  } catch (error) {
    console.error('Get cache size error:', error);
    return 0;
  }
};

module.exports = {
  setCache,
  getCache,
  removeCache,
  clearCache,
  setPageCache,
  getPageCache,
  removePageCache,
  setUserCache,
  getUserCache,
  setSearchHistoryCache,
  getSearchHistoryCache,
  clearExpiredCache,
  getCacheSize,
  CACHE_EXPIRE
};