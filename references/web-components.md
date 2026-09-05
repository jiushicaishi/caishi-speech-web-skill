# 网页讲解组件库 references/web-components
> 组件 = build.mjs 渲染器按字段自动生成的"积木"。页面数据不直接写 HTML，靠字段触发组件。

## 一、组件清单（字段 → 组件）

| 组件 | 类名 | 由哪个字段触发 | 说明 |
|---|---|---|---|
| 页眉条 | `.top` | 自动（每页） | 左：馆名；右：FIELD NOTE · 页码/总数 |
| 引导小标 | `.kicker` | kicker | 页顶金色小字（章节·主题） |
| 页标题 | `h1/h2` | h / h1 | 深色页 h1 用金属渐变字；`<br/>` 分行 |
| 副题 | `.sub` | sub | 灰色说明行（≤46ch） |
| 要点列表 | `ul.tick` | bullets | 金点项目符 + 深浅页两套配色 |
| 编号要点卡 | `.fcard+.fno` | plain 模板 bullets | 2×2 网格 `.fgrid`，左上 mono 编号 |
| 数字卡 | `.card`(lb/nb/em/nt) | nums 模板 cards | 2×2 大数字信息卡 |
| 金句块 | `.goldquote+.src` | quote 字段 | 引言 + 出处（细金线衬底） |
| 图片框 | `.fig>.ph+figcaption` | img | 见下"图片组件" |
| 章节徽章 | `.d-badge` | divider chNo | 中文数字（壹贰叁肆）方徽章 |
| 章节英文 | `.d-en` | chEn | ACT I 等，等宽字体大字距 |
| 章节名 | `.ch-name` | ch | 大标题（≤16ch） |
| 章节金线 | `.chrule` | 自动 | 居中渐隐细金线 |
| 章节副题 | `.d-sub` | chSub | 章内小字副题 |
| 页脚条 | `.footbar` | feetL + 页码 | 左脚注文字 / 右页号（自动） |
| 水印页码 | `.wm` | 自动 | 右上/左上超大衬线数字（档案感） |
| 深色页装饰 | `.stars` / `.kframe` | 自动(dark 页) | 星点 / 全屏细线框（可打印关） |

## 二、图片组件细则

| 场景 | 结构要点 |
|---|---|
| cols 图 | `<figure.fig>` 占右栏（align-self:stretch）；`.ph` 内 img max-height 60vh，object-fit contain |
| full 图 | figure flex:1 撑满下方；min-height:0 防裁切 |
| 深底图融入 | 键在 blended 集合 → `.fig-blend`：ph 透明 + `mix-blend-mode:screen` |
| 实拍图 | 非 blend → 深色页 `.ph` 白底（相框）；浅色页纸卡 |
| 图注 | figcaption 两栏：左图注 cap、右页码 |

**图例：白卡 vs 融入**
```
深色页 + 深底图   → fig-blend（图像融入背景，无框）
深色页 + 实拍照片 → 白卡相框（一般实拍图）
浅色页 + 任何照片 → 白纸卡 + 轻投影
```

## 三、样式变量（三主题通用，见 web-themes 或 build-tour extraCSS）

全部组件颜色走 `var()`：
- 深浅底：`--deep/--deep-2/--ink/--paper/--paper-2`
- 强调/金：`--gold/--gold-bright/--accent`
- 文字：`--body-on-paper/--muted-on-paper/--white`
- 线条：`--line/--line-dark`
- 字体：`--serif/--sans/--mono`
- 深色页氛围（新增）：`--dark-aurora-a/b、--dark-base-a/b/c、--metal-a..d、--deep-fg/--deep-sub`

**规则：新组件一律不许写死色值**，必须引用变量——否则三主题换肤会破相（实测坑）。

## 四、禁/慎用清单（从实战教训提炼）

- 禁用：占位词（"此处添加/单击此处/Add your…"，QC 会查）
- 禁用：连续同版式同底色翻页（节奏规则见 web-rhythm）
- 慎用：`<br/>` 在需要两行对齐的长标题（可用，但别超 3 行）
- 慎用：正文整段金色（浅底无衬；金只用于标题/编号/装饰线）
- 禁止：直接把实拍照片键加入 blended 集合
- 注意：fcard 自动 2×2，要点条数别做 3 条/5 条（会留空洞）——4 条最佳；5+ 条考虑 tick 列表页
