const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 查询陪诊员信息
    const { data: escorts } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (escorts.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const escort = escorts[0]

    // 检查账号状态
    if (escort.status !== 'ACTIVE') {
      return {
        success: false,
        message: '账号未激活或已被禁用'
      }
    }

    // 更新登录信息
    await db.collection('escorts')
      .doc(escort._id)
      .update({
        data: {
          online: true,
          lastLoginTime: db.serverDate()
        }
      })

    // 记录登录日志
    await db.collection('escort_logs').add({
      data: {
        escortId: wxContext.OPENID,
        type: 'login',
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: {
        _id: escort._id,
        name: escort.name,
        avatar: escort.avatar,
        status: escort.status
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 