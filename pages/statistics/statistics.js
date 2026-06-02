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

  onExportExcel() {
    const records = storage.getRecordsByMonth(this.data.currentMonth);
    if (records.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' });
      return;
    }

    const CATEGORY_NAMES = {
      catering: '餐饮', transport: '交通', shopping: '购物',
      entertainment: '娱乐', living: '居住', medical: '医疗',
      education: '教育', other: '其他'
    };

    // 构造CSV内容
    let csv = '\uFEFF日期,分类,金额,备注\n'; // BOM for Excel UTF-8
    records.forEach(r => {
      const cat = CATEGORY_NAMES[r.category] || r.category;
      const remark = (r.remark || '').replace(/"/g, '""');
      csv += `"${r.date}","${cat}","${r.amount}","${remark}"\n`;
    });

    const fileName = `${this.data.currentMonth}支出记录.csv`;
    const fs = wx.getFileSystemManager();

    // 写入临时文件
    const tempFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
    fs.writeFile({
      filePath: tempFilePath,
      data: csv,
      encoding: 'utf8',
      success: () => {
        wx.openDocument({
          filePath: tempFilePath,
          fileType: 'csv',
          showMenu: true,
          success: () => console.log('Excel打开成功'),
          fail: err => {
            wx.showToast({ title: '打开文件失败', icon: 'none' });
            console.error(err);
          }
        });
      },
      fail: err => {
        wx.showToast({ title: '创建文件失败', icon: 'none' });
        console.error(err);
      }
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