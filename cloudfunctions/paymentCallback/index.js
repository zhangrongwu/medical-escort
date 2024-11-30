const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { outTradeNo, resultCode, transactionId } = event.data

  try {
    if (resultCode === 'SUCCESS') {
      // 更新订单状态
      await db.collection('orders').doc(outTradeNo).update({
        data: {
          status: 'PAID',
          paymentInfo: {
            transactionId,
            payTime: db.serverDate()
          }
        }
      })

      // 获取订单信息
      const order = await db.collection('orders').doc(outTradeNo).get()

      // 发送支付成功通知
      await cloud.callFunction({
        name: 'sendMessage',
        data: {
          type: 'paymentSuccess',
          openid: order.data._openid,
          orderId: outTradeNo,
          amount: order.data.totalPrice,
          time: new Date().toLocaleString()
        }
      })

      // 通知陪诊员
      if (order.data.escortId) {
        await cloud.callFunction({
          name: 'sendMessage',
          data: {
            type: 'newOrder',
            escortId: order.data.escortId,
            orderId: outTradeNo
          }
        })
      }
    }

    return {
      success: true
    }
  } catch (err) {
    console.error('处理支付回调失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 