const app = getApp()

Page({
  data: {
    currentTab: 0,
    tabs: ['待接单', '进行中', '已完成'],
    statusMap: {
      'PENDING': '待接单',
      'ACCEPTED': '已接单',
      'PROCESSING': '服务中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    },
    tabStatus: ['PENDING', 'PROCESSING', 'COMPLETED'],
    orders: [],
    loading: false,
    refreshing: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    tabCounts: [0, 0, 0]
  },

  onLoad() {
    this.loadOrders()
    this.loadOrderCounts()
  },

  onShow() {
    // 每次显示页面时刷新数据
    if (this.data.orders.length > 0) {
      this.setData({ page: 1 }, () => {
        this.loadOrders()
        this.loadOrderCounts()
      })
    }
  },

  // 加载订单数量统计
  async loadOrderCounts() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOrderStats'
      })

      if (result.success) {
        this.setData({
          tabCounts: [
            result.data.pending || 0,
            result.data.processing || 0,
            result.data.completed || 0
          ]
        })
      }
    } catch (err) {
      console.error('加载订单统计失败:', err)
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
        const orders = append ? 
          [...this.data.orders, ...result.data.list] : 
          result.data.list

        this.setData({
          orders,
          hasMore: result.data.list.length === this.data.pageSize
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
        this.loadOrders()
        this.loadOrderCounts()
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
    await this.loadOrders()
    await this.loadOrderCounts()
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