const db = wx.cloud.database()

Page({
  data: {
    currentTab: 0,
    orderList: [],
    statusMap: {
      'UNPAID': '待付款',
      'PAID': '进行中',
      'FINISHED': '已完成',
      'CANCELLED': '已取消'
    }
  },

  onLoad: function() {
    this.loadOrders()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  // 切换标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: parseInt(tab)
    })
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders: function() {
    const _ = db.command
    let query = {}
    
    // 根据tab筛选订单状态
    switch(this.data.currentTab) {
      case 1:
        query.status = 'UNPAID'
        break
      case 2:
        query.status = 'PAID'
        break
      case 3:
        query.status = 'FINISHED'
        break
    }

    db.collection('orders')
      .where(query)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        const orderList = res.data.map(order => ({
          ...order,
          statusText: this.data.statusMap[order.status]
        }))
        this.setData({ orderList })
      })
  },

  // 取消订单
  cancelOrder: function(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'cancelOrder',
            data: { orderId }
          }).then(() => {
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            })
            this.loadOrders()
          })
        }
      }
    })
  },

  // 支付订单
  payOrder: function(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${orderId}`
    })
  },

  // 评价订单
  evaluateOrder: function(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/evaluate/evaluate?orderId=${orderId}`
    })
  },

  // 删除订单
  deleteOrder: function(e) {
    const orderId = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除订单吗？',
      success: (res) => {
        if (res.confirm) {
          db.collection('orders').doc(orderId).remove()
            .then(() => {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadOrders()
            })
        }
      }
    })
  },

  // 导航到订单详情
  navigateToDetail: function(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    })
  }
}) 