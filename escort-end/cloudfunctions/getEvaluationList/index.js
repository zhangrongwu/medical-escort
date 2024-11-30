const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, pageSize = 20 } = event

  try {
    const query = {
      escortId: wxContext.OPENID
    }

    // 获取总数
    const countResult = await db.collection('evaluations')
      .where(query)
      .count()

    // 获取评价列表
    const { data } = await db.collection('evaluations')
      .aggregate()
      .match(query)
      .lookup({
        from: 'orders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'orderInfo'
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({
        createTime: -1
      })
      .end()

    // 处理数据
    const list = data.map(item => ({
      _id: item._id,
      orderId: item.orderId,
      rating: item.rating,
      comment: item.comment,
      reply: item.reply,
      createTime: item.createTime.toLocaleString(),
      orderInfo: item.orderInfo[0] ? {
        hospitalName: item.orderInfo[0].hospitalName,
        serviceType: item.orderInfo[0].serviceType,
        appointmentDate: item.orderInfo[0].appointmentDate
      } : null
    }))

    return {
      success: true,
      data: {
        total: countResult.total,
        list,
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取评价列表失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 