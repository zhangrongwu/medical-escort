const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取今日开始时间
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 获取订单统计
    const { list } = await db.collection('orders')
      .aggregate()
      .match({
        escortId: wxContext.OPENID
      })
      .group({
        _id: '$status',
        count: $.sum(1),
        amount: $.sum('$totalPrice')
      })
      .end()

    // 获取今日订单
    const { total: todayOrders } = await db.collection('orders')
      .where({
        escortId: wxContext.OPENID,
        createTime: _.gte(today)
      })
      .count()

    return {
      success: true,
      data: {
        total: list.reduce((sum, item) => sum + item.count, 0),
        pending: list.find(item => item._id === 'PENDING')?.count || 0,
        processing: list.find(item => item._id === 'PROCESSING')?.count || 0,
        completed: list.find(item => item._id === 'COMPLETED')?.count || 0,
        todayOrders
      }
    }
  } catch (err) {
    console.error('获取订单统计失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 