const cloud = require('wx-server-sdk')
const { checkAdminAuth } = require('../middleware/adminAuth')
cloud.init()

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  // 验证管理员权限
  const isAdmin = await checkAdminAuth(context)
  if (!isAdmin) {
    return {
      success: false,
      message: '无权限访问'
    }
  }

  const { status, page = 1, pageSize = 20 } = event

  try {
    let query = {}
    if (status) {
      query.status = status
    }

    // 获取总数
    const countResult = await db.collection('escorts')
      .where(query)
      .count()

    // 获取列表
    const { data } = await db.collection('escorts')
      .where(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get()

    return {
      success: true,
      data: {
        total: countResult.total,
        list: data.map(item => ({
          ...item,
          createTime: item.createTime.toLocaleString(),
          updateTime: item.updateTime.toLocaleString()
        })),
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取陪诊员列表失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 