/**
 * 宠物商城应用配置
 */
const env = 'dev'; // dev, prod

const hosts = {
  dev: 'https://nlbieqvq.springboot-o551.k0cnhgdo.j0vrcawv.com',
  prod: 'https://nlbieqvq.springboot-o551.k0cnhgdo.j0vrcawv.com'
};

const appConfig = {
  // 当前环境
  env,
  
  // API接口地址
  apiBaseUrl: hosts[env],
  
  // AES加密密钥 (实际生产中应从服务端获取或更安全的方式存储)
  aesKey: '',
  aesIv: '', // 16字节
  
  // 接口签名密钥
  appSecret: '',
  
  // 默认分页大小
  pageSize: 20,
  
  // 请求超时时间 (毫秒)
  requestTimeout: 10000,
  
  // 静态资源CDN地址
  cdnUrl: 'https://cdn.catmall.com',
  
  // 主题色
  themeColor: '#FF9E6D',
  
  // 腾讯地图Key
  qqMapKey: 'YOUR_QQ_MAP_KEY',

  // 云开发配置
  cloud: {
    env: 'prod-2g8xmr3r62fda42b',
    service: 'springboot-o551',
    useCloudContainer: true // 是否启用云托管
  }
};

module.exports = appConfig;

