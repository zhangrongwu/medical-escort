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
    
    if (!order || order.status !== 'PROCESSING') {
      throw new Error('订单状态异常')
    }

    // 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'FINISHED',
        completeTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 更新陪诊员统计数据
    await db.collection('escorts').where({
      _openid: wxContext.OPENID
    }).update({
      data: {
        orderCount: db.command.inc(1),
        income: db.command.inc(order.totalPrice)
      }
    })

    // 发送服务完成通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'orderCompleted',
        openid: order._openid,
        orderId: order._id
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('完成服务失败', err)
    return {
      success: false,
      error: err
    }
  }
} 