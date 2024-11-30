const app = getApp()

Page({
  data: {
    score: 0,
    passed: false,
    certificate: null
  },

  onLoad(options) {
    if (options.score) {
      const score = parseInt(options.score)
      this.setData({
        score,
        passed: score >= 60
      })
      
      if (score >= 60) {
        this.loadCertificate()
      }
    }
  },

  // 加载证书信息
  async loadCertificate() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getCertificate',
        data: { type: 'training' }
      })

      if (result.success) {
        this.setData({
          certificate: result.data
        })
      }
    } catch (err) {
      console.error('获取证书失败', err)
    }
  },

  // 查看证书
  viewCertificate() {
    wx.navigateTo({
      url: `/pages/certificate/certificate?id=${this.data.certificate._id}`
    })
  },

  // 重新考试
  retakeExam() {
    wx.navigateBack()
  },

  // 返回工作台
  backToWorkspace() {
    wx.switchTab({
      url: '/pages/workspace/workspace'
    })
  }
}) 