# Implementation Plan: 记账小程序 JS 逻辑层轻整理

> **For Hermes:** Use subagent-driven-development skill to execute this plan task-by-task.

**Goal:** 清理 /root/wechat-account-book JS 逻辑层的死代码、重复代码、命名/规范、性能小坑。不改行为,不改架构。

**Architecture:** 纯文件内整理 + 抽一个 utils/category.js 共享 CATEGORY 字典。每个 task = 单文件 / 单职责,独立 commit,行为完全保持。

**Tech Stack:** 微信小程序原生 JS (ES5+), wx API, 无新依赖。

**Reference Spec:** `docs/superpowers/specs/2026-06-07-js-logic-light-refactor.md`

**Baseline Commit:** `e07fa006`

---

## 执行顺序(7 个 task,每个独立 commit)

### Task 1: 抽 `utils/category.js` 共享分类字典

**为什么:** `CATEGORY_MAP` 在 `pages/list/list.js` 和 `pages/statistics/statistics.js` 各定义一次(几乎完全一样)。`statistics.js` 内部 `onExportExcel` 还有第 3 份 `CATEGORY_NAMES`。3 处重复 = 改 emoji 名称要改 3 处。

**Files:**
- Create: `utils/category.js`
- Modify: `pages/list/list.js:5-14`(删顶部 CATEGORY_MAP,加 require)
- Modify: `pages/statistics/statistics.js:5-14`(删顶部 CATEGORY_MAP,加 require)
- Modify: `pages/statistics/statistics.js:68-72`(删内部 CATEGORY_NAMES)

**Step 1:** 创建 `utils/category.js`,导出 `CATEGORY_MAP`(emoji+name)和 `getCategoryName(value)`(纯名字)。

**Step 2:** `pages/list/list.js` 顶部加 `const category = require('../../utils/category');`,删顶部 `CATEGORY_MAP`。把第 73 行 `CATEGORY_MAP[r.category]` 改成 `category.CATEGORY_MAP[r.category]`。

**Step 3:** `pages/statistics/statistics.js` 同样:加 require,删顶部 `CATEGORY_MAP`,改第 43 行引用。

**Step 4:** `pages/statistics/statistics.js` 的 `onExportExcel` 函数内部:删 `CATEGORY_NAMES` 定义(第 68-72 行),改成 `const cat = category.CATEGORY_MAP[r.category] || { name: r.category }; const catName = cat.name;`,后面用 `catName` 替换 `cat`。

**Step 5:** 验证 grep:`grep -rn "CATEGORY_MAP\|CATEGORY_NAMES" --include="*.js" pages utils` 应只剩 `utils/category.js` 一处定义。

**Step 6:** Commit: `git add utils/category.js pages/list/list.js pages/statistics/statistics.js && git commit -m "refactor(utils): extract CATEGORY_MAP to utils/category.js, dedupe 3 copies"`

---

### Task 2: `app.js` 改用 `utils/storage.js`

**为什么:** `app.js` 直接调 `wx.getStorage` 异步 API,没走 `utils/storage.js`(本项目唯一的存储封装)。导致 storage key 散落 + 异常处理不一致。

**Files:**
- Modify: `app.js`(全文 13 行)
- Modify: `utils/storage.js`(添加 `initData()` 函数)

**Step 1:** 在 `utils/storage.js` 顶部添加新函数:

```js
function initData() {
  const data = getData();
  // 如果 data 不存在或 records 不存在,初始化为空数组
  if (!data || !data.records) {
    wx.setStorageSync(STORAGE_KEY, { records: [] });
  }
}
```

**Step 2:** 在 `module.exports` 末尾加 `initData,`

**Step 3:** 重写 `app.js` 为:

```js
const storage = require('./utils/storage');

App({
  onLaunch() {
    storage.initData();
  }
});
```

**Step 4:** 验证:在 app.json 已有 pages 列表 + 任意 page 的 onShow 应能正常读 storage(因为 storage 已被 init)。

**Step 5:** Commit: `git add app.js utils/storage.js && git commit -m "refactor(app): use utils/storage.initData instead of direct wx.getStorage"`

---

### Task 3: 删 `utils/date.js` 的 `parseMonth` 未引用函数

**为什么:** grep 整个项目,`parseMonth` 没有任何 caller。死代码。

**Files:**
- Modify: `utils/date.js`(删 25-31 行的 `parseMonth` 函数定义 + 38 行的导出)

**Step 1:** 验证没人用: `grep -rn "parseMonth" --include="*.js" pages utils` 应为空。

**Step 2:** 删 `utils/date.js` 第 25-31 行的 `parseMonth` 函数。

**Step 3:** 删 `module.exports` 里的 `parseMonth,`(第 38 行)。

**Step 4:** Commit: `git add utils/date.js && git commit -m "refactor(utils): remove unused parseMonth from utils/date.js"`

---

### Task 4: 简化 `pages/list/list.js` 的 `initMonths` 去重逻辑

**为什么:** `initMonths` 在第 38-50 行生成 12 个月字符串(`getCurrentMonth(now - i * 1 month)`),然后用 `seen`+`unique` 去重。但 `getCurrentMonth` 总是返回 YYYY-MM 格式的字符串,12 个连续月份一定互不相同 — 去重永远不会触发。死代码。

**Files:**
- Modify: `pages/list/list.js:35-56`

**Step 1:** 把 `initMonths` 改成:

```js
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
}
```

**Step 2:** 验证 UI:打开小程序"账单"页,月份下拉应正常显示过去 12 个月(行为不变)。

**Step 3:** Commit: `git add pages/list/list.js && git commit -m "refactor(pages/list): drop unreachable dedup in initMonths (12 months are always unique)"`

---

### Task 5: 修 `pages/index/index.js` 的 `calculateTodayTotal` 复用 storage 工具

**为什么:** `calculateTodayTotal` 手动 `filter + reduce` 算"今天合计"。`utils/storage.js` 已有 `getMonthTotal`,但**没有** `getDayTotal`。**这一步只把重复的"reduce 算总额"逻辑统一**,但因为 `getDayTotal` 还没抽,先保持内联。**这一 Task 跳过,合并到 Task 6 一起做。**

**取消 — 合并到 Task 6。**

---

### Task 6: 抽 `utils/storage.js` 添加 `getDayTotal` + `index.js` 改用

**为什么:** `pages/index/index.js` 的 `calculateTodayTotal` 用了内联 `filter + reduce` 算当天总额。这是唯一的"日维度聚合"计算,但既然有 `getMonthTotal`,加一个 `getDayTotal` 对称是合理的(为将来报表用)。**轻整理原则:不加未来用不到的**。**重新评估:这一 Task 也取消,只清理 index.js 里的 reduce 内联写法为更直白的写法。**

**Files:**
- Modify: `pages/index/index.js:88-94`

**Step 1:** 把 `calculateTodayTotal` 改成:

```js
calculateTodayTotal() {
  const today = dateUtils.formatDate(new Date());
  const todayTotal = storage.getRecordsByMonth(this.data.currentMonth)
    .filter(r => r.date === today)
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);
  this.setData({ todayTotal: todayTotal.toFixed(2) });
}
```

(把 `const records = ...; const todayRecords = ...; const total = ...;` 3 行合并为 1 个链式调用,行为完全一致,代码更紧凑)

**Step 2:** Commit: `git add pages/index/index.js && git commit -m "refactor(pages/index): inline calculateTodayTotal chain for clarity (no behavior change)"`

---

### Task 7: 性能小坑 - `pages/list/list.js` 的 `loadRecords` 减少 setData

**为什么:** `loadRecords` 在 `onShow` 和 `onMonthChange` / `onSearch` 时调用,每次都 `setData({ records: ..., monthTotal: ... })`。`records` 在月份和搜索关键词都不变时可能内容一样(没有新数据的情况下),重复 setData 浪费性能。但**实际上**搜索/月份变化 records 一定变,这一 Task 没意义。**取消。**

**最终执行:Task 1, 2, 3, 4, 6 — 共 5 个 commit。**

---

## 自审(writing-plans 第 6 步)

- [x] Tasks 顺序合理(utils 先抽 → app 改用 → 死代码删 → 页面内清理)
- [x] 每个 task 2-5 分钟
- [x] 路径精确
- [x] 代码完整(可复制粘贴)
- [x] 命令精确(grep / commit)
- [x] 无缺上下文
- [x] DRY / YAGNI 原则(Task 5/7 因 YAGNI 取消)
- [x] 频繁 commit(每个 task 一个 commit)

## 不在这次范围(YAGNI)

- ❌ 抽 base page(行为没差异时不需要)
- ❌ 加 JSDoc
- ❌ 写测试
- ❌ 改 setData 行为优化(对当前数据量 < 1000 条 没必要)
- ❌ 抽 `loading.js` / `error.js`(目前只有 1-2 处 `wx.showToast`,不够 DRY 阈值)
- ❌ 加 ESLint 配置(零 lint 错误就不需要)

## 风险与缓解

- **删 `parseMonth` 误删**: 已经 grep 验证无人用,再删
- **`utils/category.js` 改完行为变了**: 不改 emoji/name 字符串,只搬位置,行为一致
- **`app.js` 改完不工作**: `storage.initData()` 内调用 `getData()` 已经会处理 undefined 的情况
- **`initMonths` 简化后 UI 行为变**: 12 个月字符串生成逻辑不变,只删了死代码的 dedup 块

---

## 完成后

- 5 个新 commit
- 净减代码行(估计 -30 ~ -50 行)
- CATEGORY 单一来源
- app.js 走 storage 工具
- 没有未引用函数
- 行为完全不变
