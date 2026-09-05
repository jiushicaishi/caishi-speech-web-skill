/* ============================================================
   pages.demo.mjs — 通用演示内容（示例）
   本文件演示引擎的 8 类模板：cover / divider / cols / full /
   nums / quote / plain / end。内容为占位级通用示例，可整体替换。
   字段契约见 references/web-layouts.md
   ============================================================ */
export const PAGES = [
  {
    tpl: 'cover', id: 'cover', dark: true,
    docTitle: '巡讲网页 · 通用示例',
    kicker: 'GUIDED TOUR · 示例',
    h1: '示例巡讲<br/>网页标题',
    sub: '这是一份引擎演示：档案出版风 · 明暗节奏 · 讲稿备注一体。',
    meta1: '讲解辅助 · 演示',
    meta2: '约 12 分钟 · 三条主线',
    feetL: '示例 · 开场',
    feetR: '0 / 0',
    section: '序', minutes: 0.8,
    purpose: '演示封面版式与标题规则。',
    talk: ['这是第一页，说明 cover 模板的样子。', '标题可用 br 分行。'],
    transition: '进入第一章',
    cue: '站定开场',
    note: '讲解辅助工具演示'
  },
  {
    tpl: 'divider', id: 'd1', dark: true,
    chNo: '壹', chEn: 'ACT I · SECTION ONE', ch: '第一章：<br/>主线示例',
    chSub: '本页演示章节页：徽章 + 章名 + 副题。',
    feetL: '第一章', feetR: '0 / 0',
    section: '第一章', minutes: 1.0,
    purpose: '章节过渡',
    talk: ['章节页只需一句话带过。'],
    transition: '讲第一小节',
    cue: ''
  },
  {
    tpl: 'plain', id: 'p1', dark: false,
    kicker: '第一章 · 内容页',
    h: '要点卡片版式（无图）',
    sub: '演示 plain 模板：标题置顶 + 2×2 编号要点卡。',
    bullets: [
      '第一条要点：说明本页要讲的核心内容。',
      '第二条要点：单条建议不超过四十字。',
      '第三条要点：卡片两行半内观感最佳。',
      '第四条要点：正好凑满二乘二的网格。'
    ],
    feetL: '第一章 · 第一节', feetR: '0 / 0',
    section: '第一章', minutes: 1.6,
    purpose: '信息陈列',
    talk: ['把四条要点逐一念清即可。'],
    transition: '',
    cue: ''
  },
  {
    tpl: 'quote', id: 'q1', dark: true,
    kicker: '第一章 · 金句',
    h: '引言之页',
    quote: '一句值得停留的话，让听众记住此刻。',
    src: '—— 出处 · SOURCE',
    feetL: '第一章 · 金句', feetR: '0 / 0',
    section: '第一章', minutes: 1.0,
    purpose: '情绪锚点',
    talk: ['金句放慢读，读完停一拍。'],
    transition: '',
    cue: '停顿'
  },
  {
    tpl: 'nums', id: 'n1', dark: false,
    kicker: '第二章 · 数据',
    h: '数字信息页版式',
    cards: [
      ['标签一', '1200', '单位', '一句注释说明这个数字的意义。'],
      ['标签二', '86.5', '%', '占比类数字，念的时候放慢。'],
      ['标签三', '3', '项', '小整数配短句。'],
      ['标签四', '1999', '年', '时间节点。']
    ],
    feetL: '第二章 · 数据', feetR: '0 / 0',
    section: '第二章', minutes: 1.8,
    purpose: '用数字建立记忆点',
    talk: ['数字页是记忆点，逐个念准。'],
    transition: '',
    cue: ''
  },
  {
    tpl: 'plain', id: 'p2', dark: true,
    kicker: '第三章 · 深色要点',
    h: '深底要点卡片',
    bullets: [
      '深色页同样支持编号卡片。',
      '金点列表与编号卡二选一。',
      '深底留白可稍大。',
      '信息量低于浅色页更从容。'
    ],
    feetL: '第三章 · 深色', feetR: '0 / 0',
    section: '第三章', minutes: 1.6,
    purpose: '明暗节奏演示',
    talk: ['演示深色 plain 卡片。'],
    transition: '',
    cue: ''
  },
  {
    tpl: 'plain', id: 'p3', dark: false,
    kicker: '第三章 · 要点列表',
    h: '要点列表页版式',
    bullets: [
      '要点一：当内容条数超过四条，用列表而非卡片。',
      '要点二：列表适合讲述感强的段落。',
      '要点三：深底金点与浅底红点由主题自动切换。',
      '要点四：数据开头，结论收尾。',
      '要点五：五条以内一次讲完不累。'
    ],
    feetL: '第三章 · 列表', feetR: '0 / 0',
    section: '第三章', minutes: 1.6,
    purpose: '列表演示',
    talk: ['五条以内逐条讲。'],
    transition: '进入收尾',
    cue: ''
  },
  {
    tpl: 'end', id: 'end', dark: true,
    h: '谢谢聆听',
    bullets: [
      '主线一回顾',
      '主线二回顾',
      '留下一个问题供讨论'
    ],
    feetL: '收束', feetR: '0 / 0',
    section: '收束', minutes: 0.8,
    purpose: '收尾',
    talk: ['感谢聆听，进入问答。'],
    transition: '',
    cue: '停顿后邀请提问'
  }
];
