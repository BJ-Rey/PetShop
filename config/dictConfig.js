/**
 * 数据字典配置
 */
const dictConfig = {
  // 猫咪品种
  CAT_BREEDS: [
    { label: '英短', value: 'british_shorthair' },
    { label: '美短', value: 'american_shorthair' },
    { label: '布偶', value: 'ragdoll' },
    { label: '加菲', value: 'exotic_shorthair' },
    { label: '暹罗', value: 'siamese' },
    { label: '无毛', value: 'sphynx' },
    { label: '中华田园', value: 'chinese_lihua' }
  ],
  
  // 宠物性别
  GENDER: [
    { label: '公', value: 'male' },
    { label: '母', value: 'female' }
  ],
  
  // 宠物状态
  PET_STATUS: [
    { label: '上架中', value: 'available', color: '#07c160' },
    { label: '已预订', value: 'booked', color: '#ff9800' },
    { label: '已售出', value: 'sold', color: '#999999' },
    { label: '已下架', value: 'off_shelf', color: '#e64340' }
  ],
  
  // 订单状态
  ORDER_STATUS: [
    { label: '待支付', value: 'pending_payment' },
    { label: '待发货', value: 'pending_shipment' },
    { label: '待收货', value: 'pending_receipt' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' },
    { label: '售后中', value: 'refunding' }
  ],
  
  // 预约状态
  APPOINTMENT_STATUS: [
    { label: '待确认', value: 'pending' },
    { label: '已确认', value: 'confirmed' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' }
  ]
};

module.exports = dictConfig;
