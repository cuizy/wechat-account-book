const storage = require('../../utils/storage');

Page({
  data: {
    totalCount: 0,
    totalAmount: 0
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    this.setData({
      totalCount: storage.getTotalCount(),
      totalAmount: storage.getTotalAmount().toFixed(2)
    });
  },

  onClearData() {
    wx.showModal({
      title: '确认清除',
      content: '所有记账数据将被永久删除，确定吗？',
      success: res => {
        if (res.confirm) {
          storage.clearRecords();
          wx.showToast({ title: '已清除', icon: 'success' });
          this.loadData();
        }
      }
    });
  }
});