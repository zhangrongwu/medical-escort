const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 手机号验证
const validatePhone = phone => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

// 身份证验证
const validateIdCard = idCard => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

// 生成订单编号
const generateOrderNo = () => {
  const now = new Date()
  return 'PZ' + now.getFullYear() +
    formatNumber(now.getMonth() + 1) +
    formatNumber(now.getDate()) +
    formatNumber(now.getHours()) +
    formatNumber(now.getMinutes()) +
    formatNumber(now.getSeconds()) +
    formatNumber(Math.floor(Math.random() * 1000))
}

// 价格格式化
const formatPrice = price => {
  return '¥' + price.toFixed(2)
}

// 检查登录状态
const checkLogin = () => {
  const app = getApp()
  if (!app.globalData.isLogin) {
    wx.navigateTo({
      url: '/pages/login/login'
    })
    return false
  }
  return true
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  validatePhone,
  validateIdCard,
  generateOrderNo,
  formatPrice,
  checkLogin
} 