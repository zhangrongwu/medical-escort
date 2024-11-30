const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 消息模板配置
const templates = {
  newOrder: 'xxx', // 新订单通知模板ID
  orderCancel: 'xxx', // 订单取消通知模板ID
  evaluation: 'xxx', // 新评价通知模板ID
  withdrawal: 'xxx' // 提现结果通知模板ID
}

exports.main = async (event, context) => {
  const { type, openid, data } = event

  try {
    // 获取订阅消息权限
    const subscribeResult = await cloud.openapi.subscribeMessage.getTemplateList()
    const templateId = templates[type]

    if (!templateId) {
      throw new Error('未找到对应的消息模板')
    }

    // 发送订阅消息
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId,
      page: getPagePath(type),
      data: formatMessageData(type, data)
    })

    return {
      success: true,
      result
    }
  } catch (err) {
    console.error('发送消息失败', err)
    return {
      success: false,
      error: err
    }
  }
}

// 获取跳转页面路径
function getPagePath(type) {
  const pages = {
    newOrder: '/pages/workspace/workspace',
    orderCancel: '/pages/workspace/workspace',
    evaluation: '/pages/evaluations/evaluations',
    withdrawal: '/pages/income/income'
  }
  return pages[type] || '/pages/workspace/workspace'
}

// 格式化消息数据
function formatMessageData(type, data) {
  switch (type) {
    case 'newOrder':
      return {
        thing1: { value: data.hospitalName }, // 医院名称
        thing2: { value: data.serviceName }, // 服务类型
        time3: { value: data.appointmentTime }, // 预约时间
        amount4: { value: data.price }, // 服务金额
        thing5: { value: data.remark || '无' } // 备注
      }
    case 'orderCancel':
      return {
        thing1: { value: data.orderNo }, // 订单号
        thing2: { value: data.reason }, // 取消原因
        time3: { value: data.cancelTime }, // 取消时间
        thing4: { value: data.serviceName }, // 服务类型
        thing5: { value: data.remark || '无' } // 备注
      }
    case 'evaluation':
      return {
        thing1: { value: data.orderNo }, // 订单号
        number2: { value: data.score }, // 评分
        thing3: { value: data.comment }, // 评价内容
        time4: { value: data.evaluateTime }, // 评价时间
        thing5: { value: data.serviceName } // 服务类型
      }
    case 'withdrawal':
      return {
        amount1: { value: data.amount }, // 提现金额
        phrase2: { value: data.status }, // 提现状态
        time3: { value: data.time }, // 处理时间
        thing4: { value: data.remark || '无' } // 备注
      }
    default:
      return {}
  }
} 