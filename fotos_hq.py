import glob, os
from PIL import Image, ImageOps

RAWDIR = 'data/raw'
OUT = 'data/thumbs'
os.makedirs(OUT, exist_ok=True)
SIZE = (240, 320)  # 3:4, mesma proporcao da foto de credenciamento original
Q = 75

files = glob.glob(f'{RAWDIR}/*.bin')
ok = fail = total = 0
for f in files:
    key = os.path.splitext(os.path.basename(f))[0]
    dest = f'{OUT}/{key}.jpg'
    try:
        im = Image.open(f)
        im = ImageOps.exif_transpose(im).convert('RGB')
        im = ImageOps.fit(im, SIZE, Image.LANCZOS, centering=(0.5, 0.38))
        im.save(dest, 'JPEG', quality=Q, optimize=True, progressive=True)
        total += os.path.getsize(dest)
        ok += 1
    except Exception as e:
        fail += 1
        print('erro', f, e)
print(f'ok={ok} falhas={fail} total={total/1048576:.2f} MB media={total/max(ok,1)/1024:.1f} KB')
