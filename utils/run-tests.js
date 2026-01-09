// 测试入口文件，用于运行所有测试套件
const authTestSuite = require('./test-auth.js');
const cacheTestSuite = require('./test-cache.js');

/**
 * 运行所有测试套件
 */
async function runAllTests() {
  console.log('=== 开始运行所有测试套件 ===');
  
  // 记录开始时间
  const startTime = Date.now();
  
  // 运行各个测试套件
  const authResults = await authTestSuite.run();
  const cacheResults = await cacheTestSuite.run();
  
  // 计算总结果
  const totalResults = {
    passed: authResults.passed + cacheResults.passed,
    failed: authResults.failed + cacheResults.failed,
    total: authResults.total + cacheResults.total
  };
  
  // 记录结束时间
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  console.log('=== 所有测试套件运行结束 ===');
  console.log(`总测试用例数: ${totalResults.total}, 通过: ${totalResults.passed}, 失败: ${totalResults.failed}`);
  console.log(`总耗时: ${totalTime}ms`);
  
  if (totalResults.failed === 0) {
    console.log('🎉 所有测试用例通过！');
  } else {
    console.error('❌ 有测试用例失败，请检查测试结果。');
  }
  
  return totalResults;
}

/**
 * 导出测试函数，方便在其他地方调用
 */
module.exports = {
  runAllTests,
  // 导出单个测试套件，方便单独运行
  authTestSuite,
  cacheTestSuite
};

// 如果直接运行此文件，则执行所有测试
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}
