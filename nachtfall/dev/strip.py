import sys
from PIL import Image
base, n, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
ims = [Image.open(f'{base}-{i}.png') for i in range(n)]
w, h = ims[0].size
o = Image.new('RGB', (w * n, h))
for i, im in enumerate(ims): o.paste(im, (i * w, 0))
o = o.resize((w * n // 2 * 2 // 2, h // 1)) if False else o
o.save(out)
