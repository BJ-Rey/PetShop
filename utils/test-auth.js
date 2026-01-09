// auth.js测试用例
const { TestSuite, assert } = require('./test-utils.js');
const auth = require('./auth.js');

// 创建测试套件
const authTestSuite = new TestSuite('Auth模块测试');

// 清除本地存储中的用户信息，确保测试环境干净
const clearUserInfo = () => {
  try {
    wx.removeStorageSync('userInfo');
  } catch (error) {
    // 忽略清除失败的情况
  }
};

// 测试用例1：测试未登录状态
authTestSuite.addTestCase('测试未登录状态', () => {
  clearUserInfo();
  assert.notOk(auth.isLoggedIn(), '未登录时isLoggedIn应返回false');
  assert.equal(auth.getUserRole(), 'guest', '未登录时getUserRole应返回guest');
  assert.notOk(auth.isMerchant(), '未登录时isMerchant应返回false');
  assert.notOk(auth.hasPermission('user'), '未登录时hasPermission应返回false');
});

// 测试用例2：测试普通用户权限
authTestSuite.addTestCase('测试普通用户权限', () => {
  clearUserInfo();
  // 设置普通用户信息
  wx.setStorageSync('userInfo', {
    role: 'user',
    phoneNumber: '13800138000'
  });
  
  assert.ok(auth.isLoggedIn(), '登录时isLoggedIn应返回true');
  assert.equal(auth.getUserRole(), 'user', '普通用户getUserRole应返回user');
  assert.notOk(auth.isMerchant(), '普通用户isMerchant应返回false');
  assert.ok(auth.hasPermission('user'), '普通用户hasPermission应返回true');
  assert.notOk(auth.hasPermission('merchant'), '普通用户hasPermission应返回false');
});

// 测试用例3：测试商家用户权限
authTestSuite.addTestCase('测试商家用户权限', () => {
  clearUserInfo();
  // 设置商家用户信息
  wx.setStorageSync('userInfo', {
    role: 'merchant',
    phoneNumber: '13800138001'
  });
  
  assert.ok(auth.isLoggedIn(), '登录时isLoggedIn应返回true');
  assert.equal(auth.getUserRole(), 'merchant', '商家用户getUserRole应返回merchant');
  assert.ok(auth.isMerchant(), '商家用户isMerchant应返回true');
  assert.ok(auth.hasPermission('user'), '商家用户hasPermission应返回true');
  assert.ok(auth.hasPermission('merchant'), '商家用户hasPermission应返回true');
});

// 测试用例4：测试角色层级关系
authTestSuite.addTestCase('测试角色层级关系', () => {
  clearUserInfo();
  // 测试guest角色
  wx.setStorageSync('userInfo', {
    role: 'guest',
    phoneNumber: '13800138002'
  });
  assert.equal(auth.hasPermission('guest'), true, 'guest角色应有guest权限');
  assert.equal(auth.hasPermission('user'), false, 'guest角色不应有user权限');
  assert.equal(auth.hasPermission('merchant'), false, 'guest角色不应有merchant权限');
  
  // 测试user角色
  wx.setStorageSync('userInfo', {
    role: 'user',
    phoneNumber: '13800138003'
  });
  assert.equal(auth.hasPermission('guest'), true, 'user角色应有guest权限');
  assert.equal(auth.hasPermission('user'), true, 'user角色应有user权限');
  assert.equal(auth.hasPermission('merchant'), false, 'user角色不应有merchant权限');
  
  // 测试merchant角色
  wx.setStorageSync('userInfo', {
    role: 'merchant',
    phoneNumber: '13800138004'
  });
  assert.equal(auth.hasPermission('guest'), true, 'merchant角色应有guest权限');
  assert.equal(auth.hasPermission('user'), true, 'merchant角色应有user权限');
  assert.equal(auth.hasPermission('merchant'), true, 'merchant角色应有merchant权限');
});

// 测试用例5：测试logout功能
authTestSuite.addTestCase('测试logout功能', () => {
  clearUserInfo();
  // 设置用户信息
  wx.setStorageSync('userInfo', {
    role: 'user',
    phoneNumber: '13800138005'
  });
  
  assert.ok(auth.isLoggedIn(), '登录时isLoggedIn应返回true');
  
  // 调用logout
  auth.logout();
  
  assert.notOk(auth.isLoggedIn(), 'logout后isLoggedIn应返回false');
  assert.equal(auth.getUserRole(), 'guest', 'logout后getUserRole应返回guest');
});

// 测试用例6：测试getUserInfo功能
authTestSuite.addTestCase('测试getUserInfo功能', () => {
  clearUserInfo();
  const testUserInfo = {
    role: 'user',
    phoneNumber: '13800138006',
    name: '测试用户'
  };
  
  // 设置用户信息
  wx.setStorageSync('userInfo', testUserInfo);
  
  const getUserInfoResult = auth.getUserInfo();
  assert.deepEqual(getUserInfoResult, testUserInfo, 'getUserInfo应返回完整的用户信息');
  
  // 清除用户信息
  clearUserInfo();
  assert.equal(auth.getUserInfo(), null, '未登录时getUserInfo应返回null');
});

// 导出测试套件
module.exports = authTestSuite;
