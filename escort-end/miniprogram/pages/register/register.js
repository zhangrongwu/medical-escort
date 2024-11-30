const app = getApp()

Page({
  data: {
    formData: {
      avatar: '',
      name: '',
      gender: '',
      idCard: '',
      phone: '',
      region: [],
      serviceTypes: [],
      introduction: '',
      idCardFront: '',
      idCardBack: '',
      healthCert: ''
    },
    genderOptions: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    experienceOptions: ['1年以下', '1-3年', '3-5年', '5年以上'],
    experienceIndex: null,
    serviceTypeOptions: [
      { label: '普通陪诊', value: 'normal', selected: false },
      { label: '专业陪诊', value: 'professional', selected: false },
      { label: '术后照护', value: 'postop', selected: false },
      { label: '病房陪护', value: 'ward', selected: false }
    ],
    submitting: false
  },

  onLoad(options) {
    if (options.phone) {
      this.setData({
        'formData.phone': options.phone
      })
    } else {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo && userInfo.phone) {
        this.setData({
          'formData.phone': userInfo.phone
        })
      }
    }
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImage(res.tempFilePaths[0], 'avatar')
      }
    })
  },

  // 输入处理
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  onGenderChange(e) {
    this.setData({
      'formData.gender': e.detail.value
    })
  },

  onIdCardInput(e) {
    this.setData({
      'formData.idCard': e.detail.value
    })
  },

  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    })
  },

  onExperienceChange(e) {
    this.setData({
      experienceIndex: parseInt(e.detail.value)
    })
  },

  onRegionChange(e) {
    this.setData({
      'formData.region': e.detail.value
    })
  },

  onServiceTypesChange(e) {
    this.setData({
      'formData.serviceTypes': e.detail.value
    })
  },

  onIntroductionInput(e) {
    this.setData({
      'formData.introduction': e.detail.value
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
        this.uploadImage(res.tempFilePaths[0], type)
      }
    })
  },

  // 上传图片
  uploadImage(tempFilePath, type) {
    wx.showLoading({
      title: '上传中...'
    })

    const cloudPath = `escorts/${Date.now()}-${Math.random().toString(36).slice(-6)}.${tempFilePath.match(/\.(\w+)$/)[1]}`
    
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: res => {
        this.setData({
          [`formData.${type}`]: res.fileID
        })
      },
      fail: err => {
        console.error('上传图片失败:', err)
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 表单提交
  async submitForm() {
    if (!this.validateForm()) return
    
    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中...' })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'submitEscortRegistration',
        data: {
          ...this.data.formData,
          experience: this.data.experienceOptions[this.data.experienceIndex]
        }
      })

      console.log('submitEscortRegistration result:', result)

      if (result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        })

        // 保存用户信息到全局
        const userInfo = {
          ...this.data.formData,
          _id: result.data.escortId,
          status: 'PENDING'
        }
        wx.setStorageSync('userInfo', userInfo)
        getApp().globalData.userInfo = userInfo

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          // 跳转到注册状态页面
          wx.redirectTo({
            url: `/pages/register-status/register-status?id=${result.data.escortId}`
          })
        }, 1500)
      } else {
        throw new Error(result.message || '提交失败')
      }
    } catch (err) {
      console.error('提交注册失败:', err)
      wx.showToast({
        title: err.message || '提交失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
      wx.hideLoading()
    }
  },

  // 表单验证
  validateForm() {
    const { 
      avatar, name, gender, idCard, phone, 
      region, serviceTypes, introduction,
      idCardFront, idCardBack, healthCert 
    } = this.data.formData

    if (!avatar) {
      this.showError('请上传头像')
      return false
    }

    if (!name) {
      this.showError('请输入姓名')
      return false
    }

    if (!gender) {
      this.showError('请选择性别')
      return false
    }

    if (!this.validateIdCard(idCard)) {
      this.showError('请输入正确的身份证号')
      return false
    }

    if (!this.validatePhone(phone)) {
      this.showError('请输入正确的手机号')
      return false
    }

    if (this.data.experienceIndex === null) {
      this.showError('请选择工作年限')
      return false
    }

    if (region.length === 0) {
      this.showError('请选择服务区域')
      return false
    }

    if (!serviceTypes || serviceTypes.length === 0) {
      wx.showToast({
        title: '请选择服务类型',
        icon: 'none'
      })
      return false
    }

    if (introduction.length < 50) {
      this.showError('自我介绍不能少于50字')
      return false
    }

    if (!idCardFront || !idCardBack) {
      this.showError('请上传身份证照片')
      return false
    }

    if (!healthCert) {
      this.showError('请上传健康证')
      return false
    }

    return true
  },

  // 身份证号验证
  validateIdCard(idCard) {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return reg.test(idCard)
  },

  // 手机号验证
  validatePhone(phone) {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
  },

  // 显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    })
  },

  // 获取手机号
  async getPhoneNumber(e) {
    console.log('getPhoneNumber response:', e)

    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '获取手机号失败',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '获取中...' })

      // 先获取登录code
      const { code: loginCode } = await wx.login()

      // 调用云函数获取手机号
      const { result } = await wx.cloud.callFunction({
        name: 'getPhoneNumber',
        data: {
          code: e.detail.code,
          loginCode
        }
      })

      console.log('getPhoneNumber result:', result)

      if (result.success && result.data && result.data.phoneNumber) {
        this.setData({
          'formData.phone': result.data.phoneNumber
        })
        wx.showToast({
          title: '获取成功',
          icon: 'success'
        })
      } else {
        throw new Error(result.error || '获取手机号失败')
      }
    } catch (err) {
      console.error('获取手机号失败:', err)
      wx.showToast({
        title: err.message || '获取手机号失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 切换服务类型选择
  toggleServiceType(e) {
    const value = e.currentTarget.dataset.value
    const serviceTypeOptions = this.data.serviceTypeOptions.map(item => {
      if (item.value === value) {
        item.selected = !item.selected
      }
      return item
    })

    // 更新选中的服务类型数组
    const selectedTypes = serviceTypeOptions
      .filter(item => item.selected)
      .map(item => item.value)

    this.setData({
      serviceTypeOptions,
      'formData.serviceTypes': selectedTypes
    })
  }
}) 