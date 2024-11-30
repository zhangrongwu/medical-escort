Page({
  data: {
    patientList: []
  },

  onLoad: function() {
    this.getPatientList()
  },

  onShow: function() {
    this.getPatientList()
  },

  getPatientList: function() {
    const db = wx.cloud.database()
    db.collection('patients')
      .where({
        _openid: wx.getStorageSync('openid')
      })
      .get()
      .then(res => {
        this.setData({
          patientList: res.data
        })
      })
  },

  addPatient: function() {
    wx.navigateTo({
      url: '/pages/patient-form/patient-form'
    })
  },

  editPatient: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/patient-form/patient-form?id=${id}`
    })
  },

  deletePatient: function(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除该就医人信息吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'deletePatient',
            data: {
              id: id
            }
          }).then(() => {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.getPatientList()
          })
        }
      }
    })
  }
}) 