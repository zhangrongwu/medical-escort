const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId } = event
  const wxContext = cloud.getWXContext()

  try {
    // 获取订单信息
    const { data: order } = await db.collection('orders').doc(orderId).get()
    
    // 检查订单状态
    if (order.status !== 'PROCESSING') {
      return {
        success: false,
        message: '订单状态不正确'
      }
    }

    // 检查是否是订单的陪诊员
    if (order.escortId !== wxContext.OPENID) {
      return {
        success: false,
        message: '无权操作此订单'
      }
    }

    // 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'FINISHED',
        completeTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 更新陪诊员订单统计
    await db.collection('escorts').where({
      _openid: wxContext.OPENID
    }).update({
      data: {
        orderCount: db.command.inc(1),
        updateTime: db.serverDate()
      }
    })

    // 发送订单完成通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'orderCompleted',
        openid: order._openid,
        data: {
          orderNo: order.orderNo,
          time: new Date().toLocaleString()
        }
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('完成订单失败', err)
    return {
      success: false,
      error: err
    }
  }
} 