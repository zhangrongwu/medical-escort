const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { amount, bankInfo } = event

  try {
    // 开启事务
    const transaction = await db.startTransaction()

    // 检查余额
    const { data: escort } = await transaction.collection('escorts')
      .where({
        _openid: wxContext.OPENID,
        status: 'ACTIVE'
      })
      .get()

    if (escort.length === 0) {
      await transaction.rollback()
      return {
        success: false,
        message: '账号不存在或未激活'
      }
    }

    if ((escort[0].balance || 0) < amount) {
      await transaction.rollback()
      return {
        success: false,
        message: '余额不足'
      }
    }

    // 创建提现记录
    const withdrawalResult = await transaction.collection('withdrawals').add({
      data: {
        escortId: wxContext.OPENID,
        escortName: escort[0].name,
        amount,
        bankInfo,
        status: 'PENDING',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 扣减余额
    await transaction.collection('escorts').doc(escort[0]._id).update({
      data: {
        balance: db.command.inc(-amount),
        updateTime: db.serverDate()
      }
    })

    // 提交事务
    await transaction.commit()

    // 发送提现通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'withdrawalSubmitted',
        openid: wxContext.OPENID,
        data: {
          amount: amount.toFixed(2),
          time: new Date().toLocaleString(),
          orderNo: withdrawalResult._id
        }
      }
    })

    return {
      success: true,
      withdrawalId: withdrawalResult._id
    }
  } catch (err) {
    console.error('提现申请失败', err)
    return {
      success: false,
      error: err
    }
  }
} 