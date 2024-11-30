const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { outTradeNo, resultCode, transactionId } = event

  try {
    if (resultCode === 'SUCCESS') {
      // 支付成功，更新订单状态
      await db.collection('orders').doc(outTradeNo).update({
        data: {
          status: 'PAID',
          payTime: db.serverDate(),
          transactionId: transactionId
        }
      })

      // 通知陪诊员有新订单
      const order = await db.collection('orders').doc(outTradeNo).get()
      await cloud.callFunction({
        name: 'sendMessage',
        data: {
          type: 'newOrder',
          escortId: order.data.escortId,
          orderId: outTradeNo
        }
      })
    }

    return {
      success: true
    }
  } catch (err) {
    console.error('处理支付回调失败', err)
    return {
      success: false,
      error: err
    }
  }
} 