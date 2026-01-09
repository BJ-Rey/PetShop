// utils/orders.js

const ORDERS_KEY = 'orders_data';

// Initial Mock Data
const initialOrders = [
  {
    id: 'ORD2025001',
    orderNo: '20251218123456789',
    status: 'pending',
    statusText: '待付款',
    merchantName: '宠物商城',
    productName: '天然粮通用型',
    sku: '10kg',
    price: 129,
    quantity: 1,
    totalPrice: 129,
    shippingFee: 0,
    couponAmount: 0,
    actualPrice: 129,
    image: 'https://placehold.co/400x400/FFA726/ffffff?text=Food',
    createTime: '2025-01-08 10:00:00',
    address: {
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区'
    },
    products: [
      {
        productId: 1,
        name: '天然粮通用型',
        sku: '10kg',
        price: 129,
        quantity: 1,
        image: 'https://placehold.co/400x400/FFA726/ffffff?text=Food'
      }
    ]
  },
  {
    id: 'ORD2025002',
    orderNo: '20251218123456790',
    status: 'shipping',
    statusText: '待发货',
    merchantName: '宠物商城',
    productName: '膨润土猫砂去味结团',
    sku: '10kg',
    price: 59,
    quantity: 2,
    totalPrice: 118,
    shippingFee: 10,
    couponAmount: 5,
    actualPrice: 123,
    image: 'https://placehold.co/400x400/FFA726/ffffff?text=Sand',
    createTime: '2025-01-07 14:30:00',
    payTime: '2025-01-07 14:35:00',
    address: {
      name: '李四',
      phone: '13900139000',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      detail: '天河路'
    },
    products: [
       {
        productId: 2,
        name: '膨润土猫砂去味结团',
        sku: '10kg',
        price: 59,
        quantity: 2,
        image: 'https://placehold.co/400x400/FFA726/ffffff?text=Sand'
      }
    ]
  },
  {
    id: 'ORD2025003',
    orderNo: '20251218123456791',
    status: 'delivering',
    statusText: '待收货',
    merchantName: '宠物商城',
    productName: '宠物用品牵引绳',
    sku: '大号',
    price: 39,
    quantity: 1,
    totalPrice: 39,
    shippingFee: 6,
    couponAmount: 0,
    actualPrice: 45,
    image: 'https://placehold.co/400x400/FFA726/ffffff?text=Leash',
    createTime: '2025-01-06 09:15:00',
    payTime: '2025-01-06 09:20:00',
    shippingTime: '2025-01-06 16:00:00',
    logisticsInfo: '运输中，预计明日到达',
    address: {
      name: '王五',
      phone: '13700137000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '朝阳公园'
    },
    products: [
      {
        productId: 3,
        name: '宠物用品牵引绳',
        sku: '大号',
        price: 39,
        quantity: 1,
        image: 'https://placehold.co/400x400/FFA726/ffffff?text=Leash'
      }
    ]
  },
  {
    id: 'ORD2025004',
    orderNo: '20251218123456792',
    status: 'completed',
    statusText: '已完成',
    merchantName: '宠物商城',
    productName: '宠物项圈牵引套装',
    sku: '中小型犬',
    price: 49,
    quantity: 1,
    totalPrice: 49,
    shippingFee: 0,
    couponAmount: 0,
    actualPrice: 49,
    image: 'https://placehold.co/400x400/FFA726/ffffff?text=Collar',
    createTime: '2025-01-05 11:20:00',
    payTime: '2025-01-05 11:25:00',
    shippingTime: '2025-01-05 15:00:00',
    completeTime: '2025-01-08 09:00:00',
    logisticsInfo: '已签收',
    address: {
      name: '赵六',
      phone: '13600136000',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴'
    },
    products: [
      {
        productId: 4,
        name: '宠物项圈牵引套装',
        sku: '中小型犬',
        price: 49,
        quantity: 1,
        image: 'https://placehold.co/400x400/FFA726/ffffff?text=Collar'
      }
    ]
  }
];

const statusTextMap = {
  pending: '待付款',
  shipping: '待发货',
  delivering: '待收货',
  completed: '已完成',
  cancelled: '已取消'
};

function getOrders() {
  const stored = wx.getStorageSync(ORDERS_KEY);
  if (!stored) {
    wx.setStorageSync(ORDERS_KEY, initialOrders);
    return initialOrders;
  }
  return stored;
}

function saveOrders(orders) {
  wx.setStorageSync(ORDERS_KEY, orders);
}

module.exports = {
  getAllOrders: () => {
    return getOrders();
  },

  getOrdersByStatus: (status) => {
    const orders = getOrders();
    if (!status) return orders;
    return orders.filter(o => o.status === status);
  },

  getOrderById: (id) => {
    const orders = getOrders();
    return orders.find(o => o.id === id);
  },

  updateOrderStatus: (id, newStatus) => {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = newStatus;
      order.statusText = statusTextMap[newStatus];
      
      const now = new Date().toLocaleString();
      if (newStatus === 'shipping') order.payTime = now;
      if (newStatus === 'delivering') order.shippingTime = now;
      if (newStatus === 'completed') order.completeTime = now;
      
      saveOrders(orders);
      return true;
    }
    return false;
  }
};