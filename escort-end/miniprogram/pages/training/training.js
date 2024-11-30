const app = getApp()

Page({
  data: {
    currentTab: 0,
    tabs: ['待学习', '已完成'],
    trainings: [],
    refreshing: false,
    hasMore: false,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadTrainings()
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: parseInt(tab),
      page: 1
    }, () => {
      this.loadTrainings()
    })
  },

  // 加载培训列表
  async loadTrainings(append = false) {
    const { currentTab, page, pageSize } = this.data
    const status = currentTab === 0 ? 'upcoming' : 'completed'

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getTrainings',
        data: { status, page, pageSize }
      })

      if (result.success) {
        this.setData({
          trainings: append ? [...this.data.trainings, ...result.data.list] : result.data.list,
          hasMore: result.data.list.length === pageSize
        })
      }
    } catch (err) {
      console.error('加载培训列表失败', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 下拉刷新
  async onRefresh() {
    this.setData({
      refreshing: true,
      page: 1
    })

    await this.loadTrainings()
    this.setData({ refreshing: false })
  },

  // 加载更多
  async onLoadMore() {
    if (!this.data.hasMore || this.data.refreshing) return

    this.setData({
      page: this.data.page + 1
    })
    await this.loadTrainings(true)
  },

  // 开始培训
  startTraining(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/training-detail/training-detail?id=${id}`
    })
  }
}) 