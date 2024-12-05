const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    orderId: '',
    order: null,
    escort: null,
    statusMap: {
      'UNPAID': '待支付',
      'PAID': '待服务',
      'PROCESSING': '服务中',
      'FINISHED': '已完成',
      'CANCELLED': '已取消',
      'REFUNDING': '退款中',
      'REFUNDED': '已退款'
    },
    statusDescMap: {
      'UNPAID': '请尽快完成支付，超时订单将自动取消',
      'PAID': '陪诊员已接单，将按约定时间提供服务',
      'PROCESSING': '陪诊服务进行中',
      'FINISHED': '服务已完成，欢迎评价',
      'CANCELLED': '订单已取消',
      'REFUNDING': '退款申请处理中',
      'REFUNDED': '退款已完成'
    },
    shareImage: '',
    showSharePopup: false
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({ orderId: options.id })
      this.loadOrderDetail()
    }
  },

  // 加载订单详情
  loadOrderDetail: function() {
    db.collection('orders')
      .doc(this.data.orderId)
      .get()
      .then(res => {
        const order = res.data
        // 格式化时间
        order.createTime = this.formatTime(order.createTime)
        if (order.payTime) {
          order.payTime = this.formatTime(order.payTime)
        }
        
        this.setData({ order })

        // 如果有陪诊员信息，加载陪诊员详情
        if (order.escortId) {
          this.loadEscortInfo(order.escortId)
        }
      })
      .catch(err => {
        console.error('获取订单详情失败', err)
        wx.showToast({
          title: '获取订单信息失败',
          icon: 'none'
        })
      })
  },

  // 加载陪诊员信息
  loadEscortInfo: function(escortId) {
    db.collection('escorts')
      .doc(escortId)
      .get()
      .then(res => {
        this.setData({
          escort: res.data
        })
      })
  },

  // 格式化时间
  formatTime: function(date) {
    date = new Date(date)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  },

  // 拨打电话
  callEscort: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.escort.phone
    })
  },

  // 取消订单
  cancelOrder: function() {
    wx.showModal({
      title: '提示',
      content: '确定要取消订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'cancelOrder',
            data: {
              orderId: this.data.orderId
            }
          }).then(() => {
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            this.loadOrderDetail()
          })
        }
      }
    })
  },

  // 去支付
  payOrder: function() {
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${this.data.orderId}`
    })
  },

  // 去评价
  evaluateOrder: function() {
    wx.navigateTo({
      url: `/pages/evaluate/evaluate?orderId=${this.data.orderId}`
    })
  },

  // 显示分享弹窗
  showShare() {
    this.setData({ showSharePopup: true })
    this.generateShareImage()
  },

  // 隐藏分享弹窗
  hideShare() {
    this.setData({ showSharePopup: false })
  },

  // 生成分享图片
  generateShareImage() {
    wx.showLoading({
      title: '生成中...'
    })

    wx.cloud.callFunction({
      name: 'generateCode',
      data: {
        page: 'pages/order-detail/order-detail',
        scene: this.data.orderId
      }
    }).then(res => {
      if (res.result.success) {
        this.setData({
          shareImage: res.result.fileID
        })
      } else {
        throw new Error('生成失败')
      }
    }).catch(err => {
      console.error('生成分享图片失败:', err)
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 保存分享图片
  saveShareImage() {
    wx.showLoading({
      title: '保存中...'
    })

    wx.cloud.downloadFile({
      fileID: this.data.shareImage
    }).then(res => {
      return wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath
      })
    }).then(() => {
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    }).catch(err => {
      console.error('保存图片失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 分享给好友
  onShareAppMessage() {
    const { order } = this.data
    return {
      title: `${order.hospitalName}就医陪诊服务`,
      path: `/pages/order-detail/order-detail?id=${order._id}`,
      imageUrl: this.data.shareImage
    }
  },

  // 申请退款
  applyRefund() {
    wx.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？',
      success: (res) => {
        if (res.confirm) {
          this.showRefundReasonPopup()
        }
      }
    })
  },

  // 显示退款原因选择
  showRefundReasonPopup() {
    const reasons = [
      '行程有变',
      '医院临时变更',
      '陪诊员时间冲突',
      '其他原因'
    ]

    wx.showActionSheet({
      itemList: reasons,
      success: (res) => {
        const reason = reasons[res.tapIndex]
        this.submitRefund(reason)
      }
    })
  },

  // 提交退款
  submitRefund(reason) {
    wx.showLoading({
      title: '提交中...'
    })

    wx.cloud.callFunction({
      name: 'refundOrder',
      data: {
        orderId: this.data.orderId,
        reason: reason
      }
    }).then(res => {
      if (res.result.success) {
        wx.showToast({
          title: '退款申请成功',
          icon: 'success'
        })
        this.loadOrderDetail()
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      console.error('申请退款失败:', err)
      wx.showToast({
        title: err.message || '申请失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 查询退款状态
  queryRefundStatus() {
    wx.cloud.callFunction({
      name: 'queryRefund',
      data: {
        orderId: this.data.orderId
      }
    }).then(res => {
      if (res.result.success) {
        this.loadOrderDetail()
      }
    })
  },

  // 查看进度
  viewProgress: function() {
    wx.navigateTo({
      url: `/pages/escort-progress/escort-progress?orderId=${this.data.order._id}`
    })
  }
}) 