const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

// 验证管理员权限
exports.checkAdminAuth = async (context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 查询管理员日志
    const { data: logs } = await db.collection('admin_logs')
      .where({
        _openid: wxContext.OPENID,
        type: 'login'
      })
      .orderBy('createTime', 'desc')
      .limit(1)
      .get()

    // 检查是否有最近的登录记录
    if (logs.length === 0) {
      throw new Error('未登录或登录已过期')
    }

    // 检查登录时间是否在24小时内
    const lastLogin = logs[0].createTime
    const now = new Date()
    if (now - lastLogin > 24 * 60 * 60 * 1000) {
      throw new Error('登录已过期，请重新登录')
    }

    return true
  } catch (err) {
    console.error('验证管理员权限失败:', err)
    return false
  }
} 