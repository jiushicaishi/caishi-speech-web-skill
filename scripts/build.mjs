#!/usr/bin/env node
/* ============================================================
   build.mjs — 讲解巡讲网页构建引擎（发布版 / 通用）
   用法: node scripts/build.mjs [pages.mjs路径] [输出路径]
   默认: 相对技能根 examples/pages.demo.mjs -> examples/out/demo.html
   环境变量可选:
     TPL_HTML=自定义骨架模板路径（默认 templates/skeleton-v3.html）
     TITLE=输出 <title> 前缀（默认取自 pages 元信息）
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __here = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__here, '..');

const arg = (i, d) => process.argv[i + 2] !== undefined ? process.argv[i + 2] : d;
const pagesPath = resolve(arg(0, join(SKILL_ROOT, 'examples', 'pages.demo.mjs')));
const destPath = resolve(arg(1, join(SKILL_ROOT, 'examples', 'out', 'demo.html')));
const tplPath = process.env.TPL_HTML ? resolve(process.env.TPL_HTML) : join(SKILL_ROOT, 'templates', 'skeleton-v3.html');

const PAGES = (await import('file:///' + pagesPath.replace(/\\/g, '/'))).PAGES;
const tpl = readFileSync(tplPath, 'utf8');
/* 图片映射：可选。若 pages 使用图片且有 IMG_MAP 路径，则读取；否则页面仅用文字/占位。 */
let imgmap = {};
const imgmapPath = process.env.IMG_MAP ? resolve(process.env.IMG_MAP) : null;
if (imgmapPath && existsSync(imgmapPath)) {
  try { imgmap = JSON.parse(readFileSync(imgmapPath, 'utf8')); } catch (e) { console.warn('imgmap 读取失败，按无图处理:', e.message); }
}

/* ---- 工具（与自研模板 CSS 契约一致） ---- */
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const escBR = (s = '') => String(s).replace(/&/g, '&amp;').split('<br/>').join('\u2028').split('<br />').join('\u2028').split('<br>').join('\u2028').replace(/</g, '&lt;').split('\u2028').join('<br/>');
function qq(s) { let out = '', open = true; for (const ch of String(s)) { if (ch === '"') { out += open ? '“' : '”'; open = !open; } else out += ch; } return out; }
const T = s => qq(s);
const TOTAL = PAGES.length;
const pad = n => String(n).padStart(2, '0');
const pgnum = i => `${pad(i + 1)} / ${TOTAL}`;

/* ---- 骨架读取时把模板内占位 meta（馆名/人名）作为可配置 ---- */
const ORG = process.env.ORG || '某博物馆 · 专题巡讲';
const ORGANIZER = process.env.ORGANIZER || '';

/* ---- 版式渲染 ---- */
const blended = new Set(['route_map', 'landing', 'spirit', 'timeline', 'rocket', 'station', 'suits', 'nums', 'cover_bg']);
function sectionHTML(p, i) {
  const n = i + 1;
  const no = String(n).padStart(2, '0');
  const wm = `<span class='wm'>${no}</span>`;
  const star = (p.dark && p.tpl !== 'plain' && p.tpl !== 'cols') ? '<span class="stars"></span>' : '';
  const frame = (p.dark && p.tpl !== 'cover' && p.tpl !== 'divider' && p.tpl !== 'quote') ? '<span class="kframe"></span>' : '';
  const darkCls = p.dark ? ' dark' : ' light';
  const title = esc(p.h1 || (p.h || '').replace(/<br\/?>/g, '') || p.ch.replace(/<br\/?>/g, '') || p.chSub || '');
  let inner = '';
  const effFeetR = /^\d+ \/ \d+$/.test(p.feetR || '') ? `${pad(i + 1)} / ${TOTAL}` : (p.feetR || '');
  const topBar = `<div class="top"><span>${esc(T(ORG))}</span><span>FIELD NOTE · ${pad(i + 1)}/${TOTAL}</span></div>`;
  const foot = `<div class="footbar"><span>${esc(T(p.feetL || p.section || ''))}</span><span class="num">${esc(T(effFeetR))}</span></div>`;

  if (p.tpl === 'cover') {
    inner = topBar + `
      <div class="body">
        <div class="kicker anim d1">${esc(T(p.kicker))}</div>
        <h1 class="anim d2" style="max-width:16ch">${esc(T(p.h1))}</h1>
        <div class="sub anim d3" style="margin-top:2vh">${esc(T(p.sub))}</div>
        <div class="meta anim d4" style="margin-top:3vh"><span>${esc(T(p.meta1))}</span><span>${esc(T(p.meta2))}</span></div>
      </div>` + foot;
  } else if (p.tpl === 'divider') {
    const chRaw = String(p.ch || '').replace(/<br\/?>/gi, '\u2028');
    const chEsc = esc(T(chRaw)).split('\u2028').join('<br/>');
    inner = `<div class="top"><span>${esc(T(p.chEn || p.feetL || ''))}</span><span>FIELD NOTE · ${pad(i + 1)}/${TOTAL}</span></div>
      <div class="body" style="align-items:center;text-align:center">
        <div class="d-badge anim d1">${esc(p.chNo)}</div>
        <div class="d-en anim d1">${esc(T(p.chEn || ''))}</div>
        <h2 class="ch-name anim d2">${chEsc}</h2>
        <div class="chrule anim d3"></div>
        <p class="d-sub anim d3">${esc(T(p.chSub || ''))}</p>
      </div>` + foot;
  } else {
    const head = (p.kicker ? `<div class="kicker anim d1">${esc(T(p.kicker))}</div>\n` : '') +
      `<h2 class="anim d2">${escBR(T(p.h || p.h1 || ''))}</h2>` + (p.sub ? `\n<p class="sub anim d3" style="margin-top:1.8vh;max-width:46ch">${esc(T(p.sub))}</p>` : '');
    let list = '';
    if (p.bullets && p.bullets.length) {
      const lis = p.bullets.map(b => `<li>${esc(T(b))}</li>`).join('\n');
      list = `\n<ul class="tick anim d4">${lis}</ul>`;
    }
    let quoteBlock = '';
    if (p.quote) {
      quoteBlock = `\n<div class="goldquote anim d3"><p>${esc(T(p.quote))}</p>${p.src ? `<div class="src">${esc(T(p.src))}</div>` : ''}</div>`;
    }
    let fig = '';
    const blendCls = (p.img && blended.has(p.img)) ? ' fig-blend' : '';
    const hasImg = p.img && imgmap[p.img] && imgmap[p.img].uri;
    if (hasImg && p.tpl === 'cols') {
      fig = `\n<figure class="fig anim d3${blendCls}" style="align-self:stretch;justify-content:center;min-width:0"><div class="ph"><img src="${imgmap[p.img].uri}" alt="${esc(p.cap || '')}"></div><figcaption><span>${esc(T(p.cap || ''))}</span><span>${esc(T(effFeetR))}</span></figcaption></figure>`;
    } else if (hasImg && p.tpl === 'full') {
      fig = `\n<figure class="fig anim d3${blendCls}" style="flex:1;min-height:0;margin-top:2vh"><div class="ph" style="flex:1;min-height:0"><img src="${imgmap[p.img].uri}" alt="${esc(p.cap || '')}"></div><figcaption><span>${esc(T(p.cap || ''))}</span><span>${esc(T(effFeetR))}</span></figcaption></figure>`;
    } else if (p.img && !imgmap[p.img]) {
      console.warn(`注意：页面 ${p.id} 声明图片 '${p.img}' 但 imgmap 无此键（已按无图渲染）`);
    }
    let cards = '';
    if (p.tpl === 'nums' && p.cards) {
      const cs = p.cards.map(c => `<div class="card"><div class="lb">${esc(T(c[0]))}</div><div class="nb">${esc(c[1])}<em>${esc(T(c[2]))}</em></div><div class="nt">${esc(T(c[3]))}</div></div>`).join('\n');
      cards = `\n<div class="cards anim d4">${cs}</div>`;
    }
    if (p.tpl === 'cols') inner = topBar + `<div class="cols" style="margin-top:2vh">\n<div class="l">${head}${quoteBlock}${list}</div>${fig}</div>` + foot;
    else if (p.tpl === 'full') inner = topBar + `<div class="full-head">${head}</div>` + fig + foot;
    else if (p.tpl === 'nums') inner = topBar + `<div class="body">${head}${list ? list : ''}${cards}</div>` + foot;
    else if (p.tpl === 'quote') inner = topBar + `<div class="body">${head}${quoteBlock}${list}</div>` + foot;
    else if (p.tpl === 'end') inner = topBar + `<div class="body" style="align-items:center;text-align:center">${head}${list ? `\n<ul class="tick anim d4" style="text-align:left;max-width:38ch;margin:3vh auto 0">${p.bullets.map(b => `<li>${esc(T(b))}</li>`).join('\n')}</ul>` : ''}</div>` + foot;
    else {
      const fcells = (p.bullets || []).map((b, j) => `<div class="fcard"><span class="fno">${String(j + 1).padStart(2, '0')}</span><p>${esc(T(b))}</p></div>`).join('\n');
      inner = topBar + `<div class="body" style="align-items:stretch">${head}\n<div class="fgrid anim d4">${fcells}</div></div>` + foot;
    }
  }
  const padStyle = `style="height:100%;display:flex;flex-direction:column"`;
  return `<section class="slide${darkCls}" data-id="${p.id}" data-title="${title}">
    ${wm}${star}${frame}
    <div class="pad" ${padStyle}>
    ${inner}
    </div>
  </section>`;
}

/* ---- NOTES_BASE ---- */
const J = v => JSON.stringify(T(v || ''));
function notesBase() {
  const parts = PAGES.map((p) => {
    const talk = p.talk ? p.talk.map(t => JSON.stringify(T(t))) : [];
    return `  ${p.id}:{section:${J(p.section)},minutes:${p.minutes || 1.5},purpose:${J(p.purpose || p.note)},talk:[${talk.join(',')}],transition:${J(p.transition)},cue:${J(p.cue)},interaction:'',delivery:'',advance:'',fallback:''}`;
  });
  return 'var NOTES_BASE = {\n' + parts.join(',\n') + '\n};\n';
}

/* ---- 组装 ---- */
const extraCSS = `
/* ===== 巡讲全量 · 补充版式 ===== */
.d-badge{display:inline-flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;
  font-size:clamp(18px,1.6vw,26px);letter-spacing:.14em;line-height:1;
  border:1px solid rgba(233,203,110,.5);color:var(--gold-bright);
  padding:.9vh 1.6vw .9vh 1.7vw;border-radius:2px;background:rgba(233,203,110,.06);
  min-width:2.4em;margin-bottom:2.2vh}
.d-en{font-family:var(--mono);font-size:clamp(10px,.9vw,13px);letter-spacing:.5em;text-transform:uppercase;
  color:inherit;opacity:.6;margin-bottom:2vh}
.ch-name{font-size:clamp(32px,4.8vw,72px);line-height:1.24;letter-spacing:.04em;max-width:16ch}
.chrule{width:96px;height:1px;background:linear-gradient(90deg,transparent,var(--gold-bright),transparent);margin:3vh auto 0;opacity:.8}
.d-sub{font-family:var(--sans);font-size:clamp(14px,1.3vw,18px);line-height:1.8;letter-spacing:.16em;
  color:inherit;opacity:.6;margin-top:2.4vh;max-width:52ch}
.slide.dark ul.tick li{color:rgba(240,244,255,.94)}
.slide.dark ul.tick li::before{background:var(--gold);box-shadow:0 0 0 3px rgba(217,182,74,.16)}
figure.fig{min-width:0}
.slide.dark figure.fig .ph{background:#fff}
.slide.dark figure.fig.fig-blend .ph{background:transparent;border-color:rgba(255,255,255,.14)}
.slide.dark figure.fig.fig-blend img{mix-blend-mode:screen}
.slide.dark figure.fig figcaption{color:#C9D2E2}
.slide.dark figure.fig figcaption span{color:#C9D2E2}
.slide.dark .cols h2{color:#F2F4FA}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:1.8vh 2vw;width:100%;margin-top:4vh;flex:1;align-content:center}
.fcard{position:relative;border:1px solid;padding:2.6vh 1.6vw 2.6vh 3.2vw;border-radius:2px;display:flex;align-items:flex-start;min-height:11vh;text-align:left}
.slide.light .fcard{border-color:var(--line);background:#fff;box-shadow:0 10px 22px -20px rgba(20,30,60,.5)}
.slide.dark .fcard{border-color:rgba(255,255,255,.13);background:rgba(255,255,255,.035)}
.fcard .fno{position:absolute;left:1.1vw;top:2.7vh;font-family:var(--mono);font-size:clamp(11px,.9vw,13px);letter-spacing:.16em;color:var(--gold-bright)}
.slide.light .fcard .fno{color:var(--accent)}
.fcard p{font-family:var(--sans);font-size:clamp(14.5px,1.3vw,19px);line-height:1.75;color:inherit}
.slide.light .fcard p{color:var(--body-on-paper)}
.slide.light .fcard:hover{border-color:var(--gold)}
.full-head{flex:0 0 auto;padding-top:3.5vh}
.full-head h2{font-size:clamp(22px,2.6vw,40px)}
.slide .cols figure.fig .ph{height:auto;min-height:34vh;max-height:60vh;width:100%}
.slide .cols figure.fig .ph img{max-height:60vh;max-width:100%;width:auto;height:auto;object-fit:contain}
.slide .cols figure.fig.fig-blend .ph img{max-width:92%}
@media print{
  .d-badge{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .d-sub{opacity:.8}
}
/* ================= 主题皮肤系统 v1 ================= */
:root{
  --dark-aurora-a:rgba(46,74,148,.4);
  --dark-aurora-b:rgba(24,42,92,.12);
  --dark-base-a:#0A1126;--dark-base-b:#0C1532;--dark-base-c:#080E20;
  --metal-a:#F7EBC8;--metal-b:#E8CE8C;--metal-c:#CDA54F;--metal-d:#AE8A39;
  --deep-fg:rgba(240,244,255,.94);
  --deep-sub:#C9D2E2;
}
.slide.dark{background:radial-gradient(120% 90% at 82% -12%, var(--dark-aurora-a) 0%, var(--dark-aurora-b) 45%, transparent 72%), radial-gradient(58% 34% at 46% 112%, var(--gold) 0%, transparent 74%), linear-gradient(162deg,var(--dark-base-a) 0%, var(--dark-base-b) 48%, var(--dark-base-c) 100%)}
.slide.dark h1{background:linear-gradient(178deg,var(--metal-a) 0%,var(--metal-b) 40%,var(--metal-c) 78%,var(--metal-d) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
.slide.dark h2{color:var(--deep-fg)}
.slide.dark ul.tick li{color:var(--deep-fg)}
.slide.dark figure.fig figcaption span{color:var(--deep-sub)}
:root[data-theme="party"]{
  --deep:#1C090D;--deep-2:#33101a;--ink:#2B0E14;--ink-2:#5A2530;
  --paper:#FBF6EF;--paper-2:#F4EAE0;--line:#E4D5C6;
  --gold:#C9A227;--gold-bright:#E3C064;--accent:#9E2B25;--white:#FDF8F0;
  --body-on-paper:#47221F;--muted-on-paper:#8A6A5A;
  --dark-aurora-a:rgba(158,43,37,.4);--dark-aurora-b:rgba(120,32,28,.14);
  --dark-base-a:#2A0F14;--dark-base-b:#33101a;--dark-base-c:#1B090C;
  --metal-a:#F6E7C8;--metal-b:#EBC98C;--metal-c:#C9A227;--metal-d:#96761D;
  --deep-fg:#FBF1EA;--deep-sub:#DCC8BC;
}
:root[data-theme="biz"]{
  --deep:#0D1522;--deep-2:#1A2740;--ink:#14202F;--ink-2:#33485F;
  --paper:#FCFDFF;--paper-2:#F1F4F9;--line:#D8E0EC;
  --gold:#8F7A4E;--gold-bright:#C6B382;--accent:#2E6FD0;--white:#F7FAFE;
  --body-on-paper:#33404F;--muted-on-paper:#7A8898;
  --dark-aurora-a:rgba(46,111,208,.4);--dark-aurora-b:rgba(30,70,140,.14);
  --dark-base-a:#101B2E;--dark-base-b:#182742;--dark-base-c:#0A111E;
  --metal-a:#EDF2FA;--metal-b:#C4D4EA;--metal-c:#8FA8CC;--metal-d:#5F7EA8;
  --deep-fg:#EDF2FB;--deep-sub:#B9C7DC;
}
#theme-dock{position:fixed;right:16px;bottom:14px;z-index:9000;display:flex;gap:7px;align-items:center;
  padding:5px 9px;border-radius:20px;background:rgba(255,255,255,.88);border:1px solid rgba(0,0,0,.1);
  box-shadow:0 4px 14px rgba(0,0,0,.18);font-family:var(--mono);font-size:11px;color:#555;backdrop-filter:blur(3px)}
#theme-dock span.t-lab{margin-right:2px;opacity:.8;letter-spacing:.08em}
#theme-dock button{width:16px;height:16px;border-radius:50%;border:2px solid #fff;cursor:pointer;padding:0;
  box-shadow:0 0 0 1px rgba(0,0,0,.18);outline:none}
#theme-dock button.on{box-shadow:0 0 0 2px #333}
#theme-dock button[data-t="blue"]{background:#27437c}
#theme-dock button[data-t="party"]{background:#9E2B25}
#theme-dock button[data-t="biz"]{background:#2E6FD0}
`;
const cssIn = tpl.indexOf('</style>');
let out = tpl.slice(0, cssIn) + extraCSS + tpl.slice(cssIn);

const deckStart = out.indexOf('<div id="deck">');
const navPos = out.indexOf('<div id="nav"></div>');
const deckEnd = out.lastIndexOf('</div>', navPos);
const deckHTML = PAGES.map(sectionHTML).join('\n');
out = out.slice(0, deckStart) + '<div id="deck">\n' + deckHTML + '\n</div>\n' + out.slice(navPos);

const nbS = out.indexOf('var NOTES_BASE = {');
const nbE = out.indexOf('};', nbS);
out = out.slice(0, nbS) + notesBase() + out.slice(nbE + 2);

/* 标题：来自 pages 元信息或封面字段，通用 */
const deckTitle = (PAGES[0] && (PAGES[0].deckTitle || PAGES[0].h1)) || '讲解巡讲网页';
const htmlTitle = (PAGES[0] && PAGES[0].docTitle) ? PAGES[0].docTitle : `${deckTitle} · 讲解辅助`;
out = out.replace(/<title>[^<]*<\/title>/, `<title>${esc(htmlTitle)}</title>`);
out = out.replace('>1 / 5</span>', `>1 / ${TOTAL}</span>`);

/* 主题切换脚本 */
const THEME_JS = `<script>
(function(){
  var KEY='dsTourTheme';
  function apply(t){
    document.documentElement.setAttribute('data-theme', t||'blue');
    try{ localStorage.setItem(KEY, t||'blue'); }catch(e){}
    var bs=document.querySelectorAll('#theme-dock button');
    for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on', bs[i].getAttribute('data-t')===(t||'blue'));
  }
  function init(){
    var q=new URLSearchParams(location.search);
    var t=q.get('theme')||null;
    if(!t){ try{ t=localStorage.getItem(KEY); }catch(e){ t=null; } }
    if(!t) t=document.documentElement.getAttribute('data-theme');
    if(['blue','party','biz'].indexOf(t)<0) t='blue';
    apply(t);
    var mode=q.get('mode')||'main';
    if(mode==='main' || mode==='aud'){
      var d=document.createElement('div'); d.id='theme-dock'; d.innerHTML='<span class="t-lab">主题</span>'+
        '<button data-t="blue" title="深蓝金（默认）"></button>'+
        '<button data-t="party" title="党政红"></button>'+
        '<button data-t="biz" title="简约商务"></button>';
      document.body.appendChild(d);
      d.addEventListener('click', function(e){
        var b=e.target.closest?e.target.closest('button'):null;
        if(b) apply(b.getAttribute('data-t'));
      });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
</script>`;
out = out.replace('</body>', THEME_JS + '\n</body>');

mkdirSync(dirname(destPath), { recursive: true });
writeFileSync(destPath, out, 'utf8');
console.log('written', destPath, out.length, 'bytes');
console.log('slides:', (out.match(/<section class="slide/g) || []).length);
const nk = (out.match(/\n  [a-z0-9]+:\{/g) || []).length;
console.log('NOTES keys:', nk);
