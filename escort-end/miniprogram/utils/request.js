const MAX_RETRY_COUNT = 3
const RETRY_DELAY = 1000

export const request = async (options, retryCount = 0) => {
  try {
    const res = await wx.cloud.callFunction(options)
    if (!res.result.success) {
      throw new Error(res.result.error.message)
    }
    return res.result.data
  } catch (err) {
    if (retryCount < MAX_RETRY_COUNT) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return request(options, retryCount + 1)
    }
    throw err
  }
} 