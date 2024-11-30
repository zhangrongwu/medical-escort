const app = getApp()

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    canLogin: false
  },

  // 用户名输入
  handleUsernameInput(e) {
    this.setData({
      username: e.detail.value
    }, this.checkCanLogin)
  },

  // 密码输入
  handlePasswordInput(e) {
    this.setData({
      password: e.detail.value
    }, this.checkCanLogin)
  },

  // 检查是否可以登录
  checkCanLogin() {
    const { username, password } = this.data
    this.setData({
      canLogin: username.length > 0 && password.length > 0
    })
  },

  // 登录
  handleLogin() {
    if (!this.data.canLogin || this.data.loading) return

    const { username, password } = this.data
    this.setData({ loading: true })

    wx.cloud.callFunction({
      name: 'adminLogin',
      data: { username, password }
    }).then(res => {
      if (res.result.success) {
        wx.setStorageSync('adminInfo', res.result.data)
        app.globalData.adminInfo = res.result.data

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          })
        }, 1500)
      } else {
        throw new Error(res.result.message || '登录失败')
      }
    }).catch(err => {
      console.error('登录失败:', err)
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    }).finally(() => {
      this.setData({ loading: false })
    })
  }
}) 