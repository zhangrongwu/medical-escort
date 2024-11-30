const app = getApp()

Page({
  data: {
    isAgree: false,
    loading: false
  },

  // 用户协议勾选
  onAgreementChange(e) {
    this.setData({
      isAgree: e.detail.value.includes('agree')
    })
  },

  // 微信登录
  handleWxLogin() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    if (this.data.loading) return
    this.setData({ loading: true })

    // 直接调用云函数登录
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      if (res.result.success) {
        // 保存用户信息
        wx.setStorageSync('userInfo', res.result.userInfo)
        wx.setStorageSync('isLogin', true)
        app.globalData.userInfo = res.result.userInfo
        app.globalData.isLogin = true

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      console.error('登录失败', err)
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 手机号登录
  getPhoneNumber(e) {
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      this.setData({ loading: true })

      wx.cloud.callFunction({
        name: 'loginWithPhone',
        data: {
          cloudID: e.detail.cloudID
        }
      }).then(res => {
        if (res.result.success) {
          wx.setStorageSync('userInfo', res.result.userInfo)
          wx.setStorageSync('isLogin', true)
          app.globalData.userInfo = res.result.userInfo
          app.globalData.isLogin = true

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          throw new Error(res.result.message)
        }
      }).catch(err => {
        console.error('登录失败', err)
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        })
      }).finally(() => {
        this.setData({ loading: false })
      })
    }
  }
}) 