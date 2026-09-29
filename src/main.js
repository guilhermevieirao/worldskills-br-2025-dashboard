(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const coll = new Intl.Collator('pt-BR');
  const n2 = n => String(n).padStart(2, '0');
  const ord = n => n + 'º';
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

  const D = JSON.parse($('#bundle').textContent);
  const W = D.mundial;

  const SECTORS = [
    { name: 'Construção e Edificações', key: 'construcao' },
    { name: 'Artes Criativas e Moda', key: 'artes' },
    { name: 'Tecnologia da Informação', key: 'ti' },
    { name: 'Manufatura e Engenharia', key: 'manufatura' },
    { name: 'Serviços Sociais e Pessoais', key: 'servicos' },
    { name: 'Transporte e Logística', key: 'transporte' },
  ];
  const SECTOR_EN = { 'Construção e Edificações': 'construction building technology', 'Artes Criativas e Moda': 'creative arts fashion', 'Tecnologia da Informação': 'information communication technology', 'Manufatura e Engenharia': 'manufacturing engineering technology', 'Serviços Sociais e Pessoais': 'social personal services', 'Transporte e Logística': 'transportation logistics' };
  const secVar = name => { const s = SECTORS.find(x => x.name === name); return s ? `var(--s-${s.key})` : 'var(--cover-2)'; };
  const MEDAL = { prata: 'Medalha de Prata', bronze: 'Medalha de Bronze', excelencia: 'Medalha de Excelência', participacao: 'Participação' };
  const MEDAL_SHORT = { prata: 'Prata', bronze: 'Bronze', excelencia: 'Excelência', participacao: 'Participação' };
  const RES = { prata: 'Prata em Shanghai', bronze: 'Bronze em Shanghai', excelencia: 'Excelência em Shanghai', participacao: 'Participação em Shanghai', top5: 'Top 5 da ocupação em Shanghai' };
  const FMT = { solo: 'Ocupações individuais', equipe: 'Ocupações em equipe' };
  const UF = { AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins' };
  const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  const UF_REGION = { AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte', AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste', DF: 'Centro-Oeste', GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste', PR: 'Sul', RS: 'Sul', SC: 'Sul' };
  // estados pequenos demais para o rótulo: número fora, com linha até o estado
  const MAP_CALLOUT = { PE: [614, 206], RJ: [548, 474], ES: [572, 380], AL: [640, 238], SE: [630, 262], PB: [640, 184], RN: [640, 160], DF: [452, 300] };
  const COMPOUND = ['maria', 'joao', 'luiz', 'juan', 'ana', 'caio', 'marcus', 'jose'];
  const shortName = full => {
    const t = full.split(/\s+/).filter(w => !/^(de|da|do|dos|das|e)$/i.test(w));
    if (t.length <= 2) return t.join(' ');
    const first = COMPOUND.includes(norm(t[0])) ? t[0] + ' ' + t[1] : t[0];
    return first + ' ' + t[t.length - 1];
  };
  const initials = n => { const w = n.trim().split(/\s+/); return ((w[0] || '')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };

  const icon = {
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.8l2.7 5.7 6.2.8-4.6 4.3 1.2 6.2L12 16.8l-5.5 3 1.2-6.2L3.1 9.3l6.2-.8z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9M12 3C9.4 5.6 8.1 8.6 8.1 12s1.3 6.4 3.9 9"/></svg>',
  };

  // ── participantes ──
  // perfis agrupados em cinco famílias, como no painel original
  const CATS = [
    { id: 'comp', nome: 'Competidores', test: p => /^Competidor/.test(p) },
    { id: 'aval', nome: 'Avaliação', test: p => /^Avaliador|^SAEP Tutor/.test(p) },
    { id: 'tec', nome: 'Liderança técnica', test: p => /^(Chefe|Delegado)/.test(p) },
    { id: 'org', nome: 'Organização', test: p => /^(Staff|Organiza|Coordenador|Assessoria)/.test(p) },
    { id: 'com', nome: 'Comunicação', test: () => true },
  ];
  const catOf = perfil => CATS.find(c => c.test(perfil)).id;
  const catName = id => CATS.find(c => c.id === id).nome;
  // comissão (quem não tem ocupação), em blocos
  const ROLE_GROUPS = [
    { nome: 'Coordenação', test: p => /^(Coordenador|Assessoria)/.test(p) },
    { nome: 'Delegados técnicos', test: p => /^Delegado/.test(p) },
    { nome: 'Chefes de equipe', test: p => /^Chefe/.test(p) },
    { nome: 'Organização e staff', test: p => /^(Staff|Organiza)/.test(p) },
    { nome: 'Comunicação', test: () => true },
  ];
  // ordem dentro da equipe da ocupação
  const CREW_ORDER = ['Avaliador Líder', 'Avaliador Líder Adjunto', 'Chefe de Oficina', 'Coordenador Técnico', 'Avaliador', 'Avaliador de Empresa', 'SAEP Tutor', 'Staff'];
  const crewRank = p => { const i = CREW_ORDER.indexOf(p.perfil); return i < 0 ? 99 : i; };
  const dict = (name, i) => i < 0 ? '' : D[name][i];

  const P = D.rows.map((r, i) => {
    const [nome, inst, perfil, ocup, uf, sn, img, local, grupo, emp] = r;
    const p = {
      i, nome, inst: dict('inst', inst), perfil: dict('perfil', perfil), ocup: dict('ocup', ocup), uf, sn, img,
      local: dict('local', local), grupo: dict('grupo', grupo), emp: dict('emp', emp), ws: W.rows[i] || null,
    };
    p.cat = catOf(p.perfil);
    p.reg = UF_REGION[uf] || '';
    p.sk = sn ? W.skills[sn] : null;
    p.sector = p.sk?.sector || '';
    p.fmt = p.sk ? (p.sk.team ? 'equipe' : 'solo') : '';
    p.comp = (p.ws || []).find(x => x.kind === 'comp') || null;
    p.res = p.comp ? W.skills[p.comp.n] : null;
    p.past = (p.ws || []).flatMap(x => x.past || []);
    const wsText = (p.ws || []).map(x => [x.role, x.n && W.skills[x.n]?.pt, x.n && W.skills[x.n]?.en, x.kind === 'comp' ? 'competidor' : ''].join(' ')).join(' ');
    p.hay = norm([nome, p.inst, p.perfil, p.ocup, p.local, p.grupo, p.emp, UF[uf], p.reg, p.sk?.pt, p.sk?.en, p.sector, SECTOR_EN[p.sector], wsText,
      p.ws ? 'shanghai mundial worldskills 2026' : '', p.past.map(a => a.event + ' ' + a.skill).join(' ')].join(' '));
    p.nameKey = norm(nome);
    return p;
  });
  const byName = {};
  P.forEach(p => (byName[p.nameKey] ||= []).push(p));
  const isComp = p => p.cat === 'comp' && p.sn;

  // ── fotos ──
  // a miniatura embutida aparece na hora; no site, o recorte 600x800 e a original vêm dos pacotes por HTTP Range
  let canRange = /^https?:$/.test(location.protocol) && !!D.packs?.length;
  const cache = {};
  const packUrl = ref => (cache[ref] ||= (async () => {
    if (!canRange) throw new Error('offline');
    const [b, o, l, t] = ref.split(':'); const s = +o, n = +l;
    const ctl = new AbortController();
    const r = await fetch(D.packs[+b], { headers: { Range: `bytes=${s}-${s + n - 1}` }, signal: ctl.signal });
    if (r.status !== 206) { ctl.abort(); canRange = false; throw new Error('sem range'); }
    return URL.createObjectURL(new Blob([await r.arrayBuffer()], { type: t === 'p' ? 'image/png' : 'image/jpeg' }));
  })());
  const thumb = k => 'data:image/jpeg;base64,' + D.imgs[k];
  const photo = (p, cls = '') => p.img < 0
    ? `<span class="ph ${cls}" aria-hidden="true">${esc(initials(p.nome))}</span>`
    : `<img data-img="${p.img}" alt="" decoding="async" ${cls ? `class="${cls}"` : ''}>`;
  const load = img => {
    if (!img.dataset.img) return;
    const k = +img.dataset.img; img.removeAttribute('data-img');
    img.src = thumb(k);
    if (canRange && D.orig?.[k]) packUrl(D.orig[k]).then(u => { img.src = u; }, () => {});
  };
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target); load(e.target);
  }), { rootMargin: '500px 0px' }) : null;
  const lazy = root => $$('img[data-img]', root).forEach(img => io ? io.observe(img) : load(img));

  // ── figurinha, mini e crachá ──
  const rot = i => (((i * 37) % 5) - 2) * 0.45;
  const sash = p => p.res?.bon
    ? `<span class="sash sash--bon" aria-hidden="true">${icon.star}Best of Nation${icon.star}</span>`
    : p.ws ? `<span class="sash" aria-hidden="true">${icon.globe}Shanghai 2026</span>` : '';
  const wsLabel = p => {
    if (!p.ws) return '';
    if (p.res) return `, em Shanghai: ${MEDAL[p.res.medal]}, ${p.res.position}º de ${p.res.total}${p.res.bon ? ', Best of Nation' : ''}`;
    const x = p.ws[0];
    return `, em Shanghai: ${x.kind === 'gen' ? x.role : `${x.role || 'equipe'} de ${W.skills[x.n]?.pt || ''}`}`;
  };
  const exLabel = p => p.past.length ? ', ex-competidor da WorldSkills' : '';
  const sticker = p => {
    const m = p.res?.medal || '';
    return `<button class="sticker" type="button" data-p="${p.i}" ${m ? `data-m="${m}"` : ''}
      aria-label="${esc(p.nome)}, ${esc(p.perfil)}${p.ocup ? ', ' + esc(p.ocup) : ''}, ${esc(p.inst)}${esc(wsLabel(p))}${exLabel(p)}" style="--tint:${secVar(p.sector)};--rot:${rot(p.i)}deg">
      <span class="sticker__photo">
        ${p.sn ? `<span class="sticker__n num">${n2(p.sn)}</span>` : ''}
        ${p.uf ? `<span class="sticker__uf">${p.uf}</span>` : ''}
        ${photo(p)}
        ${sash(p)}
      </span>
      <span class="sticker__band"><span class="sticker__name">${esc(shortName(p.nome))}</span><span class="sticker__occ">${esc(p.inst)}</span></span>
      <span class="sticker__res">${p.res
        ? `<span class="medal" data-m="${m}">${MEDAL_SHORT[m]}</span><span><b class="num">${ord(p.res.position)}</b> de ${p.res.total}</span>`
        : `<span>${esc(p.perfil)}</span>`}</span>
    </button>`;
  };
  const mini = p => `<button class="mini" type="button" data-p="${p.i}" ${p.past.length ? 'data-ex="true"' : ''} aria-label="${esc(p.nome)}, ${esc(p.perfil)}, ${esc(p.inst)}${esc(wsLabel(p))}${exLabel(p)}">
      <span class="mini__photo">${p.past.length ? `<span class="ex-badge" aria-hidden="true">${icon.star}</span>` : ''}${photo(p)}${p.ws ? `<span class="sash" aria-hidden="true">${icon.globe}Shanghai</span>` : ''}</span>
      <span>${esc(shortName(p.nome))}</span><small>${esc(p.perfil)}${p.uf ? ' · ' + p.uf : ''}</small>
    </button>`;
  const badge = p => `<button class="card-staff" type="button" data-p="${p.i}" ${p.past.length ? 'data-ex="true"' : ''} aria-label="${esc(p.nome)}, ${esc(p.perfil)}, ${esc(p.inst)}${esc(wsLabel(p))}${exLabel(p)}">
      <span class="card-staff__photo">${p.past.length ? `<span class="ex-badge" aria-hidden="true">${icon.star}</span>` : ''}${p.uf ? `<span class="sticker__uf">${p.uf}</span>` : ''}${photo(p)}${sash(p)}</span>
      <span class="card-staff__band"><span class="card-staff__name">${esc(shortName(p.nome))}</span><span class="card-staff__role">${esc(p.perfil)} · ${esc(p.inst)}</span></span>
    </button>`;

  // ── filtros ──
  const SELECTS = ['perfil', 'inst', 'ocup', 'local', 'sec', 'uf', 'reg', 'res', 'fmt'];
  const MORE = ['sec', 'uf', 'reg', 'res', 'fmt'];
  const state = { q: '', cats: [], perfil: '', inst: '', ocup: '', local: '', sec: '', uf: '', reg: '', res: '', fmt: '', ws: false, ex: false,
    view: store.get('wsb-view') === 'list' ? 'list' : 'album', order: 'setor', sort: 'nome', shown: 60, more: {} };
  const qWords = () => norm(state.q).split(/\s+/).filter(w => w && w !== '#');
  const isNum = w => /^#?(\d{1,2})$/.exec(w);
  const FIELD = { perfil: 'perfil', inst: 'inst', ocup: 'ocup', local: 'local', sec: 'sector', uf: 'uf', reg: 'reg', fmt: 'fmt' };
  const matchesExcept = (p, skip) => {
    if (skip !== 'cats' && state.cats.length && !state.cats.includes(p.cat)) return false;
    for (const k in FIELD) if (skip !== k && state[k] && p[FIELD[k]] !== state[k]) return false;
    if (skip !== 'res' && state.res && !(p.res && (state.res === 'top5' ? p.res.position <= 5 : p.res.medal === state.res))) return false;
    if (skip !== 'ws' && state.ws && !p.ws) return false;
    if (skip !== 'ex' && state.ex && !p.past.length) return false;
    // número da ocupação com ou sem # e zero (9, 09, #9, #09)
    if (skip !== 'q') return qWords().every(w => { const n = isNum(w); return n ? +n[1] === p.sn : p.hay.includes(w); });
    return true;
  };
  const matches = p => matchesExcept(p, null);
  const filtered = () => !!(state.q || state.cats.length || state.ws || state.ex || SELECTS.some(k => state[k]));

  const tally = (list, f) => { const m = {}; list.forEach(p => { const k = f(p); if (k) m[k] = (m[k] || 0) + 1; }); return m; };
  const fill = (id, label, m, sortAlpha, name = k => k, order) => {
    const keys = order || Object.keys(m).sort(sortAlpha ? (a, b) => coll.compare(name(a), name(b)) : (a, b) => m[b] - m[a] || coll.compare(a, b));
    $('#f-' + id).innerHTML = `<option value="">${label}</option>` + keys.filter(k => m[k]).map(k => `<option value="${esc(k)}">${esc(name(k))} (${m[k]})</option>`).join('');
  };
  const occNum = {}; P.forEach(p => { if (p.ocup && p.sn) occNum[p.ocup] = p.sn; });
  fill('perfil', 'Todos os perfis', tally(P, p => p.perfil));
  fill('inst', 'Todas as instituições', tally(P, p => p.inst));
  fill('ocup', 'Todas as ocupações', tally(P, p => p.ocup), true, k => `${n2(occNum[k] || 0)} · ${k}`);
  fill('local', 'Todos os locais de prova', tally(P, p => p.local));
  fill('sec', 'Todos os setores', tally(P, p => p.sector), false, k => k, SECTORS.map(s => s.name));
  fill('uf', 'Todos os estados', tally(P, p => p.uf), true, k => UF[k] || k);
  fill('reg', 'Todas as regiões', tally(P, p => p.reg), false, k => k, REGIONS);
  const resCount = { prata: 0, bronze: 0, excelencia: 0, participacao: 0, top5: 0 };
  P.forEach(p => { if (p.res) { resCount[p.res.medal]++; if (p.res.position <= 5) resCount.top5++; } });
  fill('res', 'Todos os resultados', resCount, false, k => RES[k], Object.keys(RES));
  fill('fmt', 'Individual e em equipe', tally(P, p => p.fmt), false, k => FMT[k], ['solo', 'equipe']);

  $('#f-ws').innerHTML = `${icon.globe}Foram a Shanghai <span class="n num" id="n-ws"></span>`;
  $('#f-ex').innerHTML = `${icon.star}Ex-competidores da WorldSkills <span class="n num" id="n-ex"></span>`;
  $('#f-total').textContent = P.length;

  // ── capa ──
  const wsComps = P.filter(p => p.res);
  const occTotal = new Set(P.filter(p => p.sn).map(p => p.sn)).size;
  const instTotal = new Set(P.map(p => p.inst).filter(Boolean)).size;
  $('#tally').innerHTML = `<span><b class="num">${P.length}</b> participantes</span><span><b class="num">${occTotal}</b> ocupações</span><span><b class="num">${wsComps.length}</b> competidores em Shanghai</span>`;
  const MRANK = { prata: 0, bronze: 1, excelencia: 2, participacao: 3 };
  const fan = [...wsComps].filter(p => p.img >= 0).sort((a, b) => MRANK[a.res.medal] - MRANK[b.res.medal] || a.res.position - b.res.position || b.res.mark - a.res.mark);
  const fanPick = [];
  for (const p of fan) { if (fanPick.length < 5 && !fanPick.some(x => x.comp.n === p.comp.n)) fanPick.push(p); }
  $('#fan').innerHTML = [fanPick[3], fanPick[1], fanPick[0], fanPick[2], fanPick[4]].filter(Boolean).map(sticker).join('');
  $('#fan').setAttribute('aria-label', 'Da seletiva ao pódio de Shanghai');
  $('#fan').setAttribute('role', 'group');
  $$('#fan img[data-img]').forEach(load);
  $('#fan').addEventListener('click', e => { const s = e.target.closest('[data-p]'); if (s) openBack(+s.dataset.p, s); });

  // ── números do recorte ──
  // cada painel conta o recorte atual sem o próprio filtro, para dar para trocar de valor direto nele
  const facet = k => P.filter(p => matchesExcept(p, k));
  const moreBtn = (id, n, label) => n > 0 ? `<button class="mt-more" type="button" data-more="${id}" aria-expanded="${!!state.more[id]}">${state.more[id] ? 'Mostrar menos' : label}</button>` : '';
  const none = '<p class="hint">Ninguém no recorte atual.</p>';
  const stack = (parts, max) => `<span class="bar__track">${parts.map(([v, c]) => v ? `<i style="width:${v / max * 100}%;background:${c}"></i>` : '').join('')}</span>`;
  const buildBoard = list => {
    // 0. resumo
    const oc = new Set(list.filter(p => p.sn).map(p => p.sn)).size, ins = new Set(list.map(p => p.inst).filter(Boolean)).size;
    const sub = (n, tot) => filtered() && tot ? ` <em>de ${tot}</em>` : '';
    $('#board-tally').innerHTML = [
      [list.length, ['participante', 'participantes'], P.length], [list.filter(p => p.cat === 'comp').length, ['competidor', 'competidores']],
      [list.filter(p => p.cat === 'aval').length, ['na avaliação', 'na avaliação']], [oc, ['ocupação', 'ocupações'], occTotal],
      [ins, ['instituição', 'instituições'], instTotal], [list.filter(p => p.ws).length, ['em Shanghai', 'em Shanghai']],
    ].map(([n, l, tot]) => `<span><b class="num">${n}</b> ${n === 1 ? l[0] : l[1]}${sub(n, tot)}</span>`).join('');

    // 1. da seletiva a Shanghai
    const fr = facet('res').filter(p => p.res);
    const seals = ['prata', 'bronze', 'excelencia', 'participacao'].map(m => {
      const n = fr.filter(p => p.res.medal === m).length;
      return `<button class="medal-tile" type="button" data-m="${m}" data-filter="res:${m}" aria-pressed="${state.res === m}" aria-label="${n} ${n === 1 ? 'competidor' : 'competidores'} com ${MEDAL[m]} em Shanghai"><b class="num">${n}</b><span>${MEDAL_SHORT[m]}</span></button>`;
    }).join('');
    const top5 = fr.filter(p => p.res.position <= 5).length;
    const bon = list.filter(p => p.res?.bon);
    const staffWS = new Set(list.filter(p => p.ws).flatMap(p => p.ws.filter(x => x.kind !== 'comp').map(x => x.kind + x.name))).size;
    const panelWS = `<div class="panel"><h3>Da seletiva a Shanghai</h3><p class="hint">${plural(fr.length, 'competidor', 'competidores')} ${filtered() ? 'do recorte' : 'desta seletiva'} ${fr.length === 1 ? 'defendeu' : 'defenderam'} o Brasil na WorldSkills Shanghai 2026. O resultado no mundial:</p>
        <div class="medals">${seals}</div>
        <p class="ws-note"><button class="linkish" type="button" data-filter="res:top5" aria-pressed="${state.res === 'top5'}"><b class="num">${top5}</b> ${top5 === 1 ? 'ficou' : 'ficaram'} entre os 5 primeiros da ocupação</button>.
        ${staffWS ? `E mais <b class="num">${staffWS}</b> ${staffWS === 1 ? 'pessoa viajou' : 'pessoas viajaram'} como expert, intérprete ou na comissão da delegação.` : ''} <button class="linkish" type="button" data-filter="ws:1">Ver quem foi a Shanghai</button></p>
        ${bon.length ? `<div class="bon bon--sm"><span class="bon__stars" aria-hidden="true">${icon.star}${icon.star}${icon.star}</span><div><p class="bon__title">Best of Nation</p><p class="bon__text">A maior nota do Brasil em Shanghai saiu desta seletiva: ${bon.map(p => `<button class="linkish linkish--light" type="button" data-open="${p.i}">${esc(p.nome)}</button>`).join(' e ')}, em ${esc(bon[0].res.pt)}.</p></div></div>` : ''}</div>`;

    // 2. perfis
    const fc = facet('cats'); const cc = tally(fc, p => p.cat); const cmax = Math.max(1, ...Object.values(cc));
    const panelCats = `<div class="panel"><h3>Quem está na seletiva</h3><p class="hint">Os registros ${filtered() ? 'do recorte' : 'do painel'}, por perfil. Dá para marcar mais de um.</p><div class="bars">${CATS.map(c => `<button class="bar" type="button" data-filter="cats:${c.id}" aria-pressed="${state.cats.includes(c.id)}"><span>${c.nome}</span>${stack([[cc[c.id] || 0, 'var(--ink)']], cmax)}<b class="num">${cc[c.id] || 0}</b></button>`).join('')}</div></div>`;

    // 3. estados e mapa
    const st = {};
    facet('uf').forEach(p => { if (!p.uf) return; const u = (st[p.uf] ||= { uf: p.uf, n: 0, comp: 0, ws: 0, med: 0 }); u.n++; if (p.cat === 'comp') u.comp++; if (p.ws) u.ws++; if (p.res && p.res.medal !== 'participacao') u.med++; });
    const states = Object.values(st).sort((a, b) => b.n - a.n || coll.compare(UF[a.uf], UF[b.uf]));
    const shade = n => n >= 60 ? 1 : n >= 30 ? 0.66 : n >= 10 ? 0.42 : 0.24;
    const tone = n => `color-mix(in srgb, var(--green) ${Math.round(shade(n) * 100)}%, var(--paper-2))`;
    const ufLabel = u => `${UF[u.uf]}: ${u.n} participantes, ${u.comp} competidores${u.ws ? `, ${u.ws} em Shanghai` : ''}`;
    const order = Object.keys(D.map.states).sort((a, b) => (a === 'DF') - (b === 'DF'));
    const paths = order.map(uf => {
      const u = st[uf], m = D.map.states[uf];
      return u
        ? `<path class="brmap__uf" d="${m.d}" data-has="true" data-uf="${uf}" data-filter="uf:${uf}" role="button" tabindex="0" aria-pressed="${state.uf === uf}" aria-label="${ufLabel(u)}" style="fill:${tone(u.n)}"/>`
        : `<path class="brmap__uf" d="${m.d}" aria-hidden="true"/>`;
    }).join('');
    const labels = states.map(u => {
      const m = D.map.states[u.uf], dark = shade(u.n) >= 0.42 ? 'dark' : 'light', c = MAP_CALLOUT[u.uf];
      if (c) return `<g class="brmap__call" data-uf="${u.uf}" aria-hidden="true"><rect x="${c[0] - 6}" y="${c[1] - 20}" width="72" height="36" fill="transparent"/><line x1="${m.x}" y1="${m.y}" x2="${c[0] - 4}" y2="${c[1]}"/><circle cx="${m.x}" cy="${m.y}" r="2.6"/><text x="${c[0]}" y="${c[1] + 9}"><tspan class="uf">${u.uf}</tspan> <tspan class="n">${u.n}</tspan></text></g>`;
      return m.r >= 24
        ? `<g class="brmap__lbl" data-on="${dark}" transform="translate(${m.x} ${m.y})"><text class="uf" y="-9">${u.uf}</text><text class="n" y="19">${u.n}</text></g>`
        : `<g class="brmap__lbl" data-on="${dark}" data-size="s" transform="translate(${m.x} ${m.y})"><text class="uf" y="-6">${u.uf}</text><text class="n" y="14">${u.n}</text></g>`;
    }).join('');
    const stateRows = states.map((u, k) => `<tr data-uf="${u.uf}"><td class="num">${k + 1}º</td><td><button class="linkish" type="button" data-filter="uf:${u.uf}" aria-pressed="${state.uf === u.uf}">${UF[u.uf]}</button></td><td class="num">${u.n}</td><td class="num">${u.comp}</td><td class="num">${u.ws || ''}</td><td class="num">${u.med || ''}</td></tr>`).join('');
    const outside = facet('uf').filter(p => !p.uf).length;
    const panelStates = `<div class="panel panel--wide"><h3>Participantes por estado</h3><p class="hint">Pela delegação de cada um.${outside ? ` ${plural(outside, 'participante', 'participantes')} da organização nacional (WorldSkills Brasil) e da Setec/MEC ${outside === 1 ? 'fica' : 'ficam'} fora do mapa.` : ''} Medalhas contam prata, bronze e excelência em Shanghai.</p>
        ${states.length ? `<div class="states">
          <div style="overflow-x:auto"><table class="mt"><thead><tr><th>#</th><th>Estado</th><th><abbr title="Participantes">Part.</abbr></th><th><abbr title="Competidores">Comp.</abbr></th><th><abbr title="Foram a Shanghai">Shanghai</abbr></th><th><abbr title="Medalhas em Shanghai: prata, bronze e excelência">Med.</abbr></th></tr></thead><tbody>${stateRows}</tbody></table></div>
          <div><div class="brmap"><svg viewBox="0 0 680 639" role="group" aria-label="Mapa do Brasil com o número de participantes por estado">${paths}${labels}</svg>
            <p class="brmap__info" aria-hidden="true">${plural(states.length, 'estado', 'estados')} no recorte. Passe o mouse ou toque para filtrar.</p></div>
            <div class="legend legend--center">${[[1, '1 a 9'], [10, '10 a 29'], [30, '30 a 59'], [60, '60 ou mais']].map(([n, t]) => `<span><i style="background:${tone(n)}"></i>${t}</span>`).join('')}</div></div>
        </div>` : none}</div>`;

    // 4. regiões e setores
    const legendCE = c => `<div class="legend"><span><i style="background:${c}"></i>Competidores</span><span><i style="background:color-mix(in srgb, ${c} 38%, var(--paper))"></i>Equipe, comissão e organização</span></div>`;
    const fg = facet('reg'); const rg = {};
    fg.forEach(p => { if (!p.reg) return; const g = (rg[p.reg] ||= { c: 0, o: 0 }); p.cat === 'comp' ? g.c++ : g.o++; });
    const rmax = Math.max(1, ...Object.values(rg).map(g => g.c + g.o));
    const panelReg = `<div class="panel"><h3>Por região</h3><p class="hint">Pela delegação de cada participante.</p><div class="bars">${REGIONS.map(r => { const g = rg[r] || { c: 0, o: 0 }; return `<button class="bar" type="button" data-filter="reg:${r}" aria-pressed="${state.reg === r}"><span>${r}</span>${stack([[g.c, 'var(--ink)'], [g.o, 'color-mix(in srgb, var(--ink) 38%, var(--paper))']], rmax)}<b class="num">${g.c + g.o}</b></button>`; }).join('')}</div>${legendCE('var(--ink)')}</div>`;
    const fs = facet('sec'); const sg = {};
    fs.forEach(p => { if (!p.sector) return; const g = (sg[p.sector] ||= { c: 0, o: 0 }); isComp(p) ? g.c++ : g.o++; });
    const smax = Math.max(1, ...Object.values(sg).map(g => g.c + g.o));
    const panelSec = `<div class="panel"><h3>Por setor</h3><p class="hint">Os seis setores da WorldSkills, pela ocupação de cada um.</p><div class="bars">${SECTORS.map(s => { const g = sg[s.name] || { c: 0, o: 0 }; const c = `var(--s-${s.key})`; return `<button class="bar" type="button" data-filter="sec:${s.name}" aria-pressed="${state.sec === s.name}"><span>${s.name.replace(' e ', ' e ')}</span>${stack([[g.c, c], [g.o, `color-mix(in srgb, ${c} 38%, var(--paper))`]], smax)}<b class="num">${g.c + g.o}</b></button>`; }).join('')}</div>${legendCE('var(--ink-2)')}</div>`;

    // 5. da seletiva ao mundial, ocupação por ocupação
    const fo = facet('ocup'); const occ = {};
    fo.forEach(p => { if (!p.sn) return; const o = (occ[p.sn] ||= { sn: p.sn, name: p.ocup, sector: p.sector, comp: 0, crew: 0, reps: [] }); isComp(p) ? o.comp++ : o.crew++; });
    fo.forEach(p => {
      if (!p.comp) return;
      const o = occ[p.comp.n]; if (o && !o.reps.includes(p)) o.reps.push(p);
      if (p.sn && p.sn !== p.comp.n && occ[p.sn] && !occ[p.sn].reps.includes(p)) occ[p.sn].reps.push(p);
    });
    const occList = Object.values(occ).sort((a, b) => a.sn - b.sn);
    const repTxt = (p, sn) => `<button class="linkish" type="button" data-open="${p.i}">${esc(shortName(p.nome))}</button>${p.comp.n !== sn ? ` <small>(em Shanghai, ${esc(W.skills[p.comp.n].pt)})</small>` : ''}`;
    const wsRows = occList.map((o, k) => { const s = W.skills[o.sn]; return `<tr ${k >= 12 && !state.more['ws-occ'] ? 'hidden' : ''}><td class="num">${n2(o.sn)}</td><td><button class="linkish" type="button" data-filter="ocup:${esc(o.name)}" aria-pressed="${state.ocup === o.name}">${esc(o.name)}</button></td><td class="num">${o.comp}</td><td>${o.reps.map(p => repTxt(p, o.sn)).join(', ')}</td><td>${s ? `<span class="medal" data-m="${s.medal}">${MEDAL_SHORT[s.medal]}</span> <span class="num">${ord(s.position)} de ${s.total}</span>${s.bon ? ' <small>· Best of Nation</small>' : ''}` : ''}</td></tr>`; }).join('');
    const panelWsOcc = `<div class="panel panel--wide"><h3>Da seletiva ao mundial, ocupação por ocupação</h3><p class="hint">Quantos competiram na seletiva, quem dela esteve em Shanghai e o resultado do Brasil na ocupação.</p>
        ${occList.length ? `<div style="overflow-x:auto"><table class="mt mt--ws"><thead><tr><th>Nº</th><th>Ocupação</th><th><abbr title="Competidores na seletiva">Comp.</abbr></th><th>Em Shanghai</th><th>Resultado do Brasil</th></tr></thead><tbody>${wsRows}</tbody></table></div>${occList.length > 12 ? moreBtn('ws-occ', occList.length, `Ver as ${occList.length} ocupações`) : ''}` : none}</div>`;

    // 6. ocupações por tamanho, na tinta do setor
    const occBySize = [...occList].sort((a, b) => (b.comp + b.crew) - (a.comp + a.crew) || a.sn - b.sn);
    const omax = Math.max(1, ...occBySize.map(o => o.comp + o.crew));
    const occRows = occBySize.map((o, k) => `<li class="rank-row" ${k >= 12 && !state.more['occ-rank'] ? 'hidden' : ''} data-on="${state.ocup === o.name}"><button class="linkish" type="button" data-filter="ocup:${esc(o.name)}"><span class="num">${n2(o.sn)}</span>${esc(o.name)}</button><span class="rank-row__v"><b class="num">${o.comp}</b> comp. · <b class="num">${o.crew}</b> na equipe</span><span class="rank-row__bar"><i style="width:${o.comp / omax * 100}%;background:${secVar(o.sector)}"></i><i style="width:${o.crew / omax * 100}%;background:color-mix(in srgb, ${secVar(o.sector)} 38%, var(--paper))"></i></span></li>`).join('');
    const panelOcc = `<div class="panel panel--wide"><h3>Ocupações</h3><p class="hint">Competidores e equipe (avaliação e oficina) de cada uma, na cor do setor.</p>
        ${occBySize.length ? `<ol class="rank-list rank-list--cols">${occRows}</ol>${occBySize.length > 12 ? moreBtn('occ-rank', occBySize.length, `Ver as ${occBySize.length} ocupações`) : ''}` : none}</div>`;

    // 7. instituições e locais de prova
    const rank = (id, key, label, cap) => {
      const f = facet(key); const m = {};
      f.forEach(p => { const v = p[key]; if (!v) return; const o = (m[v] ||= { name: v, n: 0, comp: 0 }); o.n++; if (p.cat === 'comp') o.comp++; });
      const l = Object.values(m).sort((a, b) => b.n - a.n || coll.compare(a.name, b.name));
      if (!l.length) return none;
      return `<ol class="rank-list">${l.map((o, k) => `<li class="rank-row" ${k >= cap && !state.more[id] ? 'hidden' : ''} data-on="${state[key] === o.name}"><button class="linkish" type="button" data-filter="${key}:${esc(o.name)}">${esc(o.name)}</button><span class="rank-row__v"><b class="num">${o.n}</b> · ${o.comp} comp.</span><span class="rank-row__bar"><i style="width:${o.n / l[0].n * 100}%"></i></span></li>`).join('')}</ol>${l.length > cap ? moreBtn(id, l.length, `Ver ${label.replace('N', l.length)}`) : ''}`;
    };
    const panelInst = `<div class="panel"><h3>Instituições</h3><p class="hint">Participantes de cada instituição e quantos são competidores.</p>${rank('inst-rank', 'inst', 'as N instituições', 10)}</div>`;
    const noLocal = facet('local').filter(p => !p.local).length;
    const panelLocal = `<div class="panel"><h3>Locais de competição</h3><p class="hint">Onde cada um esteve na seletiva.${noLocal ? ` ${plural(noLocal, 'registro não tem', 'registros não têm')} local.` : ''}</p>${rank('local-rank', 'local', 'os N locais', 10)}</div>`;

    // 8. ex-competidores da WorldSkills
    const fe = facet('ex').filter(p => p.past.length);
    const exSeen = new Set();
    const exList = fe.filter(p => !exSeen.has(p.nameKey) && exSeen.add(p.nameKey)).sort((a, b) => b.past[0].year - a.past[0].year || coll.compare(a.nome, b.nome));
    const panelEx = `<div class="panel panel--wide"><h3>Ex-competidores da WorldSkills</h3><p class="hint">Quem já defendeu o Brasil numa edição anterior e voltou à seletiva de outro lado: avaliando, liderando ou organizando. <button class="linkish" type="button" data-filter="ex:1">Filtrar o álbum</button></p>
        ${exList.length ? `<ol class="rank-list rank-list--cols">${exList.map(p => `<li class="rank-row"><button class="linkish" type="button" data-open="${p.i}">${esc(p.nome)}</button><span class="rank-row__v">${p.past.map(a => `<b class="num">${a.year}</b> ${esc(a.medal.replace('Medalha de ', ''))}`).join(' · ')}</span><span class="ex-note">${p.past.map(a => `${esc(a.event)} · ${esc(a.skill)} · ${a.position}º lugar`).join('; ')}. Na seletiva: ${esc(p.perfil)}${p.ocup ? ', ' + esc(p.ocup) : ''}.</span></li>`).join('')}</ol>` : none}</div>`;

    $('#board').innerHTML = panelWS + panelCats + panelStates + panelReg + panelSec + panelWsOcc + panelOcc + panelInst + panelLocal + panelEx;

    // mapa: realce ao passar o mouse
    const info = $('#board .brmap__info');
    if (info) {
      const infoDefault = info.innerHTML;
      const hot = uf => {
        $$('#board [data-uf]').forEach(el => { el.dataset.hot = el.dataset.uf === uf; });
        const u = uf && st[uf];
        info.innerHTML = u ? `<b>${UF[uf]}</b> · ${u.n} participantes · ${u.comp} competidores${u.ws ? ` · ${u.ws} em Shanghai` : ''}` : infoDefault;
      };
      $$('#board [data-uf]').forEach(el => {
        el.addEventListener('pointerenter', () => hot(el.dataset.uf));
        el.addEventListener('pointerleave', () => hot(''));
        el.addEventListener('focus', () => hot(el.dataset.uf));
        el.addEventListener('blur', () => hot(''));
      });
      $$('#board .brmap__call').forEach(g => g.addEventListener('click', () => $(`#board .brmap__uf[data-uf="${g.dataset.uf}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }))));
      $$('#board .brmap__uf[role="button"]').forEach(el => el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
      }));
    }
  };
  $('#board').addEventListener('click', e => {
    const b = e.target.closest('[data-more]');
    if (!b) return;
    state.more[b.dataset.more] = !state.more[b.dataset.more];
    const y = b.getBoundingClientRect().top;
    buildBoard(P.filter(matches));
    const nb = $(`#board [data-more="${b.dataset.more}"]`);
    if (nb) { nb.focus({ preventScroll: true }); if (!state.more[b.dataset.more]) scrollBy(0, nb.getBoundingClientRect().top - y); }
  });

  // qualquer botão com data-filter="chave:valor" liga (ou desliga) um filtro e leva ao álbum;
  // os do painel de números só trocam o filtro, sem rolar
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { openBack(+o.dataset.open, o); return; }
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    const [k, ...rest] = b.dataset.filter.split(':'); const v = rest.join(':');
    const patch = {};
    if (k === 'ws' || k === 'ex') patch[k] = b.closest('#board') ? !state[k] || !b.closest('.ws-note, .panel') ? true : true : true;
    else if (k === 'cats') patch.cats = state.cats.includes(v) ? state.cats.filter(x => x !== v) : [...state.cats, v];
    else patch[k] = state[k] === v ? '' : v;
    setFilter(patch, !b.closest('#board'));
  });

  // ── álbum ──
  let current = [];
  const occBlock = (sn, list) => {
    const comps = list.filter(isComp).sort((a, b) => (a.perfil !== 'Competidor') - (b.perfil !== 'Competidor') || (!!b.res - !!a.res) || coll.compare(a.nome, b.nome));
    const crew = list.filter(p => !isComp(p)).sort((a, b) => crewRank(a) - crewRank(b) || coll.compare(a.nome, b.nome));
    const all = P.filter(p => p.sn === sn);
    const allComp = all.filter(isComp).length, allCrew = all.length - allComp;
    const name = (comps[0] || crew[0]).ocup;
    const sk = W.skills[sn];
    const nameHit = state.q && crew.some(p => qWords().some(w => p.nameKey.includes(w)));
    const open = filtered() && (!comps.length || nameHit || state.cats.some(c => c !== 'comp'));
    current.push(...comps, ...crew);
    const wsCount = all.filter(p => p.ws).length;
    return `<article class="occ" style="--sec:${secVar(sk?.sector)}" aria-labelledby="o-${sn}">
      <div class="occ__head"><span class="occ__n num">${n2(sn)}</span><h3 class="occ__name" id="o-${sn}">${esc(name)}</h3>
        <p class="occ__meta">${plural(allComp, 'competidor', 'competidores')} · ${allCrew} na equipe${wsCount ? ` · ${wsCount} em Shanghai` : ''}${sk?.team ? ' · ocupação em equipe' : ''}</p></div>
      ${comps.length ? `<div class="occ__stickers">${comps.map(sticker).join('')}</div>` : ''}
      ${crew.length ? `<details class="crew" ${open ? 'open' : ''}><summary><span>Avaliação e oficina <span class="num">(${crew.length}${crew.length !== allCrew ? ` de ${allCrew}` : ''})</span></span></summary>
        <div class="crew__list">${crew.map(mini).join('')}</div></details>` : ''}
    </article>`;
  };
  const renderAlbum = list => {
    current = [];
    const bySn = {};
    list.forEach(p => { if (p.sn) (bySn[p.sn] ||= []).push(p); });
    const sns = Object.keys(bySn).map(Number).sort((a, b) => a - b);
    let html = '';
    if (state.order === 'num') {
      if (sns.length) html += `<section class="page page--all" aria-labelledby="t-all"><div class="page__head"><h2 class="page__title" id="t-all"><span class="page__letter" aria-hidden="true">#</span>Todas as ocupações</h2>
        <div class="page__stats"><span><b class="num">${sns.length}</b>ocupações</span><span><b class="num">${list.filter(isComp).length}</b>competidores</span></div></div>
        <div class="page__body">${sns.map(sn => occBlock(sn, bySn[sn])).join('')}</div></section>`;
    } else {
      SECTORS.forEach((sec, k) => {
        const mine = sns.filter(sn => W.skills[sn]?.sector === sec.name);
        if (!mine.length) return;
        const ps = mine.flatMap(sn => bySn[sn]);
        html += `<section class="page" style="--sec:var(--s-${sec.key})" aria-labelledby="t-${sec.key}">
          <div class="page__head"><h2 class="page__title" id="t-${sec.key}"><span class="page__letter" aria-label="Grupo ${'ABCDEF'[k]}">${'ABCDEF'[k]}</span>${sec.name}</h2>
            <div class="page__stats"><span><b class="num">${mine.length}</b>ocupações</span><span><b class="num">${ps.filter(isComp).length}</b>competidores</span><span><b class="num">${ps.filter(p => !isComp(p)).length}</b>na equipe</span>${ps.some(p => p.ws) ? `<span><b class="num">${ps.filter(p => p.ws).length}</b>em Shanghai</span>` : ''}</div></div>
          <div class="page__body">${mine.map(sn => occBlock(sn, bySn[sn])).join('')}</div></section>`;
      });
    }
    // quem não tem ocupação: a comissão da seletiva, em crachás
    const rest = list.filter(p => !p.sn);
    if (rest.length) {
      const groups = ROLE_GROUPS.map(g => ({ g, ps: [] }));
      rest.forEach(p => groups.find(x => x.g.test(p.perfil)).ps.push(p));
      groups.forEach(x => x.ps.sort((a, b) => (!!b.ws - !!a.ws) || coll.compare(a.nome, b.nome)));
      groups.forEach(x => current.push(...x.ps));
      html += `<section class="team" aria-labelledby="t-team"><h2 id="t-team">Comissão da seletiva</h2>
        <p class="team__intro">Coordenação, delegados técnicos, chefes de equipe, organização e comunicação: quem fez a competição acontecer sem estar numa ocupação.</p>
        <div class="roles">${groups.filter(x => x.ps.length).map(x => `<div class="role"><h3>${x.g.nome}<span class="num">${x.ps.length}</span></h3><div class="role__list">${x.ps.map(badge).join('')}</div></div>`).join('')}</div></section>`;
    }
    $('#album').innerHTML = html;
  };

  const wsRank = p => p.res ? MRANK[p.res.medal] * 100 + p.res.position : p.ws ? 500 : 1000;
  const renderList = list => {
    const k = state.sort;
    current = [...list].sort((a, b) => (k === 'ws' ? wsRank(a) - wsRank(b) : k === 'ocup' ? (a.sn || 99) - (b.sn || 99) : k !== 'nome' ? coll.compare(a[k] || '￿', b[k] || '￿') : 0) || coll.compare(a.nome, b.nome));
    const slice = current.slice(0, state.shown);
    const wsCell = p => {
      if (p.res) return `<span class="medal" data-m="${p.res.medal}">${MEDAL_SHORT[p.res.medal]}</span> <span class="num">${ord(p.res.position)} de ${p.res.total}</span>`;
      if (!p.ws) return '';
      const x = p.ws[0];
      return `<span class="ws-cell">${icon.globe}${esc(x.kind === 'gen' ? x.role : (x.role || 'Equipe'))}</span>`;
    };
    $('#album').innerHTML = `<section class="board" aria-labelledby="t-list"><h2 id="t-list">Lista</h2>
      <div class="list-wrap"><table class="people"><thead><tr><th><span class="sr">Foto</span></th><th>Nome</th><th>Perfil</th><th>Ocupação</th><th>Instituição</th><th>Local</th><th>Em Shanghai</th></tr></thead>
      <tbody>${slice.map(p => `<tr data-p="${p.i}"><td><div class="thumb">${photo(p)}</div></td><td class="nm"><button type="button" data-p="${p.i}">${esc(p.nome)}</button>${p.past.length ? ` <span class="ex-badge ex-badge--inline ex-badge--xs" title="Ex-competidor da WorldSkills">${icon.star}</span>` : ''}</td><td>${esc(p.perfil)}</td>
        <td>${p.sn ? `<span class="swatch" style="background:${secVar(p.sector)}"></span><span class="num">${n2(p.sn)}</span> ${esc(p.ocup)}` : ''}</td><td>${esc(p.inst)}</td><td>${esc(p.local)}</td><td>${wsCell(p)}</td></tr>`).join('')}</tbody></table></div>
      ${current.length > slice.length ? `<div class="more-row"><button class="mt-more" type="button" id="list-more">Mostrar mais ${Math.min(120, current.length - slice.length)} · faltam ${current.length - slice.length}</button></div>` : ''}</section>`;
    $('#list-more')?.addEventListener('click', () => { state.shown += 120; renderList(list); lazy($('#album')); });
  };

  // ── etiquetas dos filtros ativos ──
  const TAGS = { perfil: 'Perfil', inst: 'Instituição', ocup: 'Ocupação', local: 'Local', sec: 'Setor', uf: 'Estado', reg: 'Região', res: 'Resultado', fmt: 'Formato' };
  const renderTags = () => {
    const t = [];
    if (state.q) t.push(['q', 'Busca', state.q]);
    state.cats.forEach(c => t.push(['cat:' + c, 'Grupo', catName(c)]));
    SELECTS.forEach(k => { if (state[k]) t.push([k, TAGS[k], k === 'uf' ? UF[state.uf] : k === 'res' ? RES[state.res] : k === 'fmt' ? FMT[state.fmt] : state[k]]); });
    if (state.ws) t.push(['ws', 'Mundial', 'Foram a Shanghai']);
    if (state.ex) t.push(['ex', 'Mundial', 'Ex-competidores da WorldSkills']);
    $('#f-tags').hidden = !t.length;
    $('#f-tags').innerHTML = t.map(([k, l, v]) => `<span class="tag">${l}: <b>${esc(v)}</b><button type="button" data-drop="${esc(k)}" aria-label="Remover o filtro ${esc(l)}: ${esc(v)}">×</button></span>`).join('') +
      (t.length ? `<button class="finder__clear" type="button" id="f-clear">${t.length > 1 ? 'Limpar tudo' : 'Limpar filtro'}</button>` : '');
  };
  $('#f-tags').addEventListener('click', e => {
    const d = e.target.closest('[data-drop]');
    if (d) {
      const k = d.dataset.drop;
      if (k.startsWith('cat:')) setFilter({ cats: state.cats.filter(c => c !== k.slice(4)) });
      else setFilter({ [k]: k === 'ws' || k === 'ex' ? false : '' });
      return;
    }
    if (e.target.id === 'f-clear') clearAll();
  });

  const render = () => {
    const list = P.filter(matches);
    $('#f-count').textContent = list.length;
    $('#empty').hidden = list.length > 0;
    if (state.view === 'list') renderList(list); else renderAlbum(list);
    lazy($('#album'));
    bindFoil($('#album'));
    buildBoard(list);
    // estado dos controles
    const cc = tally(facet('cats'), p => p.cat);
    $('#f-cats').innerHTML = `<button class="chip" type="button" data-cat="" aria-pressed="${!state.cats.length}">Todos</button>` +
      CATS.map(c => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${state.cats.includes(c.id)}">${c.nome} <span class="n num">${cc[c.id] || 0}</span></button>`).join('');
    $('#n-ws').textContent = facet('ws').filter(p => p.ws).length;
    $('#n-ex').textContent = facet('ex').filter(p => p.past.length).length;
    $('#f-ws').setAttribute('aria-pressed', state.ws);
    $('#f-ex').setAttribute('aria-pressed', state.ex);
    $('#f-q-wrap').dataset.on = !!state.q;
    SELECTS.forEach(k => { $(`#f-${k}`).value = state[k]; $(`#f-${k}-wrap`).dataset.on = !!state[k]; });
    const open = $('#finder').dataset.open === 'true';
    const hiddenSel = matchMedia('(max-width: 720px)').matches ? SELECTS : MORE;
    $('#f-toggle').dataset.n = open ? 0 : hiddenSel.filter(k => state[k]).length;
    renderTags();
    $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === state.view));
    $$('[data-order]').forEach(b => b.setAttribute('aria-pressed', b.dataset.order === state.order));
    $('#order-tools').hidden = state.view !== 'album';
    $('#sort-wrap').hidden = state.view !== 'list';
  };
  const setFilter = (patch, scroll) => {
    Object.assign(state, patch, { shown: 60 });
    if ('q' in patch) $('#f-q').value = state.q;
    if ('view' in patch) store.set('wsb-view', state.view);
    render();
    if (scroll) $('#album-tools').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  const clearAll = () => setFilter({ q: '', cats: [], perfil: '', inst: '', ocup: '', local: '', sec: '', uf: '', reg: '', res: '', fmt: '', ws: false, ex: false });

  let tq;
  $('#f-q').addEventListener('input', e => { clearTimeout(tq); tq = setTimeout(() => setFilter({ q: e.target.value.trim() }), 160); });
  SELECTS.forEach(k => $(`#f-${k}`).addEventListener('change', e => setFilter({ [k]: e.target.value })));
  $('#f-cats').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    const c = b.dataset.cat;
    setFilter({ cats: !c ? [] : state.cats.includes(c) ? state.cats.filter(x => x !== c) : [...state.cats, c] });
  });
  $('#f-ws').addEventListener('click', () => setFilter({ ws: !state.ws }));
  $('#f-ex').addEventListener('click', () => setFilter({ ex: !state.ex }));
  $('[data-clear]').addEventListener('click', clearAll);
  $('#f-toggle').addEventListener('click', () => {
    const open = $('#finder').dataset.open !== 'true';
    $('#finder').dataset.open = open; $('#f-toggle').setAttribute('aria-expanded', open);
    render();
  });
  $$('[data-view]').forEach(b => b.addEventListener('click', () => setFilter({ view: b.dataset.view })));
  $$('[data-order]').forEach(b => b.addEventListener('click', () => setFilter({ order: b.dataset.order })));
  $('#sort').addEventListener('change', e => setFilter({ sort: e.target.value }));
  $('#album').addEventListener('click', e => { const s = e.target.closest('[data-p]'); if (s) openBack(+s.dataset.p, s); });

  // ── brilho da figurinha segue o ponteiro ──
  const bindFoil = root => {
    if (reduce) return;
    $$('.sticker[data-m="prata"], .sticker[data-m="bronze"]', root).forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '50%'); el.style.setProperty('--my', '30%'); });
    });
  };
  // no celular não há cursor: o brilho corre com a rolagem
  if (!reduce && matchMedia('(hover: none), (pointer: coarse)').matches) {
    let raf = 0;
    const sweep = () => {
      raf = 0;
      $$('.sticker[data-m="prata"], .sticker[data-m="bronze"]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const t = 1 - (r.top + r.height / 2) / innerHeight;
        el.style.setProperty('--mx', (t * 120 - 10).toFixed(1) + '%');
        el.style.setProperty('--my', (t * 80 + 10).toFixed(1) + '%');
      });
    };
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(sweep); }, { passive: true });
  }

  // ── foto ampliada ──
  const ZOOM_BTN = '<button class="zoom-btn" type="button" data-zoom aria-label="Ampliar a foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4M11 8v6M8 11h6"/></svg></button>';
  const zoomDlg = document.getElementById('zoom');
  let zoomFrom = null;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-zoom]');
    if (!b) return;
    const root = b.closest('[data-zoom-root]'), img = root && root.querySelector('img');
    if (!img || !img.src) return;
    zoomFrom = b;
    const z = zoomDlg.querySelector('img');
    z.src = img.currentSrc || img.src; z.alt = img.alt || '';
    zoomDlg.querySelector('.zoom__cap').textContent = root.querySelector('figcaption')?.textContent || img.alt || '';
    zoomDlg.showModal();
    zoomDlg.querySelector('.zoom__close').focus();
  });
  zoomDlg.addEventListener('click', () => zoomDlg.close());
  zoomDlg.addEventListener('close', () => { zoomDlg.querySelector('img').removeAttribute('src'); if (zoomFrom?.isConnected) zoomFrom.focus({ preventScroll: true }); });

  // ── verso ──
  const dlg = $('#back');
  const skillLine = s => `<p class="result-line result-line--sm"><span class="medal" data-m="${s.medal}">${MEDAL[s.medal]}</span><span><b class="num">${ord(s.position)}</b> de ${s.total}</span><span><b class="num">${s.mark}</b> pontos</span></p>`;
  const wsBlock = p => {
    if (!p.ws) return '';
    const parts = p.ws.map(x => {
      const s = x.n ? W.skills[x.n] : null;
      if (x.kind === 'comp') return `
        <p class="result-line"><span class="medal" data-m="${s.medal}">${MEDAL[s.medal]}</span><span><b class="num">${ord(s.position)}</b> de ${s.total}</span><span><b class="num">${s.mark}</b> pontos</span></p>
        ${s.bon ? `<div class="bon"><span class="bon__stars" aria-hidden="true">${icon.star}${icon.star}${icon.star}</span><div><p class="bon__title">Best of Nation</p><p class="bon__text">Melhor da nação: a maior nota do Brasil em Shanghai, entre todas as ocupações${x.partner.length ? ', conquistada em dupla' : ''}.</p></div></div>` : ''}
        <p class="wsb__role">Competidor de <b>${esc(s.pt)}</b> <span class="num">(#${n2(x.n)})</span>${x.partner.length ? `, em dupla com ${x.partner.map(esc).join(' e ')}` : ''}.</p>
        <a href="${x.url}" target="_blank" rel="noopener">Ver a figurinha no álbum Brasil em Shanghai</a>`;
      if (x.kind === 'occ') return `
        <p class="wsb__role">${x.role ? `<b>${esc(x.role)}</b>` : 'Integrante da equipe'} de <b>${esc(s.pt)}</b> <span class="num">(#${n2(x.n)})</span> na delegação brasileira. O resultado do Brasil na ocupação:</p>
        ${skillLine(s)}
        <a href="${s.url}" target="_blank" rel="noopener">Ver a ocupação no álbum Brasil em Shanghai</a>`;
      return `<p class="wsb__role"><b>${esc(x.role)}</b> na comissão da delegação brasileira.</p>
        <a href="${W.album}#equipe" target="_blank" rel="noopener">Ver a comissão no álbum Brasil em Shanghai</a>`;
    }).join('');
    return `<section class="wsb"><h3><span class="wsb__ico">${icon.globe}</span>No mundial · ${esc(W.event.name)}</h3>${parts}</section>`;
  };
  const exBlock = p => p.past.length ? `<div class="exws"><h3><span class="ex-badge ex-badge--inline">${icon.star}</span>Ex-competidor da WorldSkills</h3><ul class="nat__list">${p.past.map(a => `<li><b>${esc(a.event)}</b> · ${esc(a.skill)} · ${esc(a.medal)} (${a.position}º lugar)${a.note ? `<br>${esc(a.note)}` : ''}</li>`).join('')}</ul></div>` : '';
  const field = (l, v) => v ? `<div><dt>${l}</dt><dd>${v}</dd></div>` : '';
  const natFields = p => `<dl class="dl">
      ${field('Perfil', esc(p.perfil))}
      ${field('Ocupação', p.ocup ? esc(p.ocup) : '')}
      ${field('Nº da ocupação', p.sn ? `<span class="num">${n2(p.sn)}</span>` : '')}
      ${field('Instituição', esc(p.inst))}
      ${field('Delegação / equipe', esc(p.grupo))}
      ${field('Empresa', esc(p.emp))}
      ${field('Local de competição', esc(p.local))}
      ${field('Estado', p.uf ? `${esc(UF[p.uf])} · ${esc(p.reg)}` : '')}
      ${field('Setor na WorldSkills', esc(p.sector))}
    </dl>`;
  const otherLine = o => `<b>${esc(o.perfil)}</b>${o.ocup ? ` · ${esc(o.ocup)}${o.sn ? ` <span class="num">(#${n2(o.sn)})</span>` : ''}` : ''} · ${esc(o.inst)}${o.local ? ` · ${esc(o.local)}` : ''}`;
  // fotos do verso: o recorte de credenciamento e, quando existe, a original enviada em resolução máxima
  const photosOf = p => {
    const ks = [...new Set([p, ...(byName[p.nameKey] || [])].map(x => x.img).filter(k => k >= 0))];
    const out = [];
    ks.forEach(k => {
      out.push({ k, full: false, w: 600, h: 800, cap: 'Foto de credenciamento da seletiva' });
      const f = canRange && D.full?.[k];
      if (f) { const [b, o, l, t, w, h] = f.split(':'); out.push({ k, full: true, ref: [b, o, l, t].join(':'), w: +w, h: +h, cap: `Foto original enviada · ${w}×${h}` }); }
    });
    return out;
  };
  const showPhoto = (ph, fig) => {
    const img = $('img', fig), cap = $('figcaption', fig), a = $('.back__full');
    fig.style.aspectRatio = `${ph.w} / ${ph.h}`;
    fig.style.maxWidth = ph.w > ph.h ? '100%' : '320px';
    cap.textContent = ph.full ? 'Carregando a foto original…' : ph.cap;
    if (a) a.hidden = true;
    if (!ph.full) {
      img.src = thumb(ph.k);
      if (canRange && D.orig?.[ph.k]) packUrl(D.orig[ph.k]).then(u => { if (fig.dataset.k === `${ph.k}:0`) img.src = u; }, () => {});
      fig.dataset.k = `${ph.k}:0`;
      return;
    }
    fig.dataset.k = `${ph.k}:1`;
    packUrl(ph.ref).then(u => {
      if (fig.dataset.k !== `${ph.k}:1`) return;
      img.src = u; cap.textContent = ph.cap;
      if (a) { a.href = u; a.hidden = false; }
    }, () => { cap.textContent = 'A foto original não carregou.'; });
  };
  let lastFrom = null;
  const openBack = (i, from) => {
    const p = P[i]; if (!p) return;
    if (from) lastFrom = from;
    const ids = current.map(x => x.i); const k = ids.indexOf(i);
    const prev = k >= 0 ? ids[(k - 1 + ids.length) % ids.length] : i, next = k >= 0 ? ids[(k + 1) % ids.length] : i;
    const others = (byName[p.nameKey] || []).filter(x => x !== p);
    const goIdx = $$('[data-go]', dlg).indexOf(document.activeElement);
    const photos = photosOf(p);
    dlg.style.setProperty('--sec', p.sk ? secVar(p.sector) : 'var(--cover)');
    dlg.innerHTML = `<div class="back__inner">
      <div class="back__media">
        ${photos.length ? `<figure class="back__main" id="back-fig" data-zoom-root><img alt="${esc(p.nome)}"><figcaption></figcaption>${ZOOM_BTN}</figure>
          ${photos.length > 1 ? `<div class="thumbs" role="group" aria-label="Fotos">${photos.map((ph, n) => `<button type="button" aria-pressed="${n === 0}" data-ph="${n}" aria-label="${esc(ph.cap)}"><img src="${thumb(ph.k)}" alt=""><span>${ph.full ? 'Original' : '3:4'}</span></button>`).join('')}</div>` : ''}
          <a class="back__full" target="_blank" rel="noopener" hidden>Abrir a foto em tamanho real</a>`
        : `<figure class="back__main"><span class="ph" aria-hidden="true">${esc(initials(p.nome))}</span></figure>`}
      </div>
      <div class="back__body">
        <div class="back__band">
          <span class="back__n num ${p.sn ? '' : 'back__n--txt'}">${p.sn ? n2(p.sn) : esc(p.uf || (/^Setec/i.test(p.inst) ? 'MEC' : 'BR'))}</span>
          <div><h2 class="back__name" id="back-name" tabindex="-1">${esc(p.nome)}</h2>
            <div class="back__where">${esc(p.perfil)}${p.ocup ? ' · ' + esc(p.ocup) : ''} · ${esc(p.inst)}</div></div>
          <div class="back__nav">
            ${ids.length > 1 && k >= 0 ? `<button class="icon-btn" type="button" data-go="${prev}" aria-label="Anterior">${icon.left}</button><button class="icon-btn" type="button" data-go="${next}" aria-label="Próximo">${icon.right}</button>` : ''}
            <button class="icon-btn" type="button" data-close aria-label="Fechar">${icon.close}</button>
          </div>
        </div>
        ${wsBlock(p)}
        ${exBlock(p)}
        <div class="nat"><h3>Na seletiva</h3>${natFields(p)}
          ${others.length ? `<p class="muted" style="font-size:14px">Também na seletiva:</p><ul class="nat__list">${others.map(o => `<li>${otherLine(o)} · <button class="linkish" type="button" data-go="${o.i}">abrir</button></li>`).join('')}</ul>` : ''}</div>
        <div class="back__links">
          ${p.ocup ? `<button class="linkish" type="button" data-see="ocup">Ver todos de ${esc(p.ocup)}</button>` : ''}
          ${p.inst ? `<button class="linkish" type="button" data-see="inst">Ver todos de ${esc(p.inst)}</button>` : ''}
          ${p.local ? `<button class="linkish" type="button" data-see="local">Ver este local</button>` : ''}
        </div>
      </div></div>`;
    const fig = $('#back-fig', dlg);
    if (fig) {
      showPhoto(photos[0], fig);
      $$('.thumbs [data-ph]', dlg).forEach(b => b.addEventListener('click', () => {
        $$('.thumbs [data-ph]', dlg).forEach(x => x.setAttribute('aria-pressed', x === b));
        showPhoto(photos[+b.dataset.ph], fig);
      }));
    }
    $$('[data-go]', dlg).forEach(b => b.addEventListener('click', () => openBack(+b.dataset.go)));
    $('[data-close]', dlg).addEventListener('click', () => dlg.close());
    $$('[data-see]', dlg).forEach(b => b.addEventListener('click', () => { dlg.close(); setFilter({ [b.dataset.see]: p[b.dataset.see] }, true); }));
    if (!dlg.open) {
      dlg.showModal();
      const a0 = (from || lastFrom)?.getBoundingClientRect?.();
      if (!reduce && a0 && a0.width && dlg.animate) {
        const b0 = dlg.getBoundingClientRect();
        const dx = a0.left + a0.width / 2 - (b0.left + b0.width / 2), dy = a0.top + a0.height / 2 - (b0.top + b0.height / 2);
        const sc = Math.max(0.15, a0.width / b0.width);
        dlg.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${sc}) perspective(1200px) rotateY(90deg)`, opacity: 0.4 },
          { transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(${(1 + sc) / 2}) perspective(1200px) rotateY(40deg)`, opacity: 1, offset: 0.45 },
          { transform: 'none', opacity: 1 },
        ], { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      }
    }
    if (goIdx >= 0 && $$('[data-go]', dlg)[goIdx]) $$('[data-go]', dlg)[goIdx].focus({ preventScroll: true });
    else $('#back-name').focus({ preventScroll: true });
    $('.back__body', dlg).scrollTop = 0;
    try { history.replaceState(null, '', '#p' + i); } catch (e) {}
  };
  dlg.addEventListener('close', () => {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFrom?.isConnected) lastFrom.focus({ preventScroll: true });
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  // ── CSV do recorte atual ──
  const toast = msg => {
    $('.toast')?.remove();
    const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = msg;
    document.body.appendChild(d); setTimeout(() => d.remove(), 2600);
  };
  $('#copy-csv').addEventListener('click', () => {
    const q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const ws = p => !p.ws ? '' : p.res ? `${MEDAL[p.res.medal]} (${p.res.position}º de ${p.res.total})` : p.ws.map(x => x.kind === 'gen' ? x.role : `${x.role || 'Equipe'} de ${W.skills[x.n]?.pt || ''}`).join('; ');
    const past = p => p.past.map(a => `${a.event}: ${a.medal} (${a.position}º)`).join('; ');
    const csv = [['Nome', 'Perfil', 'Ocupacao', 'NumeroOcupacao', 'Instituicao', 'Delegacao', 'Empresa', 'Local', 'UF', 'Regiao', 'Setor', 'Shanghai2026', 'EdicoesAnteriores'].join(';')]
      .concat(current.map(p => [p.nome, p.perfil, p.ocup, p.sn ? n2(p.sn) : '', p.inst, p.grupo, p.emp, p.local, p.uf, p.reg, p.sector, ws(p), past(p)].map(q).join(';'))).join('\r\n');
    const ok = () => toast(`${current.length} linhas copiadas`);
    const fallback = () => {
      const t = document.createElement('textarea'); t.value = csv; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? ok() : toast('O navegador bloqueou a cópia'); } catch (e) { toast('O navegador bloqueou a cópia'); }
      t.remove();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(csv).then(ok, fallback); else fallback();
  });

  // ── créditos ──
  const SOCIAL = {
    GitHub: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.7.5.5 5.7.5 12.1c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6a11.6 11.6 0 0 0 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
    LinkedIn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2zM8 19H5V9.5h3V19zM6.5 8.2a1.8 1.8 0 1 1 0-3.5 1.8 1.8 0 0 1 0 3.5zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.8 13 12.8 14.3V19h-3V9.5h2.9v1.3c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.6 2 3.6 4.7V19z"/></svg>',
    Instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  };
  const A = D.author;
  if (A) $('#author').innerHTML = `<span class="author__photo" data-zoom-root><img src="${A.photo}" alt="${esc(A.name)}" loading="lazy" decoding="async">${ZOOM_BTN.replace('Ampliar a foto', 'Ampliar a foto de ' + esc(A.name))}</span>
    <div><h2 class="author__name">${esc(A.name)}</h2><p class="author__role">${esc(A.role)} · criou esta página</p>
      <ul class="author__links">${A.links.map(l => `<li><a href="${l.url}" target="_blank" rel="noopener me">${SOCIAL[l.label] || ''}${esc(l.label)}</a></li>`).join('')}</ul></div>`;

  // ── atalhos e voltar ao topo ──
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !dlg.open && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName)) { e.preventDefault(); $('#f-q').focus(); $('#f-q').select(); }
  });
  const toTop = $('#to-top');
  const syncTop = () => { toTop.dataset.show = scrollY > innerHeight * 0.9; };
  addEventListener('scroll', syncTop, { passive: true }); syncTop();
  toTop.addEventListener('click', () => { scrollTo({ top: 0 }); $('#topo').focus({ preventScroll: true }); });

  render();
  bindFoil($('#fan'));
  const h = location.hash.match(/^#p(\d+)$/);
  if (h && P[+h[1]]) openBack(+h[1]);
})();
