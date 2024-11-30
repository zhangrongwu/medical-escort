Page({
  data: {
    searchKey: '',
    currentCategory: 0,
    categories: [
      {
        id: 1,
        name: '基础问题',
        icon: '/images/help-basic.png'
      },
      {
        id: 2,
        name: '订单相关',
        icon: '/images/help-order.png'
      },
      {
        id: 3,
        name: '收入结算',
        icon: '/images/help-income.png'
      },
      {
        id: 4,
        name: '账号安全',
        icon: '/images/help-account.png'
      }
    ],
    questionList: [
      {
        id: 1,
        category: 0,
        question: '如何成为陪诊员？',
        answer: '您需要完成以下步骤：1. 注册账号 2. 提交实名认证 3. 上传健康证等资质 4. 通过平台审核 5. 完成岗前培训',
        expanded: false
      },
      {
        id: 2,
        category: 0,
        question: '陪诊服务范围包括哪些？',
        answer: '主要服务包括：1. 预约挂号 2. 就医陪护 3. 取送检查报告 4. 代取药品 5. 术后陪护等',
        expanded: false
      },
      {
        id: 3,
        category: 1,
        question: '如何接单？',
        answer: '打开工作台页面，开启接单开关，系统会自动推送符合您服务范围的订单。您也可以在订单列表中主动抢单。',
        expanded: false
      },
      {
        id: 4,
        category: 2,
        question: '收入何时结算？',
        answer: '订单完成后，系统会在T+1日自动结算到您的账户余额。每周一统一提现到绑定的银行卡。',
        expanded: false
      }
    ]
  },

  onLoad() {
    this.filterQuestions()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKey: e.detail.value
    }, this.filterQuestions)
  },

  // 切换分类
  switchCategory(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentCategory: index
    }, this.filterQuestions)
  },

  // 筛选问题
  filterQuestions() {
    const { searchKey, currentCategory, questionList } = this.data
    let filteredList = questionList

    // 按分类筛选
    if (currentCategory !== 0) {
      filteredList = filteredList.filter(q => q.category === currentCategory)
    }

    // 按关键词搜索
    if (searchKey) {
      const key = searchKey.toLowerCase()
      filteredList = filteredList.filter(q => 
        q.question.toLowerCase().includes(key) || 
        q.answer.toLowerCase().includes(key)
      )
    }

    this.setData({
      filteredQuestions: filteredList
    })
  },

  // 展开/收起问题
  toggleQuestion(e) {
    const index = e.currentTarget.dataset.index
    const key = `questionList[${index}].expanded`
    this.setData({
      [key]: !this.data.questionList[index].expanded
    })
  },

  // 拨打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: '400-888-8888',
      fail: (err) => {
        console.error('拨打电话失败:', err)
        wx.showToast({
          title: '拨打失败',
          icon: 'none'
        })
      }
    })
  },

  // 跳转到反馈页
  navigateToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  }
}) 