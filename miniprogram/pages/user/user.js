const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    isLogin: false,
    userInfo: null,
    orderStats: {
      unpaid: 0,
      paid: 0,
      processing: 0,
      finished: 0
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const isLogin = wx.getStorageSync('isLogin')
    
    if (userInfo && isLogin) {
      this.setData({
        isLogin: true,
        userInfo: userInfo
      }, () => {
        this.loadOrderStats()
      })
    } else {
      this.setData({
        isLogin: false,
        userInfo: null,
        orderStats: {
          unpaid: 0,
          paid: 0,
          processing: 0,
          finished: 0
        }
      })
    }
  },

  // 加载订单统计
  loadOrderStats() {
    const _ = db.command
    db.collection('orders')
      .where({
        _openid: '{openid}'
      })
      .get()
      .then(res => {
        const orders = res.data
        const stats = {
          unpaid: orders.filter(o => o.status === 'UNPAID').length,
          paid: orders.filter(o => o.status === 'PAID').length,
          processing: orders.filter(o => o.status === 'PROCESSING').length,
          finished: orders.filter(o => o.status === 'FINISHED').length
        }
        this.setData({
          orderStats: stats
        })
      })
  },

  // 绑定手机号
  bindPhone() {
    wx.navigateTo({
      url: '/pages/bind-phone/bind-phone'
    })
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转到订单列表
  navigateToOrders(e) {
    if (!this.data.isLogin) {
      this.goToLogin()
      return
    }
    
    const status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: `/pages/order-list/order-list?status=${status}`
    })
  },

  // 页面导航
  navigateTo(e) {
    if (!this.data.isLogin) {
      this.goToLogin()
      return
    }

    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('isLogin')
          
          // 更新全局状态
          app.globalData.userInfo = null
          app.globalData.isLogin = false
          
          // 更新页面状态
          this.setData({
            isLogin: false,
            userInfo: null,
            orderStats: {
              unpaid: 0,
              paid: 0,
              processing: 0,
              finished: 0
            }
          })

          // 可选：返回首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },

  // 联系客服
  contactService() {
    // 这里可以添加额外的客服逻辑
    console.log('联系客服')
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '医疗陪诊小程序',
      path: '/pages/index/index',
      imageUrl: '/images/share.png' // 分享图片
    }
  }
}) 