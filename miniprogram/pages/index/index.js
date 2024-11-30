import { icons } from '../../utils/icons'

const db = wx.cloud.database()

Page({
  data: {
    searchKey: '',
    banners: [],
    serviceTypes: [
      {
        id: 1,
        name: '医院陪诊',
        icon: 'icon-hospital'
      },
      {
        id: 2,
        name: '急诊陪护',
        icon: 'icon-emergency'
      },
      {
        id: 3,
        name: '术后照护',
        icon: 'icon-care'
      },
      {
        id: 4,
        name: '养老陪护',
        icon: 'icon-elderly'
      }
    ],
    hospitals: [],
    escorts: []
  },

  onLoad: function() {
    this.loadBanners()
    this.loadHospitals()
    this.loadEscorts()
  },

  onPullDownRefresh: function() {
    Promise.all([
      this.loadBanners(),
      this.loadHospitals(),
      this.loadEscorts()
    ]).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载轮播图数据
  loadBanners: function() {
    return db.collection('banners')
      .where({ status: 'active' })
      .limit(5)
      .get()
      .then(res => {
        this.setData({
          banners: res.data
        })
      })
  },

  // 加载医院数据
  loadHospitals: function() {
    return db.collection('hospitals')
      .where({ status: 'active' })
      .orderBy('orderCount', 'desc')
      .limit(3)
      .get()
      .then(res => {
        this.setData({
          hospitals: res.data
        })
      })
  },

  // 加载陪诊员数据
  loadEscorts: function() {
    return db.collection('escorts')
      .where({ 
        status: 'active',
        isRecommended: true
      })
      .orderBy('score', 'desc')
      .limit(3)
      .get()
      .then(res => {
        this.setData({
          escorts: res.data
        })
      })
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKey: e.detail.value
    })
  },

  // 点击轮播图
  onBannerTap: function(e) {
    const id = e.currentTarget.dataset.id
    const banner = this.data.banners.find(item => item.id === id)
    if (banner.linkType === 'webview') {
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(banner.linkUrl)}`
      })
    } else if (banner.linkType === 'page') {
      wx.navigateTo({
        url: banner.linkUrl
      })
    }
  },

  // 导航到服务页面
  navigateToService: function(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/service/service?type=${type}`
    })
  },

  // 导航到医院列表
  navigateToHospitals: function() {
    wx.navigateTo({
      url: '/pages/hospitals/hospitals'
    })
  },

  // 导航到医院详情
  navigateToHospital: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/hospital-detail/hospital-detail?id=${id}`
    })
  },

  // 导航到陪诊员列表
  navigateToEscorts: function() {
    wx.navigateTo({
      url: '/pages/escorts/escorts'
    })
  },

  // 导航到陪诊员详情
  navigateToEscort: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/escort-detail/escort-detail?id=${id}`
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  onSearchTap() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  // 格式化医院地址
  formatAddress(address) {
    return address.length > 15 ? address.substring(0, 15) + '...' : address
  },

  // 处理图片加载失败
  onImageError(e) {
    const type = e.currentTarget.dataset.type
    const index = e.currentTarget.dataset.index
    const defaultImages = {
      banner: '/images/default-banner.png',
      hospital: '/images/default-hospital.png',
      avatar: '/images/default-avatar.png'
    }
    
    const key = `${type}s[${index}].imageUrl`
    this.setData({
      [key]: defaultImages[type]
    })
  }
}) 