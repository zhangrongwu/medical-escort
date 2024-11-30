const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate, reason, type } = event

  try {
    // 检查是否有已存在的请假记录
    const { data: existingLeaves } = await db.collection('leaves')
      .where({
        escortId: wxContext.OPENID,
        status: 'PENDING',
        startDate: db.command.lte(endDate),
        endDate: db.command.gte(startDate)
      })
      .get()

    if (existingLeaves.length > 0) {
      return {
        success: false,
        message: '该时间段已有请假申请'
      }
    }

    // 创建请假记录
    const result = await db.collection('leaves').add({
      data: {
        escortId: wxContext.OPENID,
        startDate,
        endDate,
        reason,
        type,
        status: 'PENDING',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 发送请假通知
    await cloud.callFunction({
      name: 'sendEscortMessage',
      data: {
        type: 'leaveRequest',
        openid: wxContext.OPENID,
        data: {
          startDate,
          endDate,
          type,
          leaveId: result._id
        }
      }
    })

    return {
      success: true,
      leaveId: result._id
    }
  } catch (err) {
    console.error('请假申请失败', err)
    return {
      success: false,
      error: err
    }
  }
} 