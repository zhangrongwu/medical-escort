const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { escortId, status, rejectReason } = event
  // status: ACTIVE-通过, REJECTED-拒绝

  try {
    // 更新陪诊员状态
    const result = await db.collection('escorts').doc(escortId).update({
      data: {
        status,
        rejectReason: status === 'REJECTED' ? rejectReason : '',
        updateTime: db.serverDate(),
        // 如果通过审核，设置初始数据
        ...(status === 'ACTIVE' ? {
          rating: 5.0,
          orderCount: 0,
          balance: 0,
          isOnline: false
        } : {})
      }
    })

    // 发送审核结果通知
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'reviewResult',
        openid: result.userInfo._openid,
        data: {
          status: status === 'ACTIVE' ? '通过' : '未通过',
          reason: rejectReason || '资料审核通过',
          time: new Date().toLocaleString()
        }
      }
    })

    return {
      success: true
    }
  } catch (err) {
    console.error('审核失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 