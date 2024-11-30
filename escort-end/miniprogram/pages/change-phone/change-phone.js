const app = getApp()

Page({
  data: {
    currentPhone: '',
    newPhone: '',
    verifyCode: '',
    counting: false,
    countDown: 60,
    canSubmit: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getEscortInfo'
      })

      if (result.success) {
        this.setData({
          currentPhone: this.formatPhone(result.data.phone)
        })
      }
    } catch (err) {
      console.error('加载用户信息失败:', err)
    }
  },

  // 格式化手机号
  formatPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      newPhone: e.detail.value
    }, this.checkCanSubmit)
  },

  // 验证码输入
  onCodeInput(e) {
    this.setData({
      verifyCode: e.detail.value
    }, this.checkCanSubmit)
  },

  // 检查是否可提交
  checkCanSubmit() {
    const { newPhone, verifyCode } = this.data
    const canSubmit = newPhone.length === 11 && verifyCode.length === 6
    this.setData({ canSubmit })
  },

  // 发送验证码
  async sendCode() {
    if (this.data.counting) return

    const { newPhone } = this.data
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'sendSmsCode',
        data: { phone: newPhone }
      })

      if (result.success) {
        wx.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
        this.startCountDown()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('发送验证码失败:', err)
      wx.showToast({
        title: err.message || '发送失败',
        icon: 'none'
      })
    }
  },

  // 开始倒计时
  startCountDown() {
    this.setData({
      counting: true,
      countDown: 60
    })

    this.timer = setInterval(() => {
      if (this.data.countDown <= 1) {
        clearInterval(this.timer)
        this.setData({
          counting: false
        })
      } else {
        this.setData({
          countDown: this.data.countDown - 1
        })
      }
    }, 1000)
  },

  // 提交修改
  async handleSubmit() {
    if (!this.data.canSubmit) return

    const { newPhone, verifyCode } = this.data

    try {
      wx.showLoading({ title: '提交中...' })

      const { result } = await wx.cloud.callFunction({
        name: 'updatePhone',
        data: {
          phone: newPhone,
          code: verifyCode
        }
      })

      if (result.success) {
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('修改手机号失败:', err)
      wx.showToast({
        title: err.message || '修改失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  onUnload() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}) 