const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

exports.main = async (event, context) => {
  const { orderId } = event

  try {
    const result = await cloud.cloudPay.queryOrder({
      sub_mch_id: '1900000109',  // 替换为您的商户号
      out_trade_no: orderId
    })

    return {
      success: true,
      orderInfo: result
    }
  } catch (err) {
    console.error('查询订单失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 