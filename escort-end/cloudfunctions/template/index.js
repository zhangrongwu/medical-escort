const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 错误码定义
const ERROR_CODES = {
  PARAM_INVALID: { code: 40001, message: '参数无效' },
  NO_AUTH: { code: 40003, message: '无权限访问' },
  NOT_FOUND: { code: 40004, message: '资源不存在' },
  SERVER_ERROR: { code: 50000, message: '服务器错误' }
}

// 返回结果包装
const success = (data) => ({
  success: true,
  data
})

const fail = (error) => ({
  success: false,
  error: typeof error === 'string' ? { message: error } : error
})

// 权限检查
const checkAuth = async (wxContext) => {
  const { data } = await db.collection('escorts')
    .where({
      _openid: wxContext.OPENID,
      status: 'ACTIVE'
    })
    .get()

  if (!data.length) {
    throw ERROR_CODES.NO_AUTH
  }
  return data[0]
}

// 记录操作日志
const logOperation = async (wxContext, type, content) => {
  await db.collection('escort_logs').add({
    data: {
      escortId: wxContext.OPENID,
      type,
      content,
      ip: wxContext.CLIENTIP,
      createTime: db.serverDate()
    }
  })
}

// 主函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 1. 参数验证
    const { param1, param2 } = event
    if (!param1 || !param2) {
      throw ERROR_CODES.PARAM_INVALID
    }

    // 2. 权限检查
    const escortInfo = await checkAuth(wxContext)

    // 3. 业务逻辑
    const result = await db.collection('collection_name')
      .where({
        // 查询条件
      })
      .get()

    // 4. 记录日志
    await logOperation(wxContext, 'operation_type', {
      param1,
      param2,
      result: result._id
    })

    // 5. 返回结果
    return success(result.data)

  } catch (err) {
    // 统一错误处理
    console.error('[云函数] [template] 错误:', err)
    return fail(err)
  }
} 