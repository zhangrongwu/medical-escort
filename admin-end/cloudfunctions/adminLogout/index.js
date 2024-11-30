const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 记录登出日志
    await db.collection('admin_logs').add({
      data: {
        type: 'logout',
        username: event.username,
        ip: wxContext.CLIENTIP,
        createTime: db.serverDate(),
        _openid: wxContext.OPENID
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('管理员登出失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 