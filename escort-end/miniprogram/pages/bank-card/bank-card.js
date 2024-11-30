const app = getApp()

Page({
  data: {
    cards: [],
    loading: false,
    isSelectMode: false,  // 是否是选择模式
    selectedId: '',       // 选中的卡片ID
    showDeleteConfirm: false,
    deleteId: ''         // 待删除的卡片ID
  },

  onLoad(options) {
    // 判断是否是选择模式
    if (options.select) {
      this.setData({ isSelectMode: true })
    }
    this.loadCards()
  },

  // 加载银行卡列表
  async loadCards() {
    this.setData({ loading: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getBankCards'
      })

      if (result.success) {
        // 处理卡号显示
        const cards = result.data.map(card => ({
          ...card,
          cardNumber: card.cardNumber.slice(-4)  // 只显示后四位
        }))
        this.setData({ cards })
      }
    } catch (err) {
      console.error('加载银行卡失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 选择银行卡
  selectCard(e) {
    if (!this.data.isSelectMode) return
    
    const id = e.currentTarget.dataset.id
    this.setData({ selectedId: id })

    // 返回选中的卡片信息
    const selectedCard = this.data.cards.find(card => card._id === id)
    if (selectedCard) {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      prevPage.setData({
        selectedCard: selectedCard
      })
      wx.navigateBack()
    }
  },

  // 设为默认卡
  async setDefault(e) {
    const id = e.currentTarget.dataset.id

    try {
      wx.showLoading({ title: '设置中...' })

      const { result } = await wx.cloud.callFunction({
        name: 'setDefaultCard',
        data: { cardId: id }
      })

      if (result.success) {
        // 更新本地数据
        const cards = this.data.cards.map(card => ({
          ...card,
          isDefault: card._id === id
        }))
        this.setData({ cards })

        wx.showToast({
          title: '设置成功',
          icon: 'success'
        })
      }
    } catch (err) {
      console.error('设置默认卡失败:', err)
      wx.showToast({
        title: '设置失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 显示删除确认
  deleteCard(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      showDeleteConfirm: true,
      deleteId: id
    })
  },

  // 隐藏删除确认
  hideDeleteConfirm() {
    this.setData({
      showDeleteConfirm: false,
      deleteId: ''
    })
  },

  // 确认删除
  async confirmDelete() {
    try {
      wx.showLoading({ title: '删除中...' })

      const { result } = await wx.cloud.callFunction({
        name: 'deleteBankCard',
        data: { cardId: this.data.deleteId }
      })

      if (result.success) {
        // 更新本地数据
        const cards = this.data.cards.filter(
          card => card._id !== this.data.deleteId
        )
        this.setData({ cards })

        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
      }
    } catch (err) {
      console.error('删除银行卡失败:', err)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      this.hideDeleteConfirm()
    }
  },

  // 添加银行卡
  addCard() {
    wx.navigateTo({
      url: '/pages/add-card/add-card'
    })
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '银行卡管理',
      path: '/pages/bank-card/bank-card'
    }
  }
}) 