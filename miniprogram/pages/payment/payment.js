const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    orderId: '',
    order: null,
    countdown: '14:59',
    timer: null,
    remainingSeconds: 15 * 60 // 15分钟支付时间
  },

  onLoad: function(options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId })
      this.loadOrderDetail()
      this.startCountdown()
    }
  },

  onUnload: function() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  // 加载订单详情
  loadOrderDetail: function() {
    db.collection('orders')
      .doc(this.data.orderId)
      .get()
      .then(res => {
        this.setData({
          order: res.data
        })
      })
      .catch(err => {
        console.error('获取订单详情失败:', err)
        wx.showToast({
          title: '获取订单信息失败',
          icon: 'none'
        })
      })
  },

  // 复制订单号
  copyOrderNo: function() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
      }
    })
  },

  // 开始支付
  startPay: function() {
    wx.showLoading({
      title: '支付中...'
    })

    wx.cloud.callFunction({
      name: 'createPayment',
      data: {
        orderId: this.data.orderId
      }
    }).then(res => {
      if (res.result.success) {
        const paymentData = res.result.paymentData
        return wx.requestPayment({
          ...paymentData,
          success: () => {
            this.handlePaySuccess()
          },
          fail: (err) => {
            console.error('支付失败:', err)
            this.handlePayFail()
          }
        })
      } else {
        throw new Error(res.result.message)
      }
    }).catch(err => {
      console.error('发起支付失败:', err)
      this.handlePayFail()
    }).finally(() => {
      wx.hideLoading()
    })
  },

  // 处理支付成功
  handlePaySuccess: function() {
    wx.showToast({
      title: '支付成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/order-detail/order-detail?id=${this.data.orderId}`
      })
    }, 1500)
  },

  // 处理支付失败
  handlePayFail: function() {
    wx.showToast({
      title: '支付失败，请重试',
      icon: 'none'
    })
  },

  // 开始倒计时
  startCountdown: function() {
    this.data.timer = setInterval(() => {
      let seconds = this.data.remainingSeconds - 1
      
      if (seconds <= 0) {
        clearInterval(this.data.timer)
        this.handleOrderTimeout()
        return
      }

      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      
      this.setData({
        countdown: `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`,
        remainingSeconds: seconds
      })
    }, 1000)
  },

  // 处理订单超时
  handleOrderTimeout: function() {
    wx.cloud.callFunction({
      name: 'closeOrder',
      data: {
        orderId: this.data.orderId
      }
    }).then(() => {
      wx.showToast({
        title: '订单已超时',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    })
  }
}) 