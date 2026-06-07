# 记账本 - 微信小程序

简洁实用的微信小程序记账工具，支持账单记录、统计报表、预算管理和分类管理。

## 功能模块

### 📊 账单
- 快速记一笔收入/支出
- 按日期筛选查看账单列表
- 搜索账单记录

### 📈 报表
- 支出/收入统计
- 按月/按日维度查看
- 可视化图表展示

### 💰 预算
- 设置月度预算
- 实时剩余预算提醒

### ⚙️ 分类管理
- 自定义支出/收入分类
- 灵活管理分类图标与名称

## 项目结构

```
├── pages/
│   ├── index/       # 首页 - 记账入口
│   ├── list/        # 账单列表
│   ├── statistics/  # 统计报表
│   └── profile/     # 我的（预算/分类）
├── components/       # 公共组件
├── utils/           # 工具函数
│   ├── date.js      # 日期处理
│   └── storage.js   # 本地存储封装
├── styles/          # 全局样式
├── assets/          # 静态资源（图标）
└── project.config.json
```

## 快速开始

### 开发
1. 下载并打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本项目目录
3. 替换 `project.config.json` 中的 `appid` 为你的小程序 AppID
4. 开始开发

### 配置
编辑 `project.config.json`：
```json
{
  "appid": "your-appid-here"
}
```

## 部署到微信(CI / CD)

本项目用 `miniprogram-ci` + GitHub Actions 实现 push 后自动上传到微信后台(开发版/体验版)。

### 一次性配置(在 GitHub 仓库)

1. 进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加两个 Repository secret:
   - `WECHAT_APPID` — 你的小程序 AppID(微信公众平台 → 开发 → 开发设置)
   - `WECHAT_PRIVATE_KEY` — 代码上传私钥的**完整 PEM 内容**,从微信公众平台 → 开发 → 开发管理 → 代码上传密钥生成,**包含** `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----` 头尾
3. push 到 `master` 分支后,GitHub Actions 会自动跑 `.github/workflows/deploy.yml` 上传

### 本地手动上传(开发调试用)

```bash
export WECHAT_APPID=wx你的AppID
export WECHAT_PRIVATE_KEY_CONTENT="$(cat /path/to/your-private-key.pem)"
node ci.js
```

### ⚠️ 安全说明(2026-06-07 重构)

历史版本曾把代码上传私钥放进 `.keys/` 并 commit 到 git(已被清理)。**该私钥已视为公开泄露**,请按以下步骤处理:

1. 登录微信公众平台 → 开发 → 开发管理 → 代码上传密钥 → **重置密钥**
2. 把新私钥填进 GitHub Secrets(`WECHAT_PRIVATE_KEY`),**不要**再次放进 `.keys/`
3. `.keys/` 已在 `.gitignore` 中排除,任何同名目录都不会被 git 跟踪

## 技术栈

- 微信小程序原生的 WXML + WXSS + JS
- 本地数据存储（Storage）
- ECharts（统计图表）

## 截图

> 暂无

## License

MIT