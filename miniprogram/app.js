App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true,
      })

      // 初始化数据库
      this.initDatabase()
    }

    this.globalData = {
      userInfo: null,
      userType: null,
      isLogin: false
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  // 初始化数据库
  initDatabase: function() {
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(res => {
      console.log('数据库初始化成功:', res)
      // 初始化成功后，可以调用 initData 云函数来插入一些初始数据
      return wx.cloud.callFunction({
        name: 'initData'
      })
    }).then(res => {
      console.log('数据初始化成功:', res)
    }).catch(err => {
      console.error('初始化失败:', err)
    })
  },

  // 检查登录状态和用户类型
  async checkLoginStatus() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'checkLogin'
      })
      
      if (result.success && result.isLogin) {
        this.globalData.userInfo = result.userInfo
        this.globalData.userType = result.userInfo.userType
        this.globalData.isLogin = true
        
        wx.setStorageSync('userInfo', result.userInfo)
        wx.setStorageSync('userType', result.userInfo.userType)
        wx.setStorageSync('isLogin', true)
      }
    } catch (err) {
      console.error('检查登录状态失败', err)
    }
  }
}) 