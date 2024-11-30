const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { phone, code } = event

  try {
    // 验证验证码
    const { data: codes } = await db.collection('sms_codes')
      .where({
        phone,
        code,
        used: false,
        expireTime: db.command.gt(db.serverDate())
      })
      .get()

    if (codes.length === 0) {
      return {
        success: false,
        message: '验证码无效或已过期'
      }
    }

    // 更新验证码状态
    await db.collection('sms_codes').doc(codes[0]._id).update({
      data: {
        used: true,
        useTime: db.serverDate()
      }
    })

    // 更新用户手机号
    await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .update({
        data: {
          phone,
          updateTime: db.serverDate()
        }
      })

    return {
      success: true,
      phone
    }
  } catch (err) {
    console.error('绑定手机号失败', err)
    return {
      success: false,
      error: err
    }
  }
} 