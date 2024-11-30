const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { escortId, status, rejectReason } = event

  try {
    // 开启事务
    const transaction = await db.startTransaction()

    // 更新陪诊员状态
    await transaction.collection('escorts')
      .doc(escortId)
      .update({
        data: {
          status,
          rejectReason: status === 'REJECTED' ? rejectReason : '',
          updateTime: db.serverDate()
        }
      })

    // 获取陪诊员信息用于发送通知
    const { data: escort } = await transaction.collection('escorts')
      .doc(escortId)
      .get()

    // 发送审核结果通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'reviewResult',
        openid: escort._openid,
        data: {
          status: status === 'ACTIVE' ? '通过' : '未通过',
          reason: rejectReason || '资料审核通过',
          time: new Date().toLocaleString()
        }
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
    
    console.error('审核陪诊员失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 