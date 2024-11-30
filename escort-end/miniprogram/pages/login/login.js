const app = getApp()

Page({
  data: {
    isAgree: false,
    loading: false
  },

  // 处理登录
  handleLogin() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请先同意服务协议',
        icon: 'none'
      })
      return
    }

    if (this.data.loading) return
    this.setData({ loading: true })

    console.log('开始登录流程')

    // 调用云函数登录
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userType: 'escort'
      }
    }).then(res => {
      console.log('login result:', res)
      
      if (res.result.success) {
        if (res.result.isRegistered) {
          // 已注册
          wx.setStorageSync('userInfo', res.result.userInfo)
          wx.setStorageSync('isLogin', true)
          app.globalData.userInfo = res.result.userInfo
          app.globalData.isLogin = true

          // 根据状态跳转
          if (res.result.userInfo.status === 'ACTIVE') {
            wx.switchTab({
              url: '/pages/workspace/workspace'
            })
          } else {
            wx.redirectTo({
              url: `/pages/register-status/register-status?id=${res.result.userInfo._id}`
            })
          }
        } else {
          // 未注册，跳转到注册页面
          wx.redirectTo({
            url: '/pages/register/register'
          })
        }
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
  },

  // 用户协议勾选
  onAgreementChange(e) {
    this.setData({
      isAgree: e.detail.value.includes('agree')
    })
  }
}) 