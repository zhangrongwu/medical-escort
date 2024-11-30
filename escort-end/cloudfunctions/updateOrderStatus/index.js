const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { orderId, status, location, remark } = event
  const wxContext = cloud.getWXContext()

  try {
    // 开启事务
    const transaction = await db.startTransaction()

    // 获取订单信息
    const { data: order } = await transaction.collection('orders')
      .doc(orderId)
      .get()

    if (!order) {
      await transaction.rollback()
      return { success: false, message: '订单不存在' }
    }

    // 验证操作权限
    if (order.escortId !== wxContext.OPENID) {
      await transaction.rollback()
      return { success: false, message: '无权操作此订单' }
    }

    // 验证状态流转是否合法
    if (!isValidStatusTransition(order.status, status)) {
      await transaction.rollback()
      return { success: false, message: '非法的状态变更' }
    }

    // 更新订单状态
    const updateData = {
      status,
      [`statusInfo.${status}Time`]: db.serverDate(),
      updateTime: db.serverDate()
    }

    // 添加位置信息
    if (location) {
      updateData[`statusInfo.${status}Location`] = location
    }

    // 添加备注信息
    if (remark) {
      updateData[`statusInfo.${status}Remark`] = remark
    }

    await transaction.collection('orders')
      .doc(orderId)
      .update({
        data: updateData
      })

    // 特殊状态处理
    await handleSpecialStatus(transaction, order, status)

    // 提交事务
    await transaction.commit()

    // 发送状态更新通知
    await sendStatusNotification(order, status)

    return {
      success: true,
      status
    }
  } catch (err) {
    console.error('更新订单状态失败:', err)
    return {
      success: false,
      error: err
    }
  }
}

// 验证状态流转是否合法
function isValidStatusTransition(currentStatus, newStatus) {
  const validTransitions = {
    PAID: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['ARRIVED', 'CANCELLED'],
    ARRIVED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: ['REFUNDING'],
    CANCELLED: ['REFUNDING'],
    REFUNDING: ['REFUNDED']
  }

  return validTransitions[currentStatus]?.includes(newStatus)
}

// 处理特殊状态
async function handleSpecialStatus(transaction, order, status) {
  switch (status) {
    case 'ACCEPTED':
      // 更新陪诊员接单数
      await transaction.collection('escorts')
        .doc(order.escortId)
        .update({
          data: {
            orderCount: _.inc(1)
          }
        })
      break

    case 'COMPLETED':
      // 计算服务时长
      const duration = calculateServiceDuration(order)
      // 更新陪诊员收入
      await transaction.collection('escorts')
        .doc(order.escortId)
        .update({
          data: {
            totalIncome: _.inc(order.paymentInfo.escortAmount),
            totalServiceHours: _.inc(duration)
          }
        })
      break

    case 'CANCELLED':
      // 处理取消逻辑
      if (order.status === 'ACCEPTED') {
        // 如果是已接单状态取消，需要恢复陪诊员接单数
        await transaction.collection('escorts')
          .doc(order.escortId)
          .update({
            data: {
              orderCount: _.inc(-1)
            }
          })
      }
      break
  }
}

// 发送状态更新通知
async function sendStatusNotification(order, status) {
  // 发送给用户的通知
  await cloud.callFunction({
    name: 'sendMessage',
    data: {
      type: 'orderStatus',
      openid: order.userId,
      data: {
        orderId: order._id,
        status,
        time: new Date().toLocaleString()
      }
    }
  })

  // 特定状态的额外通知
  if (status === 'COMPLETED') {
    // 发送评价提醒
    await cloud.callFunction({
      name: 'sendMessage',
      data: {
        type: 'evaluationReminder',
        openid: order.userId,
        data: {
          orderId: order._id
        }
      }
    })
  }
}

// 计算服务时长
function calculateServiceDuration(order) {
  const startTime = new Date(order.statusInfo.PROCESSINGTime)
  const endTime = new Date(order.statusInfo.COMPLETEDTime)
  return Math.ceil((endTime - startTime) / (1000 * 60 * 60)) // 向上取整小时
} 