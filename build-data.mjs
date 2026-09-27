import fs from 'node:fs';
const people = JSON.parse(fs.readFileSync('C:/claude/quem-e-quem/data/pessoas.json','utf8'));
const PREFIX = 'https://images.worldskillsusercontent.org/';

const dicts = {};
const idx = (name, v) => {
  const d = (dicts[name] ||= { list: [], map: new Map() });
  if (v === '') return -1;
  if (!d.map.has(v)) { d.map.set(v, d.list.length); d.list.push(v); }
  return d.map.get(v);
};

const rows = people.map(p => [
  p.nome,
  idx('inst', p.instituicao),
  idx('perfil', p.perfil),
  idx('ocup', p.ocupacao),
  idx('local', p.local),
  idx('grupo', p.grupo),
  p.skillNumber || '',
  idx('emp', p.empresa),
  p.foto.startsWith(PREFIX) ? p.foto.slice(PREFIX.length) : p.foto,
]);

const out = {
  prefix: PREFIX,
  inst: dicts.inst.list, perfil: dicts.perfil.list, ocup: dicts.ocup.list,
  local: dicts.local.list, grupo: dicts.grupo.list, emp: dicts.emp?.list || [],
  rows,
};
const json = JSON.stringify(out);
fs.writeFileSync('C:/claude/quem-e-quem/data/bundle.json', json, 'utf8');
console.log('bytes:', json.length, '| pessoas:', rows.length);
console.log('perfis:', out.perfil.length, out.perfil.join(' / '));
console.log('locais:', out.local.length);
console.log('instituicoes:', out.inst.length, out.inst.join(' / '));
