// pages/order/order.js
const app = getApp()

Page({
  data: {
    currentTab: 0,
    tabs: ['待接单', '进行中', '已完成'],
    statusMap: {
      'PENDING': '待接单',
      'ACCEPTED': '已接单',
      'PROCESSING': '服务中',
      'COMPLETED': '已完成'
    },
    tabStatus: ['PENDING', 'PROCESSING', 'COMPLETED'],
    orders: [],
    loading: false,
    refreshing: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    tabCounts: [0, 0, 0],
    stats: {
      todayOrders: 0,
      todayIncome: 0,
      totalOrders: 0
    }
  },

  onLoad() {
    this.loadStats()
    this.loadOrders()
  },

  onShow() {
    if (this.data.orders.length > 0) {
      this.setData({ page: 1 }, () => {
        this.loadStats()
        this.loadOrders()
      })
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOrderStats'
      })

      if (result.success) {
        this.setData({
          stats: result.data,
          tabCounts: [
            result.data.pending || 0,
            result.data.processing || 0,
            result.data.completed || 0
          ]
        })
      }
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentTab: index,
      page: 1,
      orders: [],
      hasMore: true
    }, () => {
      this.loadOrders()
    })
  },

  // 加载订单列表
  async loadOrders(append = false) {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOrders',
        data: {
          status: this.data.tabStatus[this.data.currentTab],
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      if (result.success) {
        // 处理距离信息
        const orders = result.data.list.map(order => ({
          ...order,
          distance: order.distance ? (order.distance / 1000).toFixed(1) : null
        }))

        this.setData({
          orders: append ? [...this.data.orders, ...orders] : orders,
          hasMore: orders.length === this.data.pageSize
        })
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('加载订单列表失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ 
        loading: false,
        refreshing: false
      })
    }
  },

  // 接单
  async acceptOrder(e) {
    const id = e.currentTarget.dataset.id
    
    try {
      wx.showLoading({ title: '处理中...' })
      
      const { result } = await wx.cloud.callFunction({
        name: 'updateOrderStatus',
        data: {
          orderId: id,
          status: 'ACCEPTED',
          location: await this.getCurrentLocation()
        }
      })

      if (result.success) {
        wx.showToast({
          title: '接单成功',
          icon: 'success'
        })
        // 刷新列表和统计
        this.loadStats()
        this.loadOrders()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('接单失败:', err)
      wx.showToast({
        title: err.message || '接单失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 获取当前位置
  async getCurrentLocation() {
    try {
      const res = await wx.getLocation({
        type: 'gcj02'
      })
      return {
        latitude: res.latitude,
        longitude: res.longitude
      }
    } catch (err) {
      console.error('获取位置失败:', err)
      return null
    }
  },

  // 查看订单详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      page: 1,
      refreshing: true
    })
    await Promise.all([
      this.loadStats(),
      this.loadOrders()
    ])
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({
      page: this.data.page + 1
    })
    this.loadOrders(true)
  }
})