const storage = require('../../utils/storage');
const dateUtils = require('../../utils/date');

Page({
  data: {
    currentMonth: dateUtils.getCurrentMonth(),
    amount: '',
    selectedCategory: '',
    selectedDate: dateUtils.formatDate(new Date()),
    remark: '',
    imagePath: '',
    categories: [],
    todayTotal: 0
  },

  onShow() {
    this.setData({
      currentMonth: dateUtils.getCurrentMonth(),
      selectedDate: dateUtils.formatDate(new Date()),
      categories: storage.getCategories()
    });
    this.calculateTodayTotal();
  },

  onAmountInput(e) {
    this.setData({ amount: e.detail.value });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  onAddImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ imagePath: res.tempFilePaths[0] });
      }
    });
  },

  onRemoveImage() {
    this.setData({ imagePath: '' });
  },

  onCategorySelect(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ selectedCategory: value });
  },

  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
  },

  onSubmit() {
    const { amount, selectedCategory, selectedDate, remark, imagePath } = this.data;

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
      remark,
      imagePath
    });

    wx.showToast({ title: '记账成功', icon: 'success' });

    this.setData({
      amount: '',
      selectedCategory: '',
      remark: '',
      imagePath: ''
    });
    this.calculateTodayTotal();
  },

  calculateTodayTotal() {
    const today = dateUtils.formatDate(new Date());
    const records = storage.getRecordsByMonth(this.data.currentMonth);
    const todayRecords = records.filter(r => r.date === today);
    const total = todayRecords.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    this.setData({ todayTotal: total.toFixed(2) });
  }
});