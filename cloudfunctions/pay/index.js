const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const res = await cloud.cloudPay.unifiedOrder({
      body: '医疗陪诊服务费', // 商品描述
      outTradeNo: event.orderId, // 商户订单号
      spbillCreateIp: '127.0.0.1', // 调用支付的机器IP
      subMchId: '商户号', // 商户号
      totalFee: event.totalFee, // 总金额，单位为分
      envId: cloud.DYNAMIC_CURRENT_ENV, // 云环境ID
      functionName: 'payCallback', // 支付结果通知回调云函数
      nonceStr: Math.random().toString(36).substr(2, 15), // 随机字符串
      tradeType: 'JSAPI',
      openid: wxContext.OPENID
    })

    return {
      success: true,
      payData: res
    }
  } catch (err) {
    console.error('支付失败', err)
    return {
      success: false,
      error: err
    }
  }
} 