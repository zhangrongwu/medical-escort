const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, pageSize = 20 } = event

  try {
    // 查询提现记录总数
    const countResult = await db.collection('withdrawals')
      .where({
        escortId: wxContext.OPENID
      })
      .count()

    // 分页查询提现记录
    const { data } = await db.collection('withdrawals')
      .where({
        escortId: wxContext.OPENID
      })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: {
        total: countResult.total,
        list: data,
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取提现记录失败', err)
    return {
      success: false,
      error: err
    }
  }
} 