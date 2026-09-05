# 网页讲解版式库 references/web-layouts
> 配套引擎：`scripts/build.mjs`（渲染）+ `examples/pages.demo.mjs`（页面数据）
> 产物规格：单文件 HTML，页 1280×720（16:9），浏览器全屏翻页，深/浅两套底色按页切换。

## 一、模板总览（tpl 字段）

| tpl | 用途 | 结构 | 典型用例 |
|---|---|---|---|
| `cover` | 封面 | 顶部工具条 + kicker + h1(16ch内) + sub + meta | 第一页 |
| `divider` | 章节页 | d-badge(中文数字) + d-en(ACT) + ch-name + chrule + d-sub | 每章第一页 |
| `cols` | 左文右图（或右图） | 左列 head+quote+list，右侧 figure.fig | 有实拍照/图页 |
| `full` | 全幅图文 | full-head(h2) + figure(flex:1 大图) | 火箭/时间轴等大图页 |
| `nums` | 数字卡页 | head + 2×2 cards（lb 标签/nb 大数/unit/note） | 数字记忆页等 |
| `quote` | 引言金句页 | head + goldquote + 说明 | 序厅金句 |
| `end` | 结束页 | head + 居中列表 | 谢谢聆听 |
| （默认）`plain` | 纯文字 2×2 | head + fgrid（fcard 编号卡） | 无图内容页 |

## 二、选择规则（写页面数据时的决策顺序）

1. 有**实拍照片**且想并排展示 → `cols`（img 键 + imgPos:'right'）
2. 有**大图**要撑版面 → `full`
3. 内容为**精确数字**（3-4 组） → `nums`（cards 4 项：标签|数值|单位|注释）
4. 只有文字、无合适图 → `plain`（自动转 2×2 fcard，禁止空落单列）
5. 章首/场景切换 → `divider`；全篇头尾 → cover/end
6. 同章内 **连续两页不得同模板同底色**（见 web-rhythm）

## 三、每页字段契约

| 字段 | 必需 | 说明 |
|---|---|---|
| tpl / id / dark | ✓ | dark:true=深底，false=浅纸底 |
| kicker | 内容页 | 页眉小标（章节·主题） |
| h / h1 | ✓ | 标题，可用 `<br/>` 分行 |
| sub | 选 | 副题（≤46ch） |
| bullets | 大多 | 3-5 条 tick 列表；plain 时成为 fcard |
| img + cap | 图页 | img=imgmap 键名；cap=图注 |
| imgPos | cols | 'right' |
| cards | nums | 4 卡 |
| quote/src | quote | 金句与出处 |
| feetL | ✓ | 页脚左（章节脚注） |
| section/minutes | ✓ | 备注分区 + 预估分钟 |
| purpose/note/talk/cue | ✓ | 备注卡（讲解数据契约） |

## 四、图片处理规则（重要）

- **深底原创图**（底色≈#0C1E3E）→ 键名入 blended 集合 → 自动 `fig-blend`：
  `mix-blend-mode:screen` 融入深色页，无白框。
- **实拍照片（浅底/彩色）** → 不在 blended 集合 → 深色页白卡（`.ph` 白底相框）、浅色页白纸卡。
- **勿把实拍图键加入 blended**：screen 会让照片发灰半透明。
- 尺寸：cols 右栏建议 ≥1024px 宽；full 建议 16:9 ≥1600px。
- 图片以 dataURL 内联（imgmap），产物保持单文件自包含。

## 五、版式细节基准（可写进 CSS 的参考值）

- 版心：左右 padding 6.2vw；页眉 top/footbar 全宽 hairline。
- 深底页角标 `.wm`：超大衬线页码（水印感，颜色 rgba(255,255,255,.05)）。
- 深色页金色字：不用纯金整段，标题用金属渐变(见 themes)，正文用 --white/深色高亮。
- 卡片：1px 边框 + 2px 圆角 + 少量投影；light 卡白底、dark 卡透明微亮底。
- 正文行高 ≥1.75；标题 letter-spacing .04em（档案感）。

## 六、新增页流程（工程）

1. `examples/pages.demo.mjs` → PAGES 数组内加对象（含上面字段）
2. 若用新照片：放 `assets/img/` → 更新 `imgmap.json`（跑 `build-imgmap.mjs`）→ 键名写进 img
3. 跑 `node scripts/build.mjs`
4. 校验（见 web-checklist），页码/备注/总数全部自动（build 按数组长度推导）
5. 打开产物按 Ctrl+F5，翻到新页检查（浏览器截图/目测）
