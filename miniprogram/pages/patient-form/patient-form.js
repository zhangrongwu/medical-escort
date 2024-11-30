Page({
  data: {
    id: '',
    patient: {
      name: '',
      gender: '',
      idCard: '',
      phone: ''
    }
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.getPatientDetail()
    }
  },

  getPatientDetail: function() {
    const db = wx.cloud.database()
    db.collection('patients').doc(this.data.id).get().then(res => {
      this.setData({
        patient: res.data
      })
    })
  },

  setName: function(e) {
    this.setData({
      'patient.name': e.detail.value
    })
  },

  setGender: function(e) {
    const genders = ['男', '女']
    this.setData({
      'patient.gender': genders[e.detail.value]
    })
  },

  setIdCard: function(e) {
    this.setData({
      'patient.idCard': e.detail.value
    })
  },

  setPhone: function(e) {
    this.setData({
      'patient.phone': e.detail.value
    })
  },

  savePatient: function() {
    if (!this.validateForm()) return

    if (this.data.id) {
      // 更新
      wx.cloud.callFunction({
        name: 'updatePatient',
        data: {
          id: this.data.id,
          patient: this.data.patient
        }
      }).then(() => {
        this.showSuccessAndBack()
      })
    } else {
      // 新增
      const db = wx.cloud.database()
      db.collection('patients').add({
        data: this.data.patient
      }).then(() => {
        this.showSuccessAndBack()
      })
    }
  },

  validateForm: function() {
    const { name, gender, idCard, phone } = this.data.patient
    if (!name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return false
    }
    if (!gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return false
    }
    if (!idCard) {
      wx.showToast({
        title: '请输入身份证号',
        icon: 'none'
      })
      return false
    }
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return false
    }
    return true
  },

  showSuccessAndBack: function() {
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  }
}) 