const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 查询用户信息
    const { data: users } = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (users.length > 0) {
      return {
        success: true,
        isLogin: true,
        userInfo: users[0]
      }
    } else {
      return {
        success: true,
        isLogin: false
      }
    }
  } catch (err) {
    console.error('检查登录状态失败', err)
    return {
      success: false,
      error: err
    }
  }
} 