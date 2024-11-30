const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { userInfo } = event

  try {
    // 查找用户是否已存在
    const { data: users } = await db.collection('users')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    let dbUser = null
    
    if (users.length === 0) {
      // 新用户，创建用户记录
      const result = await db.collection('users').add({
        data: {
          _openid: wxContext.OPENID,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
      
      dbUser = {
        _id: result._id,
        _openid: wxContext.OPENID,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender
      }
    } else {
      // 更新已有用户信息
      dbUser = users[0]
      await db.collection('users').doc(dbUser._id).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          updateTime: db.serverDate()
        }
      })
    }

    return {
      success: true,
      userInfo: dbUser
    }
  } catch (err) {
    console.error('登录失败', err)
    return {
      success: false,
      error: err
    }
  }
} 