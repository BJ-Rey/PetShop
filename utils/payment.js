/**
 * 微信支付工具类
 * 用于处理微信支付相关逻辑，包括配置、统一下单、回调处理等。
 */

const CONFIG = {
    // 商户号 (MCHID)
    mchId: 'YOUR_MCH_ID',
    // API密钥 (32字符)
    apiKey: 'YOUR_API_KEY_32_CHARS',
    // 证书路径 (需在后端服务器配置，小程序端不直接使用证书)
    certPath: '/path/to/apiclient_cert.p12',
    // 支付回调域名 (必须在微信商户平台配置白名单)
    notifyUrl: 'https://your-domain.com/api/payment/notify',
    // 支付超时时间 (分钟)
    timeout: 30
};

/**
 * 模拟统一下单接口
 * 实际开发中，此步骤必须在后端服务器完成，小程序端只负责发起请求获取支付参数
 * @param {Object} orderInfo 订单信息
 * @returns {Promise} 返回支付参数
 */
const unifiedOrder = (orderInfo) => {
    return new Promise((resolve, reject) => {
        console.log('[Payment] Creating unified order:', orderInfo);
        
        // 模拟网络请求延迟
        setTimeout(() => {
            // 模拟成功返回支付参数
            const paymentParams = {
                timeStamp: String(Date.now()),
                nonceStr: Math.random().toString(36).substr(2, 15),
                package: 'prepay_id=wx201410272009395522657a690389285100',
                signType: 'MD5',
                paySign: 'MOCK_SIGNATURE_FOR_TESTING'
            };
            resolve(paymentParams);
        }, 1000);
    });
};

/**
 * 发起微信支付
 * @param {Object} paymentParams 后端返回的支付参数
 * @returns {Promise}
 */
const requestPayment = (paymentParams) => {
    return new Promise((resolve, reject) => {
        wx.requestPayment({
            ...paymentParams,
            success: (res) => {
                console.log('[Payment] Success:', res);
                resolve(res);
            },
            fail: (err) => {
                console.error('[Payment] Failed:', err);
                if (err.errMsg.indexOf('cancel') > -1) {
                    reject({ code: 'USER_CANCEL', message: '用户取消支付' });
                } else {
                    reject({ code: 'PAY_FAIL', message: '支付失败', detail: err });
                }
            }
        });
    });
};

/**
 * 查询支付状态
 * @param {string} orderId 订单号
 * @returns {Promise}
 */
const queryPaymentStatus = (orderId) => {
    return new Promise((resolve, reject) => {
        // 模拟查询
        console.log(`[Payment] Querying status for order ${orderId}`);
        setTimeout(() => {
            resolve({ status: 'SUCCESS', transactionId: 'TX_MOCK_123456' });
        }, 500);
    });
};

/**
 * 错误代码处理文档
 */
const ERROR_CODES = {
    'USER_CANCEL': '用户取消支付',
    'PAY_FAIL': '支付失败，请检查网络或余额',
    'ORDER_CLOSED': '订单已关闭',
    'SYSTEM_ERROR': '系统错误，请稍后重试'
};

module.exports = {
    CONFIG,
    unifiedOrder,
    requestPayment,
    queryPaymentStatus,
    ERROR_CODES
};
