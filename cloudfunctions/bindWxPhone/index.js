const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  try {
    // 获取手机号
    const res = await cloud.getPhoneNumber({
      code: event.code
    })

    // 更新用户信息
    await db.collection('users').where({
      openid: wxContext.OPENID
    }).update({
      data: {
        phone: res.phoneInfo.phoneNumber,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      phone: res.phoneInfo.phoneNumber
    }
  } catch (err) {
    console.error('绑定手机号失败:', err)
    return {
      success: false,
      error: err.message || '绑定失败'
    }
  }
} 