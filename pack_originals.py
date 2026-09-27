import json, os, hashlib, zipfile, re, unicodedata

BASE = 'C:/claude/quem-e-quem'
RAWDIR = BASE + '/data/raw'
people = json.load(open(BASE + '/data/pessoas.json', encoding='utf8'))

def key(u):
    return hashlib.sha1(u.encode()).hexdigest()[:16]

def slugify(name):
    n = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii')
    n = re.sub(r'[^A-Za-z0-9]+', '-', n).strip('-')
    return n or 'sem-nome'

# nome -> lista de pessoas com essa foto (algumas fotos podem ser reaproveitadas)
by_url = {}
for p in people:
    if p['foto']:
        by_url.setdefault(p['foto'], []).append(p)

used_names = {}
zpath = BASE + '/worldskills-br-2025-dashboard-fotos-originais.zip'
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_STORED) as z:
    count = 0
    for url, plist in by_url.items():
        src = f'{RAWDIR}/{key(url)}.bin'
        if not os.path.exists(src):
            continue
        raw = open(src, 'rb').read()
        for p in plist:
            base = slugify(p['nome'])
            n = used_names.get(base, 0)
            used_names[base] = n + 1
            fname = base if n == 0 else f'{base}-{n+1}'
            z.writestr(f'{fname}.jpg', raw)
            count += 1
    # inclui a planilha de dados para referência cruzada
    z.write(BASE + '/data/pessoas.json', 'dados/pessoas.json')
print('arquivos no zip:', count + 1)
print('tamanho zip MB:', round(os.path.getsize(zpath) / 1048576, 2))
