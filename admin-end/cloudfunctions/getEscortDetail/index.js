const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { id } = event

  try {
    const { data } = await db.collection('escorts')
      .doc(id)
      .get()

    if (!data) {
      throw new Error('陪诊员不存在')
    }

    return {
      success: true,
      data: {
        ...data,
        createTime: data.createTime.toLocaleString(),
        updateTime: data.updateTime.toLocaleString()
      }
    }
  } catch (err) {
    console.error('获取陪诊员详情失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 