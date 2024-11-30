const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    feedbackTypes: ['功能异常', '体验问题', '产品建议', '其他'],
    selectedType: null,
    content: '',
    images: [],
    contact: ''
  },

  onLoad() {
    // 如果用户已登录，自动填充手机号
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.phone) {
      this.setData({
        contact: userInfo.phone
      })
    }
  },

  // 选择反馈类型
  selectType(e) {
    this.setData({
      selectedType: e.currentTarget.dataset.index
    })
  },

  // 输入反馈内容
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 4 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.uploadImages(tempFilePaths)
      }
    })
  },

  // 上传图片
  uploadImages(tempFilePaths) {
    wx.showLoading({
      title: '上传中...'
    })

    const uploads = tempFilePaths.map(path => {
      return wx.cloud.uploadFile({
        cloudPath: `feedback/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`,
        filePath: path
      })
    })

    Promise.all(uploads).then(results => {
      const newImages = results.map(res => res.fileID)
      this.setData({
        images: [...this.data.images, ...newImages]
      })
      wx.hideLoading()
    }).catch(err => {
      console.error('上传图片失败:', err)
      wx.hideLoading()
      wx.showToast({
        title: '上传图片失败',
        icon: 'none'
      })
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images
    images.splice(index, 1)
    this.setData({ images })
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: this.data.images,
      current: url
    })
  },

  // 提交反馈
  submitFeedback() {
    if (!this.validateForm()) return

    wx.showLoading({
      title: '提交中...'
    })

    const feedbackData = {
      type: this.data.feedbackTypes[this.data.selectedType],
      content: this.data.content,
      images: this.data.images,
      contact: this.data.contact
    }

    wx.cloud.callFunction({
      name: 'submitFeedback',
      data: feedbackData
    }).then(res => {
      if (res.result.success) {
        wx.showToast({
          title: '提交成功',
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
        title: err.message || '提交失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 表单验证
  validateForm() {
    if (this.data.selectedType === null) {
      wx.showToast({
        title: '请选择反馈类型',
        icon: 'none'
      })
      return false
    }

    if (!this.data.content.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return false
    }

    if (this.data.content.length < 10) {
      wx.showToast({
        title: '反馈内容至少10个字',
        icon: 'none'
      })
      return false
    }

    if (!this.data.contact) {
      wx.showToast({
        title: '请留下联系方式',
        icon: 'none'
      })
      return false
    }

    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(this.data.contact)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return false
    }

    return true
  }
}) 