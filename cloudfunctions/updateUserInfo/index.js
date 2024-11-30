const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    return await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        nickName: event.nickName,
        avatarUrl: event.avatarUrl,
        phone: event.phone,
        gender: event.gender,
        updateTime: db.serverDate()
      }
    })
  } catch (err) {
    console.error(err)
    return err
  }
} 