const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    name, gender, idCard, phone, 
    region, serviceTypes, introduction,
    avatar, idCardFront, idCardBack, healthCert,
    experience 
  } = event

  try {
    // 检查必填字段
    if (!name || !gender || !idCard || !phone || !region || 
        !serviceTypes || !introduction || !idCardFront || 
        !idCardBack || !healthCert || !experience) {
      return {
        success: false,
        message: '请填写完整信息'
      }
    }

    // 检查手机号是否已注册
    const { data: existingEscorts } = await db.collection('escorts')
      .where({
        phone: phone
      })
      .get()

    if (existingEscorts.length > 0) {
      return {
        success: false,
        message: '该手机号已注册'
      }
    }

    // 创建陪诊员记录
    const result = await db.collection('escorts').add({
      data: {
        _openid: wxContext.OPENID,
        name,
        gender,
        idCard,
        phone,
        region,
        serviceTypes,
        introduction,
        avatar,
        idCardFront,
        idCardBack,
        healthCert,
        experience,
        status: 'PENDING',  // 待审核
        isOnline: false,    // 默认下线
        rating: 5.0,        // 默认评分
        orderCount: 0,      // 订单数
        balance: 0,         // 账户余额
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: {
        escortId: result._id
      }
    }

  } catch (err) {
    console.error('提交注册失败:', err)
    return {
      success: false,
      error: err.message || '提交失败'
    }
  }
} 