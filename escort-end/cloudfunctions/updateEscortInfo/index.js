const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    name, 
    avatar, 
    phone, 
    serviceTypes, 
    region, 
    introduction,
    bankInfo 
  } = event

  try {
    // 获取陪诊员信息
    const { data: escorts } = await db.collection('escorts')
      .where({
        _openid: wxContext.OPENID
      })
      .get()

    if (!escorts.length) {
      return {
        success: false,
        message: '账户不存在'
      }
    }

    // 更新信息
    const updateData = {
      updateTime: db.serverDate()
    }

    // 只更新提供的字段
    if (name) updateData.name = name
    if (avatar) updateData.avatar = avatar
    if (phone) updateData.phone = phone
    if (serviceTypes) updateData.serviceTypes = serviceTypes
    if (region) updateData.region = region
    if (introduction) updateData.introduction = introduction
    if (bankInfo) updateData.bankInfo = bankInfo

    await db.collection('escorts')
      .doc(escorts[0]._id)
      .update({
        data: updateData
      })

    return {
      success: true,
      data: {
        ...escorts[0],
        ...updateData
      }
    }
  } catch (err) {
    console.error('更新个人信息失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 