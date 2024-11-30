Page({
  data: {
    updateTime: '2024年01月01日',
    company: '智潮磅礴科技有限公司',
    contact: {
      phone: '400-888-8888',
      email: 'privacy@mediguide.com',
      address: '北京市朝阳区xxx大厦'
    }
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
      phoneNumber: this.data.contact.phone,
      fail: (err) => {
        console.error('拨打电话失败:', err)
      }
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '医诊助手隐私政策',
      path: '/pages/privacy/privacy'
    }
  }
}) 