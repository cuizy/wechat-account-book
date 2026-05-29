App({
  onLaunch() {
    // 初始化本地存储数据结构
    const initData = {
      records: []
    };
    wx.getStorage({
      key: 'account_data',
      fail: () => {
        wx.setStorage({ key: 'account_data', data: initData });
      }
    });
  }
});