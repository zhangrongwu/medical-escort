const app = getApp()

Page({
  data: {
    training: null,
    currentSection: 0,
    progress: 0
  },

  onLoad(options) {
    if (options.id) {
      this.loadTrainingDetail(options.id)
    }
  },

  // 加载培训详情
  async loadTrainingDetail(id) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getTrainingDetail',
        data: { id }
      })

      if (result.success) {
        this.setData({
          training: result.data
        })
      }
    } catch (err) {
      console.error('加载培训详情失败', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 切换章节
  switchSection(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentSection: index
    })
  },

  // 更新学习进度
  updateProgress() {
    const progress = Math.min(
      ((this.data.currentSection + 1) / this.data.training.sections.length) * 100,
      100
    )
    this.setData({ progress })
  },

  // 开始考试
  startExam() {
    wx.navigateTo({
      url: `/pages/training-exam/training-exam?id=${this.data.training._id}`
    })
  }
}) 