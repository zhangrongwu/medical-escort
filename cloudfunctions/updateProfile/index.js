const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    await db.collection('users').where({
      openid: wxContext.OPENID
    }).update({
      data: {
        ...event,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    console.error('更新用户资料失败:', err)
    return {
      success: false,
      error: err.message || '更新失败'
    }
  }
} 