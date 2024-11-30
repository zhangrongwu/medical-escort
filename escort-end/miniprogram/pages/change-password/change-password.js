const app = getApp()

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    canSubmit: false
  },

  // 旧密码输入
  onOldPasswordInput(e) {
    this.setData({
      oldPassword: e.detail.value
    }, this.checkCanSubmit)
  },

  // 新密码输入
  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    }, this.checkCanSubmit)
  },

  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    }, this.checkCanSubmit)
  },

  // 检查密码格式
  checkPasswordFormat(password) {
    // 8-20位，必须包含字母和数字
    const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/
    return reg.test(password)
  },

  // 检查是否可提交
  checkCanSubmit() {
    const { oldPassword, newPassword, confirmPassword } = this.data
    
    const canSubmit = 
      oldPassword.length >= 8 &&
      this.checkPasswordFormat(newPassword) &&
      newPassword === confirmPassword

    this.setData({ canSubmit })
  },

  // 提交修改
  async handleSubmit() {
    if (!this.data.canSubmit) return

    const { oldPassword, newPassword, confirmPassword } = this.data

    // 再次验证密码
    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      })
      return
    }

    if (!this.checkPasswordFormat(newPassword)) {
      wx.showToast({
        title: '新密码格式不正确',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '提交中...' })

      const { result } = await wx.cloud.callFunction({
        name: 'updatePassword',
        data: {
          oldPassword,
          newPassword
        }
      })

      if (result.success) {
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
        
        // 清除登录状态，返回登录页
        setTimeout(() => {
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('修改密码失败:', err)
      wx.showToast({
        title: err.message || '修改失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
}) 