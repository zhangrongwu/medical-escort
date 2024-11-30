const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init()

const db = cloud.database()

// MD5加密
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { oldPassword, newPassword } = event

  try {
    // 验证旧密码
    const { data } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        password: md5(oldPassword)
      })
      .get()

    if (data.length === 0) {
      return {
        success: false,
        message: '原密码错误'
      }
    }

    // 更新密码
    await db.collection('escorts')
      .doc(data[0]._id)
      .update({
        data: {
          password: md5(newPassword),
          updateTime: db.serverDate()
        }
      })

    return {
      success: true
    }
  } catch (err) {
    console.error('修改密码失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 