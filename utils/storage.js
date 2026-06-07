// 本地存储封装

const STORAGE_KEY = 'account_data';

/**
 * 生成唯一 ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 获取所有数据
 */
function getData() {
  return wx.getStorageSync(STORAGE_KEY) || { records: [] };
}

/**
 * 添加一条记账记录
 */
function addRecord(record) {
  const data = getData();
  const newRecord = {
    id: generateId(),
    amount: parseFloat(record.amount).toFixed(2),
    category: record.category,
    date: record.date,
    remark: record.remark || '',
    imagePath: record.imagePath || '',
    createTime: Date.now()
  };
  data.records.unshift(newRecord);
  wx.setStorageSync(STORAGE_KEY, data);
  return newRecord;
}

/**
 * 获取所有记录
 */
function getRecords() {
  return getData().records;
}

/**
 * 按月份筛选记录
 */
function getRecordsByMonth(monthStr) {
  const records = getData().records;
  if (!monthStr) return records;
  return records.filter(r => r.date && r.date.startsWith(monthStr));
}

/**
 * 搜索记录（按备注/分类）
 */
function searchRecords(keyword, monthStr) {
  let records = getRecordsByMonth(monthStr);
  if (!keyword) return records;
  const kw = keyword.toLowerCase();
  return records.filter(r =>
    r.remark.toLowerCase().includes(kw) ||
    r.category.toLowerCase().includes(kw)
  );
}

/**
 * 删除一条记录
 */
function deleteRecord(id) {
  const data = getData();
  data.records = data.records.filter(r => r.id !== id);
  wx.setStorageSync(STORAGE_KEY, data);
}

/**
 * 清除所有记录
 */
function clearRecords() {
  wx.setStorageSync(STORAGE_KEY, { records: [] });
}

/**
 * 计算指定月份的总支出
 */
function getMonthTotal(monthStr) {
  const records = getRecordsByMonth(monthStr);
  return records.reduce((sum, r) => sum + parseFloat(r.amount), 0);
}

/**
 * 计算所有记录的总支出
 */
function getTotalAmount() {
  const records = getData().records;
  return records.reduce((sum, r) => sum + parseFloat(r.amount), 0);
}

/**
 * 获取总记录数
 */
function getTotalCount() {
  return getData().records.length;
}

/**
 * 按分类统计指定月份的支出
 */
function getMonthStatsByCategory(monthStr) {
  const records = getRecordsByMonth(monthStr);
  const stats = {};
  records.forEach(r => {
    if (!stats[r.category]) {
      stats[r.category] = 0;
    }
    stats[r.category] += parseFloat(r.amount);
  });
  return stats;
}

// ==================== 分类管理 ====================

const CATEGORIES_KEY = 'custom_categories';

const DEFAULT_CATEGORIES = [
  { name: '餐饮', emoji: '🍜', value: 'catering', color: '#ff6b6b' },
  { name: '交通', emoji: '🚗', value: 'transport', color: '#4ecdc4' },
  { name: '购物', emoji: '🛒', value: 'shopping', color: '#ff9f43' },
  { name: '娱乐', emoji: '🎮', value: 'entertainment', color: '#a55eea' },
  { name: '居住', emoji: '🏠', value: 'living', color: '#26de81' },
  { name: '医疗', emoji: '💊', value: 'medical', color: '#ff6348' },
  { name: '教育', emoji: '📚', value: 'education', color: '#45aaf2' },
  { name: '其他', emoji: '📌', value: 'other', color: '#95afc0' }
];

/**
 * 获取分类列表（含自定义）
 */
function getCategories() {
  const stored = wx.getStorageSync(CATEGORIES_KEY);
  if (stored && stored.length > 0) return stored;
  return DEFAULT_CATEGORIES;
}

/**
 * 保存自定义分类
 */
function saveCategories(categories) {
  wx.setStorageSync(CATEGORIES_KEY, categories);
}

/**
 * 添加自定义分类
 */
function addCategory(name, emoji, value, color) {
  const cats = getCategories();
  cats.push({ name, emoji, value, color });
  saveCategories(cats);
}

/**
 * 删除自定义分类
 */
function deleteCategory(value) {
  const cats = getCategories().filter(c => c.value !== value);
  saveCategories(cats);
}

// ==================== 预算管理 ====================

const BUDGET_KEY = 'monthly_budget';

/**
 * 获取指定月份的预算
 */
function getMonthBudget(monthStr) {
  const budget = wx.getStorageSync(BUDGET_KEY) || {};
  return budget[monthStr] || 0;
}

/**
 * 设置指定月份的预算
 */
function setMonthBudget(monthStr, amount) {
  const budget = wx.getStorageSync(BUDGET_KEY) || {};
  budget[monthStr] = parseFloat(amount) || 0;
  wx.setStorageSync(BUDGET_KEY, budget);
}

/**
 * 初始化本地存储数据(如果 key 不存在)
 */
function initData() {
  if (!wx.getStorageSync(STORAGE_KEY)) {
    wx.setStorageSync(STORAGE_KEY, { records: [] });
  }
}

module.exports = {
  initData,
  addRecord,
  getRecords,
  getRecordsByMonth,
  searchRecords,
  deleteRecord,
  clearRecords,
  getMonthTotal,
  getTotalAmount,
  getTotalCount,
  getMonthStatsByCategory,
  getCategories,
  addCategory,
  deleteCategory,
  getMonthBudget,
  setMonthBudget
};