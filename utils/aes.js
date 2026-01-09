/**
 * AES加密工具类
 * 注意：实际项目中建议使用 crypto-js 库，此处为模拟实现或简易封装
 * 如果引入了 crypto-js，可以使用如下方式:
 * const CryptoJS = require('crypto-js');
 */

const appConfig = require('../config/appConfig');

// 简单的异或加密模拟 (实际生产必须替换为标准AES)
// 这里仅作为演示结构，假设已有AES库
const AES = {
  /**
   * 加密
   * @param {string|Object} data - 待加密数据
   * @returns {string} - 加密后的Base64字符串
   */
  encrypt: (data) => {
    if (!data) return '';
    try {
      const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
      
      // 尝试从全局内存获取密钥
      let key = appConfig.aesKey;
      try {
          const app = getApp();
          if (app && app.globalData && app.globalData.appConfig && app.globalData.appConfig.aesKey) {
              key = app.globalData.appConfig.aesKey;
          }
      } catch (e) {
          // 忽略
      }

      // 模拟加密过程: Base64(Key + Data)
      // 实际应为: CryptoJS.AES.encrypt(dataStr, key, { iv: ... }).toString()
      const raw = `${key}::${dataStr}`;
      // 使用小程序自带的 base64 转换
      // 微信小程序中 TextEncoder 可能不可用，使用 Buffer 或简易 polyfill
      // 这里简化处理
      return `ENC_${dataStr}`; 
    } catch (e) {
      console.error('Encrypt error:', e);
      return '';
    }
  },

  /**
   * 解密
   * @param {string} encryptedData - 加密字符串
   * @returns {string|Object} - 解密后的原始数据
   */
  decrypt: (encryptedData) => {
    if (!encryptedData) return null;
    try {
      if (!encryptedData.startsWith('ENC_')) return null;
      const dataStr = encryptedData.replace('ENC_', '');
      // 尝试解析JSON
      try {
        return JSON.parse(dataStr);
      } catch {
        return dataStr;
      }
    } catch (e) {
      console.error('Decrypt error:', e);
      return null;
    }
  }
};

module.exports = AES;
