import fs from 'node:fs';

const KEY = 'f59c302a-543e-4313-8ae6-0d83f8801cf0';
const URL_Q = 'https://wabi-brazil-south-d-primary-api.analysis.windows.net/public/reports/querydata?synchronous=true';
const MODEL = 712351, DATASET = '1e3de96a-6e6c-4608-80ed-fbece91d4bb3';
const ENTITY = 'Registration List by Group';

// Apenas colunas exibidas no relatorio publico. Email/CPF/Celular/Data de Nascimento
// existem no modelo mas nao sao exibidos - deliberadamente nao extraidos.
const COLS = ['Image','Instituicao','Nome_Completo','Position','Skill','Local','Group','Skill Number','Empresa'];

const payload = {
  version: '1.0.0',
  queries: [{
    Query: { Commands: [{ SemanticQueryDataShapeCommand: {
      Query: {
        Version: 2,
        From: [{ Name: 'r', Entity: ENTITY, Type: 0 }],
        Select: COLS.map(c => ({ Column: { Expression: { SourceRef: { Source: 'r' } }, Property: c }, Name: ENTITY + '.' + c })),
      },
      Binding: {
        Primary: { Groupings: [{ Projections: COLS.map((_, i) => i) }] },
        DataReduction: { DataVolume: 3, Primary: { Window: { Count: 5000 } } },
        Version: 1,
      },
      ExecutionMetricsKind: 1,
    }}]},
    QueryId: '',
    ApplicationContext: { DatasetId: DATASET, Sources: [{ ReportId: '', VisualId: '162549522' }] },
  }],
  cancelQueries: [],
  modelId: MODEL,
};

const res = await fetch(URL_Q, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json;charset=UTF-8', 'X-PowerBI-ResourceKey': KEY },
  body: JSON.stringify(payload),
});
if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text()).slice(0, 500));
const json = await res.json();
const ds = json.results[0].result.data.dsr.DS[0];
const dm = ds.PH[0].DM0;
const S = dm[0].S;
const VD = ds.ValueDicts || {};

const prev = new Array(S.length).fill(null);
const raw = [];
for (const r of dm) {
  const out = new Array(S.length).fill(null);
  const R = r.R || 0, O = r['\u00d8'] || 0;
  let ci = 0;
  for (let i = 0; i < S.length; i++) {
    if (O & (1 << i)) { out[i] = null; prev[i] = null; continue; }
    if (R & (1 << i)) { out[i] = prev[i]; continue; }
    let v = r.C[ci++];
    const dn = S[i].DN;
    if (dn && typeof v === 'number') v = VD[dn][v];
    out[i] = v; prev[i] = v;
  }
  raw.push(out);
}

const clean = s => (s == null ? '' : String(s).replace(/\s+/g, ' ').trim());
const seen = new Set();
const people = [];
for (const r of raw) {
  const o = {
    nome: clean(r[2]), instituicao: clean(r[1]), perfil: clean(r[3]),
    ocupacao: clean(r[4]), local: clean(r[5]), grupo: clean(r[6]),
    skillNumber: clean(r[7]), empresa: clean(r[8]), foto: clean(r[0]),
  };
  if (!o.nome) continue;
  const k = [o.nome, o.instituicao, o.perfil, o.ocupacao].join('|').toLowerCase();
  if (seen.has(k)) continue;
  seen.add(k);
  people.push(o);
}
people.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

fs.writeFileSync('C:/claude/quem-e-quem/data/pessoas.json', JSON.stringify(people, null, 2), 'utf8');
console.log('linhas brutas:', raw.length, '| pessoas:', people.length);
console.log('com foto:', people.filter(p => p.foto).length);
