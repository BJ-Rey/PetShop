// 图片资源映射工具

// 建立图片名称到本地资源路径的映射
const imageMap = {
  // 功能图标
  'close': '/images/关闭_close.svg',
  'filter': '/images/筛选_filter.svg',
  'add': '/images/添加_add.svg',
  'edit': '/images/编辑_edit.svg',
  'delete': '/images/删除_delete.svg',
  'search': '/images/搜索_search.svg',
  'sort': '/images/排序_sort.svg',
  'list': '/images/列表_list.svg',
  'check': '/images/校验_check.svg',
  'user': '/images/用户_user.svg',
  'wechat': '/images/微信息_wechat.svg',
  'shop': '/images/商店_shop.svg',
  'commodity': '/images/商品_commodity.svg',
  'dog': '/images/狗_dog.svg',
  'me': '/images/我的_me.svg',
  
  // 箭头图标
  'up': '/images/上_up.svg',
  'down': '/images/下_down.svg',
  'left': '/images/左_left.svg',
  'right': '/images/右_right.svg',
  
  // 其他图标
  'loading': '/images/加载_loading.svg',
  'qiyehao': '/images/企业号_qiyehao.svg'
};

/**
 * 获取图片资源路径
 * @param {string} imageName - 图片名称
 * @param {string} defaultImage - 默认图片路径
 * @returns {string} - 完整的图片资源路径
 */
const getImagePath = (imageName, defaultImage = '/images/商品_commodity.svg') => {
  if (!imageName) return defaultImage;
  
  // 如果已经是完整路径，直接
  if (imageName.startsWith('http') || imageName.startsWith('/')) {
    return imageName;
  }
  
  // 从映射表中查找
  return imageMap[imageName] || defaultImage;
};

/**
 * 处理图片加载错误
 * @param {Object} e - 事件对象
 */
const handleImageError = (e) => {
  const defaultImage = '/images/商品_commodity.svg';
  if (e && e.currentTarget) {
    e.currentTarget.dataset.src = defaultImage;
    e.currentTarget.src = defaultImage;
  }
};

module.exports = {
  getImagePath,
  handleImageError
};