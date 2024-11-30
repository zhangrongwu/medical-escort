const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    currentTab: 0,
    appointments: [],
    statusMap: {
      'PENDING': '待确认',
      'CONFIRMED': '已确认',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
  },

  onLoad() {
    this.loadAppointments()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: parseInt(tab)
    })
    this.loadAppointments()
  },

  // 加载预约列表
  loadAppointments() {
    const db = wx.cloud.database()
    const _ = db.command
    let query = {}
    
    // 根据tab筛选预约状态
    switch(this.data.currentTab) {
      case 1:
        query.status = 'PENDING'
        break
      case 2:
        query.status = 'CONFIRMED'
        break
      case 3:
        query.status = 'COMPLETED'
        break
    }

    db.collection('appointments')
      .where(query)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        const appointments = res.data.map(item => ({
          ...item,
          serviceNames: item.services.map(s => s.name).join('、')
        }))
        this.setData({
          appointments
        })
      })
  },

  // 取消预约
  cancelAppointment(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要取消预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'cancelAppointment',
            data: { id }
          }).then(() => {
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            })
            this.loadAppointments()
          })
        }
      }
    })
  },

  // 导航到预约详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/appointment-detail/appointment-detail?id=${id}`
    })
  }
}) 