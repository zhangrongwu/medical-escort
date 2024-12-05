const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { orderId, status, location } = event
  const wxContext = cloud.getWXContext()
  
  try {
    const order = await db.collection('orders').doc(orderId).get()
    if (!order.data) {
      return {
        success: false,
        message: '订单不存在'
      }
    }

    // 检查权限
    if (order.data.escortId !== wxContext.OPENID) {
      return {
        success: false,
        message: '无权更新此订单'
      }
    }

    const updateData = {
      status: status
    }

    // 更新时间轴
    const timeline = order.data.timeline || {}
    switch(status) {
      case 1:
        timeline.confirmTime = new Date()
        break
      case 2:
        timeline.startTime = new Date()
        break
      case 3:
        timeline.arriveTime = new Date()
        break
      case 4:
        timeline.treatmentTime = new Date()
        break
      case 5:
        timeline.finishTime = new Date()
        break
    }
    updateData.timeline = timeline

    // 如果提供了位置信息，更新位置
    if (location) {
      updateData.currentLocation = {
        ...location,
        updateTime: new Date()
      }
    }

    await db.collection('orders').doc(orderId).update({
      data: updateData
    })

    return {
      success: true,
      message: '更新成功'
    }

  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
