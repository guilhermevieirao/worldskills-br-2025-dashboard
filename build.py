"""Monta a página final num HTML único e independente.

Uso:
  python tools/build_mundial.py   # liga a seletiva ao mundial (lê o data.json do álbum Brasil em Shanghai)
  python build.py                 # gera worldskills-br-2025-dashboard.html

Entram no arquivo: os dados da seletiva (data/pessoas.json), as ligações com o mundial
(data/mundial.json), as miniaturas 240x320 (data/thumbs, geradas por fotos_raw.py e fotos_hq.py),
os contornos dos estados (data/brmap.json), as fontes do Google Fonts e o favicon.
Os campos "empresa" (que em alguns registros traz datas) e "local" não entram.
"""
import base64, hashlib, json, os, re, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'worldskills-br-2025-dashboard.html')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
THUMBS = next(p for p in (os.path.join(ROOT, 'data', 'thumbs'), 'C:/claude/quem-e-quem/data/thumbs') if os.path.isdir(p))

load = lambda name: json.load(open(os.path.join(ROOT, 'data', name), encoding='utf8'))
people, mundial, brmap = load('pessoas.json'), load('mundial.json'), load('brmap.json')
key = lambda u: hashlib.sha1(u.encode()).hexdigest()[:16]

# o registro sem número de ocupação herda o número de quem tem a mesma ocupação
num_of = {p['ocupacao']: p['skillNumber'] for p in people if p['ocupacao'] and p['skillNumber']}

dicts = {}


def idx(name, v):
    d = dicts.setdefault(name, {'list': [], 'map': {}})
    if not v:
        return -1
    if v not in d['map']:
        d['map'][v] = len(d['list'])
        d['list'].append(v)
    return d['map'][v]


imgs, imap = [], {}


def img(u):
    if not u:
        return -1
    p = f'{THUMBS}/{key(u)}.jpg'
    if not os.path.exists(p):
        return -1
    if u not in imap:
        imap[u] = len(imgs)
        imgs.append(base64.b64encode(open(p, 'rb').read()).decode())
    return imap[u]


rows = []
for i, p in enumerate(people):
    m = re.search(r'BR_([A-Z]{2})_', p['grupo'] or '')
    sn = p['skillNumber'] or (num_of.get(p['ocupacao']) if p['ocupacao'] else '')
    rows.append([mundial['rename'].get(str(i), p['nome']), idx('inst', p['instituicao']), idx('perfil', p['perfil']),
                 idx('ocup', p['ocupacao']), m.group(1) if m else '', int(sn) if sn else 0, img(p['foto'])])

bundle = {k: dicts[k]['list'] for k in ('inst', 'perfil', 'ocup')}
bundle.update(rows=rows, imgs=imgs, mundial={k: mundial[k] for k in ('event', 'skills', 'rows', 'album')}, map=brmap)
data = json.dumps(bundle, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

html = open(os.path.join(ROOT, 'page.template.html'), encoding='utf8').read()
assert html.count('/*__DATA__*/') == 1

# fontes: o CSS do Google Fonts com cada woff2 embutido, só os alfabetos que o português usa
links = re.findall(r'<link[^>]+fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?', html)
css_url = re.search(r'https://fonts\.googleapis\.com/css2[^"]+', html).group(0).replace('&amp;', '&')
get = lambda url: urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})).read()
css = get(css_url).decode('utf8')
css = '\n'.join(b for sub, b in re.findall(r'/\* ([\w-]+) \*/\s*(@font-face \{.*?\})', css, re.S) if sub in ('latin', 'latin-ext'))
css = re.sub(r'url\((https://fonts\.gstatic\.com/[^)]+)\)',
             lambda m: 'url(data:font/woff2;base64,' + base64.b64encode(get(m.group(1))).decode() + ')', css)
for l in links:
    html = html.replace(l, '')
fav = base64.b64encode(open(os.path.join(ROOT, 'tools', 'favicon.png'), 'rb').read()).decode()
html = html.replace('<!--__HEAD__-->', f'<link rel="icon" type="image/png" href="data:image/png;base64,{fav}">\n<style>\n{css}\n</style>', 1)
html = html.replace('/*__DATA__*/', data, 1)

open(OUT, 'w', encoding='utf8', newline='\n').write(html)
print(os.path.basename(OUT), round(os.path.getsize(OUT) / 1e6, 1), 'MB |', len(rows), 'participantes |',
      len(imgs), 'fotos |', len(mundial['rows']), 'registros com o mundial')
