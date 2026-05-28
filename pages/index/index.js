const storage = require('../../utils/storage');
const dateUtils = require('../../utils/date');

// 默认分类
const CATEGORIES = [
  { name: '餐饮', emoji: '🍜', value: 'catering' },
  { name: '交通', emoji: '🚗', value: 'transport' },
  { name: '购物', emoji: '🛒', value: 'shopping' },
  { name: '娱乐', emoji: '🎮', value: 'entertainment' },
  { name: '居住', emoji: '🏠', value: 'living' },
  { name: '医疗', emoji: '💊', value: 'medical' },
  { name: '教育', emoji: '📚', value: 'education' },
  { name: '其他', emoji: '📌', value: 'other' }
];

Page({
  data: {
    currentMonth: dateUtils.getCurrentMonth(),
    amount: '',
    selectedCategory: '',
    selectedDate: dateUtils.formatDate(new Date()),
    remark: '',
    categories: CATEGORIES,
    todayTotal: 0
  },

  onShow() {
    this.setData({
      currentMonth: dateUtils.getCurrentMonth(),
      selectedDate: dateUtils.formatDate(new Date())
    });
    this.calculateTodayTotal();
  },

  // 金额输入
  onAmountInput(e) {
    this.setData({ amount: e.detail.value });
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  // 选择分类
  onCategorySelect(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ selectedCategory: value });
  },

  // 选择日期
  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
  },

  // 提交记账
  onSubmit() {
    const { amount, selectedCategory, selectedDate, remark } = this.data;

    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }
    if (!selectedCategory) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }

    storage.addRecord({
      amount,
      category: selectedCategory,
      date: selectedDate,
      remark
    });

    wx.showToast({ title: '记账成功', icon: 'success' });

    // 重置表单
    this.setData({
      amount: '',
      selectedCategory: '',
      remark: ''
    });
    this.calculateTodayTotal();
  },

  // 计算今日支出
  calculateTodayTotal() {
    const today = dateUtils.formatDate(new Date());
    const records = storage.getRecordsByMonth(this.data.currentMonth);
    const todayRecords = records.filter(r => r.date === today);
    const total = todayRecords.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    this.setData({ todayTotal: total.toFixed(2) });
  }
});