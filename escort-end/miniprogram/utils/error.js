// 统一错误处理
export const handleError = (err, title = '操作失败') => {
  console.error(err)
  wx.showToast({
    title: err.message || title,
    icon: 'none'
  })
}

// 网络错误处理
export const handleNetworkError = () => {
  wx.showToast({
    title: '网络异常,请检查网络连接',
    icon: 'none'
  })
}

// 权限错误处理
export const handleAuthError = () => {
  wx.showModal({
    title: '提示',
    content: '您还未登录,是否前往登录?',
    success: (res) => {
      if (res.confirm) {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    }
  })
} 