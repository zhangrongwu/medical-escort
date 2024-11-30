const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId, reason } = event
  const wxContext = cloud.getWXContext()

  try {
    // 获取订单信息
    const orderResult = await db.collection('orders').doc(orderId).get()
    const order = orderResult.data

    // 检查订单状态
    if (order.status !== 'PAID') {
      return {
        success: false,
        message: '订单状态不支持退款'
      }
    }

    // 调用退款接口
    const refundResult = await cloud.cloudPay.refund({
      sub_mch_id: '1900000109',  // 替换为您的商户号
      out_trade_no: orderId,
      out_refund_no: `RF${Date.now()}`,
      total_fee: order.totalPrice * 100,
      refund_fee: order.totalPrice * 100
    })

    // 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'REFUNDING',
        refundInfo: {
          reason: reason,
          refundNo: refundResult.refund_id,
          refundTime: db.serverDate(),
          operatorId: wxContext.OPENID
        }
      }
    })

    // 发送退款通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'orderRefund',
        openid: order._openid,
        orderId: orderId,
        amount: order.totalPrice,
        reason: reason,
        time: new Date().toLocaleString()
      }
    })

    return {
      success: true,
      refundId: refundResult.refund_id
    }
  } catch (err) {
    console.error('申请退款失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 