const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId } = event

  try {
    const order = await db.collection('orders').doc(orderId).get()
    const refundResult = await cloud.cloudPay.queryRefund({
      sub_mch_id: '1900000109',  // 替换为您的商户号
      out_trade_no: orderId
    })

    // 如果退款成功，更新订单状态
    if (refundResult.refund_status_0 === 'SUCCESS') {
      await db.collection('orders').doc(orderId).update({
        data: {
          status: 'REFUNDED',
          'refundInfo.completeTime': db.serverDate()
        }
      })
    }

    return {
      success: true,
      refundInfo: refundResult
    }
  } catch (err) {
    console.error('查询退款状态失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 