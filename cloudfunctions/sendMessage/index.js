const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

// 订阅消息模板ID
const TEMPLATE_IDS = {
  paymentSuccess: 'xxx', // 支付成功通知
  orderStart: 'xxx',     // 服务开始通知
  orderComplete: 'xxx',  // 服务完成通知
  orderCancel: 'xxx'     // 订单取消通知
}

exports.main = async (event, context) => {
  const { type, openid, orderId, ...data } = event

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: TEMPLATE_IDS[type],
      page: `pages/order-detail/order-detail?id=${orderId}`,
      data: formatMessageData(type, data),
      miniprogramState: 'formal'
    })

    return {
      success: true,
      result
    }
  } catch (err) {
    console.error('发送订阅消息失败:', err)
    return {
      success: false,
      error: err
    }
  }
}

// 格式化消息数据
function formatMessageData(type, data) {
  switch (type) {
    case 'paymentSuccess':
      return {
        thing1: { value: '订单支付成功' },
        amount2: { value: data.amount },
        time3: { value: data.time },
        thing4: { value: '感谢您的使用，请等待服务开始' }
      }
    case 'orderStart':
      return {
        thing1: { value: '服务即将开始' },
        time2: { value: data.time },
        thing3: { value: data.hospitalName },
        name4: { value: data.escortName },
        phone_number5: { value: data.escortPhone }
      }
    case 'orderComplete':
      return {
        thing1: { value: '服务已完成' },
        thing2: { value: data.serviceName },
        time3: { value: data.time },
        thing4: { value: '请对本次服务进行评价' }
      }
    case 'orderCancel':
      return {
        thing1: { value: '订单已取消' },
        thing2: { value: data.reason || '用户取消' },
        time3: { value: data.time },
        thing4: { value: '如有疑问请联系客服' }
      }
    default:
      return {}
  }
} 