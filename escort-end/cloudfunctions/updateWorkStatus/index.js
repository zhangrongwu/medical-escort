const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { isWorking, location, serviceRange } = event

  try {
    // 更新陪诊员工作状态
    await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'
      })
      .update({
        data: {
          isWorking,
          lastActiveTime: db.serverDate(),
          currentLocation: location,
          serviceRange,
          updateTime: db.serverDate()
        }
      })

    // 如果下线，自动拒绝所有待接单的订单
    if (!isWorking) {
      await db.collection('orders')
        .where({
          escortId: wxContext.OPENID,
          status: 'PENDING'
        })
        .update({
          data: {
            status: 'REJECTED',
            rejectReason: '陪诊员已下线',
            updateTime: db.serverDate()
          }
        })
    }

    return {
      success: true
    }
  } catch (err) {
    console.error('更新工作状态失败', err)
    return {
      success: false,
      error: err
    }
  }
} 