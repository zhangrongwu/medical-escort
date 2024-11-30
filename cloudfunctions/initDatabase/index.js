const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 初始化数据库集合
exports.main = async () => {
  try {
    // 用户集合 - 区分普通用户和陪诊员
    await db.createCollection('users')
    await db.collection('users').createIndexes({
      indexes: [{
        fields: {
          userType: 1 // userType: 'user' 普通用户, 'escort' 陪诊员
        }
      }]
    })

    // 订单集合
    await db.createCollection('orders')
    await db.collection('orders').createIndexes({
      indexes: [{
        fields: {
          userId: 1,
          escortId: 1,
          status: 1
        }
      }]
    })

    // 陪诊员认证信息集合
    await db.createCollection('escort_verifications')
    
    // 医院集合
    await db.createCollection('hospitals')
    
    // 评价集合
    await db.createCollection('evaluations')
    
    // 培训课程集合
    await db.createCollection('trainings')
    
    // 证书集合
    await db.createCollection('certificates')

    return {
      success: true,
      message: '数据库初始化成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
} 