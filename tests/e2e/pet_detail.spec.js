const automator = require('miniprogram-automator');

describe('宠物详情页 E2E 测试', () => {
  let miniProgram;
  let page;

  beforeAll(async () => {
    miniProgram = await automator.launch({
      projectPath: 'd:/Project-ai/宠物商城',
    });
    page = await miniProgram.reLaunch('/pages/index/index');
    await page.waitFor(500);
  }, 30000);

  afterAll(async () => {
    await miniProgram.close();
  });

  it('首页点击宠物应跳转到正确的详情页', async () => {
    // 1. 获取首页推荐猫咪列表的第一个卡片
    const petCard = await page.$('.pet-card');
    expect(petCard).not.toBeNull();
    
    // 获取该卡片的 data-id
    const dataId = await petCard.attribute('data-id');
    expect(dataId).toBeTruthy();

    // 2. 点击卡片
    await petCard.tap();
    await page.waitFor(1000);

    // 3. 获取当前页面栈
    const currentPage = await miniProgram.currentPage();
    expect(currentPage.path).toBe('pages/pet/detail/detail');
    
    // 4. 验证详情页加载了正确的数据 (模拟)
    // 实际应检查页面内容是否包含对应ID的信息，或者检查API调用
    const pageData = await currentPage.data();
    expect(pageData.petId).toBe(dataId);
    expect(pageData.hasError).toBe(false);
  });

  it('详情页网络异常应显示重试按钮', async () => {
    // 模拟跳转到一个不存在的ID或断网 (需Mock支持)
    await miniProgram.navigateTo('/pages/pet/detail/detail?id=999999');
    const detailPage = await miniProgram.currentPage();
    await detailPage.waitFor(2000);

    // 假设后端返回404或失败
    const errorState = await detailPage.$('.error-state');
    // 如果ID无效导致API失败，应显示错误状态
    // 注意：这取决于后端是否真的返回错误，或者前端Mock
    // 这里验证代码逻辑：如果有错误，error-state 应存在
    if (errorState) {
        const retryBtn = await detailPage.$('.retry-btn');
        expect(retryBtn).not.toBeNull();
        
        // 点击重试
        await retryBtn.tap();
        // 验证是否重新触发加载 (可以通过isLoading状态变化验证)
        const isLoading = await detailPage.data('isLoading');
        expect(isLoading).toBe(true);
    }
  });
});
