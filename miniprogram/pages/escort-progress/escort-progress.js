const app = getApp()

Page({
  data: {
    orderId: '',
    currentStep: 1,
    longitude: 116.397390,
    latitude: 39.908860,
    markers: [],
    timeline: {
      confirmTime: '',
      startTime: '',
      arriveTime: '',
      treatmentTime: '',
      finishTime: ''
    },
    escortInfo: {
      avatar: '',
      name: '',
      phone: ''
    }
  },

  onLoad: function (options) {
    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      })
      this.getOrderProgress()
      this.startLocationUpdate()
    }
  },

  onUnload: function () {
    // 清理定时器和位置监听
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
    }
    wx.stopLocationUpdate()
  },

  getOrderProgress: function () {
    const db = wx.cloud.database()
    db.collection('orders').doc(this.data.orderId).get({
      success: res => {
        const order = res.data
        this.setData({
          currentStep: order.status,
          timeline: order.timeline || this.data.timeline,
          escortInfo: {
            avatar: order.escortInfo.avatar,
            name: order.escortInfo.name,
            phone: order.escortInfo.phone
          }
        })
      }
    })
  },

  startLocationUpdate: function () {
    // 每30秒更新一次位置和进度
    this.progressTimer = setInterval(() => {
      this.updateLocation()
      this.getOrderProgress()
    }, 30000)
  },

  updateLocation: function () {
    const db = wx.cloud.database()
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        const { latitude, longitude } = res
        this.setData({
          markers: [{
            id: 1,
            latitude,
            longitude,
            width: 30,
            height: 30,
            iconPath: '/images/escort-marker.png'
          }]
        })

        // 更新云数据库中的位置信息
        db.collection('orders').doc(this.data.orderId).update({
          data: {
            currentLocation: {
              latitude,
              longitude,
              updateTime: new Date()
            }
          }
        })
      }
    })
  },

  contactEscort: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.escortInfo.phone,
      fail: () => {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        })
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '实时查看陪诊进度',
      path: `/pages/escort-progress/escort-progress?orderId=${this.data.orderId}`
    }
  }
})
