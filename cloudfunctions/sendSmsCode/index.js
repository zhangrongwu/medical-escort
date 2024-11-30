const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

// 引入腾讯云短信 SDK
const tencentcloud = require("tencentcloud-sdk-nodejs")
const SmsClient = tencentcloud.sms.v20210111.Client

// 创建短信客户端
const client = new SmsClient({
  credential: {
    secretId: "您的secretId",
    secretKey: "您的secretKey",
  },
  region: "ap-guangzhou",
  profile: {
    signMethod: "HmacSHA256",
    httpProfile: {
      reqMethod: "POST",
      reqTimeout: 30,
      endpoint: "sms.tencentcloudapi.com",
    },
  },
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { phone } = event
  const wxContext = cloud.getWXContext()

  try {
    // 生成6位随机验证码
    const code = Math.random().toString().slice(-6)
    
    // 发送短信
    const result = await client.SendSms({
      PhoneNumberSet: [`+86${phone}`],
      SmsSdkAppId: "您的SmsSdkAppId",
      SignName: "您的签名名称",
      TemplateId: "您的模板ID",
      TemplateParamSet: [code, "5"], // 验证码和有效期
    })

    if (result.SendStatusSet[0].Code === "Ok") {
      // 将验证码保存到数据库
      await db.collection('sms_codes').add({
        data: {
          phone,
          code,
          openid: wxContext.OPENID,
          createTime: db.serverDate(),
          expireTime: db.serverDate({
            offset: 5 * 60 * 1000 // 5分钟有效期
          })
        }
      })

      return {
        success: true,
        message: '验证码发送成功'
      }
    } else {
      throw new Error('短信发送失败')
    }
  } catch (err) {
    console.error('发送验证码失败:', err)
    return {
      success: false,
      error: err.message || '发送失败'
    }
  }
} 