const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId } = event

  try {
    // 关闭微信支付订单
    await cloud.cloudPay.closeOrder({
      sub_mch_id: '1900000109',  // 替换为您的商户号
      out_trade_no: orderId
    })

    // 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'CANCELLED',
        cancelTime: db.serverDate()
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('关闭订单失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 