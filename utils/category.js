// 分类字典共享
// 之前在 list.js / statistics.js 重复 3 次,这里单一来源

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

// 获取某分类的 emoji+name,缺省回退到 other
function getCategory(value) {
  return CATEGORY_MAP[value] || CATEGORY_MAP.other;
}

// 只取名字(用于 Excel 导出)
function getCategoryName(value) {
  return getCategory(value).name;
}

module.exports = {
  CATEGORY_MAP,
  getCategory,
  getCategoryName
};
