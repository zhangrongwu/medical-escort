// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    menuList: [
      {
        title: '我的服务',
        items: [
          {
            icon: '/images/wallet.png',
            text: '收入明细',
            url: '/pages/income/income'
          },
          {
            icon: '/images/star.png',
            text: '我的评价',
            url: '/pages/evaluation/evaluation'
          },
          {
            icon: '/images/location.png',
            text: '服务区域',
            url: '/pages/service-area/service-area'
          }
        ]
      },
      {
        title: '账户设置',
        items: [
          {
            icon: '/images/verify.png',
            text: '实名认证',
            url: '/pages/certification/certification'
          },
          {
            icon: '/images/bank.png',
            text: '银行卡',
            url: '/pages/bank-card/bank-card'
          },
          {
            icon: '/images/settings.png',
            text: '系统设置',
            url: '/pages/settings/settings'
          }
        ]
      }
    ]
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时刷新用户信息
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
          userInfo: {
            ...result.data,
            totalIncome: (result.data.totalIncome / 100).toFixed(2)
          }
        })
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('加载用户信息失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 编辑资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile'
    })
  },

  // 页面导航
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  },

  // 显示帮助中心
  showHelp() {
    wx.navigateTo({
      url: '/pages/help/help'
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'logout'
            })
            
            // 清除本地存储
            wx.clearStorageSync()
            
            // 重置全局数据
            app.globalData.userInfo = null
            app.globalData.isLogin = false

            // 返回登录页
            wx.reLaunch({
              url: '/pages/login/login'
            })
          } catch (err) {
            console.error('退出登录失败:', err)
            wx.showToast({
              title: '退出失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})