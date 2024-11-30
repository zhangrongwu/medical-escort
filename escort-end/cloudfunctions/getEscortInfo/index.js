const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const { data } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    return {
      success: true,
      data: data[0]
    }
  } catch (err) {
    console.error('获取陪诊员信息失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 