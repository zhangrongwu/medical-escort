// 订单状态常量
export const ORDER_STATUS = {
  UNPAID: 'UNPAID',      // 待支付
  PAID: 'PAID',          // 待接单
  ACCEPTED: 'ACCEPTED',   // 已接单
  ARRIVED: 'ARRIVED',     // 已到达
  PROCESSING: 'PROCESSING', // 服务中
  COMPLETED: 'COMPLETED',   // 已完成
  CANCELLED: 'CANCELLED',   // 已取消
  REFUNDING: 'REFUNDING',   // 退款中
  REFUNDED: 'REFUNDED'     // 已退款
}

// 订单状态显示文本
export const ORDER_STATUS_TEXT = {
  UNPAID: '待支付',
  PAID: '待接单',
  ACCEPTED: '已接单',
  ARRIVED: '已到达',
  PROCESSING: '服务中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款'
} 