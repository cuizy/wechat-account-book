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

module.exports = {
  addRecord,
  getRecords,
  getRecordsByMonth,
  deleteRecord,
  clearRecords,
  getMonthTotal,
  getTotalAmount,
  getTotalCount,
  getMonthStatsByCategory
};