const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { date, page = 1, pageSize = 20 } = event

  try {
    // 获取月份开始和结束时间
    const [year, month] = date.split('-')
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const query = {
      escortId: wxContext.OPENID,
      status: 'COMPLETED',
      completeTime: _.gte(startDate).and(_.lte(endDate))
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

    return {
      success: true,
      data: {
        total: countResult.total,
        list: data.map(order => ({
          _id: order._id,
          orderId: order.orderId,
          amount: order.totalPrice,
          type: order.serviceType,
          hospitalName: order.hospitalName,
          status: order.settlementStatus || 'PENDING',
          createTime: order.createTime.toLocaleString()
        })),
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