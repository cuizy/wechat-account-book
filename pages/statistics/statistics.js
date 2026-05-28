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
    categoryStats: [],
    maxAmount: 0
  },

  onShow() {
    this.setData({ currentMonth: dateUtils.getCurrentMonth() });
    this.loadStats();
  },

  loadStats() {
    const stats = storage.getMonthStatsByCategory(this.data.currentMonth);
    const total = storage.getMonthTotal(this.data.currentMonth);

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

    const maxAmount = entries.length > 0 ? entries[0].amount : 0;

    this.setData({
      monthTotal: total.toFixed(2),
      categoryStats: entries,
      maxAmount
    });
  }
});