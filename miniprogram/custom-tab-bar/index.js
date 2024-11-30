Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#1296db",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        icon: "icon-home"
      },
      {
        pagePath: "/pages/appointment/appointment",
        text: "预约",
        icon: "icon-appointment"
      },
      {
        pagePath: "/pages/order/order",
        text: "订单",
        icon: "icon-order"
      },
      {
        pagePath: "/pages/user/user",
        text: "我的",
        icon: "icon-user"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url
      })
      this.setData({
        selected: data.index
      })
    }
  }
}) 