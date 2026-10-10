# public/uploads içindeki jpg/png dosyalarını max 1000px webp'ye çevirir.
import sys, glob, os
from PIL import Image
d = sys.argv[1]
for f in glob.glob(os.path.join(d, '*.png')) + glob.glob(os.path.join(d, '*.jpg')):
    im = Image.open(f).convert('RGB')
    im.thumbnail((1000, 1000))
    out = os.path.splitext(f)[0] + '.webp'
    im.save(out, 'WEBP', quality=80, method=6)
    os.remove(f)
