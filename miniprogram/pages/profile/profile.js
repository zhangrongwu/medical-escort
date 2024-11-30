const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    userInfo: {},
    genderOptions: ['男', '女'],
    genderIndex: null,
    region: [],
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  },

  onLoad() {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo,
        genderIndex: userInfo.gender === 1 ? 0 : 1,
        region: userInfo.region || [],
        address: userInfo.address || '',
        emergencyContact: userInfo.emergencyContact || '',
        emergencyPhone: userInfo.emergencyPhone || ''
      })
    }
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        wx.showLoading({
          title: '上传中...'
        })

        // 上传图片到云存储
        const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(-6)}.${tempFilePath.match(/\.(\w+)$/)[1]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath,
          success: res => {
            this.setData({
              'userInfo.avatarUrl': res.fileID
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }
    })
  },

  // 输入处理
  onNickNameInput(e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    })
  },

  onGenderChange(e) {
    this.setData({
      genderIndex: parseInt(e.detail.value),
      'userInfo.gender': parseInt(e.detail.value) === 0 ? 1 : 2
    })
  },

  onRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
  },

  onAddressInput(e) {
    this.setData({
      address: e.detail.value
    })
  },

  onEmergencyContactInput(e) {
    this.setData({
      emergencyContact: e.detail.value
    })
  },

  onEmergencyPhoneInput(e) {
    this.setData({
      emergencyPhone: e.detail.value
    })
  },

  // 绑定/更换手机号
  bindPhone() {
    wx.navigateTo({
      url: '/pages/bind-phone/bind-phone'
    })
  },

  changePhone() {
    wx.showModal({
      title: '提示',
      content: '确定要更换手机号吗？',
      success: (res) => {
        if (res.confirm) {
          this.bindPhone()
        }
      }
    })
  },

  // 保存资料
  saveProfile() {
    if (!this.validateForm()) return

    wx.showLoading({
      title: '保存中...'
    })

    const profileData = {
      nickName: this.data.userInfo.nickName,
      avatarUrl: this.data.userInfo.avatarUrl,
      gender: this.data.userInfo.gender,
      region: this.data.region,
      address: this.data.address,
      emergencyContact: this.data.emergencyContact,
      emergencyPhone: this.data.emergencyPhone
    }

    // 调用云函数更新资料
    wx.cloud.callFunction({
      name: 'updateProfile',
      data: profileData
    }).then(res => {
      if (res.result.success) {
        // 更新本地存储
        const userInfo = wx.getStorageSync('userInfo')
        const newUserInfo = { ...userInfo, ...profileData }
        wx.setStorageSync('userInfo', newUserInfo)
        app.globalData.userInfo = newUserInfo

        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 表单验证
  validateForm() {
    if (!this.data.userInfo.nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return false
    }

    if (this.data.genderIndex === null) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      })
      return false
    }

    if (this.data.emergencyContact && !this.data.emergencyPhone) {
      wx.showToast({
        title: '请输入紧急联系人电话',
        icon: 'none'
      })
      return false
    }

    if (this.data.emergencyPhone) {
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(this.data.emergencyPhone)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return false
      }
    }

    return true
  }
}) 