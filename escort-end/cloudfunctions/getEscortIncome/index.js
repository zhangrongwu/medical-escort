const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { year, month } = event

  try {
    // 构建查询条件
    let query = {
      escortId: wxContext.OPENID,
      status: 'FINISHED'
    }

    // 如果指定了月份，添加时间筛选
    if (year && month) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      query.completeTime = _.gte(startDate).and(_.lte(endDate))
    }

    // 获取订单列表
    const { data: orders } = await db.collection('orders')
      .where(query)
      .orderBy('completeTime', 'desc')
      .get()

    // 计算总收入
    const totalIncome = orders.reduce((sum, order) => sum + order.price, 0)

    // 获取本月收入
    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthlyIncome = orders
      .filter(order => new Date(order.completeTime) >= currentMonthStart)
      .reduce((sum, order) => sum + order.price, 0)

    // 获取陪诊员评分
    const { data: escort } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    return {
      success: true,
      data: {
        totalIncome,
        monthlyIncome,
        orderCount: orders.length,
        rating: escort[0].rating || 5.0,
        orders: orders.map(order => ({
          ...order,
          createTime: order.createTime.toLocaleString(),
          completeTime: order.completeTime.toLocaleString()
        }))
      }
    }
  } catch (err) {
    console.error('获取收入统计失败', err)
    return {
      success: false,
      error: err
    }
  }
} 