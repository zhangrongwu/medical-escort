const app = getApp()

Page({
  data: {
    currentDate: '',
    stats: {
      totalIncome: '0.00',
      monthIncome: '0.00',
      orderCount: 0,
      balance: '0.00'
    },
    incomeList: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    // 设置当前月份
    const now = new Date()
    const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    this.setData({ currentDate }, () => {
      this.loadIncomeStats()
      this.loadIncomeList()
    })
  },

  // 加载收入统计
  async loadIncomeStats() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getIncomeStats',
        data: {
          date: this.data.currentDate
        }
      })

      if (result.success) {
        // 处理金额显示
        const stats = {
          totalIncome: (result.data.totalIncome / 100).toFixed(2),
          monthIncome: (result.data.monthIncome / 100).toFixed(2),
          orderCount: result.data.orderCount,
          balance: (result.data.balance / 100).toFixed(2)
        }
        this.setData({ stats })
      }
    } catch (err) {
      console.error('加载收入统计失败:', err)
    }
  },

  // 加载收入明细
  async loadIncomeList(append = false) {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getIncomeList',
        data: {
          date: this.data.currentDate,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      if (result.success) {
        // 处理金额显示
        const list = result.data.list.map(item => ({
          ...item,
          amount: (item.amount / 100).toFixed(2)
        }))

        this.setData({
          incomeList: append ? [...this.data.incomeList, ...list] : list,
          hasMore: list.length === this.data.pageSize
        })
      }
    } catch (err) {
      console.error('加载收入明细失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      currentDate: e.detail.value,
      page: 1,
      incomeList: []
    }, () => {
      this.loadIncomeStats()
      this.loadIncomeList()
    })
  },

  // 提现
  handleWithdraw() {
    const { balance } = this.data.stats
    if (parseFloat(balance) <= 0) {
      wx.showToast({
        title: '暂无可提现金额',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/withdraw/withdraw'
    })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({ page: 1 })
    await Promise.all([
      this.loadIncomeStats(),
      this.loadIncomeList()
    ])
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({
      page: this.data.page + 1
    })
    this.loadIncomeList(true)
  }
}) 