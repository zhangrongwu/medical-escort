const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    orderId: '',
    order: null,
    escort: null,
    ratings: {
      attitude: 0,
      professional: 0,
      experience: 0
    },
    comment: '',
    images: [],
    isAnonymous: false
  },

  onLoad: function(options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId })
      this.loadOrderDetail()
    }
  },

  // 加载订单详情
  loadOrderDetail: function() {
    db.collection('orders')
      .doc(this.data.orderId)
      .get()
      .then(res => {
        this.setData({ order: res.data })
        return db.collection('escorts').doc(res.data.escortId).get()
      })
      .then(res => {
        this.setData({ escort: res.data })
      })
      .catch(err => {
        console.error('获取订单详情失败', err)
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
  },

  // 评分处理
  rateAttitude: function(e) {
    this.setData({
      'ratings.attitude': e.currentTarget.dataset.score
    })
  },

  rateProfessional: function(e) {
    this.setData({
      'ratings.professional': e.currentTarget.dataset.score
    })
  },

  rateExperience: function(e) {
    this.setData({
      'ratings.experience': e.currentTarget.dataset.score
    })
  },

  // 评价内容输入
  onCommentInput: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  // 选择图片
  chooseImage: function() {
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
  uploadImages: function(tempFilePaths) {
    wx.showLoading({
      title: '上传中...'
    })

    const uploads = tempFilePaths.map(path => {
      return wx.cloud.uploadFile({
        cloudPath: `evaluations/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`,
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
      console.error('上传图片失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '上传图片失败',
        icon: 'none'
      })
    })
  },

  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images
    images.splice(index, 1)
    this.setData({ images })
  },

  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: this.data.images,
      current: url
    })
  },

  // 切换匿名评价
  toggleAnonymous: function(e) {
    this.setData({
      isAnonymous: e.detail.value
    })
  },

  // 提交评价
  submitEvaluation: function() {
    if (!this.validateForm()) return

    wx.showLoading({
      title: '提交中...'
    })

    const evaluationData = this.generateEvaluationData()

    wx.cloud.callFunction({
      name: 'submitEvaluation',
      data: evaluationData
    }).then(() => {
      wx.hideLoading()
      wx.showToast({
        title: '评价成功',
        icon: 'success'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      console.error('提交评价失败', err)
      wx.hideLoading()
      wx.showToast({
        title: '评价失败',
        icon: 'none'
      })
    })
  },

  // 表单验证
  validateForm: function() {
    const { attitude, professional, experience } = this.data.ratings
    if (!attitude || !professional || !experience) {
      wx.showToast({
        title: '请完成所有评分项',
        icon: 'none'
      })
      return false
    }

    if (this.data.comment.length < 10) {
      wx.showToast({
        title: '评价内容至少10个字',
        icon: 'none'
      })
      return false
    }

    return true
  },

  // 生成评价数据
  generateEvaluationData: function() {
    return {
      orderId: this.data.orderId,
      escortId: this.data.order.escortId,
      ratings: this.data.ratings,
      comment: this.data.comment,
      images: this.data.images,
      isAnonymous: this.data.isAnonymous
    }
  }
}) 