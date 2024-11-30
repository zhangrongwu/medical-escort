const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    avatar,
    name,
    gender,
    phone,
    region,
    serviceTypes,
    introduction,
    idCardFront,
    idCardBack,
    healthCert
  } = event

  try {
    // 更新陪诊员资料
    await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .update({
        data: {
          avatar,
          name,
          gender,
          phone,
          region,
          serviceTypes,
          introduction,
          idCardFront,
          idCardBack,
          healthCert,
          updateTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新陪诊员资料失败', err)
    return {
      success: false,
      error: err
    }
  }
} 