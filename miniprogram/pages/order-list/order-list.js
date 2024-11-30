const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const PAGE_SIZE = 10

Page({
  data: {
    searchKey: '',
    orders: [],
    filteredOrders: [],
    page: 0,
    hasMore: true,
    refreshing: false,
    showDatePicker: false,
    showStatusFilter: false,
    startDate: '',
    endDate: '',
    selectedStatus: '',
    dateFilter: '',
    statusFilter: '',
    statusMap: {
      'UNPAID': '待支付',
      'PAID': '待服务',
      'PROCESSING': '服务中',
      'FINISHED': '已完成',
      'CANCELLED': '已取消'
    }
  },

  onLoad() {
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    if (!this.data.hasMore) return

    const query = this.buildQuery()

    db.collection('orders')
      .where(query)
      .orderBy('createTime', 'desc')
      .skip(this.data.page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .get()
      .then(res => {
        const orders = res.data.map(order => ({
          ...order,
          createTime: this.formatTime(order.createTime)
        }))

        this.setData({
          orders: this.data.page === 0 ? orders : [...this.data.orders, ...orders],
          hasMore: orders.length === PAGE_SIZE,
          page: this.data.page + 1
        })

        this.filterOrders()
      })
  },

  // 构建查询条件
  buildQuery() {
    const query = {}
    
    // 日期筛选
    if (this.data.startDate && this.data.endDate) {
      query.appointmentDate = _.gte(this.data.startDate).lte(this.data.endDate)
    }

    // 状态筛选
    if (this.data.selectedStatus) {
      query.status = this.data.selectedStatus
    }

    return query
  },

  // 搜索处理
  onSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    })
    this.filterOrders()
  },

  // 筛选订单
  filterOrders() {
    const searchKey = this.data.searchKey.toLowerCase()
    const filteredOrders = this.data.orders.filter(order => {
      return order.orderNo.toLowerCase().includes(searchKey) ||
             order.hospitalName.toLowerCase().includes(searchKey) ||
             order.patientInfo.name.toLowerCase().includes(searchKey)
    })

    this.setData({
      filteredOrders
    })
  },

  // 日期选择相关
  showDatePicker() {
    this.setData({ showDatePicker: true })
  },

  hideDatePicker() {
    this.setData({ showDatePicker: false })
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value })
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value })
  },

  resetDateFilter() {
    this.setData({
      startDate: '',
      endDate: '',
      dateFilter: ''
    })
  },

  confirmDateFilter() {
    if (this.data.startDate && this.data.endDate) {
      this.setData({
        dateFilter: `${this.data.startDate} 至 ${this.data.endDate}`,
        showDatePicker: false,
        page: 0,
        orders: [],
        hasMore: true
      })
      this.loadOrders()
    }
  },

  // 状态筛选相关
  showStatusFilter() {
    this.setData({ showStatusFilter: true })
  },

  hideStatusFilter() {
    this.setData({ showStatusFilter: false })
  },

  selectStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      selectedStatus: status,
      statusFilter: this.data.statusMap[status] || '全部',
      showStatusFilter: false,
      page: 0,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  // 下拉刷新
  onRefresh() {
    this.setData({
      refreshing: true,
      page: 0,
      orders: [],
      hasMore: true
    })
    
    this.loadOrders().then(() => {
      this.setData({ refreshing: false })
    })
  },

  // 加载更多
  loadMore() {
    this.loadOrders()
  },

  // 格式化时间
  formatTime(date) {
    date = new Date(date)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  },

  // 页面跳转
  goToDetail(e) {
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${e.currentTarget.dataset.id}`
    })
  },

  // 订单操作
  cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'cancelOrder',
            data: { orderId: id }
          }).then(() => {
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            this.onRefresh()
          })
        }
      }
    })
  },

  payOrder(e) {
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${e.currentTarget.dataset.id}`
    })
  },

  evaluateOrder(e) {
    wx.navigateTo({
      url: `/pages/evaluate/evaluate?orderId=${e.currentTarget.dataset.id}`
    })
  },

  shareOrder(e) {
    const order = this.data.orders.find(item => item._id === e.currentTarget.dataset.id)
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })
  },

  onShareAppMessage(e) {
    const order = this.data.orders.find(item => item._id === e.target.dataset.id)
    return {
      title: `${order.hospitalName}就医陪诊服务`,
      path: `/pages/order-detail/order-detail?id=${order._id}`
    }
  }
}) 