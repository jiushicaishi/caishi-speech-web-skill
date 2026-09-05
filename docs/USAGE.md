# Caishi Speech Web Skill · 详细使用文档（USAGE）

> 本技能生成**博物馆/展厅/展馆讲解辅助**用的单文件 HTML 巡讲网页：档案出版感视觉、讲稿与提示卡一体、演讲者双屏、三主题换肤。
> 面向两种读者：**最终用户**（直接用引擎做网页）与 **Agent/开发者**（扩展引擎或把它接进自动化工作流）。

---

## 目录

1. [这是什么](#1-这是什么)
2. [快速开始：5 分钟跑通](#2-快速开始5-分钟跑通)
3. [制作你自己的巡讲网页](#3-制作你自己的巡讲网页)
4. [页面字段完全字典](#4-页面字段完全字典)
5. [8 类版式模板怎么选](#5-8-类版式模板怎么选)
6. [图片：内联、白卡与融入](#6-图片内联白卡与融入)
7. [主题换肤与自定义配色](#7-主题换肤与自定义配色)
8. [演讲者/观众双屏与会场操作](#8-演讲者观众双屏与会场操作)
9. [导出 PDF](#9-导出-pdf)
10. [质检清单（QC）](#10-质检清单qc)
11. [把本技能接进 DSH / 其他 Agent](#11-把本技能接进-dsh--其他-agent)
12. [引擎架构（给开发者）](#12-引擎架构给开发者)
13. [常见问题速查](#13-常见问题速查)
14. [许可与致谢](#14-许可与致谢)

---

## 1. 这是什么

一个"内容 → 单文件 HTML"的渲染管线：

```
你的页面数据 (PAGES)  ──►  scripts/build.mjs  ──►  单文件 HTML 巡讲网页
(可选) 图片 imgmap   ──      + 骨架模板 CSS/JS          （自包含、可离线、可 PDF）
```

**产物特性**
- 浏览器直开（无服务器、无外部字体/CDN 依赖——全部内联）
- 键盘翻页、全屏、演讲者双屏、备注浮层
- 页码/页眉/备注契约**全部由页数自动推导**，加页删页不手改
- 长讲稿备注卡内部滚动，不遮挡底部功能条
- 三主题一键换肤（深蓝金/党政红/简约商务），或自定义

**设计哲学**
克制、留白、档案感。适合讲解/巡讲/导览，不适合动画炫技。

---

## 2. 快速开始：5 分钟跑通

### 2.1 环境要求
- **Node.js ≥ 18**（用了 `import()`、`structuredClone` 等现代特性）
- 不需要任何 npm 依赖、不需要图片

### 2.2 克隆并构建示例

```bash
git clone https://github.com/jiushicaishi/caishi-speech-web-skill.git
cd caishi-speech-web-skill
node scripts/build.mjs          # 生成 examples/out/demo.html
node scripts/qc.mjs             # 一键质检，退出码 0 = 全过
```

### 2.3 打开产物

浏览器打开 `examples/out/demo.html`，操作：
- `←` / `→` 或滚轮：翻页
- `F`：全屏
- `P`：演讲者模式（双屏）
- `N`：备注浮层
- `Esc`：大纲宫格
- `?theme=biz` 或右下角圆点：换肤

> 💡 每次重新 build 后，浏览器请 **Ctrl+F5 强刷**，否则会看到旧缓存。

---

## 3. 制作你自己的巡讲网页

### 3.1 推荐工作流

1. **分诊**：内容规模、有几张图（实拍照片 vs 深底原创图）、讲解时长、主题气质。
2. **写内容数据**：复制 `examples/pages.demo.mjs` 为 `pages.mjs`，逐页改写 PAGES 数组（字段见第 4 节）。
3. **选版式**：每页定 tpl 与 dark（规则见第 5 节）。
4. **构建质检**：
   ```bash
   node scripts/build.mjs pages.mjs out/我的巡讲.html
   node scripts/qc.mjs out/我的巡讲.html
   ```
5. **人眼验收**：Ctrl+F5 → 逐页翻 → 查溢出/裁图 → 三主题抽验 → 演讲者/观众模式各开一遍。

### 3.2 一分钟最小示例

```js
// pages.mjs —— 最少 3 个字段就能出页
export const PAGES = [
  {
    tpl: 'cover', id: 'c1', dark: true,
    h1: '我的展厅<br/>巡讲',        // <br/> 可分行
    sub: '副标题说明',
    kicker: 'GUIDED TOUR',
    meta1: '讲解人 · 日期', meta2: '约 20 分钟',
    feetL: '开场',
    section: '序', minutes: 1,
    purpose: '开场破题',
    talk: ['第一句讲什么…', '第二句讲什么…'],
    transition: '翻页语', cue: '动作提示'
  },
  // ……继续加页
];
```

> 无图、纯文字也能成页；`minutes`/`talk` 等备注字段与网页一体，讲解时照读。

---

## 4. 页面字段完全字典

每个页对象 = 一个对象字面量。以下为全部字段：

| 字段 | 必填 | 类型 | 说明 |
|---|---|---|---|
| `tpl` | ✓ | string | 版式模板，见第 5 节（缺省 `plain`） |
| `id` | ✓ | string | 唯一英文 id；备注契约按它匹配（可带后缀如 `pg09s`，勿用严格正则校验） |
| `dark` | ✓ | bool | `true` 深底（夜空档案风）；`false` 浅底（纸张档案风） |
| `h1` / `h` | ✓ | string | 大标题。cover 用 h1，内容页用 h（内部等价）；可含 `<br/>` |
| `kicker` | 内容页 | string | 页眉小标（章节·主题），金色小字 |
| `sub` | 选 | string | 副题说明（≤46ch 观感佳） |
| `bullets` | 大多 | string[] | 要点 3–5 条；plain 模板自动变 2×2 编号卡 |
| `quote` / `src` | quote | string | 金句与出处 |
| `img` / `cap` | 图页 | string | 图键名（对应 imgmap）与图注 |
| `cards` | nums | array | 4 组 `[标签, 数值, 单位, 注释]` |
| `chNo`/`chEn`/`ch`/`chSub` | divider | string | 章节徽章（壹贰叁）/ 英文章题 / 中文章名 / 章副题 |
| `feetL` | ✓ | string | 页脚左（章节脚注） |
| `section` | ✓ | string | 备注分区名（序/第一章/…） |
| `minutes` | ✓ | number | 预估分钟，驱动计时与总时长 |
| `purpose` | ✓ | string | 本页目的（备注卡第一行） |
| `talk` | ✓ | string[] | 逐句讲稿（备注卡主区，长稿自动滚动） |
| `transition` | 选 | string | 翻页衔接语 |
| `cue` | 选 | string | 动作/提示（指图、停顿等） |
| `note` | 选 | string | 旧备注兜底（purpose 缺失时用） |
| `feetR` | — | string | 页脚右页码；`/^\d+ \/ \d+$/` 形则自动按页重写 |

**备注契约（重要）**：运行时按页面 `data-id` 查 `NOTES_BASE[id]` 显示备注卡。PAGES 数组即唯一事实源——build 自动生成 NOTES_BASE，**不要**手写 HTML 页或手改 NOTES_BASE。

**引号规则**：中文语境建议直接用中文双引号“ ”；英文直双引号 `"` 会被自动转成成对弯引号（智能排版）。

---

## 5. 8 类版式模板怎么选

| tpl | 长相 | 何时用 | 要点 |
|---|---|---|---|
| `cover` | 封面：kicker+大标题+sub+meta | 第一页 | 标题 ≤16ch；meta 两栏 |
| `divider` | 章节页：徽章 壹 + ACT I + 章名 + 金线 | 每章首页 | 徽章用中文数字 |
| `cols` | 左文右图 | 有实拍照片想并排 | 右栏图 1024px+ |
| `full` | 全幅大图 | 火箭/时间轴/大照片 | 图 16:9、1600px+ |
| `nums` | 2×2 大数字卡 | 精确数字记忆点 | 4 卡：标签/数值/单位/注释 |
| `quote` | 金句页 | 章内金句 | 深底效果好 |
| `end` | 结束页：谢谢聆听 | 末页 | 居中，可留回顾列表 |
| `plain`（默认） | 纯文字 2×2 编号卡 | 无图内容页 | bullets 4 条最佳；5+ 条改 tick 列表感 |

**节奏铁律（"不丑"的关键）**
- 同章内**相邻两页不同 tpl 且不同底色**（深—浅交替最稳）
- 整章不宜连续 ≥3 深 或 ≥3 浅
- 深底页信息密度低（留白多、字距大）；浅底页承载要点卡/数据
- 章首页 divider 固定深底

---

## 6. 图片：内联、白卡与融入

### 6.1 无图也可以
不声明 `img` 就纯文字渲染，构建零告警。**零图示例见 examples/pages.demo.mjs**。

### 6.2 有图：制作 imgmap

图片以 **dataURL 内联**进单文件保持自包含。imgmap 是 `{键名: {uri, bytes}}` 的 json：

```js
// make-imgmap.mjs（示意；或用你喜欢的任何脚本生成）
import { readFileSync, writeFileSync } from 'fs';
const imgmap = {};
for (const [k, p] of Object.entries({
  rocket: './img/rocket.png',
  hall:   './img/hall.jpg'
})) {
  const buf = readFileSync(p);
  const mime = p.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  imgmap[k] = { uri: `data:${mime};base64,${buf.toString('base64')}`, bytes: buf.length };
}
writeFileSync('./imgmap.json', JSON.stringify(imgmap));
```

构建时传入：
```bash
IMG_MAP=imgmap.json node scripts/build.mjs pages.mjs out/巡讲.html
```
页面里写 `img: 'rocket'`、`cap: '图注'` 即可。声明了图但 imgmap 缺键 → 引擎**告警并按无图渲染**（不会崩）。

### 6.3 两类图，两种处理（关键区别）

| 图类型 | 特征 | 处理 |
|---|---|---|
| **深底原创图** | 底色≈深蓝夜空（如星空插画/示意） | 引擎内置 blend 键集合 → `mix-blend-mode:screen` **融入**深色页，无白框 |
| **实拍照片** | 浅底/彩色（现场照、展品照） | 深色页走**白卡相框**；浅色页白纸卡 |

- **绝不要**把实拍照片加入 blend 集合：screen 会让照片发灰半透明。
- 若要自定义 blend 键：在 `scripts/build.mjs` 顶部 `const blended = new Set([...])` 增删键名。
- 尺寸建议：cols 右栏图 ≥1024px；full 图 16:9 ≥1600px。

---

## 7. 主题换肤与自定义配色

### 7.1 内置三主题

| 主题 | 参数 | 气质 | 典型场景 |
|---|---|---|---|
| 深蓝金（默认） | `?theme=blue` | 夜空 × 米白 × 细金线，档案出版感 | 航天/科技/博物馆 |
| 党政红 | `?theme=party` | 红金 | 党政团参观、主题党日、专题讲座 |
| 简约商务 | `?theme=biz` | 浅底蓝灰 | 馆方汇报、对外交流 |

切换方式：
- URL：`demo.html?theme=party`
- 页面右下角圆形主题 dock（主屏/观众屏显示）
- 选择记忆到 localStorage，下次自动沿用

### 7.2 自定义配色（改一处即可）

皮肤由模板内 **CSS 变量** 驱动（在 `templates/skeleton-v3.html` 的 `:root[data-theme="…"]` 或 build 注入段）。新主题 = 新增一组 `:root[data-theme="我的主题"]{...}` 变量，并把按钮加进主题 dock：

```css
:root[data-theme="forest"]{
  --deep:#0B1F16; --deep-2:#123A28; --ink:#0E2A1E; --paper:#F4F7F2;
  --gold:#8FAE6F; --gold-bright:#B5D49A; --accent:#2F7D5A; /* …完整变量集见默认组 */
}
```

> ⚠️ **铁律**：所有组件颜色必须走 `var(--…)`，禁止写死 hex——否则换肤破相。完整变量清单见 `references/web-components.md` 第三节。

---

## 8. 演讲者/观众双屏与会场操作

### 8.1 双屏模式（主屏按 P）
主控页按下 `P` 进入演讲者模式：
- 左：本页大画面；右：下一页预览 + **备注卡**（本页 section/分钟/目的/逐句讲稿/转场/提示）
- 观众屏：自动打开独立窗口（或 `?mode=aud` 单独开）
- 备注卡长稿**内部滚动**，不遮挡底部功能条（本仓库已修复该历史 bug）

### 8.2 快捷键总表

| 键 | 功能 |
|---|---|
| `←` `→` 或滚轮 | 上/下一页 |
| `F` | 全屏 |
| `P` | 演讲者模式 |
| `N` | 备注浮层 |
| `Esc` | 大纲宫格（选页） |
| `B` `W`（如实现） | 黑屏/白屏 |

### 8.3 讲解动线建议
- 开场页站定，语速放慢建立仪式感（`cue` 字段记提示）
- 数字页逐字念准（`nums` 是记忆点）
- 金句页读完停一拍再翻
- 收束页预留问答时间（封面 `meta2` 注明总时长口径）

---

## 9. 导出 PDF

单文件 HTML 已含 `@media print` 打印样式（每页 1280×720 分页）：

**Chrome 方法**（推荐）
1. 打开产物 → Ctrl+P
2. 目标：另存为 PDF；取消勾选"页眉页脚"
3. 边距：无；勾选"背景图形"
4. 保存

**无头 CLI**
```bash
chrome --headless --disable-gpu --print-to-pdf=out.pdf out/巡讲.html
```

> 演讲者备注不打印（打印样式只含画面页）。

---

## 10. 质检清单（QC）

### 10.1 一键自动质检

```bash
node scripts/qc.mjs [产物路径]      # 缺省检查 examples/out/demo.html
```

退出码 0 = 结构全过。自动检查：
- slides 数量 = PAGES.length
- `data-id` ↔ `NOTES_BASE` 键一一对应（备注契约）
- 页码 `01/N…N/N` 唯一连续
- div 开闭平衡、无占位词残留（自动剔除 base64 干扰）
- 声明图的页面确有内联 dataURL

### 10.2 人工验收清单（每次构建必过）

- [ ] 构建日志 `slides: N`，且 NOTES keys = N
- [ ] Ctrl+F5 后逐页翻：文字不溢出卡片、标题换行正常
- [ ] 深底图融入（无白框）/ 实拍照片白卡，两类都抽查
- [ ] 演讲者模式：备注卡滚动到底不遮功能条
- [ ] 三主题各看 1 深 1 浅页
- [ ] 封面总分钟口径与各页 minutes 合计一致
- [ ] 无占位词（此处添加/单击此处/…）

---

## 11. 把本技能接进 DSH / 其他 Agent

`SKILL.md` 遵循 Agent Skills 规范（frontmatter `name` + `description`），DSH 会自动发现并注入技能目录：

- **技能名**：`caishi-speech-web-skill`
- **触发词**：讲解网页 / 巡讲网页 / 演示网页 / 网页版讲解稿 / 展厅讲解辅助 / 档案出版风讲解页

接入 DSH 用户级技能根（跨会话可用，把本仓库 clone 或复制到该目录）：
```
<DSH_HOME>\skills\caishi-speech-web-skill\   ← 本仓库内容即技能根
```
（`DSH_HOME` 通常为 `~/.dsh` 或环境变量 `$DSH_HOME`）

**给 Agent 的执行要点（摘自 SKILL.md 工作流）**
1. 分诊（规模/图/深浅/时长）
2. 写内容数据 PAGES（唯一事实源），参考 `examples/pages.demo.mjs`
3. `node scripts/build.mjs` + `node scripts/qc.mjs`，人工项过 `references/web-checklist.md`
4. 交付附 Ctrl+F5 提示与三主题说明

**Agent 版式纪律（违者破相）**
- 组件 CSS 只用 `var(--…)`，禁止写死色值
- 深底图进 blend、实拍照片绝不 blend
- 长内容栏 `overflow-y:auto` + 底栏禁 shrink
- 页码/总数由 PAGES.length 推导，禁止硬编码
- 模板含 BOM/中文时 PowerShell 5.1 处理需小心

---

## 12. 引擎架构（给开发者）

```
scripts/build.mjs              渲染主引擎
  ├─ 读 templates/skeleton-v3.html   ← CSS/JS 权威源（改版式/皮肤改这里）
  ├─ 读 pages.mjs (PAGES)            ← 内容唯一事实源
  ├─ 可选 IMG_MAP json               ← 图片 dataURL 映射
  └─ 输出单文件 HTML
scripts/qc.mjs                 产物自动质检
templates/skeleton-v3.html     骨架模板（deck/NOTES_BASE 由引擎整段重写，模板内仅留占位）
references/*.md                规范库：layouts 版式｜components 组件｜rhythm 节奏｜checklist 质检｜faq 排障
```

**构建替换点**（改引擎时注意，build 按这些锚点工作）
- `</style>` 前注入补充版式 CSS（含主题皮肤系统）
- `<div id="deck">` 至 `<div id="nav">` 整段重写为渲染后的 slides
- `var NOTES_BASE = {…};` 整段重写（按 PAGES 生成）
- `<title>` 替换为封面/文档标题
- `</body>` 前注入主题切换脚本

**把本仓库用于新技能（复用模板）**
1. clone 本仓库（或复制 engine 两文件 + template + references）
2. 写自己的 `pages.mjs`（可以整个换内容）
3. 需要的话改模板标题/默认页脚/org 文案（在 build 顶部配置或模板内查 "某博物馆" 占位）
4. 跑 build + qc，产出你的 N 页 html

---

## 13. 常见问题速查

| 症状 | 原因/解法 |
|---|---|
| 改了 html 但页面没变 | 浏览器缓存 → **Ctrl+F5 强刷** |
| 换肤后某处颜色不对 | 组件里写死了 hex → 改成 `var(--…)` |
| 实拍照片发灰/半透明 | 误加入 blend → 从 `blended` 集合移除 |
| 页码错乱（xx/25 之类） | 数据里硬编码了页数 → 删掉，让 build 推导 |
| QC 报"缺键" | 新页 id 与 NOTES 键不一致 → 检查 PAGES 数组 |
| 备注卡长稿遮底部功能条 | 版本过旧 → 重新 build（新模板已内置滚动修复） |
| build 日志 NOTES keys 数 ≠ 页数 | 仅计数口径噪音（正则漏计带后缀 id），以 QC 契约为准 |
| 中文文件名/内容乱码 | 用 UTF-8 无 BOM 保存；PowerShell 5.1 写脚本注意编码 |
| 构建后想要纯文字示例 | `examples/pages.demo.mjs` 即零图全模板示例 |

更多复盘与教训：`references/web-faq.md`（F1–F15）。

---

## 14. 许可与致谢

- 仓库代码与文档：**MIT**（见 LICENSE），可自由使用/修改/商用，保留版权声明即可。
- 引擎与视觉风格为自研沉淀（档案出版感：深蓝夜空 × 米白纸、细金线、超大页码水印、明暗节奏），从真实展厅巡讲任务复盘而来。
- 规范库 five-pieces（版式/组件/节奏/质检/FAQ）记录了大量实测经验，欢迎提 Issue 交流。

**仓库主页**：https://github.com/jiushicaishi/caishi-speech-web-skill
**提交问题**：仓库 Issues（https://github.com/jiushicaishi/caishi-speech-web-skill/issues）
