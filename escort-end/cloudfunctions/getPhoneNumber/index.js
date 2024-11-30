const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('getPhoneNumber called:', event)
  
  try {
    const { code } = event
    
    if (!code) {
      throw new Error('缺少code参数')
    }

    // 获取手机号
    const result = await cloud.openapi.phonenumber.getPhoneNumber({
      code: code
    })

    console.log('getPhoneNumber result:', result)

    if (!result.phoneInfo || !result.phoneInfo.phoneNumber) {
      throw new Error('获取手机号失败')
    }

    return {
      success: true,
      data: result.phoneInfo
    }
  } catch (err) {
    console.error('getPhoneNumber error:', err)
    return {
      success: false,
      error: err.message || '获取手机号失败'
    }
  }
} 