Component({
  properties: {
    image: {
      type: String,
      value: '/images/empty.png'
    },
    text: {
      type: String,
      value: '暂无数据'
    },
    actionText: {
      type: String,
      value: ''
    }
  },

  methods: {
    onAction() {
      this.triggerEvent('action')
    }
  }
}) 