const app = getApp()

Page({
  data: {
    certificates: [],
    refreshing: false,
    hasMore: false,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadCertificates()
  },

  // 加载证书列表
  async loadCertificates(append = false) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getCertificates',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      if (result.success) {
        this.setData({
          certificates: append ? [...this.data.certificates, ...result.data.list] : result.data.list,
          hasMore: result.data.list.length === this.data.pageSize
        })
      }
    } catch (err) {
      console.error('加载证书列表失败', err)
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

    await this.loadCertificates()
    this.setData({ refreshing: false })
  },

  // 加载更多
  async onLoadMore() {
    if (!this.data.hasMore || this.data.refreshing) return

    this.setData({
      page: this.data.page + 1
    })
    await this.loadCertificates(true)
  },

  // 查看证书
  viewCertificate(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/certificate/certificate?id=${id}`
    })
  }
}) 