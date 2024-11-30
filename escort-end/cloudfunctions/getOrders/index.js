const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { status, page = 1, pageSize = 20 } = event

  try {
    let query = {
      escortId: wxContext.OPENID
    }

    // 如果指定了状态，添加状态筛选
    if (status && status !== 'ALL') {
      query.status = status
    }

    // 获取总数
    const countResult = await db.collection('orders')
      .where(query)
      .count()

    // 获取列表
    const { data } = await db.collection('orders')
      .where(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get()

    return {
      success: true,
      data: {
        total: countResult.total,
        list: data.map(order => ({
          ...order,
          createTime: order.createTime.toLocaleString()
        })),
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取订单列表失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 