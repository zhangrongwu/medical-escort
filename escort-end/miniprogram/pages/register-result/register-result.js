Page({
  data: {
    registrationId: '' // 注册申请ID
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        registrationId: options.id
      })
    }
  },

  // 查看审核状态
  checkStatus() {
    wx.navigateTo({
      url: '/pages/register-status/register-status'
    })
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 防止用户返回到注册页
  onUnload() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      const prePage = pages[pages.length - 2]
      if (prePage.route.includes('register')) {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    }
  }
}) 