const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { registrationId, status, rejectReason } = event
  const wxContext = cloud.getWXContext()

  try {
    // 获取注册信息
    const { data: registration } = await db.collection('escort_registrations')
      .doc(registrationId)
      .get()

    if (!registration) {
      throw new Error('注册信息不存在')
    }

    // 更新注册状态
    await db.collection('escort_registrations')
      .doc(registrationId)
      .update({
        data: {
          status,
          rejectReason,
          reviewTime: db.serverDate(),
          reviewerId: wxContext.OPENID
        }
      })

    // 如果审核通过，创建陪诊员账号
    if (status === 'APPROVED') {
      await db.collection('escorts').add({
        data: {
          _openid: registration._openid,
          name: registration.name,
          gender: registration.gender,
          age: registration.age,
          idCard: registration.idCard,
          workYears: registration.workYears,
          background: registration.background,
          experience: registration.experience,
          idCardFront: registration.idCardFront,
          idCardBack: registration.idCardBack,
          healthCert: registration.healthCert,
          serviceArea: registration.serviceArea,
          price: registration.price,
          status: 'ACTIVE',
          score: 5.0,
          orderCount: 0,
          income: 0,
          createTime: db.serverDate()
        }
      })

      // 发送审核通过通知
      await cloud.callFunction({
        name: 'sendMessage',
        data: {
          type: 'registrationApproved',
          openid: registration._openid
        }
      })
    } else if (status === 'REJECTED') {
      // 发送审核拒绝通知
      await cloud.callFunction({
        name: 'sendMessage',
        data: {
          type: 'registrationRejected',
          openid: registration._openid,
          reason: rejectReason
        }
      })
    }

    return {
      success: true
    }
  } catch (err) {
    console.error('审核陪诊员注册失败', err)
    return {
      success: false,
      error: err
    }
  }
} 