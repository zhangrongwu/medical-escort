const app = getApp()

Page({
  data: {
    status: 'PENDING', // PENDING-审核中 ACTIVE-已通过 REJECTED-已拒绝
    escortInfo: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.loadRegistrationStatus(options.id)
    }
  },

  // 加载注册状态
  async loadRegistrationStatus(id) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'checkEscortStatus',
        data: { id }
      })

      if (result.success && result.data) {
        this.setData({
          status: result.data.status,
          escortInfo: result.data
        })
      }
    } catch (err) {
      console.error('加载状态失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 返回修改
  goToModify() {
    wx.redirectTo({
      url: `/pages/register/register?id=${this.data.escortInfo._id}&edit=true`
    })
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: '/pages/workspace/workspace'
    })
  },

  // 联系客服
  contactService() {
    // 可以跳转到客服会话
    wx.openCustomerServiceChat({
      extInfo: { url: '' },
      corpId: '',
      success(res) {}
    })
  }
}) 