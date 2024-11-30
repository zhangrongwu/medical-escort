const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    genderOptions: ['男', '女'],
    backgroundOptions: ['护理专业', '医学专业', '养老护理', '其他'],
    formData: {
      name: '',
      gender: null,
      age: '',
      idCard: '',
      workYears: '',
      background: null,
      experience: '',
      idCardFront: '',
      idCardBack: '',
      healthCert: '',
      serviceArea: [],
      price: ''
    }
  },

  // 输入处理函数
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  onGenderChange(e) {
    this.setData({
      'formData.gender': parseInt(e.detail.value)
    })
  },

  onAgeInput(e) {
    this.setData({
      'formData.age': e.detail.value
    })
  },

  onIdCardInput(e) {
    this.setData({
      'formData.idCard': e.detail.value
    })
  },

  onWorkYearsInput(e) {
    this.setData({
      'formData.workYears': e.detail.value
    })
  },

  onBackgroundChange(e) {
    this.setData({
      'formData.background': parseInt(e.detail.value)
    })
  },

  onExperienceInput(e) {
    this.setData({
      'formData.experience': e.detail.value
    })
  },

  onServiceAreaChange(e) {
    this.setData({
      'formData.serviceArea': e.detail.value
    })
  },

  onPriceInput(e) {
    this.setData({
      'formData.price': e.detail.value
    })
  },

  // 选择图片
  chooseImage(e) {
    const type = e.currentTarget.dataset.type
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.uploadImage(tempFilePath, type)
      }
    })
  },

  // 上传图片
  uploadImage(tempFilePath, type) {
    wx.showLoading({
      title: '上传中...'
    })

    const cloudPath = `escorts/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: res => {
        this.setData({
          [`formData.${type}`]: res.fileID
        })
      },
      fail: err => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        console.error('上传图片失败：', err)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 表单验证
  validateForm() {
    const { formData } = this.data
    
    if (!formData.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return false
    }

    if (formData.gender === null) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return false
    }

    if (!formData.age || formData.age < 18 || formData.age > 60) {
      wx.showToast({
        title: '年龄必须在18-60岁之间',
        icon: 'none'
      })
      return false
    }

    const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!idCardReg.test(formData.idCard)) {
      wx.showToast({
        title: '请输入正确的身份证号',
        icon: 'none'
      })
      return false
    }

    if (!formData.workYears) {
      wx.showToast({
        title: '请输入工作年限',
        icon: 'none'
      })
      return false
    }

    if (formData.background === null) {
      wx.showToast({
        title: '请选择专业背景',
        icon: 'none'
      })
      return false
    }

    if (!formData.experience || formData.experience.length < 50) {
      wx.showToast({
        title: '工作经历不能少于50字',
        icon: 'none'
      })
      return false
    }

    if (!formData.idCardFront || !formData.idCardBack || !formData.healthCert) {
      wx.showToast({
        title: '请上传所有必要证件照片',
        icon: 'none'
      })
      return false
    }

    if (!formData.serviceArea.length) {
      wx.showToast({
        title: '请选择服务区域',
        icon: 'none'
      })
      return false
    }

    if (!formData.price || formData.price < 50) {
      wx.showToast({
        title: '服务价格不能低于50元',
        icon: 'none'
      })
      return false
    }

    return true
  },

  // 提交注册
  submitRegistration() {
    if (!this.validateForm()) return

    wx.showLoading({
      title: '提交中...'
    })

    // 调用云函数提交注册
    wx.cloud.callFunction({
      name: 'submitEscortRegistration',
      data: {
        ...this.data.formData,
        status: 'PENDING',
        createTime: db.serverDate()
      }
    }).then(() => {
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
      console.error('提交注册失败：', err)
    })
  },

  // 显示协议
  showAgreement() {
    wx.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent('服务协议URL')
    })
  }
}) 