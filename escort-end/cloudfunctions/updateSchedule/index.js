const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { schedules, workingDays, workingHours } = event

  try {
    // 更新陪诊员排班信息
    await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'
      })
      .update({
        data: {
          schedules,        // 具体排班时间
          workingDays,     // 工作日设置
          workingHours,    // 工作时间设置
          updateTime: db.serverDate()
        }
      })

    // 检查并处理冲突的订单
    const conflictOrders = await db.collection('orders')
      .where({
        escortId: wxContext.OPENID,
        status: 'PENDING',
        appointmentDate: db.command.nin(schedules.map(s => s.date))
      })
      .get()

    // 自动拒绝冲突订单
    if (conflictOrders.data.length > 0) {
      const batch = conflictOrders.data.map(order => 
        db.collection('orders').doc(order._id).update({
          data: {
            status: 'REJECTED',
            rejectReason: '陪诊员排班调整',
            updateTime: db.serverDate()
          }
        })
      )
      await Promise.all(batch)
    }

    return {
      success: true,
      conflictOrders: conflictOrders.data.length
    }
  } catch (err) {
    console.error('更新排班失败', err)
    return {
      success: false,
      error: err
    }
  }
} 