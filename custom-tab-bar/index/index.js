const app = getApp()
Component({
  data: {
    selected: 0,
    list: [
      { text: '记账', icon: 'icon记账', activeIcon: 'icon记账-active' },
      { text: '账单', icon: 'icon账单', activeIcon: 'icon账单-active' },
      { text: '报表', icon: 'icon报表', activeIcon: 'icon报表-active' },
      { text: '我的', icon: 'icon我的', activeIcon: 'icon我的-active' }
    ]
  },
  attached() {
    this.switchTab(app.globalData.currentTab || 0)
  },
  methods: {
    switchTab(index) {
      const pages = ['/pages/index/index', '/pages/list/list', '/pages/statistics/statistics', '/pages/profile/profile']
      app.globalData.currentTab = index
      this.setData({ selected: index })
      wx.switchTab({ url: pages[index] })
    }
  }
})