const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId } = event
  const wxContext = cloud.getWXContext()

  try {
    // 查询订单信息
    const { data: order } = await db.collection('orders').doc(orderId).get()
    
    if (!order || order.status !== 'PAID') {
      throw new Error('订单状态异常')
    }

    // 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'PROCESSING',
        escortOpenid: wxContext.OPENID,
        acceptTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 发送订单状态变更通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'orderAccepted',
        openid: order._openid,
        orderId: order._id
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('接单失败', err)
    return {
      success: false,
      error: err
    }
  }
} 