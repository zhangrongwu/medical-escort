const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    escortInfo: {},
    isOnline: false,
    currentTab: 0,
    tabs: ['新订单', '进行中', '已完成'],
    newOrders: [],
    processingOrders: [],
    historyOrders: []
  },

  onLoad() {
    this.loadEscortInfo()
    this.loadOrders()
  },

  // 加载陪诊员信息
  loadEscortInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.escortId) {
      db.collection('escorts')
        .doc(userInfo.escortId)
        .get()
        .then(res => {
          this.setData({
            escortInfo: res.data,
            isOnline: res.data.isOnline || false
          })
        })
    }
  },

  // 切换在线状态
  toggleOnlineStatus(e) {
    const isOnline = e.detail.value
    db.collection('escorts')
      .doc(this.data.escortInfo._id)
      .update({
        data: {
          isOnline,
          updateTime: db.serverDate()
        }
      })
      .then(() => {
        this.setData({ isOnline })
        wx.showToast({
          title: isOnline ? '已开始接单' : '已停止接单',
          icon: 'success'
        })
      })
  },

  // 切换标签页
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentTab: index })
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    const { currentTab } = this.data
    let status = ''
    
    switch(currentTab) {
      case 0:
        status = 'PAID'
        break
      case 1:
        status = 'PROCESSING'
        break
      case 2:
        status = 'FINISHED'
        break
    }

    db.collection('orders')
      .where({
        status,
        escortId: this.data.escortInfo._id
      })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        const orders = res.data.map(order => ({
          ...order,
          serviceNames: order.services.map(s => s.name).join('、')
        }))

        if (currentTab === 0) {
          this.setData({ newOrders: orders })
        } else if (currentTab === 1) {
          this.setData({ processingOrders: orders })
        } else {
          this.setData({ historyOrders: orders })
        }
      })
  },

  // 接单
  acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认接单',
      content: '接单后需要按时完成服务，是否确认接单？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' })
          
          wx.cloud.callFunction({
            name: 'acceptOrder',
            data: { orderId }
          }).then(() => {
            wx.hideLoading()
            wx.showToast({
              title: '接单成功',
              icon: 'success'
            })
            this.loadOrders()
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: '接单失败',
              icon: 'none'
            })
            console.error('接单失败', err)
          })
        }
      }
    })
  },

  // 完成服务
  completeOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认完成',
      content: '确认已完成本次服务？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中' })
          
          wx.cloud.callFunction({
            name: 'completeOrder',
            data: { orderId }
          }).then(() => {
            wx.hideLoading()
            wx.showToast({
              title: '已完成服务',
              icon: 'success'
            })
            this.loadOrders()
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            })
            console.error('完成服务失败', err)
          })
        }
      }
    })
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    })
  },

  // 更新订单进度
  updateProgress: function(e) {
    const orderId = e.currentTarget.dataset.id
    const currentStatus = e.currentTarget.dataset.status
    
    // 显示进度选择器
    wx.showActionSheet({
      itemList: ['接单确认', '前往约定地点', '到达医院', '就医中', '服务完成'],
      success: (res) => {
        const newStatus = res.tapIndex + 1
        
        wx.showLoading({
          title: '更新中...'
        })
        
        // 获取当前位置
        wx.getLocation({
          type: 'gcj02',
          success: (location) => {
            // 调用云函数更新进度
            wx.cloud.callFunction({
              name: 'updateOrderProgress',
              data: {
                orderId: orderId,
                status: newStatus,
                location: {
                  latitude: location.latitude,
                  longitude: location.longitude
                }
              },
              success: (res) => {
                if (res.result.success) {
                  wx.showToast({
                    title: '更新成功',
                    icon: 'success'
                  })
                  // 刷新订单列表
                  this.loadOrders()
                } else {
                  wx.showToast({
                    title: res.result.message,
                    icon: 'none'
                  })
                }
              },
              fail: (err) => {
                wx.showToast({
                  title: '更新失败',
                  icon: 'none'
                })
              },
              complete: () => {
                wx.hideLoading()
              }
            })
          },
          fail: () => {
            wx.showToast({
              title: '获取位置失败',
              icon: 'none'
            })
            wx.hideLoading()
          }
        })
      }
    })
  }
}) 