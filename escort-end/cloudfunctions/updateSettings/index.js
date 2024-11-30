const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .update({
        data: {
          settings: event,
          updateTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新设置失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 