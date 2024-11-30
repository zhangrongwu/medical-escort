Page({
  data: {
    // 可以添加一些动态数据
  },

  copyText: function(e) {
    const text = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
      }
    })
  }
}) 