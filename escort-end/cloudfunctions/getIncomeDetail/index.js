const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate, page = 1, pageSize = 20 } = event

  try {
    const query = {
      escortId: wxContext.OPENID,
      status: 'COMPLETED'
    }

    // 如果有日期筛选
    if (startDate && endDate) {
      query.completeTime = _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
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
      .orderBy('completeTime', 'desc')
      .get()

    // 处理数据
    const list = data.map(order => ({
      _id: order._id,
      orderId: order.orderId,
      amount: order.totalPrice,
      serviceType: order.serviceType,
      hospitalName: order.hospitalName,
      patientName: order.patientInfo.name,
      createTime: order.createTime.toLocaleString(),
      completeTime: order.completeTime.toLocaleString(),
      settlementStatus: order.settlementStatus || 'PENDING'
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
    console.error('获取收入明细失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 