const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { startDate, endDate } = event

  try {
    // 构建查询条件
    const matchCondition = {
      escortId: wxContext.OPENID,
      status: 'FINISHED'
    }

    if (startDate && endDate) {
      matchCondition.completeTime = _.gte(new Date(startDate)).and(_.lte(new Date(endDate)))
    }

    // 聚合查询统计数据
    const { list } = await db.collection('orders')
      .aggregate()
      .match(matchCondition)
      .group({
        _id: null,
        totalOrders: $.sum(1),
        totalIncome: $.sum('$price'),
        avgScore: $.avg('$evaluation.score'),
        serviceHours: $.sum('$serviceHours'),
        serviceTypes: $.addToSet('$serviceType')
      })
      .end()

    // 获取评价统计
    const evaluationStats = await db.collection('evaluations')
      .aggregate()
      .match({
        escortId: wxContext.OPENID,
        createTime: matchCondition.completeTime || _.exists(true)
      })
      .group({
        _id: null,
        totalEvaluations: $.sum(1),
        avgAttitude: $.avg('$ratings.attitude'),
        avgProfessional: $.avg('$ratings.professional'),
        avgExperience: $.avg('$ratings.experience')
      })
      .end()

    const stats = list[0] || {
      totalOrders: 0,
      totalIncome: 0,
      avgScore: 5,
      serviceHours: 0,
      serviceTypes: []
    }

    const evalStats = evaluationStats.list[0] || {
      totalEvaluations: 0,
      avgAttitude: 5,
      avgProfessional: 5,
      avgExperience: 5
    }

    return {
      success: true,
      data: {
        ...stats,
        ...evalStats
      }
    }
  } catch (err) {
    console.error('获取工作统计失败', err)
    return {
      success: false,
      error: err
    }
  }
} 