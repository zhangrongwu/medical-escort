const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { type, page = 1, pageSize = 20 } = event

  try {
    let query = {
      escortId: wxContext.OPENID
    }

    // 根据类型筛选订单
    switch (type) {
      case 0: // 新订单
        query.status = 'PAID'
        break
      case 1: // 进行中
        query.status = 'PROCESSING'
        break
      case 2: // 已完成
        query.status = 'FINISHED'
        break
    }

    // 查询订单总数
    const countResult = await db.collection('orders')
      .where(query)
      .count()

    // 分页查询订单列表
    const { data } = await db.collection('orders')
      .where(query)
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
    console.error('获取陪诊员订单失败', err)
    return {
      success: false,
      error: err
    }
  }
} 