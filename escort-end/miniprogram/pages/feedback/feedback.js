const app = getApp()

Page({
  data: {
    typeList: [
      { id: 1, name: '功能异常' },
      { id: 2, name: '体验问题' },
      { id: 3, name: '订单相关' },
      { id: 4, name: '账户问题' },
      { id: 5, name: '其他建议' }
    ],
    selectedType: null,
    content: '',
    images: [],
    contact: '',
    canSubmit: false,
    submitting: false
  },

  onLoad() {
    // 自动填充用户手机号
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.phone) {
      this.setData({ contact: userInfo.phone })
    }
  },

  // 选择问题类型
  selectType(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      selectedType: index
    }, this.checkCanSubmit)
  },

  // 问题描述输入
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    }, this.checkCanSubmit)
  },

  // 联系方式输入
  onContactInput(e) {
    this.setData({
      contact: e.detail.value
    })
  },

  // 选择图片
  async chooseImage() {
    try {
      const { tempFilePaths } = await wx.chooseImage({
        count: 4 - this.data.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      this.setData({
        images: [...this.data.images, ...tempFilePaths]
      })
    } catch (err) {
      console.error('选择图片失败:', err)
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: this.data.images,
      current: url
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 检查是否可提交
  checkCanSubmit() {
    const { selectedType, content } = this.data
    const canSubmit = selectedType !== null && content.trim().length > 0
    this.setData({ canSubmit })
  },

  // 上传图片到云存储
  async uploadImages() {
    const uploadTasks = this.data.images.map(filePath => {
      return wx.cloud.uploadFile({
        cloudPath: `feedback/${Date.now()}-${Math.random().toString(36).slice(-6)}.jpg`,
        filePath
      })
    })

    try {
      const results = await Promise.all(uploadTasks)
      return results.map(res => res.fileID)
    } catch (err) {
      console.error('上传图片失败:', err)
      throw new Error('上传图片失败')
    }
  },

  // 提交反馈
  async handleSubmit() {
    if (!this.data.canSubmit || this.data.submitting) return

    this.setData({ submitting: true })

    try {
      wx.showLoading({ title: '提交中...' })

      // 上传图片
      let fileIDs = []
      if (this.data.images.length > 0) {
        fileIDs = await this.uploadImages()
      }

      // 提交反馈
      const { result } = await wx.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          type: this.data.typeList[this.data.selectedType].id,
          content: this.data.content,
          images: fileIDs,
          contact: this.data.contact
        }
      })

      if (result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('提交反馈失败:', err)
      wx.showToast({
        title: err.message || '提交失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      this.setData({ submitting: false })
    }
  }
}) 