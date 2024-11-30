const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

exports.main = async (event, context) => {
  const { page, scene } = event

  try {
    const result = await cloud.openapi.wxacode.get({
      path: `${page}?scene=${scene}`,
      width: 280,
      isHyaline: true,
      autoColor: true
    })

    // 上传小程序码到云存储
    const upload = await cloud.uploadFile({
      cloudPath: `qrcode/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`,
      fileContent: result.buffer
    })

    return {
      success: true,
      fileID: upload.fileID
    }
  } catch (err) {
    console.error('生成小程序码失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 