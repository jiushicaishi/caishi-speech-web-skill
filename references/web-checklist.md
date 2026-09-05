# 网页讲解质检清单 references/web-checklist
> 用途：每次 build.mjs 重建后逐项勾选。质量靠清单，不靠手感。

## 一、构建后必查（自动/脚本可查项）

**先跑一键自动质检（覆盖第 1、2、4、5 项）**：
```
node scripts/qc.mjs [产物html路径]   # 默认指向 examples/out/demo.html；任意页数产物通用
```
退出码 0 = 结构全过；"提示"类为版本特性（旧产物可缺失）。以下为清单明细，人工抽查仍建议过一遍。

| # | 检查项 | 期望 | 命令/方法 |
|---|---|---|---|
| 1 | slides 数量 | = PAGES.length | build 输出行 "slides: N" |
| 2 | 备注键数量 | = slides 数量 | build 输出 NOTES keys；N 页 = N |
| 3 | data-id ↔ NOTES 键一一对应 | 无缺失 | 见下"备注契约校验" |
| 4 | 页脚页码 | 01/N … N/N 连续、唯一 | `正则 '<span class="num">'` 收集去重计数 = N |
| 5 | 页眉 FIELD NOTE | 每页 xx/N | 抽查首末 |
| 6 | div 闭合 | open == close | 粗略正则对比 |
| 7 | 图片 bytes 与源图一致 | 嵌入图解码长度≈源文件 | imgmap 每键 {uri,bytes} 抽查 |
| 8 | 正文无占位词 | 无 | grep "此处添加\|单击此处\|Add your\|预设标题" |
| 9 | 文件名 | 巡讲网页-N页.html | build 自动（TOTAL 参数化） |

## 二、备注契约校验（重要）

运行时备注按 `slides[cur].dataset.id` 查 `NOTES_BASE[id]`。任何 slide 缺键 = 该页讲解时备注空白。

```
slides data-id 集合 ⊇ NOTES_BASE 键集合，且一一对应
```
校验脚本片段（PowerShell）：
```powershell
$c = Get-Content '<html>' -Raw -Encoding UTF8
$ids = [regex]::Matches($c,'data-id="([^"]+)"')|%{$_.Groups[1].Value}
$nb  = [regex]::Match($c,'var NOTES_BASE = \{([\s\S]*?)\n\};')
$keys= [regex]::Matches($nb.Groups[1].Value,'^\s{2}(pg[^:]+):','Multiline')|%{$_.Groups[1].Value}
"缺键: " + (($ids | ?{$_ -notin $keys}) -join ',')
```
新页 id 允许 `pg09s/pg12a` 这类带后缀名（与 data-id 一致即可）；建脚本校验勿用 `pg\d\d` 严格正则。

## 三、浏览器验收（必做，人眼环节）

1. **Ctrl+F5 强刷**（重要：改过 html 后旧缓存会显示旧版）
2. 逐页翻：文字不溢出卡片/标题不换行异常、图片不裁不白
3. 深色页图片观感：
   - 深底图：应融入（无白框）
   - 实拍照片：白卡相框是否合适
4. 浅色页：纸卡/文字对比度 OK
5. 演讲者预览（?mode=pv）/观众模式（?mode=aud）能开、翻页同步
6. 打印：导出 PDF 后每页一版、无动画残留、无水印过深

## 四、三主题换肤验收（若启用主题系统）

| 主题 | data-theme | 预期观感 |
|---|---|---|
| 深蓝金 | blue（默认） | 深蓝底 + 金 |
| 党政红 | party | 红褐深底 + 暖金 + 米白纸 |
| 简约商务 | biz | 冷蓝灰 + 银 + 白纸 |

- 每主题看 1 张深色页 + 1 张浅色页（颜色确实变化）
- 切换方式：URL `?theme=party` 或右下悬浮圆点（仅主控/观众窗）
- 注意：主题 JS 有 localStorage 记忆；测试完删 `dsTourTheme` 或换隐身窗
- 打印导出沿用当前 data-theme（无需额外配置）

## 五、常见误报与排除

- grep "25" 出现：产物含图片 base64，"25"字样出现在 dataURL 中属正常——查正文前先剔除 `src="data:image..."` 段
- build 输出 "NOTES keys: 25"（页数 31 时）：仅控制台计数正则用 `pg\d\d`，带后缀 id（pg12a）不计入 → 用上面 §2 脚本真校验
- "extra css in: false"：build 日志该项只在 CSS 注释文本匹配时 True，不影响功能（CSS 注入以 grep `.fgrid/.fig-blend` 为准）
- vision API 额度有限：截图用本地 html_screenshot；"看图"优先 local dominant-colors 或请用户目测

## 六、交付前最后一遍

- [ ] 打开新 N 页 html 强刷无 JS 报错
- [ ] 首（cover）/末（end）页正常
- [ ] 页脚时间口径与 minutes 合计一致（封面 meta 文案手改过就核对）
- [ ] 旧版本文件保留或删除有交代（同目录 25/31 页并存时说明差异）
- [ ] 预览 PNG 输出到产物目录（如 _预览_新增页_*.png），方便用户不开浏览器先看
