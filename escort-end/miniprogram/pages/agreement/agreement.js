Page({
  data: {
    updateTime: '2024年01月01日',
    company: '智潮磅礴科技有限公司',
    contact: {
      phone: '400-888-8888',
      email: 'service@mediguide.com',
      address: '北京市朝阳区xxx大厦'
    }
  },

  // 拨打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.contact.phone,
      fail: (err) => {
        console.error('拨打电话失败:', err)
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        })
      }
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

  // 分享
  onShareAppMessage() {
    return {
      title: '医诊助手陪诊员服务协议',
      path: '/pages/agreement/agreement'
    }
  },

  // 保存协议记录
  async saveAgreementLog() {
    try {
      await wx.cloud.callFunction({
        name: 'saveAgreementLog',
        data: {
          type: 'escort_agreement',
          version: '1.0.0',
          timestamp: new Date().getTime()
        }
      })
    } catch (err) {
      console.error('保存协议记录失败:', err)
    }
  }
}) 