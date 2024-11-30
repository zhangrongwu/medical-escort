const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 创建评价记录
    await db.collection('evaluations').add({
      data: {
        openid: openid,
        orderId: event.orderId,
        escortId: event.escortId,
        score: event.score,
        content: event.content,
        createTime: db.serverDate()
      }
    })

    // 更新订单状态
    await db.collection('orders').doc(event.orderId).update({
      data: {
        status: 'EVALUATED'
      }
    })

    // 更新陪诊员评分
    const escort = await db.collection('escorts').doc(event.escortId).get()
    const newScore = (escort.data.score * escort.data.orderCount + event.score) / (escort.data.orderCount + 1)
    
    return await db.collection('escorts').doc(event.escortId).update({
      data: {
        score: newScore,
        orderCount: db.command.inc(1)
      }
    })
  } catch (err) {
    console.error(err)
    return err
  }
} 