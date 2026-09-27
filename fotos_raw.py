import json, os, hashlib, concurrent.futures as cf
import urllib.request

BASE = 'C:/claude/quem-e-quem'
RAWDIR = BASE + '/data/raw'
os.makedirs(RAWDIR, exist_ok=True)
people = json.load(open(BASE + '/data/pessoas.json', encoding='utf8'))
urls = sorted({p['foto'] for p in people if p['foto']})
print('urls unicas:', len(urls))

def key(u):
    return hashlib.sha1(u.encode()).hexdigest()[:16]

def grab(u):
    dest = f'{RAWDIR}/{key(u)}.bin'
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return u, os.path.getsize(dest)
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        raw = urllib.request.urlopen(req, timeout=30).read()
        open(dest, 'wb').write(raw)
        return u, len(raw)
    except Exception as e:
        return u, -1

ok = fail = total = 0
with cf.ThreadPoolExecutor(max_workers=24) as ex:
    for u, n in ex.map(grab, urls):
        if n < 0: fail += 1
        else: ok += 1; total += n
print(f'ok={ok} falhas={fail} total_raw={total/1048576:.2f} MB  media={total/max(ok,1)/1024:.1f} KB')
