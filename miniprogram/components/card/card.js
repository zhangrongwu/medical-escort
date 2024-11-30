Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    shadow: {
      type: Boolean,
      value: false
    },
    showMore: {
      type: Boolean,
      value: false
    },
    moreText: {
      type: String,
      value: '查看更多'
    }
  },

  methods: {
    onMore() {
      this.triggerEvent('more')
    }
  }
}) 