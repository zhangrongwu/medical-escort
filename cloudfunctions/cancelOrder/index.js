const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { orderId } = event

  try {
    // 获取订单信息
    const order = await db.collection('orders').doc(orderId).get()
    
    // 只有未支付或已支付的订单可以取消
    if (!['UNPAID', 'PAID'].includes(order.data.status)) {
      return {
        success: false,
        message: '当前订单状态不可取消'
      }
    }

    // 如果是已支付订单，需要退款
    if (order.data.status === 'PAID') {
      // 调用退款接口
      await cloud.cloudPay.refund({
        subMchId: '商户号',
        transactionId: order.data.transactionId,
        totalFee: order.data.totalPrice * 100,
        refundFee: order.data.totalPrice * 100
      })
    }

    // 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'CANCELLED',
        cancelTime: db.serverDate(),
        cancelBy: wxContext.OPENID
      }
    })

    // 如果有陪诊员，发送取消通知
    if (order.data.escortId) {
      await cloud.callFunction({
        name: 'sendMessage',
        data: {
          type: 'orderCancel',
          escortId: order.data.escortId,
          orderId: orderId
        }
      })
    }

    return {
      success: true,
      message: '订单取消成功'
    }
  } catch (err) {
    console.error('取消订单失败', err)
    return {
      success: false,
      error: err,
      message: '订单取消失败'
    }
  }
} 