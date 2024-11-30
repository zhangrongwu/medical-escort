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

    // 获取今日订单统计
    const { list: todayStats } = await db.collection('orders')
      .aggregate()
      .match({
        escortId: wxContext.OPENID,
        createTime: _.gte(today)
      })
      .group({
        _id: '$status',
        count: $.sum(1),
        amount: $.sum('$totalPrice')
      })
      .end()

    // 获取总订单统计
    const { list: totalStats } = await db.collection('orders')
      .aggregate()
      .match({
        escortId: wxContext.OPENID
      })
      .group({
        _id: '$status',
        count: $.sum(1)
      })
      .end()

    return {
      success: true,
      data: {
        today: {
          total: todayStats.reduce((sum, item) => sum + item.count, 0),
          amount: todayStats.reduce((sum, item) => sum + (item.amount || 0), 0),
          pending: todayStats.find(item => item._id === 'PENDING')?.count || 0,
          processing: todayStats.find(item => item._id === 'PROCESSING')?.count || 0,
          completed: todayStats.find(item => item._id === 'COMPLETED')?.count || 0
        },
        total: {
          orders: totalStats.reduce((sum, item) => sum + item.count, 0),
          pending: totalStats.find(item => item._id === 'PENDING')?.count || 0,
          processing: totalStats.find(item => item._id === 'PROCESSING')?.count || 0,
          completed: totalStats.find(item => item._id === 'COMPLETED')?.count || 0
        }
      }
    }
  } catch (err) {
    console.error('获取工作台统计失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 