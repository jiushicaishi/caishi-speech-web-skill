#!/usr/bin/env node
/* ============================================================
   qc.mjs — 巡讲网页产物自动质检
   用法: node scripts/qc.mjs [产物html路径]
   默认: examples/out/demo.html（相对技能根；任意页数产物通用）
   对应 references/web-checklist.md 的自动检查项(§1/§2)
   ============================================================ */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
let target = process.argv[2];
if (!target) {
  target = resolve(here, '../examples/out/demo.html');
} else if (!/^[A-Za-z]:[\\/]/.test(target)) {
  target = resolve(here, target);
}
if (!existsSync(target)) { console.error('找不到文件:', target); process.exit(1); }

const c = readFileSync(target, 'utf8');
const stripBase64 = s => s.replace(/src="data:image[^"]*"/g, '');
const txt = stripBase64(c);

const results = [];
const featureResults = [];
const check = (name, pass, detail) => results.push({ name, pass, detail });
/* 版本特性类（新构建才要求；旧产物缺失只提示不算 FAIL） */
const feat = (name, pass, detail) => featureResults.push({ name, pass, detail });

/* 1. slides 数 */
const slides = txt.match(/<section class="slide/g) || [];
check('slides 数', slides.length > 0, slides.length + ' 页');

/* 2. NOTES_BASE 键 <-> data-id 对齐（仅统计 <section class="slide…">） */
const ids = [...txt.matchAll(/<section class="slide[^"]*"[^>]*data-id="([^"]+)"/g)].map(m => m[1]);
const nbM = c.match(/var NOTES_BASE = \{([\s\S]*?)\n\};/);
const nbSrc = nbM ? nbM[1] : '';
const keys = [...nbSrc.matchAll(/(?:^|\n)\s*([A-Za-z0-9_]+):\{/g)].map(m => m[1]);
const missing = ids.filter(x => !keys.includes(x));
const extra = keys.filter(x => !ids.includes(x));
const nbAlign = nbM && missing.length === 0 && extra.length === 0;
check('备注契约 data-id↔NOTES_BASE', nbAlign,
  `ids=${ids.length} keys=${keys.length}` + (missing.length ? ` 缺键:${missing}` : '') + (extra.length ? ` 多余:${extra}` : ''));

/* 3. 页码唯一连续（页脚 .num） */
const nums = [...txt.matchAll(/<span class="num">([^<]*)<\/span>/g)].map(m => m[1].trim());
const uniq = new Set(nums);
const uniqOk = nums.length > 0 && uniq.size === nums.length;
const seqOk = (() => {
  const totalMatch = nums[0] && nums[0].match(/\/\s*(\d+)$/);
  if (!totalMatch) return false;
  const N = +totalMatch[1];
  if (N !== slides.length) return false;
  for (let i = 0; i < N; i++) {
    const want = String(i + 1).padStart(2, '0') + ' / ' + N;
    if (!nums.includes(want)) return false;
  }
  return true;
})();
check('页码唯一连续', uniqOk && seqOk,
  `共 ${uniq.size}/${nums.length} 个唯一页脚号` + (seqOk ? '' : '（缺连续序号）'));

/* 4. div 闭合 */
const divO = (txt.match(/<div/g) || []).length;
const divC = (txt.match(/<\/div>/g) || []).length;
check('div 闭合', divO === divC, `open=${divO} close=${divC}`);

/* 5. 占位词残留（剔除 base64 后） */
const placeholders = ['此处添加', '单击此处', 'Add your', '预设标题', 'Lorem', '占位'];
const hits = [];
for (const p of placeholders) {
  let i = 0;
  while ((i = txt.indexOf(p, i)) >= 0) { hits.push(p); i += p.length; }
}
check('无占位词', hits.length === 0, hits.length ? '命中:' + [...new Set(hits)].join(',') : '干净');

/* 6. 三主题变量存在（版本特性：旧构建可无） */
feat('主题层(party/biz CSS)', c.includes('data-theme="party"') && c.includes('data-theme="biz"'), '');
feat('主题切换 JS(theme-dock)', c.includes('theme-dock'), '');

/* 7. 长稿滚动修复（版本特性：防遮挡，新构建应含） */
feat('备注卡滚动修复(#note-card overflow)', /#note-card\{[^}]*overflow-y:auto/.test(txt), '');
feat('notes 浮层限高', txt.includes('max-height:min(52vh,460px)'), '');

/* 8. 内联图片：仅当产物声明了图（figure.fig / fig-blend）时才要求内联存在 */
const declaredImgs = (txt.match(/<figure class="fig/g) || []).length;
const uriCount = (c.match(/data:image\/(png|jpe?g|webp)[^"]+/g) || []).length;
const needImg = declaredImgs > 0;
check('内联图片数', !needImg || uriCount > 0, `${uriCount} 张内联 / ${declaredImgs} 处声明图` + (needImg && !uriCount ? '（有声明图但未内联）' : ''));

/* ---- 输出 ---- */
const fail = results.filter(r => !r.pass);
const featMiss = featureResults.filter(r => !r.pass);
console.log('QC 报告 · ' + target.split('/').pop());
console.log('='.repeat(52));
for (const r of results) {
  console.log((r.pass ? 'PASS' : 'FAIL') + '  ' + r.name.padEnd(30) + (r.detail || ''));
}
for (const r of featureResults) {
  console.log((r.pass ? 'PASS' : '提示') + '  ' + r.name.padEnd(30) + (r.pass ? '' : '(版本特性，旧产物可缺失)'));
}
console.log('='.repeat(52));
console.log(fail.length ? `共 ${fail.length} 项硬伤未过` : '结构检查全部通过 ✓' + (featMiss.length ? `（${featMiss.length} 项版本特性缺失）` : ''));
process.exit(fail.length ? 1 : 0);
