const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    escortInfo: null,
    isOnline: false,
    tabs: ['新订单', '进行中', '已完成'],
    currentTab: 0,
    newOrders: [],
    processingOrders: [],
    historyOrders: [],
    todayOrders: 0,
    monthOrders: 0,
    totalOrders: 0,
    refreshing: false,
    hasMore: false,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadEscortInfo()
    this.loadOrderStats()
    this.loadOrders()
  },

  onShow() {
    // 刷新数据
    this.loadOrderStats()
    this.loadOrders()
  },

  // 加载陪诊员信息
  async loadEscortInfo() {
    try {
      const { data } = await db.collection('escorts')
        .where({
          _openid: '{openid}'
        })
        .get()

      if (data.length > 0) {
        this.setData({
          escortInfo: data[0],
          isOnline: data[0].isOnline || false
        })
      }
    } catch (err) {
      console.error('加载陪诊员信息失败', err)
    }
  },

  // 加载订单统计
  async loadOrderStats() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOrderStats'
      })

      if (result.success) {
        this.setData({
          todayOrders: result.data.today,
          monthOrders: result.data.month,
          totalOrders: result.data.total
        })
      }
    } catch (err) {
      console.error('加载订单统计失败', err)
    }
  },

  // 切换在线状态
  async toggleOnlineStatus(e) {
    const isOnline = e.detail.value

    wx.showLoading({
      title: isOnline ? '上线中...' : '下线中...'
    })

    try {
      await wx.cloud.callFunction({
        name: 'updateEscortStatus',
        data: { isOnline }
      })

      this.setData({ isOnline })
      wx.showToast({
        title: isOnline ? '已上线' : '已下线',
        icon: 'success'
      })
    } catch (err) {
      console.error('更新状态失败', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
      // 恢复开关状态
      this.setData({
        isOnline: !isOnline
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: parseInt(tab),
      page: 1
    }, () => {
      this.loadOrders()
    })
  },

  // 加载订单列表
  async loadOrders(append = false) {
    const { currentTab, page, pageSize } = this.data

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getEscortOrders',
        data: {
          type: currentTab,
          page,
          pageSize
        }
      })

      if (result.success) {
        const list = result.data.list.map(order => ({
          ...order,
          createTime: this.formatTime(order.createTime)
        }))

        const key = currentTab === 0 ? 'newOrders' : 
                   currentTab === 1 ? 'processingOrders' : 'historyOrders'

        this.setData({
          [key]: append ? [...this.data[key], ...list] : list,
          hasMore: list.length === pageSize
        })
      }
    } catch (err) {
      console.error('加载订单列表失败', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 接单
  async acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    try {
      wx.showLoading({ title: '处理中...' })
      
      const { result } = await wx.cloud.callFunction({
        name: 'updateOrderStatus',
        data: {
          orderId,
          status: 'ACCEPTED',
          location: await this.getCurrentLocation()
        }
      })

      if (result.success) {
        wx.showToast({
          title: '接单成功',
          icon: 'success'
        })
        this.refreshOrderList()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      wx.showToast({
        title: err.message || '接单失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 到达医院
  async arrivedHospital(e) {
    const orderId = e.currentTarget.dataset.id
    
    try {
      wx.showLoading({ title: '处理中...' })
      
      const location = await this.getCurrentLocation()
      // 验证是否在医院范围内
      if (!await this.verifyHospitalLocation(orderId, location)) {
        throw new Error('请在医院范围内签到')
      }

      const { result } = await wx.cloud.callFunction({
        name: 'updateOrderStatus',
        data: {
          orderId,
          status: 'ARRIVED',
          location
        }
      })

      if (result.success) {
        wx.showToast({
          title: '签到成功',
          icon: 'success'
        })
        this.refreshOrderList()
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      wx.showToast({
        title: err.message || '签到失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 开始服务
  async startService(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '开始服务',
      content: '确认开始提供陪诊服务？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' })
            
            const { result } = await wx.cloud.callFunction({
              name: 'updateOrderStatus',
              data: {
                orderId,
                status: 'PROCESSING',
                location: await this.getCurrentLocation()
              }
            })

            if (result.success) {
              wx.showToast({
                title: '已开始服务',
                icon: 'success'
              })
              this.refreshOrderList()
            } else {
              throw new Error(result.message)
            }
          } catch (err) {
            wx.showToast({
              title: err.message || '操作失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 完成服务
  async completeService(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '完成服务',
      content: '确认已完成本次陪诊服务？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '处理中...' })
            
            const { result } = await wx.cloud.callFunction({
              name: 'updateOrderStatus',
              data: {
                orderId,
                status: 'COMPLETED',
                location: await this.getCurrentLocation()
              }
            })

            if (result.success) {
              wx.showToast({
                title: '服务已完成',
                icon: 'success'
              })
              this.refreshOrderList()
            } else {
              throw new Error(result.message)
            }
          } catch (err) {
            wx.showToast({
              title: err.message || '操作失败',
              icon: 'none'
            })
          } finally {
            wx.hideLoading()
          }
        }
      }
    })
  },

  // 下拉刷新
  async onRefresh() {
    this.setData({
      refreshing: true,
      page: 1
    })

    await Promise.all([
      this.loadOrderStats(),
      this.loadOrders()
    ])

    this.setData({
      refreshing: false
    })
  },

  // 加载更多
  onLoadMore() {
    if (this.data.hasMore) {
      this.setData({
        page: this.data.page + 1
      }, () => {
        this.loadOrders(true)
      })
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  },

  // 开始位置更新
  startLocationUpdate() {
    if (!this.data.isOnline) return
    
    wx.startLocationUpdate({
      success: () => {
        // 监听位置变化
        wx.onLocationChange(this.updateLocation)
      },
      fail: (err) => {
        console.error('开启位置更新失败', err)
        wx.showToast({
          title: '请开启位置权限',
          icon: 'none'
        })
      }
    })
  },

  // 停止位置更新
  stopLocationUpdate() {
    wx.stopLocationUpdate()
    wx.offLocationChange(this.updateLocation)
  },

  // 更新位置信息
  updateLocation(location) {
    wx.cloud.callFunction({
      name: 'updateLocation',
      data: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }).catch(err => {
      console.error('更新位置失败', err)
    })
  },

  // 加载统计数据
  async loadStats() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getWorkspaceStats'
      })

      if (result.success) {
        this.setData({
          stats: result.data
        })
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('加载统计数据失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  }
}) 