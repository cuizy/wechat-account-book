const storage = require('../../utils/storage');
const dateUtils = require('../../utils/date');
const category = require('../../utils/category');

Page({
  data: {
    currentMonth: dateUtils.getCurrentMonth(),
    records: [],
    monthTotal: 0,
    months: [],
    selectedMonth: '',
    searchKeyword: ''
  },

  onLoad() {
    this.initMonths();
  },

  onShow() {
    this.setData({ currentMonth: dateUtils.getCurrentMonth() });
    this.loadRecords();
  },

  initMonths() {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(dateUtils.getCurrentMonth(d));
    }
    this.setData({
      months,
      selectedMonth: months[0],
      monthIndex: 0
    });
  },

  onMonthChange(e) {
    const idx = e.detail.value;
    const month = this.data.months[idx];
    this.setData({ selectedMonth: month });
    this.loadRecords();
  },

  onSearch(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.loadRecords();
  },

  loadRecords() {
    const records = storage.searchRecords(this.data.searchKeyword, this.data.selectedMonth);
    const formatted = records.map(r => {
      const cat = category.getCategory(r.category);
      return { ...r, emoji: cat.emoji, categoryName: cat.name };
    });
    const total = storage.getMonthTotal(this.data.selectedMonth);
    this.setData({ records: formatted, monthTotal: total.toFixed(2) });
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复',
      success: res => {
        if (res.confirm) {
          storage.deleteRecord(id);
          this.loadRecords();
        }
      }
    });
  }
});