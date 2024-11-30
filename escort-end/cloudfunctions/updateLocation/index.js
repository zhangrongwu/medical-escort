const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { latitude, longitude } = event

  try {
    // 更新陪诊员位置信息
    await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'
      })
      .update({
        data: {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          updateTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新位置失败', err)
    return {
      success: false,
      error: err
    }
  }
} 