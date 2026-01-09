// Mock data for cats
const catBreeds = ['英短', '美短', '布偶', '加菲', '暹罗', '中华田园猫', '金吉拉', '缅因'];
const catPersonalities = ['活泼', '粘人', '高冷', '温顺', '调皮', '安静', '聪明', '胆小'];
const healthStatuses = ['健康', '健康', '健康', '已驱虫', '已疫苗', '少许瑕疵'];

const generateCats = (count = 20) => {
  const cats = [];
  for (let i = 1; i <= count; i++) {
    const breed = catBreeds[Math.floor(Math.random() * catBreeds.length)];
    cats.push({
      id: i,
      name: `${breed}No.${i}`,
      age: `${Math.floor(Math.random() * 5) + 1}岁`,
      breed: breed,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      healthStatus: healthStatuses[Math.floor(Math.random() * healthStatuses.length)],
      personality: [
        catPersonalities[Math.floor(Math.random() * catPersonalities.length)],
        catPersonalities[Math.floor(Math.random() * catPersonalities.length)]
      ],
      price: Math.floor(Math.random() * 5000) + 1000,
      deposit: Math.floor(Math.random() * 1000) + 200,
      avatar: `https://placehold.co/400x400/FFA726/ffffff?text=Cat${i}`, // Using the new primary color for placeholder
      status: i % 5 === 0 ? 'booked' : 'available',
      statusText: i % 5 === 0 ? '已预订' : '可预订',
      isOrdered: i % 5 === 0,
      description: `这是一只可爱的${breed}，性格${catPersonalities[Math.floor(Math.random() * catPersonalities.length)]}。`
    });
  }
  return cats;
};

const products = [
    {
      id: 1,
      name: '天然猫粮通用型英短美短成猫粮',
      category: 'food',
      price: 129,
      originalPrice: 199,
      sales: 1256,
      rating: 4.8,
      stock: 500,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Food1'
    },
    {
      id: 2,
      name: '猫砂膨润土除臭结团猫砂10kg',
      category: 'daily',
      price: 59,
      originalPrice: 89,
      sales: 2341,
      rating: 4.9,
      stock: 300,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Sand'
    },
    {
      id: 3,
      name: '猫咪逗猫棒玩具',
      category: 'toys',
      price: 39,
      originalPrice: 59,
      sales: 892,
      rating: 4.7,
      stock: 200,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Toy'
    },
    {
      id: 4,
      name: '猫咪牵引绳防挣脱',
      category: 'daily',
      price: 49,
      originalPrice: 79,
      sales: 1567,
      rating: 4.6,
      stock: 400,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Leash'
    },
    {
      id: 5,
      name: '猫咪疫苗妙三多疫苗',
      category: 'medicine',
      price: 198,
      originalPrice: 298,
      sales: 678,
      rating: 4.9,
      stock: 100,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Vaccine'
    },
    {
      id: 6,
      name: '猫咪专用香波沐浴露',
      category: 'grooming',
      price: 69,
      originalPrice: 99,
      sales: 987,
      rating: 4.8,
      stock: 350,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Shampoo'
    },
    {
      id: 7,
      name: '猫咪衣服秋冬装保暖卫衣',
      category: 'clothing',
      price: 79,
      originalPrice: 129,
      sales: 1123,
      rating: 4.7,
      stock: 250,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Clothes'
    },
    {
      id: 8,
      name: '猫咪航空箱外出便携箱运输箱',
      category: 'daily',
      price: 159,
      originalPrice: 239,
      sales: 567,
      rating: 4.6,
      stock: 180,
      image: 'https://placehold.co/400x400/FFA726/ffffff?text=Box'
    }
];

const services = [
    {
      id: 1,
      name: '犬瘟热疫苗接种',
      category: 'vaccine',
      description: '专业犬瘟热疫苗接种服务，保护爱犬健康',
      price: 198,
      duration: '30分钟',
      merchantName: '爱心宠物医院',
      image: 'https://example.com/service1.jpg',
      sales: 1256,
      rating: 4.8
    },
    {
      id: 2,
      name: '宠物美容套餐',
      category: 'grooming',
      description: '包含洗澡、剪毛、美甲等全套美容服务',
      price: 128,
      duration: '2小时',
      merchantName: '宠物美容中心',
      image: 'https://example.com/service2.jpg',
      sales: 2341,
      rating: 4.9
    },
    {
      id: 3,
      name: '宠物寄养服务',
      category: 'boarding',
      description: '提供舒适的寄养环境，专业护理人员24小时照顾',
      price: 80,
      duration: '1天',
      merchantName: '宠物乐园',
      image: 'https://example.com/service3.jpg',
      sales: 892,
      rating: 4.7
    },
    {
      id: 4,
      name: '宠物健康咨询',
      category: 'consultation',
      description: '专业兽医在线咨询，解答宠物健康问题',
      price: 50,
      duration: '30分钟',
      merchantName: '宠物健康中心',
      image: 'https://example.com/service4.jpg',
      sales: 567,
      rating: 4.6
    },
    {
      id: 5,
      name: '宠物训练课程',
      category: 'training',
      description: '基础服从训练，让宠物更听话',
      price: 298,
      duration: '4课时',
      merchantName: '宠物训练学校',
      image: 'https://example.com/service5.jpg',
      sales: 342,
      rating: 4.8
    },
    {
      id: 6,
      name: '狂犬病疫苗接种',
      category: 'vaccine',
      description: '预防狂犬病，保障宠物和家人安全',
      price: 80,
      duration: '20分钟',
      merchantName: '爱心宠物医院',
      image: 'https://example.com/service6.jpg',
      sales: 1890,
      rating: 4.9
    },
    {
      id: 7,
      name: '宠物绝育手术',
      category: 'medical',
      description: '专业宠物绝育手术，降低患病风险',
      price: 398,
      duration: '1小时',
      merchantName: '爱心宠物医院',
      image: 'https://example.com/service7.jpg',
      sales: 789,
      rating: 4.7
    },
    {
      id: 8,
      name: '宠物摄影服务',
      category: 'other',
      description: '专业宠物摄影，记录美好瞬间',
      price: 168,
      duration: '1小时',
      merchantName: '宠物摄影工作室',
      image: 'https://example.com/service8.jpg',
      sales: 456,
      rating: 4.9
    }
];

module.exports = {
  cats: generateCats(),
  products: products,
  services: services
};