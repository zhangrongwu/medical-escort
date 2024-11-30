const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

// 默认管理员账号配置
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'e10adc3949ba59abbe56e057f20f883e', // 123456 的 md5 值
  role: 'super_admin',
  status: 'active',
  name: '超级管理员',
  createTime: db.serverDate()
}

exports.main = async (event, context) => {
  try {
    // 检查是否已存在管理员
    const { total } = await db.collection('admins').count()
    
    if (total === 0) {
      // 创建默认管理员
      await db.collection('admins').add({
        data: DEFAULT_ADMIN
      })
      
      return {
        success: true,
        message: '初始化管理员成功',
        data: {
          username: DEFAULT_ADMIN.username,
          password: '123456' // 明文密码仅首次返回
        }
      }
    }
    
    return {
      success: false,
      message: '管理员已存在'
    }
  } catch (err) {
    console.error('初始化管理员失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 