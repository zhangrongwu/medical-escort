const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, status } = event
  const wxContext = cloud.getWXContext()

  try {
    // 检查权限
    const { data: currentAdmin } = await db.collection('admins')
      .where({
        _openid: wxContext.OPENID,
        role: 'super_admin'
      })
      .get()

    if (currentAdmin.length === 0) {
      return {
        success: false,
        message: '无权限查看管理员列表'
      }
    }

    // 构建查询条件
    const query = {}
    if (status) {
      query.status = status
    }

    // 获取总数
    const countResult = await db.collection('admins')
      .where(query)
      .count()

    // 获取列表
    const { data } = await db.collection('admins')
      .where(query)
      .field({
        password: false
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get()

    return {
      success: true,
      data: {
        total: countResult.total,
        list: data.map(admin => ({
          ...admin,
          createTime: admin.createTime.toLocaleString(),
          lastLoginTime: admin.lastLoginTime?.toLocaleString()
        })),
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取管理员列表失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 