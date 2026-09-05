# Caishi Speech Web Skill · 讲解巡讲网页生成技能

生成**博物馆/展厅讲解辅助**用的单文件 HTML 巡讲网页。由真实展厅巡讲任务沉淀的自研引擎（档案出版风），不是通用 PPT 模板——克制、留白、讲稿与提示卡一体。

**跑通只需一条命令**（无需图片、无需服务端）：

```bash
node scripts/build.mjs            # 生成 examples/out/demo.html
node scripts/qc.mjs               # 一键质检（退出码 0 = 全过）
```

浏览器打开 `examples/out/demo.html` 即可翻页预览（Ctrl+F5 强刷）。

## 能力速览

| 能力 | 说明 |
|---|---|
| 单文件产物 | 浏览器直开、可离线、可发 PDF（@media print） |
| 翻页/全屏 | ← → / 滚轮；F 全屏 |
| 演讲者双屏 | `P` 键：本页/下一页预览 + 观众屏同步 |
| 备注卡 | 每页 section/分钟/目的/讲述稿/转场/提示，数据契约驱动，长稿独立滚动 |
| 大纲宫格 / 备注浮层 | `Esc` 宫格选页、`N` 浮层看稿 |
| 三主题换肤 | 深蓝金（默认）/ 党政红 / 简约商务；`?theme=` 参数或右下角圆点 |
| 自动页码 | 页数由内容数组推导，加页删页全自动 |
| 一键质检 | 页码/备注契约/div/占位词，脚本校验 |

## 快速开始（换成你自己的内容）

1. 复制 `examples/pages.demo.mjs` 为 `pages.mjs`，按 `references/web-layouts.md` 的字段契约改写 PAGES 数组（8 类模板：cover / divider / cols / full / nums / quote / plain / end）。
2. 无图直接构建；有图见「图片」一节。
3. 构建 + 质检 + 浏览器验收（清单见 `references/web-checklist.md`）。

```bash
node scripts/build.mjs pages.mjs out/巡讲网页.html
node scripts/qc.mjs out/巡讲网页.html
```

## 图片（可选）

图片以 dataURL 内联进单文件，保持自包含。先做一个 imgmap json：

```json
{ "rocket": { "uri": "data:image/png;base64,...", "bytes": 12345 } }
```

构建时 `IMG_MAP=imgmap.json node scripts/build.mjs pages.mjs out.html`。
深底原创图（底色≈深蓝夜空）自动走 `mix-blend-mode:screen` 融入深色页；实拍照片走白卡相框。细节见 `references/web-layouts.md` 第四节。

## 目录

```
caishi-speech-web-skill/
├─ SKILL.md                技能入口（agent 工作流 + DoD）
├─ scripts/
│  ├─ build.mjs            渲染引擎（模板 + PAGES + imgmap → 单文件）
│  └─ qc.mjs               一键质检
├─ templates/
│  └─ skeleton-v3.html     骨架模板（CSS/JS 权威源）
├─ examples/
│  ├─ pages.demo.mjs       8 页 × 8 类模板的通用示例
│  └─ out/demo.html        构建产物（示例）
├─ references/             规范库（五份文档）
│  ├─ web-layouts.md       版式库（模板/字段契约/图规则）
│  ├─ web-components.md    组件库（字段→组件映射）
│  ├─ web-rhythm.md        明暗·节奏·主题纪律
│  ├─ web-checklist.md     质检清单
│  └─ web-faq.md           常见问题与复盘
├─ themes/                 三套配色记录（网页换肤由引擎内置 CSS 变量驱动）
└─ README.md
```

## 演讲者/观众双屏

产物支持两屏模式：

- `?mode=pv` 演讲者预览 iframe（本页大 + 下一页小 + 备注卡）
- `?mode=aud` 观众独立屏
- 主控页 `P` 键进入双屏模式

## 主题换肤

默认深蓝金（档案出版感）。URL 参数或右下角主题圆点切换：

- `?theme=party` 党政红（红金，适合党政团/专题党建）
- `?theme=biz` 简约商务（浅底蓝灰，适合汇报交流）
- `?theme=blue` 深蓝金（默认）

## 本技能作为 DSH Skill 使用

`SKILL.md` 遵循 [Agent Skills](https://agent-skills.ai) 规范：当任务匹配描述（"讲解网页/巡讲网页/演示网页/网页版讲解稿/展厅讲解辅助/档案出版风"），agent 自动加载 SKILL.md 并按其四步工作流执行。

## License

MIT
