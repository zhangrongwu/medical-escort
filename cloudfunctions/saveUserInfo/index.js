const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 查询用户是否已存在
    const user = await db.collection('users').where({
      openid: openid
    }).get()

    if (user.data.length === 0) {
      // 新用户，插入记录
      return await db.collection('users').add({
        data: {
          openid: openid,
          nickName: event.nickName,
          avatarUrl: event.avatarUrl,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })
    } else {
      // 更新用户信息
      return await db.collection('users').where({
        openid: openid
      }).update({
        data: {
          nickName: event.nickName,
          avatarUrl: event.avatarUrl,
          updateTime: db.serverDate()
        }
      })
    }
  } catch (err) {
    console.error(err)
    return err
  }
} 