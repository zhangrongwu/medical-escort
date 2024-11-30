const db = wx.cloud.database()

Page({
  data: {
    id: '',
    hospital: null,
    escorts: []
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadHospitalDetail()
      this.loadEscorts()
    }
  },

  // 加载医院详情
  loadHospitalDetail: function() {
    db.collection('hospitals')
      .doc(this.data.id)
      .get()
      .then(res => {
        this.setData({
          hospital: res.data
        })
      })
      .catch(err => {
        console.error('获取医院详情失败', err)
        wx.showToast({
          title: '获取医院信息失败',
          icon: 'none'
        })
      })
  },

  // 加载推荐陪诊员
  loadEscorts: function() {
    db.collection('escorts')
      .where({
        status: 'active',
        'serviceHospitals': this.data.id
      })
      .orderBy('score', 'desc')
      .limit(5)
      .get()
      .then(res => {
        this.setData({
          escorts: res.data
        })
      })
      .catch(err => {
        console.error('获取陪诊员列表失败', err)
      })
  },

  // 打开地图
  openLocation: function() {
    const { location, name, address } = this.data.hospital
    wx.openLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      name: name,
      address: address,
      scale: 18
    })
  },

  // 选择科室
  selectDepartment: function(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/appointment/appointment?hospitalId=${this.data.id}&departmentId=${id}&departmentName=${name}`
    })
  },

  // 跳转到陪诊员详情
  navigateToEscort: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/escort-detail/escort-detail?id=${id}`
    })
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
      url: `/pages/appointment/appointment?hospitalId=${this.data.id}&hospitalName=${this.data.hospital.name}`
    })
  },

  onShareAppMessage: function() {
    const { name } = this.data.hospital
    return {
      title: name,
      path: `/pages/hospital-detail/hospital-detail?id=${this.data.id}`
    }
  }
}) 