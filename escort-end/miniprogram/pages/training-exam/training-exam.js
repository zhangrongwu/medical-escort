const app = getApp()

Page({
  data: {
    trainingId: '',
    examInfo: null,
    currentQuestion: 0,
    answers: [],
    timeLeft: 0,
    timer: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ trainingId: options.id })
      this.loadExamInfo()
    }
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  // 加载考试信息
  async loadExamInfo() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getTrainingExam',
        data: { trainingId: this.data.trainingId }
      })

      if (result.success) {
        this.setData({
          examInfo: result.data,
          timeLeft: result.data.duration * 60,
          answers: new Array(result.data.questions.length).fill(null)
        })
        this.startTimer()
      }
    } catch (err) {
      console.error('加载考试信息失败', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 开始计时
  startTimer() {
    this.data.timer = setInterval(() => {
      if (this.data.timeLeft > 0) {
        this.setData({
          timeLeft: this.data.timeLeft - 1
        })
      } else {
        clearInterval(this.data.timer)
        this.submitExam()
      }
    }, 1000)
  },

  // 选择答案
  selectAnswer(e) {
    const { index } = e.currentTarget.dataset
    const answers = [...this.data.answers]
    answers[this.data.currentQuestion] = index
    this.setData({ answers })
  },

  // 上一题
  prevQuestion() {
    if (this.data.currentQuestion > 0) {
      this.setData({
        currentQuestion: this.data.currentQuestion - 1
      })
    }
  },

  // 下一题
  nextQuestion() {
    if (this.data.currentQuestion < this.data.examInfo.questions.length - 1) {
      this.setData({
        currentQuestion: this.data.currentQuestion + 1
      })
    }
  },

  // 提交考试
  async submitExam() {
    if (this.data.answers.includes(null)) {
      wx.showModal({
        title: '提示',
        content: '还有题目未作答，确定提交吗？',
        success: (res) => {
          if (res.confirm) {
            this.doSubmit()
          }
        }
      })
    } else {
      this.doSubmit()
    }
  },

  // 执行提交
  async doSubmit() {
    wx.showLoading({
      title: '提交中...'
    })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'submitTrainingExam',
        data: {
          trainingId: this.data.trainingId,
          answers: this.data.answers
        }
      })

      if (result.success) {
        wx.redirectTo({
          url: `/pages/exam-result/exam-result?score=${result.data.score}`
        })
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('提交考试失败', err)
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 格式化剩余时间
  formatTimeLeft() {
    const minutes = Math.floor(this.data.timeLeft / 60)
    const seconds = this.data.timeLeft % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
}) 