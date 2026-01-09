/**
 * 网络请求工具类 - 优化版
 * 包含：并发控制、优先级调度、超时重试、缓存、节流、拦截器、签名
 */
const appConfig = require('../config/appConfig');
const cache = require('./cache');
const AES = require('./aes');

// 优先级常量
const PRIORITY = {
  HIGH: 3,    // 用户交互相关（如：支付、提交订单）
  MEDIUM: 2,  // 页面数据加载（如：商品列表）
  LOW: 1      // 后台数据同步（如：日志上报）
};

// 请求队列管理类
class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent; // 最大并发数
    this.queue = []; // 等待队列
    this.activeCount = 0; // 当前活跃请求数
  }

  /**
   * 添加请求到队列
   * @param {Function} requestFn - 返回Promise的请求函数
   * @param {number} priority - 优先级
   * @returns {Promise}
   */
  add(requestFn, priority = PRIORITY.MEDIUM) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        priority,
        resolve,
        reject
      });
      // 按照优先级排序（高优先级在前）
      this.queue.sort((a, b) => b.priority - a.priority);
      this.process();
    });
  }

  /**
   * 处理队列
   */
  process() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { requestFn, resolve, reject } = this.queue.shift();
    this.activeCount++;

    requestFn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.activeCount--;
        this.process();
      });
  }
}

// 全局请求队列实例
const globalQueue = new RequestQueue(5);

// 请求节流记录
const requestThrottleRecord = {};

/**
 * 生成签名
 * @param {Object} params - 请求参数
 * @returns {Object} - 签名相关信息
 */
const generateSignature = (params = {}) => {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substr(2, 15);
  
  // 简单的签名算法：key排序 + secret + timestamp + nonce
  const keys = Object.keys(params).sort();
  let str = '';
  keys.forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      str += `${key}=${params[key]}&`;
    }
  });

  // 尝试从全局内存获取密钥
  let secret = appConfig.appSecret;
  try {
      const app = getApp();
      if (app && app.globalData && app.globalData.appConfig && app.globalData.appConfig.appSecret) {
          secret = app.globalData.appConfig.appSecret;
      }
  } catch (e) {
      // 忽略错误，getApp() 可能在某些时机不可用
  }

  str += `secret=${secret || 'default_secret'}&timestamp=${timestamp}&nonce=${nonce}`;
  
  // 实际应使用 MD5 或 SHA256，此处模拟
  const sign = `SIGN_${timestamp}`; 
  
  return { sign, timestamp, nonce };
};

/**
 * 核心请求函数
 * @param {Object} options - 请求配置
 * @returns {Promise}
 */
const request = (options) => {
  // 1. 默认配置合并
  const config = {
    url: '',
    method: 'GET',
    data: {},
    header: {},
    timeout: appConfig.requestTimeout || 10000,
    loading: true, // 是否显示loading
    retry: 2, // 重试次数
    cache: false, // 是否开启缓存
    cacheTime: 5 * 60 * 1000, // 缓存时间
    throttle: 0, // 节流时间(ms)
    encrypt: false, // 是否加密参数
    priority: PRIORITY.MEDIUM, // 默认优先级
    ...options
  };

  // 2. 节流处理
  if (config.throttle > 0) {
    const requestKey = `${config.method}:${config.url}`;
    const lastRequestTime = requestThrottleRecord[requestKey];
    const now = Date.now();
    if (lastRequestTime && now - lastRequestTime < config.throttle) {
      return Promise.reject({ code: -1, message: '请求过于频繁，请稍后再试' });
    }
    requestThrottleRecord[requestKey] = now;
  }

  // 3. 缓存处理 (仅GET)
  if (config.method === 'GET' && config.cache) {
    const cacheKey = `API_CACHE_${config.url}_${JSON.stringify(config.data)}`;
    const cachedData = cache.getCache(cacheKey);
    if (cachedData) {
      console.log('[Cache Hit]', config.url);
      return Promise.resolve(cachedData);
    }
  }

  // 4. URL处理
  if (!config.url.startsWith('http')) {
    config.url = `${appConfig.apiBaseUrl || 'https://api.example.com'}${config.url}`;
  }

  // 5. 参数加密
  if (config.encrypt && config.data) {
    config.data = {
      payload: AES.encrypt(config.data)
    };
  }

  // 6. 签名与Header处理
  const token = wx.getStorageSync('token');
  const { sign, timestamp, nonce } = generateSignature(config.data);
  
  config.header = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Sign': sign,
    ...config.header
  };

  // 定义实际执行请求的函数（包含重试逻辑）
  const doRequest = () => {
    return new Promise((resolve, reject) => {
      // 7. 显示Loading
      if (config.loading) {
        wx.showLoading({ title: '加载中...', mask: true });
      }

      // 内部递归重试函数
      const execute = (retryCount) => {
        // 检查是否使用云托管
        if (appConfig.cloud && appConfig.cloud.useCloudContainer) {
             wx.cloud.callContainer({
                config: {
                    env: appConfig.cloud.env
                },
                path: config.url.replace(appConfig.apiBaseUrl, ''), // 去除BaseURL，保留相对路径
                header: {
                    ...config.header,
                    'X-WX-SERVICE': appConfig.cloud.service
                },
                method: config.method,
                data: config.data,
                success: (res) => {
                    // 云托管返回的res结构可能不同，通常在res.data中
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                         const result = res.data;
                         // 业务状态码判断
                         if (result.code === 0 || result.code === 200) {
                            // 写入缓存
                            if (config.method === 'GET' && config.cache) {
                                const cacheKey = `API_CACHE_${config.url}_${JSON.stringify(config.data)}`;
                                cache.setCache(cacheKey, result.data, config.cacheTime);
                            }
                            resolve(result.data);
                         } else {
                            reject(result);
                         }
                    } else {
                        reject({ code: res.statusCode, message: `请求失败: ${res.statusCode}` });
                    }
                },
                fail: (err) => {
                    handleFail(err, retryCount);
                },
                complete: () => {
                    if (config.loading) {
                        wx.hideLoading();
                    }
                }
             });
             return;
        }

        wx.request({
          ...config,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const result = res.data;
              // 业务状态码判断
              if (result.code === 0 || result.code === 200) {
                // 写入缓存
                if (config.method === 'GET' && config.cache) {
                  const cacheKey = `API_CACHE_${config.url}_${JSON.stringify(config.data)}`;
                  cache.setCache(cacheKey, result.data, config.cacheTime);
                }
                resolve(result.data);
              } else if (result.code === 401 || result.code === 403) {
                  // 权限异常处理
                  console.warn('Unauthorized/Forbidden:', result.errorMsg);
                  wx.showToast({
                      title: '无权限访问',
                      icon: 'none'
                  });
                  // 记录安全日志 (Mock)
                  console.log('[Security Log] Access Denied for:', config.url);
                  
                  // 强制跳转首页
                  setTimeout(() => {
                      wx.switchTab({ url: '/pages/index/index' });
                  }, 1500);
                  reject(result);
              } else {
                reject(result);
              }
            } else if (res.statusCode === 401 || res.statusCode === 403) {
                 // HTTP status code check
                  console.warn('Unauthorized/Forbidden HTTP:', res.statusCode);
                  wx.showToast({
                      title: '无权限访问',
                      icon: 'none'
                  });
                  setTimeout(() => {
                      wx.switchTab({ url: '/pages/index/index' });
                  }, 1500);
                  reject({ code: res.statusCode, message: '无权限访问' });
            } else {
              // HTTP错误
              reject({ code: res.statusCode, message: `请求失败: ${res.statusCode}` });
            }
          },
          fail: (err) => {
            handleFail(err, retryCount);
          },
          complete: () => {
            if (config.loading) {
              wx.hideLoading();
            }
          }
        });
      };
      
      const handleFail = (err, retryCount) => {
            if (retryCount > 0) {
              console.warn(`[Retry ${config.retry - retryCount + 1}]`, config.url);
              // 指数退避重试: 1s, 2s, 4s...
              const delay = Math.pow(2, config.retry - retryCount) * 1000;
              setTimeout(() => {
                execute(retryCount - 1);
              }, delay);
            } else {
              reject({ code: -1, message: '网络请求超时或失败', original: err });
            }
      };

      // 开始执行
      execute(config.retry);
    });
  };

  // 8. 加入并发队列执行
  return globalQueue.add(doRequest, config.priority);
};

// 挂载优先级常量
request.PRIORITY = PRIORITY;

// 便捷方法
request.get = (url, data, options) => request({ ...options, url, method: 'GET', data });
request.post = (url, data, options) => request({ ...options, url, method: 'POST', data });
request.put = (url, data, options) => request({ ...options, url, method: 'PUT', data });
request.delete = (url, data, options) => request({ ...options, url, method: 'DELETE', data });

/**
 * 上传文件
 * @param {string} url - 接口地址
 * @param {string} filePath - 文件路径
 * @param {string} name - 文件对应的 key
 * @param {Object} formData - 其他表单数据
 * @param {Object} options - 其他配置
 */
request.upload = (url, filePath, name = 'file', formData = {}, options = {}) => {
  // URL处理
  let uploadUrl = url;
  if (!uploadUrl.startsWith('http')) {
    uploadUrl = `${appConfig.apiBaseUrl || 'https://api.example.com'}${url}`;
  }

  const token = wx.getStorageSync('token');
  const header = {
    'Authorization': token ? `Bearer ${token}` : '',
    ...options.header
  };

  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中...', mask: true });

    // 如果使用云托管，通常建议使用云存储，或者通过 HTTPS 调用
    // 这里为了兼容性，直接使用 wx.uploadFile
    // 注意：如果云托管服务未开启公网访问，wx.uploadFile 可能无法直接访问
    // 在这种情况下，建议使用 wx.cloud.uploadFile 上传到云存储，然后将 fileID 传给后端
    
    // 这里按照用户要求，调用后端的 /api/upload
    // 如果是云托管环境，可能需要特殊处理 URL
    if (appConfig.cloud && appConfig.cloud.useCloudContainer) {
        // 云托管环境下，uploadFile 需要公网域名
        // 如果没有公网域名，此方式可能失败
    }

    wx.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: name,
      formData: formData,
      header: header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // wx.uploadFile 返回的 data 是字符串，需要 parse
          let result;
          try {
            result = JSON.parse(res.data);
          } catch (e) {
            result = res.data;
          }

          if (result.code === 0 || result.code === 200) {
             // 如果返回的是相对路径，补全为完整路径
             let fileUrl = result.data;
             if (fileUrl && !fileUrl.startsWith('http')) {
                 fileUrl = `${appConfig.apiBaseUrl}${fileUrl}`;
             }
             resolve(fileUrl);
          } else {
            reject(result);
          }
        } else {
          reject({ code: res.statusCode, message: `上传失败: ${res.statusCode}` });
        }
      },
      fail: (err) => {
        reject({ code: -1, message: '网络请求超时或失败', original: err });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};

module.exports = request;
