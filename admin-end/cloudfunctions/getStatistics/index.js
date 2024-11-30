const cloud = require('wx-server-sdk')
const { checkAdminAuth } = require('../middleware/adminAuth')
cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  // 验证管理员权限
  const isAdmin = await checkAdminAuth(context)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限访问'
    }
  }

  try {
    // 获取陪诊员统计
    const escortStats = await db.collection('escorts')
      .aggregate()
      .group({
        _id: '$status',
        count: $.sum(1)
      })
      .end()

    // 获取订单统计
    const orderStats = await db.collection('orders')
      .aggregate()
      .group({
        _id: '$status',
        count: $.sum(1),
        totalAmount: $.sum('$totalPrice')
      })
      .end()

    // 获取今日数据
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStats = await Promise.all([
      // 今日新增陪诊员
      db.collection('escorts')
        .where({
          createTime: _.gte(today)
        })
        .count(),

      // 今日订单数
      db.collection('orders')
        .where({
          createTime: _.gte(today)
        })
        .count(),

      // 今日收入
      db.collection('orders')
        .where({
          createTime: _.gte(today),
          status: 'COMPLETED'
        })
        .aggregate()
        .group({
          _id: null,
          totalAmount: $.sum('$totalPrice')
        })
        .end()
    ])

    return {
      success: true,
      data: {
        escort: {
          total: escortStats.list.reduce((sum, item) => sum + item.count, 0),
          pending: escortStats.list.find(item => item._id === 'PENDING')?.count || 0,
          active: escortStats.list.find(item => item._id === 'ACTIVE')?.count || 0,
          rejected: escortStats.list.find(item => item._id === 'REJECTED')?.count || 0
        },
        order: {
          total: orderStats.list.reduce((sum, item) => sum + item.count, 0),
          totalAmount: orderStats.list.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
          completed: orderStats.list.find(item => item._id === 'COMPLETED')?.count || 0,
          processing: orderStats.list.find(item => item._id === 'PROCESSING')?.count || 0
        },
        today: {
          newEscorts: todayStats[0].total,
          newOrders: todayStats[1].total,
          income: todayStats[2].list[0]?.totalAmount || 0
        }
      }
    }
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 