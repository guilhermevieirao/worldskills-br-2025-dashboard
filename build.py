"""Monta a página final num HTML único e independente.

Uso:
  python tools/build_mundial.py   # liga a seletiva ao mundial (lê o data.json do álbum Brasil em Shanghai)
  python build.py                 # gera worldskills-br-2025-dashboard.html

Entram no arquivo: os dados da seletiva (data/pessoas.json), as ligações com o mundial
(data/mundial.json), as miniaturas 240x320 (data/thumbs, geradas por fotos_raw.py e fotos_hq.py),
os contornos dos estados (data/brmap.json), as fontes do Google Fonts e o favicon.
No campo "empresa", só entram nomes de empresa: três registros trazem ali uma data, que fica de fora.

As fotos vão sem recompressão para fotos/, em pacotes com os arquivos concatenados:
- credenciamento-N.bin: o recorte 600x800 de data/raw (fotos_raw.py);
- originais-N.bin: a foto enviada em resolução máxima, de data/orig (fotos_orig.py), quando é maior.
No site, a página lê cada foto do pacote por HTTP Range; aberta do disco, fica com as miniaturas.
"""
import base64, hashlib, json, os, re, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'worldskills-br-2025-dashboard.html')
SITE = os.path.join(ROOT, 'site')  # worktree do branch gh-pages, que o GitHub Pages publica
BASE = 'https://guilhermevieirao.github.io/worldskills-br-2025-dashboard/'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
THUMBS = next(p for p in (os.path.join(ROOT, 'data', 'thumbs'), 'C:/claude/quem-e-quem/data/thumbs') if os.path.isdir(p))
RAW = next(p for p in (os.path.join(ROOT, 'data', 'raw'), 'C:/claude/quem-e-quem/data/raw') if os.path.isdir(p))
FULL = next(p for p in (os.path.join(ROOT, 'data', 'orig'), 'C:/claude/quem-e-quem/data/orig') if os.path.isdir(p))
PACK = 45 * 1024 * 1024  # cada pacote fica abaixo do limite de 50 MB do GitHub

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
    emp = '' if re.fullmatch(r'\d{4}-\d{2}-\d{2}', p['empresa'] or '') else p['empresa']
    rows.append([mundial['rename'].get(str(i), p['nome']), idx('inst', p['instituicao']), idx('perfil', p['perfil']),
                 idx('ocup', p['ocupacao']), m.group(1) if m else '', int(sn) if sn else 0, img(p['foto']),
                 idx('local', p['local']), idx('grupo', p['grupo']), idx('emp', emp)])

# fotos sem recompressão, na mesma ordem das miniaturas, em pacotes:
# credenciamento: o recorte 3:4 de 600x800 que o painel mostra (figurinhas e verso)
# originais: a foto enviada, sem o sufixo _accreditation, quando é maior que o recorte (só no verso)
from PIL import Image
os.makedirs(os.path.join(SITE, 'fotos'), exist_ok=True)
packs = []


class Packer:
    def __init__(self, prefix):
        self.prefix, self.cur, self.n = prefix, bytearray(), 0

    def add(self, raw):
        if len(self.cur) + len(raw) > PACK:
            self.flush()
        ref = f'{len(packs)}:{len(self.cur)}:{len(raw)}:{"p" if raw[1:4] == b"PNG" else "j"}'
        self.cur += raw
        return ref

    def flush(self):
        if self.cur:
            self.n += 1
            name = f'fotos/{self.prefix}-{self.n}.bin'
            open(os.path.join(SITE, name), 'wb').write(self.cur)
            packs.append(name)
            self.cur = bytearray()


orig, full = [], []
acc_p = Packer('credenciamento')
for u in sorted(imap, key=imap.get):
    orig.append(acc_p.add(open(f'{RAW}/{key(u)}.bin', 'rb').read()))
acc_p.flush()
full_p = Packer('originais')
for u in sorted(imap, key=imap.get):
    f = f'{FULL}/{key(u)}.bin'
    if not os.path.exists(f):
        full.append('')
        continue
    w, h = Image.open(f).size
    if w * h <= 600 * 800:
        full.append('')
        continue
    full.append(f'{full_p.add(open(f, "rb").read())}:{w}:{h}')
full_p.flush()
for f in os.listdir(os.path.join(SITE, 'fotos')):
    if 'fotos/' + f not in packs:
        os.remove(os.path.join(SITE, 'fotos', f))

bundle = {k: dicts.get(k, {'list': []})['list'] for k in ('inst', 'perfil', 'ocup', 'local', 'grupo', 'emp')}
bundle.update(rows=rows, imgs=imgs, orig=orig, full=full, packs=packs, mundial={k: mundial[k] for k in ('event', 'skills', 'rows', 'album')}, map=brmap)
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


def write_site(html):
    """O site publicado: a mesma página como index.html, mais os arquivos de busca e prévia."""
    import shutil
    w = lambda name, text: open(os.path.join(SITE, name), 'w', encoding='utf8', newline='\n').write(text)
    w('index.html', html)
    w('.nojekyll', '')
    shutil.copy(os.path.join(ROOT, 'tools', 'favicon.png'), os.path.join(SITE, 'favicon.png'))
    if os.path.exists(os.path.join(ROOT, 'tools', 'og.jpg')):
        shutil.copy(os.path.join(ROOT, 'tools', 'og.jpg'), os.path.join(SITE, 'og.jpg'))
    desc = 'Quem é quem na seletiva nacional da WorldSkills Brasil 2025, e o que quem foi a Shanghai conquistou no mundial.'
    # o endereço antigo continua valendo, inclusive com o link direto de cada pessoa (#p123)
    w('worldskills-br-2025-dashboard.html', f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Seletiva Nacional 2025 · WorldSkills Brasil</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="{BASE}">
<link rel="icon" type="image/png" href="favicon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="Seletiva Nacional 2025 · WorldSkills Brasil">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{BASE}">
<meta property="og:image" content="{BASE}og.jpg">
<meta name="twitter:card" content="summary_large_image">
<script>location.replace('./' + location.hash);</script>
</head>
<body><p><a href="./">Abrir a Seletiva Nacional 2025</a></p></body>
</html>
''')
    w('404.html', f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página não encontrada | Seletiva Nacional 2025</title>
<meta name="description" content="Este endereço não existe na Seletiva Nacional 2025. Volte ao álbum.">
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="{BASE}favicon.png">
<style>
body {{ margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; box-sizing: border-box;
  background: radial-gradient(circle at 1.2px 1.2px, rgb(255 255 255 / 0.07) 1.2px, transparent 0) 0 0 / 14px 14px, #10234f;
  color: #f3f6fb; font: 400 17px/1.5 'Segoe UI', system-ui, sans-serif; text-align: center; }}
h1 {{ margin: 0; font: 900 clamp(2.4rem, 8vw, 4.5rem)/0.9 'Arial Narrow', 'Roboto Condensed', system-ui, sans-serif; text-transform: uppercase; }}
p {{ color: #b9c6e4; max-width: 40ch; margin: 16px auto 24px; }}
a {{ display: inline-block; padding: 13px 22px; border-radius: 999px; background: #ffd21f; color: #1a1400; font-weight: 700; text-decoration: none; }}
</style>
</head>
<body><main><h1>Página não encontrada</h1><p>Este endereço não existe. As figurinhas da seletiva estão no álbum.</p><a href="{BASE}">Abrir a Seletiva Nacional 2025</a></main></body>
</html>
''')
    w('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n')
    import datetime
    w('sitemap.xml', f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>{BASE}</loc><lastmod>{datetime.date.today().isoformat()}</lastmod></url>
</urlset>
''')
    # llms.txt: resumo para assistentes de IA
    skills = mundial['skills']
    comps, staff = [], []
    for i, v in mundial['rows'].items():
        for x in v:
            if x['kind'] == 'comp':
                s = skills[str(x['n'])]
                comps.append((x['n'], x['name'], s['pt'], s['medal'], s['position'], s['total'], s['bon']))
            else:
                staff.append(x['name'])
    comps = sorted(set(comps))
    MED = {'prata': 'Medalha de Prata', 'bronze': 'Medalha de Bronze', 'excelencia': 'Medalha de Excelência', 'participacao': 'Participação'}
    occ = {}
    for r in rows:
        if r[5]:
            occ.setdefault(r[5], [dicts['ocup']['list'][r[3]], 0])
            if dicts['perfil']['list'][r[2]].startswith('Competidor'):
                occ[r[5]][1] += 1
    lines = [
        '# Seletiva Nacional 2025 · WorldSkills Brasil', '',
        f'> Quem é quem na competição nacional da WorldSkills Brasil / SENAI de 2025: {len(rows)} registros do painel público "Quem é Quem" '
        f'(competidores, avaliadores, chefes de equipe, organização e comunicação) em {len(occ)} ocupações. '
        f'{len(comps)} competidores da seletiva defenderam o Brasil na WorldSkills Shanghai 2026, e {len(set(staff))} pessoas viajaram como experts, intérpretes ou comissão.', '',
        'Página independente, sem vínculo oficial com a WorldSkills, o SENAI ou o Senac. Resultados do mundial: results.worldskills.org.', '',
        '## Páginas', '',
        f'- [Seletiva Nacional 2025]({BASE}): álbum por setor e ocupação, números, mapa por estado, locais de prova e lista com busca.',
        '- [Brasil em Shanghai](https://skillex.com.br/): o álbum da delegação brasileira na WorldSkills Shanghai 2026.', '',
        '## Ocupações e competidores na seletiva', '',
    ] + [f'- #{n:02d} {name}: {c} competidores' for n, (name, c) in sorted(occ.items())] + [
        '', '## Da seletiva a Shanghai', '',
    ] + [f'- {name}: #{n:02d} {pt}, {MED[m]}, {pos}º de {tot}' + (', Best of Nation' if bon else '') for n, name, pt, m, pos, tot, bon in comps] + [
        '', '## Fontes', '',
        '- Painel "Quem é Quem" da WorldSkills Brasil (Power BI): https://app.powerbi.com/view?r=eyJrIjoiZjU5YzMwMmEtNTQzZS00MzEzLThhZTYtMGQ4M2Y4ODAxY2YwIiwidCI6IjZkNmJjYzNmLWJkYTEtNGY1NC1hZjFkLTg2ZDRiN2Q0ZTZiOCJ9',
        '- Resultados oficiais: https://results.worldskills.org/',
        '- Álbum Brasil em Shanghai: https://skillex.com.br/', '']
    w('llms.txt', '\n'.join(lines))
print(os.path.basename(OUT), round(os.path.getsize(OUT) / 1e6, 1), 'MB |', len(rows), 'participantes |',
      len(imgs), 'fotos |', len(mundial['rows']), 'registros com o mundial |',
      len(packs), 'pacotes de originais,', round(sum(os.path.getsize(os.path.join(SITE, f)) for f in packs) / 1e6), 'MB')
write_site(html)
