// 测试工具函数

/**
 * 测试结果对象
 */
const TestResult = {
  PASSED: 'passed',
  FAILED: 'failed',
  ERROR: 'error'
};

/**
 * 测试用例类
 */
class TestCase {
  constructor(name, testFn) {
    this.name = name;
    this.testFn = testFn;
    this.result = null;
    this.error = null;
  }

  async run() {
    try {
      await this.testFn();
      this.result = TestResult.PASSED;
    } catch (error) {
      this.error = error;
      this.result = TestResult.FAILED;
    }
  }
}

/**
 * 测试套件类
 */
class TestSuite {
  constructor(name) {
    this.name = name;
    this.testCases = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  addTestCase(name, testFn) {
    this.testCases.push(new TestCase(name, testFn));
  }

  async run() {
    console.log(`=== 开始测试套件: ${this.name} ===`);
    
    for (const testCase of this.testCases) {
      await testCase.run();
      this.results.total++;
      
      if (testCase.result === TestResult.PASSED) {
        this.results.passed++;
        console.log(`✅ ${testCase.name}`);
      } else {
        this.results.failed++;
        console.error(`❌ ${testCase.name}: ${testCase.error.message}`);
        if (testCase.error.stack) {
          console.error(testCase.error.stack);
        }
      }
    }
    
    console.log(`=== 测试套件结束: ${this.name} ===`);
    console.log(`总测试用例数: ${this.results.total}, 通过: ${this.results.passed}, 失败: ${this.results.failed}`);
    
    return this.results;
  }
}

/**
 * 断言工具函数
 */
const assert = {
  equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `预期值: ${expected}, 实际值: ${actual}`);
    }
  },
  
  notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(message || `预期值不等于: ${expected}, 实际值: ${actual}`);
    }
  },
  
  ok(value, message) {
    if (!value) {
      throw new Error(message || `预期值为真, 实际值: ${value}`);
    }
  },
  
  notOk(value, message) {
    if (value) {
      throw new Error(message || `预期值为假, 实际值: ${value}`);
    }
  },
  
  deepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `预期值: ${JSON.stringify(expected)}, 实际值: ${JSON.stringify(actual)}`);
    }
  }
};

module.exports = {
  TestSuite,
  TestCase,
  TestResult,
  assert
};
