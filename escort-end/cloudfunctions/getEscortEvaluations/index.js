const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, pageSize = 20 } = event

  try {
    // 查询评价总数
    const countResult = await db.collection('evaluations')
      .where({
        escortId: wxContext.OPENID
      })
      .count()

    // 分页查询评价列表
    const { data } = await db.collection('evaluations')
      .aggregate()
      .match({
        escortId: wxContext.OPENID
      })
      .lookup({
        from: 'orders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'order'
      })
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_openid',
        as: 'user'
      })
      .sort({
        createTime: -1
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .end()

    // 处理评价数据
    const evaluations = data.map(item => ({
      ...item,
      order: item.order[0] || {},
      user: item.isAnonymous ? {
        nickName: '匿名用户',
        avatarUrl: '/images/default-avatar.png'
      } : (item.user[0] || {}),
      createTime: item.createTime.toLocaleString()
    }))

    return {
      success: true,
      data: {
        total: countResult.total,
        list: evaluations,
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取评价列表失败', err)
    return {
      success: false,
      error: err
    }
  }
} 