import json, os, hashlib, zipfile, re, unicodedata

BASE = 'C:/claude/quem-e-quem'
RAWDIR = BASE + '/data/raw'
people = json.load(open(BASE + '/data/pessoas.json', encoding='utf8'))
people.sort(key=lambda p: p['nome'])

def key(u):
    return hashlib.sha1(u.encode()).hexdigest()[:16]

def slugify(name):
    n = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode('ascii')
    n = re.sub(r'[^A-Za-z0-9]+', '-', n).strip('-')
    return n or 'sem-nome'

TARGET = 24 * 1024 * 1024  # 24MB por parte, com folga do limite de 30MB
used_names = {}
parts = []
cur_files = []
cur_size = 0
part_n = 1

def flush():
    global cur_files, cur_size, part_n
    if not cur_files:
        return
    zpath = f'{BASE}/quem-e-quem-fotos-parte{part_n}.zip'
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_STORED) as z:
        for fname, raw in cur_files:
            z.writestr(fname, raw)
    parts.append((zpath, len(cur_files), os.path.getsize(zpath)))
    part_n += 1
    cur_files = []
    cur_size = 0

skipped = 0
for p in people:
    if not p['foto']:
        continue
    src = f'{RAWDIR}/{key(p["foto"])}.bin'
    if not os.path.exists(src):
        skipped += 1
        continue
    raw = open(src, 'rb').read()
    base = slugify(p['nome'])
    n = used_names.get(base, 0)
    used_names[base] = n + 1
    fname = (base if n == 0 else f'{base}-{n+1}') + '.jpg'
    if cur_size + len(raw) > TARGET and cur_files:
        flush()
    cur_files.append((fname, raw))
    cur_size += len(raw)
flush()

print('partes:', len(parts), 'sem foto/ausentes:', skipped)
for zp, n, sz in parts:
    print(os.path.basename(zp), n, 'arquivos', round(sz/1048576,2), 'MB')
