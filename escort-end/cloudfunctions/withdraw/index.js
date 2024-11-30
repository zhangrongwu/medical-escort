const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { amount } = event

  try {
    // 开启事务
    const transaction = await db.startTransaction()

    // 获取陪诊员信息
    const { data: escorts } = await transaction.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (!escorts.length) {
      await transaction.rollback()
      return {
        success: false,
        message: '账户不存在'
      }
    }

    const escort = escorts[0]
    if (escort.balance < amount) {
      await transaction.rollback()
      return {
        success: false,
        message: '余额不足'
      }
    }

    // 创建提现记录
    await transaction.collection('withdrawals').add({
      data: {
        escortId: wxContext.OPENID,
        amount,
        status: 'PENDING',
        createTime: db.serverDate()
      }
    })

    // 更新余额
    await transaction.collection('escorts')
      .doc(escort._id)
      .update({
        data: {
          balance: escort.balance - amount
        }
      })

    // 提交事务
    await transaction.commit()

    return {
      success: true
    }
  } catch (err) {
    // 回滚事务
    if (transaction) {
      await transaction.rollback()
    }
    
    console.error('提现失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 