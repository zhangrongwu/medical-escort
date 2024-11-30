const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { amount } = event

  try {
    // 检查余额是否足够
    const { data: escort } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (escort.length === 0) {
      return {
        success: false,
        message: '陪诊员不存在'
      }
    }

    const balance = escort[0].balance || 0
    if (balance < amount) {
      return {
        success: false,
        message: '余额不足'
      }
    }

    // 创建提现记录
    const result = await db.collection('withdrawals').add({
      data: {
        escortId: wxContext.OPENID,
        escortName: escort[0].name,
        amount,
        status: 'PENDING',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 更新陪诊员余额
    await db.collection('escorts').doc(escort[0]._id).update({
      data: {
        balance: balance - amount,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      withdrawalId: result._id
    }
  } catch (err) {
    console.error('申请提现失败', err)
    return {
      success: false,
      error: err
    }
  }
} 