// utils/favorites.js

/**
 * 收藏工具模块
 * 用于管理商品和宠物的收藏功能
 */

// 收藏数据的本地存储键名
const FAVORITES_KEY = 'favorites';

/**
 * 获取所有收藏数据
 * @returns {Object} 包含services、products和pets的收藏数据对象
 */
export function getAllFavorites() {
  const favorites = wx.getStorageSync(FAVORITES_KEY) || {};
  return {
    services: favorites.services || [],
    products: favorites.products || [],
    pets: favorites.pets || []
  };
}

/**
 * 获取指定类型的收藏数据
 * @param {string} type - 收藏类型：'services'、'products'或'pets'
 * @returns {Array} 收藏数据数组
 */
export function getFavoritesByType(type) {
  const favorites = getAllFavorites();
  return favorites[type] || [];
}

/**
 * 检查商品/宠物是否已收藏
 * @param {string} type - 收藏类型：'services'、'products'或'pets'
 * @param {number|string} id - 商品/宠物ID
 * @returns {boolean} 是否已收藏
 */
export function isFavorite(type, id) {
  const favorites = getFavoritesByType(type);
  return favorites.some(item => item.id == id);
}

/**
 * 添加到收藏
 * @param {string} type - 收藏类型：'services'、'products'或'pets'
 * @param {Object} item - 要收藏的商品/宠物对象
 */
export function addToFavorites(type, item) {
  const favorites = getAllFavorites();
  const typeFavorites = favorites[type] || [];
  
  // 检查是否已收藏
  if (!isFavorite(type, item.id)) {
    // 添加到收藏列表
    const itemWithTime = { ...item, savedAt: Date.now() };
    typeFavorites.push(itemWithTime);
    favorites[type] = typeFavorites;
    
    // 保存到本地存储
    wx.setStorageSync(FAVORITES_KEY, favorites);
    
    // 显示收藏成功提示
    wx.showToast({
      title: '已添加到收藏',
      icon: 'success'
    });
    
    return true;
  } else {
    // 已收藏，不重复添加
    wx.showToast({
      title: '已在收藏夹中',
      icon: 'none'
    });
    
    return false;
  }
}

/**
 * 从收藏中移除
 * @param {string} type - 收藏类型：'services'、'products'或'pets'
 * @param {number|string} id - 商品/宠物ID
 */
export function removeFromFavorites(type, id) {
  const favorites = getAllFavorites();
  const typeFavorites = favorites[type] || [];
  
  // 过滤掉要移除的收藏项
  const updatedFavorites = typeFavorites.filter(item => item.id != id);
  favorites[type] = updatedFavorites;
  
  // 保存到本地存储
  wx.setStorageSync(FAVORITES_KEY, favorites);
  
  return true;
}

/**
 * 切换收藏状态
 * @param {string} type - 收藏类型：'services'、'products'或'pets'
 * @param {Object} item - 要收藏/取消收藏的商品/宠物对象
 * @returns {boolean} 切换后的收藏状态
 */
export function toggleFavorite(type, item) {
  if (isFavorite(type, item.id)) {
    // 已收藏，移除
    removeFromFavorites(type, item.id);
    return false;
  } else {
    // 未收藏，添加
    addToFavorites(type, item);
    return true;
  }
}