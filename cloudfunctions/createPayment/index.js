const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId } = event
  const wxContext = cloud.getWXContext()

  try {
    // 获取订单信息
    const orderResult = await db.collection('orders').doc(orderId).get()
    const order = orderResult.data

    // 检查订单状态
    if (order.status !== 'UNPAID') {
      return {
        success: false,
        message: '订单状态不正确'
      }
    }

    // 生成支付订单
    const paymentResult = await cloud.cloudPay.unifiedOrder({
      body: '医疗陪诊服务费',
      outTradeNo: orderId,
      spbillCreateIp: '127.0.0.1',
      subMchId: '1900000109',  // 这里需要替换为您的商户号
      totalFee: order.totalPrice * 100,  // 单位为分
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'paymentCallback',
      nonceStr: Math.random().toString(36).substr(2, 15),
      tradeType: 'JSAPI',
      openid: wxContext.OPENID
    })

    // 更新订单支付信息
    await db.collection('orders').doc(orderId).update({
      data: {
        paymentInfo: {
          prepayId: paymentResult.payment.prepayId,
          nonceStr: paymentResult.payment.nonceStr,
          timeStamp: paymentResult.payment.timeStamp,
          createTime: db.serverDate()
        }
      }
    })

    return {
      success: true,
      paymentData: paymentResult.payment
    }
  } catch (err) {
    console.error('创建支付订单失败:', err)
    return {
      success: false,
      error: err,
      message: '创建支付订单失败'
    }
  }
} 