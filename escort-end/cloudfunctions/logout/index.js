const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 更新陪诊员在线状态
    await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .update({
        data: {
          online: false,
          lastLogoutTime: db.serverDate()
        }
      })

    // 记录登出日志
    await db.collection('escort_logs').add({
      data: {
        escortId: wxContext.OPENID,
        type: 'logout',
        createTime: db.serverDate()
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('退出登录失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 