const app = getApp()

Page({
  data: {
    balance: '0.00',
    amount: '',
    selectedCard: null,
    canSubmit: false,
    showConfirm: false,
    withdrawLimit: {
      min: 1,
      max: 50000,
      dailyCount: 3,
      remainCount: 3
    }
  },

  onLoad() {
    this.loadBalance()
    this.loadDefaultCard()
    this.checkWithdrawLimit()
  },

  // 加载余额
  async loadBalance() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getIncomeStats'
      })

      if (result.success) {
        this.setData({
          balance: (result.data.balance / 100).toFixed(2)
        })
      }
    } catch (err) {
      console.error('加载余额失败:', err)
    }
  },

  // 加载默认银行卡
  async loadDefaultCard() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getDefaultBankCard'
      })

      if (result.success && result.data) {
        this.setData({
          selectedCard: result.data
        }, this.checkCanSubmit)
      }
    } catch (err) {
      console.error('加载银行卡失败:', err)
    }
  },

  // 检查提现限制
  async checkWithdrawLimit() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getWithdrawLimit'
      })

      if (result.success) {
        this.setData({
          withdrawLimit: result.data
        })
      }
    } catch (err) {
      console.error('检查提现限制失败:', err)
    }
  },

  // 金额输入
  onAmountInput(e) {
    let value = e.detail.value
    // 限制只能输入两位小数
    value = value.replace(/[^\d.]/g, '')
    value = value.replace(/\.{2,}/g, '.')
    value = value.replace(/^(\d+)\.(\d\d).*$/, '$1.$2')

    this.setData({
      amount: value
    }, this.checkCanSubmit)
  },

  // 全部提现
  setFullAmount() {
    this.setData({
      amount: this.data.balance
    }, this.checkCanSubmit)
  },

  // 选择银行卡
  selectCard() {
    wx.navigateTo({
      url: '/pages/bank-card/bank-card?select=true'
    })
  },

  // 检查是否可提现
  checkCanSubmit() {
    const { amount, selectedCard, balance, withdrawLimit } = this.data
    const amountNum = parseFloat(amount)
    const balanceNum = parseFloat(balance)

    const canSubmit = 
      amount && 
      selectedCard && 
      amountNum >= withdrawLimit.min && 
      amountNum <= Math.min(balanceNum, withdrawLimit.max) &&
      withdrawLimit.remainCount > 0

    this.setData({ canSubmit })
  },

  // 显示确认弹窗
  handleWithdraw() {
    if (!this.data.canSubmit) return
    this.setData({ showConfirm: true })
  },

  // 隐藏确认弹窗
  hideConfirm() {
    this.setData({ showConfirm: false })
  },

  // 确认提现
  async confirmWithdraw() {
    try {
      wx.showLoading({ title: '提交中...' })

      const { result } = await wx.cloud.callFunction({
        name: 'withdraw',
        data: {
          amount: parseFloat(this.data.amount) * 100, // 转为分
          cardId: this.data.selectedCard._id
        }
      })

      if (result.success) {
        wx.showToast({
          title: '提现申请成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('提现失败:', err)
      wx.showToast({
        title: err.message || '提现失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
      this.hideConfirm()
    }
  }
}) 