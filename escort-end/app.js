App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true,
      })
    }

    this.globalData = {
      userInfo: null,
      isLogin: false
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus: function() {
    const userInfo = wx.getStorageSync('userInfo')
    const isLogin = wx.getStorageSync('isLogin')
    
    if (userInfo && isLogin) {
      this.globalData.userInfo = userInfo
      this.globalData.isLogin = true
    } else {
      this.globalData.userInfo = null
      this.globalData.isLogin = false
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('isLogin')
    }
  }
}) 