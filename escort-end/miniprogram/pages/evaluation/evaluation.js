const app = getApp()

Page({
  data: {
    stats: {
      totalCount: 0,
      goodRate: '0%',
      avgScore: '0.0',
      distribution: [
        { score: 5, label: '5星', count: 0, percentage: 0 },
        { score: 4, label: '4星', count: 0, percentage: 0 },
        { score: 3, label: '3星', count: 0, percentage: 0 },
        { score: 2, label: '2星', count: 0, percentage: 0 },
        { score: 1, label: '1星', count: 0, percentage: 0 }
      ]
    },
    evaluations: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    showReplyDialog: false,
    currentEvalId: '',
    replyContent: '',
    canSubmitReply: false
  },

  onLoad() {
    this.loadStats()
    this.loadEvaluations()
  },

  // 加载评价统计
  async loadStats() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getEvaluationStats'
      })

      if (result.success) {
        // 计算好评率和评分分布
        const stats = result.data
        const totalCount = stats.distribution.reduce((sum, item) => sum + item.count, 0)
        const goodCount = stats.distribution
          .filter(item => item.score >= 4)
          .reduce((sum, item) => sum + item.count, 0)
        
        stats.goodRate = totalCount ? Math.round(goodCount / totalCount * 100) + '%' : '0%'
        stats.distribution.forEach(item => {
          item.percentage = totalCount ? Math.round(item.count / totalCount * 100) : 0
        })

        this.setData({ stats })
      }
    } catch (err) {
      console.error('加载评价统计失败:', err)
    }
  },

  // 加载评价列表
  async loadEvaluations(append = false) {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getEvaluationList',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      if (result.success) {
        const evaluations = append ? 
          [...this.data.evaluations, ...result.data.list] : 
          result.data.list

        this.setData({
          evaluations,
          hasMore: result.data.list.length === this.data.pageSize
        })
      }
    } catch (err) {
      console.error('加载评价列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 预览图片
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset
    wx.previewImage({ urls, current })
  },

  // 显示回复弹窗
  showReplyDialog(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      showReplyDialog: true,
      currentEvalId: id,
      replyContent: ''
    })
  },

  // 隐藏回复弹窗
  hideReplyDialog() {
    this.setData({
      showReplyDialog: false,
      currentEvalId: '',
      replyContent: ''
    })
  },

  // 回复内容输入
  onReplyInput(e) {
    const content = e.detail.value
    this.setData({
      replyContent: content,
      canSubmitReply: content.trim().length > 0
    })
  },

  // 提交回复
  async submitReply() {
    if (!this.data.canSubmitReply) return

    try {
      wx.showLoading({ title: '提交中...' })

      const { result } = await wx.cloud.callFunction({
        name: 'replyEvaluation',
        data: {
          evaluationId: this.data.currentEvalId,
          content: this.data.replyContent
        }
      })

      if (result.success) {
        wx.showToast({
          title: '回复成功',
          icon: 'success'
        })
        
        // 更新本地数据
        const evaluations = this.data.evaluations.map(item => {
          if (item._id === this.data.currentEvalId) {
            return {
              ...item,
              reply: this.data.replyContent,
              hasReplied: true
            }
          }
          return item
        })

        this.setData({ evaluations })
        this.hideReplyDialog()
      }
    } catch (err) {
      console.error('提交回复失败:', err)
      wx.showToast({
        title: '回复失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ page: 1 })
    await Promise.all([
      this.loadStats(),
      this.loadEvaluations()
    ])
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({
      page: this.data.page + 1
    })
    this.loadEvaluations(true)
  }
}) 