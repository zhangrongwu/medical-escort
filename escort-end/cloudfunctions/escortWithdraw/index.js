const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { amount } = event

  try {
    // 检查余额
    const { data: escorts } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'
      })
      .get()

    if (escorts.length === 0) {
      throw new Error('账号不存在')
    }

    const escort = escorts[0]
    if (escort.balance < amount) {
      throw new Error('余额不足')
    }

    // 创建提现记录
    const result = await db.collection('withdrawals').add({
      data: {
        escortId: wxContext.OPENID,
        amount,
        status: 'PENDING',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 更新余额
    await db.collection('escorts').doc(escort._id).update({
      data: {
        balance: escort.balance - amount,
        updateTime: db.serverDate()
      }
    })

    // 发送提现通知
    await cloud.callFunction({
      name: 'sendEscortMessage',
      data: {
        type: 'withdrawal',
        openid: wxContext.OPENID,
        data: {
          amount,
          status: '处理中',
          time: new Date().toLocaleString(),
          remark: '提现申请已提交'
        }
      }
    })

    return {
      success: true,
      withdrawalId: result._id
    }
  } catch (err) {
    console.error('提现失败', err)
    return {
      success: false,
      error: err
    }
  }
} 