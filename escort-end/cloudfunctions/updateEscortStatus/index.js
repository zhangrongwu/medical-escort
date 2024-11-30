const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { isOnline } = event

  try {
    // 更新陪诊员在线状态
    await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'  // 只有审核通过的陪诊员才能更新状态
      })
      .update({
        data: {
          isOnline,
          updateTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('更新陪诊员状态失败', err)
    return {
      success: false,
      error: err
    }
  }
} 