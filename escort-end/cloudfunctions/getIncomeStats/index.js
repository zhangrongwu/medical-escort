const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate } = event

  try {
    const query = {
      escortId: wxContext.OPENID,
      status: 'COMPLETED'
    }

    // 如果有日期筛选
    if (startDate && endDate) {
      query.completeTime = _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
    }

    // 获取收入统计
    const { list } = await db.collection('orders')
      .aggregate()
      .match(query)
      .group({
        _id: null,
        totalAmount: $.sum('$totalPrice'),
        orderCount: $.sum(1)
      })
      .end()

    // 获取待结算金额
    const { list: pendingList } = await db.collection('orders')
      .aggregate()
      .match({
        escortId: wxContext.OPENID,
        status: 'COMPLETED',
        settlementStatus: 'PENDING'
      })
      .group({
        _id: null,
        pendingAmount: $.sum('$totalPrice')
      })
      .end()

    return {
      success: true,
      data: {
        totalAmount: list[0]?.totalAmount || 0,
        orderCount: list[0]?.orderCount || 0,
        pendingAmount: pendingList[0]?.pendingAmount || 0
      }
    }
  } catch (err) {
    console.error('获取收入统计失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 