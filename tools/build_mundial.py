"""Liga os participantes da seletiva nacional ao que fizeram no mundial (WorldSkills Shanghai 2026).

Uso: python tools/build_mundial.py [caminho do data.json do álbum]
Entrada: data/pessoas.json (seletiva) e o data.json do álbum "Brasil em Shanghai"
         (repositório Resultado-Brasil-na-WorldSkills-2026-Shangai, pasta public/).
Saída:   data/mundial.json

Ninguém novo entra: só ganham informação do mundial os registros que já estão na seletiva.
A correspondência vem do álbum, que já guarda, para cada pessoa da delegação, os registros
dela na etapa nacional (perfil, instituição e ocupação), conferidos por nome e foto.
"""
import json, os, re, sys, unicodedata, difflib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALBUM = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'worldskills-brasil', 'public', 'data.json')
STOP = {'de', 'da', 'do', 'dos', 'das', 'e'}
SITE = 'https://skillex.com.br/'


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', (s or '').lower()) if unicodedata.category(c) != 'Mn')


def toks(s):
    return [t for t in re.split(r'[^a-z]+', norm(s)) if t and t not in STOP]


def close(a, b):
    return a == b or (len(a) > 3 and len(b) > 3 and difflib.SequenceMatcher(None, a, b).ratio() >= 0.8)


def same_person(a, b):
    """mesmo primeiro nome e ao menos mais um nome em comum (a seletiva às vezes abrevia)"""
    A, B = toks(a), toks(b)
    return bool(A and B and close(A[0], B[0]) and any(close(t, u) for t in A[1:] for u in B[1:]))


Q = json.load(open(os.path.join(ROOT, 'data', 'pessoas.json'), encoding='utf8'))
D = json.load(open(ALBUM, encoding='utf8'))
by_skill = {s['n']: s for s in D['skills']}
people = {p['id']: p for p in D['people']}

# ocupações: setor e nome no mundial, pelo número da ocupação
skills = {}
for s in D['skills']:
    comp = [people[i] for i in s['competitors']]
    skills[str(s['n'])] = {
        'pt': s['pt'], 'en': s['en'], 'sector': s['sector'], 'medal': s['medal'], 'position': s['position'],
        'total': s['total'], 'mark': s['mark'], 'bon': bool(s.get('bestOfNation')), 'team': bool(s.get('team')),
        'url': SITE + 'f/' + comp[0]['slug'] + '/' if comp and comp[0].get('slug') else SITE,
    }

rows, rename, problems = {}, {}, []


def link(kind, ent, nat_entries, info):
    for r in nat_entries or []:
        cands = [i for i, q in enumerate(Q) if q['perfil'] == r['perfil'] and q['instituicao'] == r['instituicao']
                 and (not r.get('ocupacao') or q['ocupacao'] == r['ocupacao'])]
        hit = [i for i in cands if same_person(ent['name'], Q[i]['nome'])]
        if not hit and kind == 'comp':
            # competidor: o único registro de competidor da mesma instituição nessa ocupação
            only = [i for i in cands if Q[i]['skillNumber'] == f"{ent['n']:02d}"]
            if len(only) == 1:
                hit = only
                rename[str(only[0])] = ent['name']
        if len(hit) != 1:
            problems.append((kind, ent['name'], r, [Q[i]['nome'] for i in hit]))
            continue
        i = str(hit[0])
        if any(x['who'] == info['who'] for x in rows.get(i, [])):
            continue
        rows.setdefault(i, []).append(dict(info))


for p in D['people']:
    s = by_skill[p['n']]
    partner = [people[x]['name'] for x in s['competitors'] if x != p['id']]
    link('comp', p, p.get('national'), {
        'who': 'comp:%d' % p['id'], 'kind': 'comp', 'name': p['name'], 'n': p['n'],
        'partner': partner, 'city': p.get('city'), 'uf': p.get('uf'),
        'url': SITE + 'f/' + p['slug'] + '/' if p.get('slug') else SITE,
    })
for k, t in enumerate(D['teamOcc']):
    link('occ', t, t.get('national'), {
        'who': 'occ:%d' % k, 'kind': 'occ', 'name': t['name'], 'n': t['n'], 'role': t.get('wsRole') or '',
        'past': t.get('pastWS') or [],
    })
for k, g in enumerate(D['general']):
    link('gen', g, g.get('national'), {
        'who': 'gen:%d' % k, 'kind': 'gen', 'name': g['name'], 'role': g['role'], 'past': g.get('pastWS') or [],
    })

for v in rows.values():
    for x in v:
        del x['who']
out = {'event': D['event'], 'skills': skills, 'rows': rows, 'rename': rename, 'album': SITE}
json.dump(out, open(os.path.join(ROOT, 'data', 'mundial.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)

ents = {}
for v in rows.values():
    for x in v:
        ents.setdefault(x['kind'], set()).add(x['name'])
print('registros da seletiva ligados ao mundial:', len(rows), '| pessoas:', {k: len(v) for k, v in ents.items()})
print('nomes trocados pelo nome atual:', len(rename))
for pr in problems:
    print('SEM CORRESPONDÊNCIA ÚNICA:', pr)
