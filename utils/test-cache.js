// cache.js测试用例
const { TestSuite, assert } = require('./test-utils.js');
const cache = require('./cache.js');

// 创建测试套件
const cacheTestSuite = new TestSuite('Cache模块测试');

// 测试用例1：测试基本缓存功能
cacheTestSuite.addTestCase('测试基本缓存功能', () => {
  const testKey = 'test_key';
  const testData = { name: 'test', value: 123 };
  
  // 设置缓存
  const setResult = cache.setCache(testKey, testData);
  assert.ok(setResult, '设置缓存应返回true');
  
  // 获取缓存
  const getResult = cache.getCache(testKey);
  assert.deepEqual(getResult, testData, '获取的缓存数据应与设置的一致');
  
  // 删除缓存
  const removeResult = cache.removeCache(testKey);
  assert.ok(removeResult, '删除缓存应返回true');
  
  // 验证缓存已删除
  const getAfterRemove = cache.getCache(testKey);
  assert.equal(getAfterRemove, null, '删除缓存后获取应返回null');
});

// 测试用例2：测试默认值功能
cacheTestSuite.addTestCase('测试默认值功能', () => {
  const testKey = 'non_existent_key';
  const defaultValue = 'default_value';
  
  // 获取不存在的缓存，应返回默认值
  const result = cache.getCache(testKey, defaultValue);
  assert.equal(result, defaultValue, '获取不存在的缓存应返回默认值');
});

// 测试用例3：测试缓存过期
cacheTestSuite.addTestCase('测试缓存过期', async () => {
  const testKey = 'expire_test_key';
  const testData = { name: 'test', value: 456 };
  
  // 设置一个1秒后过期的缓存
  cache.setCache(testKey, testData, 1000);
  
  // 立即获取，应返回数据
  let result = cache.getCache(testKey);
  assert.deepEqual(result, testData, '设置缓存后立即获取应返回数据');
  
  // 等待2秒，确保缓存过期
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 获取过期的缓存，应返回null
  result = cache.getCache(testKey);
  assert.equal(result, null, '缓存过期后应返回null');
});

// 测试用例4：测试页面缓存功能
cacheTestSuite.addTestCase('测试页面缓存功能', () => {
  const testPagePath = 'test/page';
  const testPageData = { title: 'Test Page', content: 'Test Content' };
  
  // 设置页面缓存
  const setResult = cache.setPageCache(testPagePath, testPageData);
  assert.ok(setResult, '设置页面缓存应返回true');
  
  // 获取页面缓存
  const getResult = cache.getPageCache(testPagePath);
  assert.deepEqual(getResult, testPageData, '获取的页面缓存数据应与设置的一致');
  
  // 删除页面缓存
  const removeResult = cache.removePageCache(testPagePath);
  assert.ok(removeResult, '删除页面缓存应返回true');
  
  // 验证页面缓存已删除
  const getAfterRemove = cache.getPageCache(testPagePath);
  assert.equal(getAfterRemove, null, '删除页面缓存后获取应返回null');
});

// 测试用例5：测试用户缓存功能
cacheTestSuite.addTestCase('测试用户缓存功能', () => {
  const testUserData = { name: 'Test User', phone: '13800138000' };
  
  // 设置用户缓存
  const setResult = cache.setUserCache(testUserData);
  assert.ok(setResult, '设置用户缓存应返回true');
  
  // 获取用户缓存
  const getResult = cache.getUserCache();
  assert.deepEqual(getResult, testUserData, '获取的用户缓存数据应与设置的一致');
  
  // 删除用户缓存（间接测试）
  cache.removeCache('user_info');
  const getAfterRemove = cache.getUserCache();
  assert.equal(getAfterRemove, null, '删除用户缓存后获取应返回null');
});

// 测试用例6：测试清除所有缓存功能
cacheTestSuite.addTestCase('测试清除所有缓存功能', () => {
  // 设置多个缓存
  cache.setCache('test_key1', 'value1');
  cache.setCache('test_key2', 'value2');
  cache.setPageCache('test/page1', { data: 'page1' });
  
  // 验证缓存已设置
  assert.equal(cache.getCache('test_key1'), 'value1', '缓存test_key1应存在');
  assert.equal(cache.getCache('test_key2'), 'value2', '缓存test_key2应存在');
  assert.deepEqual(cache.getPageCache('test/page1'), { data: 'page1' }, '页面缓存应存在');
  
  // 清除所有缓存
  const clearResult = cache.clearCache();
  assert.ok(clearResult, '清除所有缓存应返回true');
  
  // 验证所有缓存已清除
  assert.equal(cache.getCache('test_key1'), null, '缓存test_key1应被清除');
  assert.equal(cache.getCache('test_key2'), null, '缓存test_key2应被清除');
  assert.equal(cache.getPageCache('test/page1'), null, '页面缓存应被清除');
});

// 测试用例7：测试清除过期缓存功能
cacheTestSuite.addTestCase('测试清除过期缓存功能', async () => {
  // 设置一个1秒后过期的缓存和一个1小时后过期的缓存
  cache.setCache('expire_key', 'expire_value', 1000);
  cache.setCache('long_key', 'long_value', 3600000);
  
  // 等待2秒，确保第一个缓存过期
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 清除过期缓存
  const clearedCount = cache.clearExpiredCache();
  assert.equal(clearedCount, 1, '应清除1个过期缓存');
  
  // 验证过期缓存已清除，长期缓存仍存在
  assert.equal(cache.getCache('expire_key'), null, '过期缓存应被清除');
  assert.equal(cache.getCache('long_key'), 'long_value', '长期缓存应存在');
  
  // 清理测试数据
  cache.removeCache('long_key');
});

// 测试用例8：测试搜索历史缓存功能
cacheTestSuite.addTestCase('测试搜索历史缓存功能', () => {
  const testHistory = ['cat', 'dog', 'fish'];
  
  // 设置搜索历史缓存
  const setResult = cache.setSearchHistoryCache(testHistory);
  assert.ok(setResult, '设置搜索历史缓存应返回true');
  
  // 获取搜索历史缓存
  const getResult = cache.getSearchHistoryCache();
  assert.deepEqual(getResult, testHistory, '获取的搜索历史缓存数据应与设置的一致');
  
  // 删除搜索历史缓存（间接测试）
  cache.removeCache('search_history');
  const getAfterRemove = cache.getSearchHistoryCache();
  assert.deepEqual(getAfterRemove, [], '删除搜索历史缓存后获取应返回空数组');
});

// 导出测试套件
module.exports = cacheTestSuite;
