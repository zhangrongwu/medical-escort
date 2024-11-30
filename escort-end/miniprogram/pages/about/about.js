const app = getApp()

Page({
  data: {
    version: '1.0.0',
    phone: '400-888-8888',
    email: 'support@mediguide.com',
    website: 'www.mediguide.com',
    company: '智潮磅礴科技有限公司'
  },

  onLoad() {
    // 获取小程序版本信息
    const accountInfo = wx.getAccountInfoSync()
    this.setData({
      version: accountInfo.miniProgram.version || '1.0.0'
    })
  },

  // 复制文本
  copyText(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  },

  // 拨打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.phone,
      fail: (err) => {
        console.error('拨打电话失败:', err)
      }
    })
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // 查看位置
  openLocation() {
    wx.openLocation({
      latitude: 39.9219,  // 替换为实际经纬度
      longitude: 116.4404,
      name: this.data.company,
      address: '北京市朝阳区xxx大厦'  // 替换为实际地址
    })
  }
}) 