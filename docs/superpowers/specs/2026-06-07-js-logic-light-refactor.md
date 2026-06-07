# Spec: 记账小程序 JS 逻辑层"轻整理"重构

**日期:** 2026-06-07
**作者:** Hermes (走完 brainstorming skill 8 步流程)
**状态:** 待用户批准

---

## 1. 目标(GOAL)

对 `/root/wechat-account-book` 项目的 JS 逻辑层做"轻整理"级重构:

- 清理死代码、重复代码、命名/规范不一致
- 修小性能坑(setData 模式、wx:for key)
- **不**改动功能行为、**不**改架构、**不**换技术栈
- **不**加新依赖、**不**引入状态管理、**不**写 JSDoc

## 2. 范围 / 非范围

**包含**:
- `pages/*/*.js` (4 个页面: index / list / statistics / profile)
- `components/*/*.js` (6 个组件)
- `utils/*.js` (date.js, storage.js)
- `app.js`、`ci.js`

**不包含**:
- `.wxml` 模板、`.wxss` 样式、`.json` 配置
- 微信开发者工具相关
- `node_modules/`、`__pycache__/`、`.keys/`
- 添加测试代码(B3 方案:暂不引入测试框架;只测 utils 留给下次)
- 改 UI/交互(行为级 0 改动,所有"清理"必须保持用户感知行为不变)

**假设**:
- 项目**未上线 / 无真实用户**(用户口头确认:O 选项 = 1)
- 已有 commit `e07fa006` 作为基线

## 3. 具体清理项(对应 Q3 的 i+ii+iii+v)

### 3.1 死代码清除 (i)
- 未使用的 import / require
- 未使用的变量 / 函数 / 页面 / 组件
- 注释掉的代码块
- 无意义的 `console.log` 调试残留
- `data` 字段里定义了但从未 `setData` 写入的项
- 工具函数定义后从未被调用

### 3.2 重复代码抽取 (ii)
- `setData({ loading: true/false })` 模式散落 — 提取为 `utils/loading.js`
- `wx.setStorageSync` / `wx.getStorageSync` 散落 — 集中在 `utils/storage.js`(若已有,补全)
- 日期格式化(`formatDate` / `formatTime`)重复实现 — 统一到 `utils/date.js`
- `try { ... } catch (e) { console.error(e) }` 重复 — 提取 `utils/error.js`
- 跨页面的"空数据 / 加载中 / 错误"三态 UI 模式 → 抽成 base page 工具

### 3.3 命名 / 规范统一 (iii)
- 统一 `function fn() {}` vs `const fn = () => {}` 风格(项目内一致即可)
- 修拼音/英文混杂命名
- 统一缩进(2 空格)、引号(单引号)、分号
- 修正 `var` → `const` / `let`
- 修正 `==` → `===`

### 3.4 性能小坑 (v)
- `setData` 传整个 data object → 改为传差异字段
- 同一字段在 `onLoad` / `onShow` 中反复 `setData` 同一值 → 跳过
- `wx:for` 缺 `wx:key` → 补
- `onShow` 中无脑 `this.setData({ ...全部 })` → 改为按需更新
- `wx.getSystemInfoSync` 在多个页面的 onLoad 反复调用 → 提取到 app.js globalData

## 4. 验收标准

每条 PR / commit 必须满足:

- [ ] 用户感知行为**完全不变**(打开页面、点击交互、数据展示一致)
- [ ] 项目**能正常启动**(微信开发者工具能打开,无报错)
- [ ] `git diff` 简洁,改动有 commit message 解释
- [ ] 死代码清除后,无新 linter 错误
- [ ] 重复代码抽取后,功能等价(对比 commit 前后行为)

## 5. 不做(明确边界)

- ❌ 不写测试(项目无测试框架,引入会增加依赖,违反"轻整理"原则)
- ❌ 不改样式 / 模板 / 配置
- ❌ 不引入新依赖(无 `npm install`)
- ❌ 不改架构(无 service / store / hooks 分层)
- ❌ 不加 JSDoc / 文档生成
- ❌ 不做性能压测(肉眼级优化即可)

## 6. 工作量预估

- 文件数: ~12-15 个 .js
- 总行数: ~2000-3000 行(估)
- 时间: 1 个 session 内可以完成大部分,**预计 1-2 小时**
- 增量 commit 数: 5-10 个,每个聚焦一个清理维度

## 7. 风险

| 风险 | 缓解 |
|---|---|
| 改 setData 行为引入 bug | 每次提交前用 `git diff` 复查,行为级改动保留兼容写法 |
| 删了"看似无用"的代码,实际是页面间约定的副作用 | 第一次清先标注 `// TODO: verify unused`,跑一遍再删 |
| 改风格触发 linter 雪崩 | 改动按"文件为单位"分批,每个 commit 1-3 个文件 |
| 引入 base page 工具导致其他页面要改 | 抽公共工具用"可选迁移"模式: 工具先存在,旧调用保留,后续 commit 再迁移 |

## 8. 交付顺序(writing-plans 会再拆细)

1. `app.js` 全局化(性能小坑 v)
2. `utils/` 内部整理 + 抽 loading/error 工具
3. `components/` 一个一个来
4. `pages/` 一个一个来
5. 最后跑一遍全量检查 + 提交

---

**请审阅。批准后我走 writing-plans 拆 2-5 分钟任务。**
