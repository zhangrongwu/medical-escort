const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const registrationData = event

  try {
    // 检查是否已经提交过注册
    const { data: existingRegistrations } = await db.collection('escort_registrations')
      .where({
        _openid: wxContext.OPENID,
        status: 'PENDING'
      })
      .get()

    if (existingRegistrations.length > 0) {
      return {
        success: false,
        message: '您已提交注册申请，请等待审核'
      }
    }

    // 创建注册记录
    const result = await db.collection('escort_registrations').add({
      data: {
        ...registrationData,
        _openid: wxContext.OPENID,
        status: 'PENDING',
        createTime: db.serverDate()
      }
    })

    // 发送注册提醒给管理员
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'newRegistration',
        openid: 'admin-openid', // 管理员的openid
        registrationId: result._id
      }
    })

    return {
      success: true,
      registrationId: result._id
    }
  } catch (err) {
    console.error('提交陪诊员注册失败', err)
    return {
      success: false,
      error: err
    }
  }
} 