import json, base64, hashlib, os
BASE='C:/claude/quem-e-quem'; OUT=BASE+'/data/thumbs'
people=json.load(open(BASE+'/data/pessoas.json',encoding='utf8'))
key=lambda u: hashlib.sha1(u.encode()).hexdigest()[:16]

dicts={}
def idx(name,v):
    d=dicts.setdefault(name,{'list':[],'map':{}})
    if v=='' : return -1
    if v not in d['map']: d['map'][v]=len(d['list']); d['list'].append(v)
    return d['map'][v]

imgs=[]; imap={}
def img(u):
    if not u: return -1
    p=f'{OUT}/{key(u)}.jpg'
    if not os.path.exists(p): return -1
    if u not in imap:
        imap[u]=len(imgs)
        imgs.append(base64.b64encode(open(p,'rb').read()).decode())
    return imap[u]

rows=[[p['nome'], idx('inst',p['instituicao']), idx('perfil',p['perfil']),
       idx('ocup',p['ocupacao']), idx('local',p['local']), idx('grupo',p['grupo']),
       p['skillNumber'], idx('emp',p['empresa']), img(p['foto'])] for p in people]

bundle={'inst':dicts['inst']['list'],'perfil':dicts['perfil']['list'],
        'ocup':dicts['ocup']['list'],'local':dicts['local']['list'],
        'grupo':dicts['grupo']['list'],'emp':dicts.get('emp',{'list':[]})['list'],
        'rows':rows,'imgs':imgs}
s=json.dumps(bundle,ensure_ascii=False,separators=(',',':'))
open(BASE+'/data/bundle.json','w',encoding='utf8').write(s)
print('bundle MB:',round(len(s.encode())/1048576,2),'| pessoas:',len(rows),'| imgs:',len(imgs))
print('sem foto:',sum(1 for r in rows if r[8]<0))
