const app = getApp()

Page({
  data: {
    phone: '',
    code: '',
    counting: false,
    countdown: 60
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 验证码输入
  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 发送验证码
  sendCode() {
    if (!this.validatePhone()) return
    if (this.data.counting) return

    wx.showLoading({
      title: '发送中...'
    })

    // 调用云函数发送验证码
    wx.cloud.callFunction({
      name: 'sendSmsCode',
      data: {
        phone: this.data.phone
      }
    }).then(res => {
      if (res.result.success) {
        wx.showToast({
          title: '发送成功',
          icon: 'success'
        })
        this.startCountdown()
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      wx.showToast({
        title: err.message || '发送失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 开始倒计时
  startCountdown() {
    this.setData({
      counting: true,
      countdown: 60
    })

    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer)
        this.setData({
          counting: false,
          countdown: 60
        })
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        })
      }
    }, 1000)
  },

  // 绑定手机号
  bindPhone() {
    if (!this.validateForm()) return

    wx.showLoading({
      title: '绑定中...'
    })

    // 调用云函数绑定手机号
    wx.cloud.callFunction({
      name: 'bindPhone',
      data: {
        phone: this.data.phone,
        code: this.data.code
      }
    }).then(res => {
      if (res.result.success) {
        // 更新用户信息
        const userInfo = wx.getStorageSync('userInfo') || {}
        userInfo.phone = this.data.phone
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.userInfo = userInfo

        wx.showToast({
          title: '绑定成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      wx.showToast({
        title: err.message || '绑定失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 微信手机号快捷绑定
  getWxPhone(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '绑定中...'
    })

    // 调用云函数解密手机号
    wx.cloud.callFunction({
      name: 'bindWxPhone',
      data: {
        cloudID: e.detail.cloudID
      }
    }).then(res => {
      if (res.result.success) {
        // 更新用户信息
        const userInfo = wx.getStorageSync('userInfo') || {}
        userInfo.phone = res.result.phone
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.userInfo = userInfo

        wx.showToast({
          title: '绑定成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      wx.showToast({
        title: err.message || '绑定失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 验证手机号
  validatePhone() {
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(this.data.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return false
    }
    return true
  },

  // 验证表单
  validateForm() {
    if (!this.validatePhone()) return false

    if (!this.data.code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return false
    }

    return true
  }
}) 