# 网页讲解管线·常见问题与复盘 references/web-faq
> 每次实战后补一条；让技能越用越强。分四类：编码环境 / 图片素材 / 构建渲染 / 交付验证。

## 一、编码与环境（Windows 特供）

### F1 PowerShell 5.1 中文乱码 → 语法错
- 现象：ps1 无 BOM，PowerShell5.1 按 ANSI(GBK) 读中文 → 中文变乱码甚至语法错误；pwsh7 无此问题。
- 修法：文件存 UTF-8 **带 BOM**（`new UTF8Encoding($true)`）。write/edit 工具产出无 BOM，编辑含 BOM 文件会破坏 BOM → 改后必须重建 BOM。
- 备份小工具：`_fixbom.ps1 param([string]$File)` 读 UTF8 写 UTF8BOM。

### F2 bat 编码与管道
- bat 需 GBK(936) 或纯 ASCII；echo 行不能含裸 `|`。涉及中文建议 `chcp 65001` 且脚本另存 UTF-8。
- 与 F1 同根：多工具链（bat/ps1/mjs）编码口径不一时先查 BOM。

## 二、图片与素材

### F3 Wikimedia 文件名易错（空格 vs 连字符）
- 现象：`Shenzhou 12 roll out 02.png` 不存在，`Shenzhou-12 roll out 02.png` 存在。空格版普遍 missing。
- 修法：用 Wikimedia API 核实确切文件名再下载，别凭记忆拼 URL。

### F4 官方页抓回装饰条
- 现象：官方快讯页正文图里混入二维码/横幅（720×68 之类）。
- 修法：下载脚本加尺寸过滤（宽<800 或高<350 或宽高比>3.5 剔除），文案提示用"跳过(尺寸不符)"勿吓人。

### F5 深底原创图 vs 实拍照片的嵌入方式
- 深底原创图(底色≈#0C1E3E)：放 blend 集合 → mix-blend-mode:screen 融入深色页。
- 实拍照片：绝不 blend（会半透明发灰），应走白卡/相框。
- 判定底色：本地 `GetPixel` 平均亮度 >~120 为浅底(白卡)，<~95 为深底(可 blend)。

### F6 图放不进/存错目录
- v2/v3 下载脚本默认输出 `_下载图\`；人工要用的主图统一收进 `scripts\_img\` 再入 imgmap。
- imgmap 键值 = {uri: dataURL, bytes}；重建用 `build-imgmap.mjs`，勿手工编辑 1MB+ JSON。

## 三、构建与渲染

### F7 页码/总数写死 → 加页后错乱
- 历史：25 页阶段 build 里 `FIELD NOTE · xx/25`、标题"(25页)"、默认进度 `>1/25<`、每页 feetR 全硬编码。
- 修法：build 改为 `TOTAL = PAGES.length`，页码/备注键/文件名全由数组长度推导（已参数化）。加页只动 tour-pages.mjs。

### F8 data-id ↔ NOTES 键必须对齐
- 备注按 slide 的 data-id 查 NOTES_BASE[id]。加页若用带后缀 id（pg09s/pg12a）没问题，但**校验勿用严格 `pg\d\d` 正则**（会漏计），用"键集合⊇id集合"比对。

### F9 div 数/图片检查的误区
- grep "/25" 或 "25" 命中多半在图片 base64 里（dataURL 随机字符）——先剔除 `src="data:image..."` 再查正文。
- build 日志 "NOTES keys:25"（页数31时）与 "extra css in:false" 都只是 console 计数口径，非真故障。

### F10 plain 页 fcard 空洞
- fcard 自动 2×2，要点做 3 条或 5 条会留洞。要点取 4 条；内容多的改 tick 列表页或拆两页。

### F11 cols/full 图片裁切或留白过大
- `.cols figure.fig` 需 `align-self:stretch;min-width:0`，`.ph` 高度链 min/max-height 约束，img object-fit contain 防裁。
- full 图 flex:1 + min-height:0；标题区 `.full-head` 固定，勿让 flex 挤压。

## 四、主题与交付

### F12 主题切换"没生效"的坑
- 主题 JS 优先级：URL ?theme= → localStorage → html data-theme 属性 → blue。
- 静态改 html 标签 data-theme 验证时，会被 JS 按 localStorage 重置 → 截图看似同色。先清 `dsTourTheme` 或传参。
- CSS 变量：新组件写死 hex 会三主题破相；一律 var(--…)。

### F13 交付后用户看到旧版
- 改了 html 必须 **Ctrl+F5**（浏览器缓存旧文件）。交付说明里必须写这句。

### F14 文件体积大（图内联）
- 内联 dataURL 使单文件 1.9–2MB+。可接受（自包含）；若嫌大可降图片分辨率/只内联用到的键。别用 <img src="相对路径">，破坏单文件自包含。

## 五、本轮 31 页实战新增复盘（2026-09）

1. **加六页后旧 25 页文件与 31 页并存** → 交付讲清"用 31 页，25 页为历史版"，或删旧防混淆。
2. **插入页 id 用语义后缀**(pg09s/pg12a/pg12b/pg12c/pg15a/pg15b) → 数组顺序即页面顺序，id 只要唯一，不必连续；NOTES 自动跟。
3. **分钟合计随页变**（页数变化时）→ 封面 meta2"约N分钟"须手动同步（封面文案不在 build 自动范围）。
4. **主题层注入尽量放 build**（extraCSS + body前 JS），基线模板零改动 → 25/31 页及未来产物全带主题，模板不膨胀。
5. **fcard 与 nums 卡文字量**：新页要点别超两行半，fcard min-height 会撑但观感差——宁拆两页。
6. **讲述草稿过长遮挡（2026-09-06 修复）**：演讲者右栏 `#note-card`（本页目的/讲述草稿/提示）内容超高时因无 overflow 而外溢，视觉上压住下方 `#p-bar`（计时/翻页功能文字）。修复模板 CSS：`#note-card{flex:1 1 auto;overflow-y:auto;min-height:0}`（内容区内滚动）、`#p-right{overflow:hidden}` + `#p-right>*{flex-shrink:0}`（顶部/底栏不再被挤出）；主屏 N 浮层 `#notes` 补 `max-height:min(52vh,460px);overflow-y:auto`。规律：**凡"左/右栏 = 可变长内容 + 底部固定功能条"，内容容器必须独占滚动（overflow-y:auto），功能条禁 shrink**。

## 六、快速排查索引
| 现象 | 先查 |
|---|---|
| 中文乱码/语法错 | F1 F2（BOM） |
| 页面不出图/图错 | F5 F6（imgmap 键/底色） |
| 页码错乱 | F7（TOTAL） |
| 某页备注空白 | F8（id↔键） |
| 主题换不上 | F12（localStorage/CSS变量） |
| 用户说"没看到改动" | F13（强刷） |
