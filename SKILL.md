---
name: caishi-speech-web-skill
description: 生成博物馆/展厅/展馆讲解辅助用的单文件 HTML 巡讲网页（自研档案出版风引擎），含翻页/全屏、演讲者双屏、备注卡与讲稿草稿、大纲宫格、三主题换肤（深蓝金/党政红/简约商务）、自动页码与备注契约、可导出 PDF；附版本库 references（版式/组件/质检/节奏/FAQ）。当用户需要"讲解网页/巡讲网页/演示网页/网页版讲解稿/展厅讲解辅助"或提及"档案出版风讲解页/巡讲辅助"时使用。
---

# 讲解巡讲网页技能 · Caishi Speech Web

> 由展厅巡讲任务复盘沉淀的通用讲解辅助资料生成技能。
> 引擎为本仓库自研：档案出版感视觉（深蓝夜空 × 米白纸、细金线、超大页码水印、明暗节奏）。

## 本技能产出

- **主产物**：单文件 HTML 巡讲网页（自包含、浏览器直开、Ctrl+F5 刷新即用）
  - 键盘 ← → / 滚轮翻页，P 演讲者模式（本页/下一页预览 + 观众屏同步），N 备注浮层
  - 每页"备注卡"= 数据契约（section/minutes/purpose/talk/transition/cue…）驱动，长讲稿区独立滚动
  - 页码、页眉 FIELD NOTE、NOTES_BASE 全部按页面数自动生成
- **可选导出**：打印样式 PDF（@media print / 无头 Chrome）
- **示例**：`examples/pages.demo.mjs` → `examples/out/demo.html`（8 页 × 8 类模板，零图片，clone 即可跑通）

## 何时用 / 何时不用

**适合**：展厅/展馆讲解、巡讲、导览辅助、需要"讲稿+提示卡一体"的演示。
**不适合**：动画炫技型演示（本技能是克制档案风）；多人实时协作编辑（静态 HTML）；
纯数据图表报告（改用图表工具或参考 components/layouts 拆页）。

## 工作流（superpowers 式：分诊→撰写→质检→交付）

### Step 1 · 分诊
- 澄清：内容规模、是否已有图、深浅偏好、讲解时长口径。
- 收集图：实拍照片（浅底、走白卡）与深底原创图（走 screen 融入）分开登记。

### Step 2 · 撰写（内容数据唯一事实源）
- 新建/编辑页面数据 PAGES 数组（参考 `examples/pages.demo.mjs`）：每页一个对象（字段契约见 references/web-layouts.md）。
- 选模板：cover / divider / cols(文+图) / full(大图) / nums(数字卡) / quote(金句) / plain(2×2卡片) / end。
- 节奏纪律：同章不连续同版式同底色；每页 3–5 要点、单条 ≤40 字（见 references/web-rhythm.md）。
- 新增图片：制作 imgmap json（键名写进 img 字段）→ `IMG_MAP=xxx.json` 传给 build。

### Step 3 · 构建与质检
- 跑 `node scripts/build.mjs [pages.mjs] [out.html]`（默认 demo 示例）。
- 先跑一键自动质检 `node scripts/qc.mjs [产物html]`（结构/备注契约/页码/占位词，退出码 0 = 全过）。
- 再逐项过 references/web-checklist.md：slides 数、备注契约 N/N、页码唯一、div 闭合、无占位词。
- 浏览器验收：Ctrl+F5 → 逐页翻、图不裁、备注卡滚动不遮底栏；演讲者/观众模式开一遍。
- 换肤抽验：三主题各看 1 深 1 浅页（URL ?theme=party/biz 或右下圆点）。

### Step 4 · 交付
- 交付物：N 页 HTML（主）+ 预览 PNG（可先截图几页）+ 需要的 PDF。
- 交付说明写清：页码口径（xx/N）、总分钟、三主题切换法、旧文件留档说明、Ctrl+F5 提示。
- DoD 清单（全过才叫完成）：
  - [ ] 构建日志 slides=N 且 N=备注键数
  - [ ] data-id ↔ NOTES_BASE 键一一对应
  - [ ] 页码 01/N…N/N 唯一连续；封面 meta 分钟口径同步
  - [ ] 无占位词残留；div 闭合
  - [ ] 深底图融入 / 实拍图白卡，两套都对
  - [ ] 长讲稿页备注卡内部滚动、底栏功能条不被遮挡
  - [ ] 三主题深+浅页观感验证
  - [ ] 用户 Ctrl+F5 实机验收过

## 工程与路径（本仓库根）

- 详细使用文档：`docs/USAGE.md`（字段字典/版式/图片/换肤/双屏/PDF/QC/引擎架构/FAQ——agent 先读它再动手）
- 内容数据源：`examples/pages.demo.mjs`（PAGES 示例）——实际内容自行新建 pages.mjs 或复制该文件改写
- 渲染引擎：`scripts/build.mjs`（读 templates/skeleton-v3.html + PAGES + 可选 imgmap → 输出单文件）
- 骨架模板：`templates/skeleton-v3.html`（CSS/JS 权威源；改版式改这里）
- 图床：可选 IMG_MAP json（{uri:dataURL,bytes}；缺省则纯文字页）
- 质检：`scripts/qc.mjs`（任意页数通用）
- 产物目录：`examples/out/`
- 规范库：`references/`（本目录）
  - web-layouts.md 版式库 | web-components.md 组件库 | web-rhythm.md 明暗与主题
  - web-checklist.md 质检清单 | web-faq.md 常见问题与复盘
- 配色记录：`themes/*.json`（PPTX/扩展配色参考；网页三主题换肤由引擎内置 CSS 变量驱动）
- 备注契约格式（NOTES_BASE 键）与字段解释：见 web-layouts.md 第三节
- 版本同步：`sync-update.bat`/`.ps1`（git add/commit/push 一键，改动后运行）

## 铁律（踩坑沉淀，违者破相）

- 新增组件 CSS 只许 `var(--…)`，禁止写死 hex——三主题换肤会破。
- 图片分两类：深底图进 blend 集合（screen 融入），实拍照片绝不 blend（白卡）。
- 长内容栏（备注卡等）必须 `overflow-y:auto`，底部功能条禁 shrink——否则长稿遮挡底栏。
- 页码/总数/文件名由 PAGES.length 推导，禁止硬编码页数。
- 交付前必须 Ctrl+F5 提示用户（改 HTML 后旧缓存会显示旧版）。
- 模板文件带 BOM/中文时 PowerShell5.1 处理要小心（见 web-faq.md F1）。
