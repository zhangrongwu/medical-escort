const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate, page = 1, pageSize = 20 } = event

  try {
    const matchCondition = {
      escortId: wxContext.OPENID,
      status: 'FINISHED'
    }

    if (startDate && endDate) {
      matchCondition.completeTime = _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
    }

    // 使用聚合查询获取更详细的收入信息
    const { list } = await db.collection('orders')
      .aggregate()
      .match(matchCondition)
      .lookup({
        from: 'evaluations',
        localField: '_id',
        foreignField: 'orderId',
        as: 'evaluation'
      })
      .addFields({
        hasEvaluation: $.size('$evaluation'),
        evaluationScore: $.arrayElemAt(['$evaluation.score', 0])
      })
      .sort({
        completeTime: -1
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .end()

    // 获取总数
    const { total } = await db.collection('orders')
      .where(matchCondition)
      .count()

    // 计算统计数据
    const stats = await db.collection('orders')
      .aggregate()
      .match(matchCondition)
      .group({
        _id: null,
        totalIncome: $.sum('$price'),
        totalOrders: $.sum(1),
        avgScore: $.avg('$evaluation.score')
      })
      .end()

    return {
      success: true,
      data: {
        list: list.map(item => ({
          ...item,
          createTime: item.createTime.toLocaleString(),
          completeTime: item.completeTime.toLocaleString()
        })),
        stats: stats.list[0] || {
          totalIncome: 0,
          totalOrders: 0,
          avgScore: 5
        },
        pagination: {
          total,
          page,
          pageSize
        }
      }
    }
  } catch (err) {
    console.error('获取收入明细失败', err)
    return {
      success: false,
      error: err
    }
  }
} 