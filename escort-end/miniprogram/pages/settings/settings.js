// pages/settings/settings.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    settings: {
      orderNotify: true,
      messageNotify: true,
      soundNotify: true,
      locationService: true,
      showOnlineStatus: true
    },
    cacheSize: '0KB',
    version: '1.0.0'
  },

  onLoad() {
    this.loadUserInfo()
    this.loadSettings()
    this.calculateCacheSize()
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getEscortInfo'
      })

      if (result.success) {
        this.setData({
          userInfo: result.data
        })
      }
    } catch (err) {
      console.error('加载用户信息失败:', err)
    }
  },

  // 加载设置
  loadSettings() {
    const settings = wx.getStorageSync('settings') || this.data.settings
    this.setData({ settings })
  },

  // 计算缓存大小
  async calculateCacheSize() {
    try {
      const { size } = await wx.getStorageInfo()
      const sizeStr = size < 1024 ? 
        size + 'KB' : 
        (size / 1024).toFixed(2) + 'MB'
      this.setData({ cacheSize: sizeStr })
    } catch (err) {
      console.error('获取缓存大小失败:', err)
    }
  },

  // 切换设置开关
  async toggleSetting(key, value) {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'updateSettings',
        data: {
          [key]: value
        }
      })

      if (result.success) {
        const settings = { ...this.data.settings }
        settings[key] = value
        this.setData({ settings })
        wx.setStorageSync('settings', settings)
        
        wx.showToast({
          title: '设置已更新',
          icon: 'success'
        })
      }
    } catch (err) {
      console.error('更新设置失败:', err)
      wx.showToast({
        title: '设置失败',
        icon: 'none'
      })
    }
  },

  // 订单通知开关
  toggleOrderNotify(e) {
    this.toggleSetting('orderNotify', e.detail.value)
  },

  // 消息通知开关
  toggleMessageNotify(e) {
    this.toggleSetting('messageNotify', e.detail.value)
  },

  // 声音提示开关
  toggleSoundNotify(e) {
    this.toggleSetting('soundNotify', e.detail.value)
  },

  // 位置服务开关
  toggleLocationService(e) {
    this.toggleSetting('locationService', e.detail.value)
  },

  // 在线状态开关
  toggleOnlineStatus(e) {
    this.toggleSetting('showOnlineStatus', e.detail.value)
  },

  // 清除缓存
  async clearCache() {
    try {
      await wx.clearStorage()
      this.calculateCacheSize()
      wx.showToast({
        title: '清除成功',
        icon: 'success'
      })
    } catch (err) {
      console.error('清除缓存失败:', err)
      wx.showToast({
        title: '清除失败',
        icon: 'none'
      })
    }
  },

  // 检查更新
  checkUpdate() {
    const updateManager = wx.getUpdateManager()
    
    updateManager.onCheckForUpdate(res => {
      if (res.hasUpdate) {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      } else {
        wx.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }
    })
  },

  // 页面导航
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({ url })
  }
})