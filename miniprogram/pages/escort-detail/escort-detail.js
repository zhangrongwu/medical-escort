const db = wx.cloud.database()

Page({
  data: {
    id: '',
    escort: null,
    evaluations: []
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadEscortDetail()
      this.loadEvaluations()
    }
  },

  // 加载陪诊员详情
  loadEscortDetail: function() {
    db.collection('escorts')
      .doc(this.data.id)
      .get()
      .then(res => {
        this.setData({
          escort: res.data
        })
      })
      .catch(err => {
        console.error('获取陪诊员详情失败', err)
        wx.showToast({
          title: '获取信息失败',
          icon: 'none'
        })
      })
  },

  // 加载评价列表
  loadEvaluations: function() {
    db.collection('evaluations')
      .where({
        escortId: this.data.id
      })
      .orderBy('createTime', 'desc')
      .limit(10)
      .get()
      .then(res => {
        // 格式化评价时间
        const evaluations = res.data.map(item => ({
          ...item,
          createTime: this.formatTime(item.createTime)
        }))
        this.setData({
          evaluations
        })
      })
  },

  // 格式化时间
  formatTime: function(date) {
    date = new Date(date)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  },

  // 开始预约
  startBooking: function() {
    // 检查是否登录
    const app = getApp()
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    // 跳转到预约页面
    wx.navigateTo({
      url: `/pages/appointment/appointment?escortId=${this.data.id}&escortName=${this.data.escort.name}`
    })
  },

  onShareAppMessage: function() {
    const { name } = this.data.escort || {}
    return {
      title: `${name} - 专业陪诊服务`,
      path: `/pages/escort-detail/escort-detail?id=${this.data.id}`
    }
  }
}) 