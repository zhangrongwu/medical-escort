const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    id: '',
    address: {
      name: '',
      phone: '',
      region: [],
      detail: '',
      isDefault: false,
      location: null
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadAddress()
    }
  },

  // 加载地址详情
  loadAddress() {
    db.collection('addresses')
      .doc(this.data.id)
      .get()
      .then(res => {
        this.setData({
          address: res.data
        })
      })
  },

  // 输入处理
  onNameInput(e) {
    this.setData({
      'address.name': e.detail.value
    })
  },

  onPhoneInput(e) {
    this.setData({
      'address.phone': e.detail.value
    })
  },

  onRegionChange(e) {
    this.setData({
      'address.region': e.detail.value
    })
  },

  onDetailInput(e) {
    this.setData({
      'address.detail': e.detail.value
    })
  },

  onDefaultChange(e) {
    this.setData({
      'address.isDefault': e.detail.value
    })
  },

  // 选择位置
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'address.location': {
            latitude: res.latitude,
            longitude: res.longitude,
            name: res.name,
            address: res.address
          },
          'address.detail': res.address
        })
      }
    })
  },

  // 保存地址
  saveAddress() {
    if (!this.validateForm()) return

    wx.showLoading({
      title: '保存中...'
    })

    const addressData = {
      name: this.data.address.name,
      phone: this.data.address.phone,
      region: this.data.address.region,
      detail: this.data.address.detail,
      isDefault: this.data.address.isDefault,
      location: this.data.address.location
    }

    if (this.data.id) {
      // 更新地址
      db.collection('addresses')
        .doc(this.data.id)
        .update({
          data: addressData
        })
        .then(this.handleSuccess)
        .catch(this.handleError)
    } else {
      // 新增地址
      db.collection('addresses')
        .add({
          data: addressData
        })
        .then(this.handleSuccess)
        .catch(this.handleError)
    }
  },

  // 表单验证
  validateForm() {
    const { name, phone, region, detail } = this.data.address

    if (!name) {
      this.showError('请输入收货人姓名')
      return false
    }

    if (!phone) {
      this.showError('请输入手机号码')
      return false
    }

    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(phone)) {
      this.showError('请输入正确的手机号')
      return false
    }

    if (region.length === 0) {
      this.showError('请选择所在地区')
      return false
    }

    if (!detail) {
      this.showError('请输入详细地址')
      return false
    }

    return true
  },

  // 处理成功
  handleSuccess() {
    wx.hideLoading()
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  // 处理错误
  handleError() {
    wx.hideLoading()
    wx.showToast({
      title: '保存失败',
      icon: 'none'
    })
  },

  // 显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    })
  }
}) 