const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    await db.collection('feedback').add({
      data: {
        ...event,
        openid: wxContext.OPENID,
        status: 'PENDING',
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      message: '提交成功'
    }
  } catch (err) {
    console.error('提交反馈失败:', err)
    return {
      success: false,
      error: err.message || '提交失败'
    }
  }
} 