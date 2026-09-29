"""Baixa a foto original de cada participante, em resolução máxima.

O painel mostra o recorte de credenciamento (URL terminada em _accreditation, 600x800).
Sem esse sufixo, o mesmo endereço entrega a foto que a pessoa enviou, quase sempre maior.
Saída: data/orig/<chave>.bin (a mesma chave de fotos_raw.py)
"""
import hashlib, json, os, urllib.request, concurrent.futures as cf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raiz do repositório
OUT = ROOT + '/data/orig'
os.makedirs(OUT, exist_ok=True)
people = json.load(open(ROOT + '/data/sources/pessoas.json', encoding='utf8'))
urls = sorted({p['foto'] for p in people if p['foto']})
key = lambda u: hashlib.sha1(u.encode()).hexdigest()[:16]


def grab(u):
    dest = f'{OUT}/{key(u)}.bin'
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True
    base = u[:-len('_accreditation')] if u.endswith('_accreditation') else u
    try:
        raw = urllib.request.urlopen(urllib.request.Request(base, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
        open(dest, 'wb').write(raw)
        return True
    except Exception:
        return False


with cf.ThreadPoolExecutor(max_workers=24) as ex:
    ok = sum(ex.map(grab, urls))
print(f'{ok} de {len(urls)} originais')
