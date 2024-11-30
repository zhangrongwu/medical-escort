const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    addresses: [],
    isSelect: false  // 是否是选择地址场景
  },

  onLoad(options) {
    if (options.select) {
      this.setData({
        isSelect: true
      })
    }
  },

  onShow() {
    this.loadAddresses()
  },

  // 加载地址列表
  loadAddresses() {
    db.collection('addresses')
      .where({
        _openid: '{openid}'
      })
      .orderBy('isDefault', 'desc')
      .get()
      .then(res => {
        this.setData({
          addresses: res.data
        })
      })
  },

  // 选择地址
  selectAddress(e) {
    if (!this.data.isSelect) return
    
    const id = e.currentTarget.dataset.id
    const address = this.data.addresses.find(item => item._id === id)
    
    // 返回选中的地址
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    prevPage.setData({
      selectedAddress: address
    })
    wx.navigateBack()
  },

  // 设为默认地址
  setDefault(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showLoading({
      title: '设置中...'
    })

    // 调用云函数设置默认地址
    wx.cloud.callFunction({
      name: 'setDefaultAddress',
      data: { addressId: id }
    }).then(() => {
      wx.hideLoading()
      wx.showToast({
        title: '设置成功',
        icon: 'success'
      })
      this.loadAddresses()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '设置失败',
        icon: 'none'
      })
    })
  },

  // 编辑地址
  editAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/address-form/address-form?id=${id}`
    })
  },

  // 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          })

          db.collection('addresses').doc(id).remove()
            .then(() => {
              wx.hideLoading()
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadAddresses()
            })
            .catch(() => {
              wx.hideLoading()
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            })
        }
      }
    })
  },

  // 新增地址
  addAddress() {
    wx.navigateTo({
      url: '/pages/address-form/address-form'
    })
  },

  // 导入微信收货地址
  importFromWx() {
    wx.chooseAddress({
      success: (res) => {
        // 转换为我们的地址格式
        const address = {
          name: res.userName,
          phone: res.telNumber,
          region: [res.provinceName, res.cityName, res.countyName],
          detail: res.detailInfo,
          isDefault: false
        }

        // 保存到数据库
        db.collection('addresses').add({
          data: address
        }).then(() => {
          wx.showToast({
            title: '导入成功',
            icon: 'success'
          })
          this.loadAddresses()
        }).catch(() => {
          wx.showToast({
            title: '导入失败',
            icon: 'none'
          })
        })
      }
    })
  }
}) 