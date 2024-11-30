const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { evaluationId, reply } = event

  try {
    // 获取评价信息
    const { data: evaluations } = await db.collection('evaluations')
      .where({
        _id: evaluationId,
        escortId: wxContext.OPENID
      })
      .get()

    if (!evaluations.length) {
      return {
        success: false,
        message: '评价不存在或无权限回复'
      }
    }

    // 更新评价回复
    await db.collection('evaluations')
      .doc(evaluationId)
      .update({
        data: {
          reply,
          replyTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('回复评价失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 