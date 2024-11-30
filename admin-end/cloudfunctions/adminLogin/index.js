const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('event:', event)
  const { username, password } = event
  
  try {
    const db = cloud.database()
    const { data } = await db.collection('admins')
      .where({
        username,
        password
      })
      .get()
    
    console.log('查询结果:', data)
    
    return {
      success: true,
      data: data[0] || null
    }
  } catch (err) {
    console.error('错误:', err)
    return {
      success: false,
      error: err
    }
  }
} 