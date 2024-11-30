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
    if (order.status !== 'PAID') {
      return {
        success: false,
        message: '订单状态不正确'
      }
    }

    // 检查陪诊员状态
    const { data: escort } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'
      })
      .get()

    if (escort.length === 0) {
      return {
        success: false,
        message: '陪诊员状态异常'
      }
    }

    // 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'PROCESSING',
        escortId: wxContext.OPENID,
        escortName: escort[0].name,
        escortPhone: escort[0].phone,
        acceptTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 发送订单接单通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'orderAccepted',
        openid: order._openid,
        data: {
          orderNo: order.orderNo,
          escortName: escort[0].name,
          escortPhone: escort[0].phone,
          time: new Date().toLocaleString()
        }
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