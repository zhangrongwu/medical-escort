const cloud = require('wx-server-sdk')
cloud.init({
  env: '你的新环境ID'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userInfo } = event

  console.log('escortLogin called:', { userInfo, OPENID: wxContext.OPENID })

  try {
    // 查询是否已注册
    const { data: escorts } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'  // 只查询已通过审核的陪诊员
      })
      .get()

    console.log('escorts query result:', escorts)

    if (escorts.length > 0) {
      // 已注册且已通过审核
      const escort = escorts[0]

      // 更新登录信息和用户信息
      await db.collection('escorts').doc(escort._id).update({
        data: {
          lastLoginTime: db.serverDate(),
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          gender: userInfo.gender
        }
      })

      return {
        success: true,
        isRegistered: true,
        escortInfo: {
          ...escort,
          avatarUrl: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          gender: userInfo.gender
        }
      }
    } else {
      // 未注册或未通过审核
      return {
        success: true,
        isRegistered: false,
        userInfo
      }
    }
  } catch (err) {
    console.error('陪诊员登录失败:', err)
    return {
      success: false,
      error: err.message || '登录失败'
    }
  }
} 