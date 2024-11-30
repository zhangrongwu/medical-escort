const cloud = require('wx-server-sdk')
cloud.init({
  env: 'sit-9gh7crp3a446e876'
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { addressId } = event

  try {
    // 先将所有地址设为非默认
    await db.collection('addresses')
      .where({
        _openid: wxContext.OPENID
      })
      .update({
        data: {
          isDefault: false
        }
      })

    // 将选中的地址设为默认
    await db.collection('addresses')
      .doc(addressId)
      .update({
        data: {
          isDefault: true
        }
      })

    return {
      success: true,
      message: '设置成功'
    }
  } catch (err) {
    console.error('设置默认地址失败:', err)
    return {
      success: false,
      error: err.message || '设置失败'
    }
  }
} 