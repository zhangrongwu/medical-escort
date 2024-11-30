const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId } = event

  try {
    // 获取订单信息
    const { data: orders } = await db.collection('orders')
      .where({
        _id: orderId,
        status: 'FINISHED'
      })
      .get()

    if (orders.length === 0) {
      throw new Error('订单不存在或未完成')
    }

    const order = orders[0]

    // 计算陪诊员收入(假设平台抽成20%)
    const platformFee = order.totalPrice * 0.2
    const escortIncome = order.totalPrice - platformFee

    // 更新陪诊员余额
    await db.collection('escorts')
      .where({
        _openid: order.escortId
      })
      .update({
        data: {
          balance: db.command.inc(escortIncome),
          updateTime: db.serverDate()
        }
      })

    // 创建收入记录
    await db.collection('incomes').add({
      data: {
        orderId,
        escortId: order.escortId,
        amount: escortIncome,
        platformFee,
        totalAmount: order.totalPrice,
        status: 'SETTLED',
        createTime: db.serverDate()
      }
    })

    // 发送收入通知
    await cloud.callFunction({
      name: 'sendEscortMessage',
      data: {
        type: 'income',
        openid: order.escortId,
        data: {
          orderNo: order.orderNo,
          amount: escortIncome,
          time: new Date().toLocaleString(),
          remark: '订单收入已结算'
        }
      }
    })

    return {
      success: true,
      income: escortIncome
    }
  } catch (err) {
    console.error('结算收入失败', err)
    return {
      success: false,
      error: err
    }
  }
} 