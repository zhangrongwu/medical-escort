const cloud = require('wx-server-sdk')
const crypto = require('crypto')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { username, password, name, role = 'admin' } = event
  const wxContext = cloud.getWXContext()

  try {
    // 检查创建权限
    const { data: currentAdmin } = await db.collection('admins')
      .where({
        _openid: wxContext.OPENID,
        role: 'super_admin'
      })
      .get()

    if (currentAdmin.length === 0) {
      return {
        success: false,
        message: '无权限创建管理员'
      }
    }

    // 检查用户名是否存在
    const { total } = await db.collection('admins')
      .where({ username })
      .count()

    if (total > 0) {
      return {
        success: false,
        message: '用户名已存在'
      }
    }

    // 创建管理员
    const result = await db.collection('admins').add({
      data: {
        username,
        password: md5(password),
        name,
        role,
        status: 'active',
        createTime: db.serverDate(),
        createBy: currentAdmin[0]._id
      }
    })

    // 记录操作日志
    await db.collection('admin_logs').add({
      data: {
        adminId: currentAdmin[0]._id,
        type: 'create_admin',
        targetId: result._id,
        ip: wxContext.CLIENTIP,
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: {
        _id: result._id
      }
    }
  } catch (err) {
    console.error('创建管理员失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 