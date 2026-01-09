// 日志管理工具

// 日志级别
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// 当前日志级别
const currentLogLevel = LOG_LEVEL.INFO;

// 日志类型
const LOG_TYPE = {
  // 页面生命周期
  PAGE_LIFECYCLE: 'page_lifecycle',
  // 用户行为
  USER_ACTION: 'user_action',
  // 网络请求
  NETWORK_REQUEST: 'network_request',
  // 网络响应
  NETWORK_RESPONSE: 'network_response',
  // 错误信息
  ERROR: 'error',
  // 性能监控
  PERFORMANCE: 'performance',
  // 自定义事件
  CUSTOM: 'custom'
};

/**
 * 格式化日志时间
 * @returns {string} - 格式化的时间字符串
 */
const formatTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const millisecond = String(now.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
};

/**
 * 格式化日志内容
 * @param {string} level - 日志级别
 * @param {string} type - 日志类型
 * @param {string} message - 日志消息
 * @param {Object} data - 日志数据
 * @returns {Object} - 格式化的日志对象
 */
const formatLog = (level, type, message, data = {}) => {
  let currentPage = 'unknown';
  try {
    // 移除 getCurrentPages 调用以避免启动时崩溃
    // const pages = getCurrentPages();
    // if (pages && pages.length > 0) {
    //   const lastPage = pages[pages.length - 1];
    //   currentPage = lastPage.route || 'unknown';
    // }
  } catch (error) {
    // console.error('Get current page error:', error);
  }

  // 避免频繁调用 getSystemInfoSync，使用 try-catch 包裹
  let systemInfo = {
    version: 'unknown',
    system: 'unknown',
    platform: 'unknown',
    SDKVersion: 'unknown'
  };
  
  try {
     // 在某些极端的启动场景下，getSystemInfoSync 也可能失败
     // 实际项目中可以考虑只获取一次并缓存
     const info = wx.getSystemInfoSync();
     systemInfo = {
       version: info.version || 'unknown',
       system: info.system || 'unknown',
       platform: info.platform || 'unknown',
       SDKVersion: info.SDKVersion || 'unknown'
     };
  } catch (e) {
     // ignore
  }

  return {
    timestamp: Date.now(),
    time: formatTime(),
    level,
    type,
    message,
    data,
    page: currentPage,
    appVersion: systemInfo.version,
    system: systemInfo.system,
    platform: systemInfo.platform,
    SDKVersion: systemInfo.SDKVersion
  };
};

/**
 * 保存日志到本地
 * @param {Object} log - 日志对象
 */
const saveLog = (log) => {
  try {
    // 获取现有日志
    const logs = wx.getStorageSync('logs') || [];
    
    // 添加新日志
    logs.push(log);
    
    // 只保留最近1000条日志
    const newLogs = logs.slice(-1000);
    
    // 保存日志
    wx.setStorageSync('logs', newLogs);
    
    // 实际项目中可以考虑定期上传日志到服务器
  } catch (error) {
    console.error('Save log error:', error);
  }
};

/**
 * 记录日志
 * @param {string} level - 日志级别
 * @param {string} type - 日志类型
 * @param {string} message - 日志消息
 * @param {Object} data - 日志数据
 */
const log = (level, type, message, data = {}) => {
  // 检查日志级别
  if (LOG_LEVEL[level] < currentLogLevel) {
    return;
  }

  // 格式化日志
  const logObj = formatLog(level, type, message, data);

  // 保存日志到本地
  saveLog(logObj);

  // 打印到控制台
  switch (level) {
    case 'DEBUG':
      console.debug(`[${level}] [${type}] ${message}`, data);
      break;
    case 'INFO':
      console.info(`[${level}] [${type}] ${message}`, data);
      break;
    case 'WARN':
      console.warn(`[${level}] [${type}] ${message}`, data);
      break;
    case 'ERROR':
      console.error(`[${level}] [${type}] ${message}`, data);
      break;
    case 'FATAL':
      console.error(`[${level}] [${type}] ${message}`, data);
      break;
    default:
      console.log(`[${level}] [${type}] ${message}`, data);
  }
};

/**
 * 记录调试日志
 * @param {string} type - 日志类型
 * @param {string} message - 日志消息
 * @param {Object} data - 日志数据
 */
const debug = (type, message, data = {}) => {
  log('DEBUG', type, message, data);
};

/**
 * 记录信息日志
 * @param {string} type - 日志类型
 * @param {string} message - 日志消息
 * @param {Object} data - 日志数据
 */
const info = (type, message, data = {}) => {
  log('INFO', type, message, data);
};

/**
 * 记录警告日志
 * @param {string} type - 日志类型
 * @param {string} message - 日志消息
 * @param {Object} data - 日志数据
 */
const warn = (type, message, data = {}) => {
  log('WARN', type, message, data);
};

/**
 * 记录错误日志
 * @param {string} type - 日志类型
 * @param {string} message - 日志消息
 * @param {Object} data - 日志数据
 */
const error = (type, message, data = {}) => {
  log('ERROR', type, message, data);
};

/**
 * 记录致命错误日志
 * @param {string} type - 日志类型
 * @param {string} message - 日志消息
 * @param {Object} data - 日志数据
 */
const fatal = (type, message, data = {}) => {
  log('FATAL', type, message, data);
};

/**
 * 记录页面生命周期日志
 * @param {string} pageName - 页面名称
 * @param {string} lifecycle - 生命周期阶段
 * @param {Object} data - 附加数据
 */
const pageLifecycle = (pageName, lifecycle, data = {}) => {
  info(LOG_TYPE.PAGE_LIFECYCLE, `${pageName} ${lifecycle}`, { pageName, lifecycle, ...data });
};

/**
 * 记录用户行为日志
 * @param {string} action - 行为名称
 * @param {Object} data - 行为数据
 */
const userAction = (action, data = {}) => {
  info(LOG_TYPE.USER_ACTION, action, { action, ...data });
};

/**
 * 记录网络请求日志
 * @param {string} url - 请求URL
 * @param {Object} options - 请求选项
 */
const networkRequest = (url, options = {}) => {
  debug(LOG_TYPE.NETWORK_REQUEST, `Request to ${url}`, { url, ...options });
};

/**
 * 记录网络响应日志
 * @param {string} url - 请求URL
 * @param {Object} response - 响应数据
 * @param {number} duration - 请求耗时（毫秒）
 */
const networkResponse = (url, response, duration = 0) => {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    debug(LOG_TYPE.NETWORK_RESPONSE, `Response from ${url}`, { url, response, duration });
  } else {
    warn(LOG_TYPE.NETWORK_RESPONSE, `Response error from ${url}`, { url, response, duration });
  }
};

/**
 * 记录错误日志
 * @param {string} errorType - 错误类型
 * @param {string} message - 错误消息
 * @param {Object} error - 错误对象
 * @param {Object} data - 附加数据
 */
const errorLog = (errorType, message, error, data = {}) => {
  error(LOG_TYPE.ERROR, message, {
    errorType,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    ...data
  });
};

/**
 * 记录性能监控日志
 * @param {string} metric - 性能指标
 * @param {number} value - 性能值
 * @param {Object} data - 附加数据
 */
const performance = (metric, value, data = {}) => {
  info(LOG_TYPE.PERFORMANCE, metric, { metric, value, ...data });
};

/**
 * 记录自定义事件日志
 * @param {string} eventName - 事件名称
 * @param {Object} data - 事件数据
 */
const customEvent = (eventName, data = {}) => {
  info(LOG_TYPE.CUSTOM, eventName, { eventName, ...data });
};

/**
 * 获取日志
 * @param {number} limit - 日志数量限制
 * @returns {Array} - 日志数组
 */
const getLogs = (limit = 100) => {
  try {
    const logs = wx.getStorageSync('logs') || [];
    return logs.slice(-limit);
  } catch (error) {
    console.error('Get logs error:', error);
    return [];
  }
};

/**
 * 清除日志
 * @returns {boolean} - 是否成功
 */
const clearLogs = () => {
  try {
    wx.removeStorageSync('logs');
    return true;
  } catch (error) {
    console.error('Clear logs error:', error);
    return false;
  }
};

module.exports = {
  // 日志级别
  LOG_LEVEL,
  // 日志类型
  LOG_TYPE,
  // 日志方法
  debug,
  info,
  warn,
  error: errorLog,
  fatal,
  // 快捷日志方法
  pageLifecycle,
  userAction,
  networkRequest,
  networkResponse,
  performance,
  customEvent,
  // 日志管理方法
  getLogs,
  clearLogs
};