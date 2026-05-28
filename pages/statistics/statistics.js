const storage = require('../../utils/storage');
const dateUtils = require('../../utils/date');

// 分类映射
const CATEGORY_MAP = {
  catering: { emoji: '🍜', name: '餐饮' },
  transport: { emoji: '🚗', name: '交通' },
  shopping: { emoji: '🛒', name: '购物' },
  entertainment: { emoji: '🎮', name: '娱乐' },
  living: { emoji: '🏠', name: '居住' },
  medical: { emoji: '💊', name: '医疗' },
  education: { emoji: '📚', name: '教育' },
  other: { emoji: '📌', name: '其他' }
};

Page({
  data: {
    currentMonth: dateUtils.getCurrentMonth(),
    monthTotal: 0,
    budget: 0,
    budgetPercent: 0,
    categoryStats: []
  },

  onShow() {
    this.setData({ currentMonth: dateUtils.getCurrentMonth() });
    this.loadStats();
  },

  loadStats() {
    const stats = storage.getMonthStatsByCategory(this.data.currentMonth);
    const total = storage.getMonthTotal(this.data.currentMonth);
    const budget = storage.getMonthBudget(this.data.currentMonth);

    // 计算进度百分比
    let budgetPercent = 0;
    if (budget > 0) {
      budgetPercent = Math.min(Math.round((total / budget) * 100), 100);
    }

    // 转换为数组并排序
    const entries = Object.entries(stats).map(([key, value]) => {
      const cat = CATEGORY_MAP[key] || CATEGORY_MAP.other;
      return {
        key,
        emoji: cat.emoji,
        name: cat.name,
        amount: value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    this.setData({
      monthTotal: total.toFixed(2),
      budget,
      budgetPercent,
      categoryStats: entries
    });
  },

  // 设置预算
  onSetBudget() {
    wx.showModal({
      title: '设置月度预算',
      editable: true,
      placeholderText: '输入预算金额',
      success: res => {
        if (res.confirm && res.content) {
          storage.setMonthBudget(this.data.currentMonth, res.content);
          this.loadStats();
        }
      }
    });
  }
});