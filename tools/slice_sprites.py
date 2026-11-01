"""Slices the AI sprite sheets into transparent per-character atlases + assets/data.js"""
import numpy as np, json, os, sys
from PIL import Image
from scipy import ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].endswith('/') else '/mnt/user-data/uploads/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
P = 'A_2D_pixel_art_sprite_sheet_for_a_retro_16-bit_'
SHEETS = {  # id: (file, dilation, target height in game px)
 'merchant': (P+'comedy_fighti__3_.png', 6, 250),
 'delivery': (P+'comedy_fighti__2_.png', 6, 285),
 'sheikh':   (P+'comedy_fighti__3_.jpg', 5, 285),
 'grandma':  (P+'comedy_fighti.png',     6, 265),
 'big':      (P+'arcade_fighti__3_.jpg', 6, 320),
 'mech':     (P+'arcade_fighti__5_.jpg', 6, 285),
 'tea':      (P+'arcade_fighti__4_.jpg', 6, 270),
}

def fg_mask(rgb):
    mn, mx = rgb.min(2), rgb.max(2)
    lab, _ = ndi.label((mn >= 236) & ((mx - mn) <= 18))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    fg = ~bg
    fg[ndi.binary_dilation(bg) & fg & (mn > 205)] = False   # remove white halo
    return fg

def process(name, f, it, target):
    im = Image.open(SRC + f).convert('RGBA')
    white = Image.new('RGBA', im.size, 'white'); white.alpha_composite(im)
    rgb = np.array(white.convert('RGB'))
    fg = fg_mask(rgb)
    if name == 'grandma': fg[:165, 942:] = False            # drop the speech bubble
    lab, _ = ndi.label(ndi.binary_dilation(fg, iterations=it))
    comps = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        m = (lab[sl] == i) & fg[sl]
        if m.sum() < 1500: continue
        ys, xs = np.nonzero(m)
        y0, y1, x0, x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        m = m[y0:y1, x0:x1]
        crop = rgb[sl][y0:y1, x0:x1]
        comps.append(dict(cy=sl[0].start+(y0+y1)/2, cx=sl[1].start+x0, m=m, crop=crop))
    comps.sort(key=lambda c: c['cy'])
    rows, cur = [], [comps[0]]
    for c in comps[1:]:
        if c['cy'] - cur[-1]['cy'] > 100: rows.append(cur); cur = []
        cur.append(c)
    rows.append(cur)
    rows = [sorted(r, key=lambda c: c['cx']) for r in rows]
    print(name, [len(r) for r in rows])
    rows = rows[:3]   # idle / walk / attack (extra rows are ignored)
    hs = [c['m'].shape[0] for r in rows[:2] for c in r]
    s = round(target / float(np.median(hs)), 4)
    H = max(c['m'].shape[0] for r in rows for c in r)
    Wt = sum(c['m'].shape[1] + 2 for r in rows for c in r)
    atlas = np.zeros((H, Wt, 4), np.uint8)
    x = 0; data = {}
    for key, r in zip(('idle', 'walk', 'atk'), rows):
        data[key] = []
        for c in r:
            h, w = c['m'].shape
            atlas[:h, x:x+w, :3] = c['crop']; atlas[:h, x:x+w, 3] = c['m'] * 255
            low = c['m'][int(h*.7):]
            ax = float(np.nonzero(low)[1].mean())
            data[key].append([x, 0, w, h, round(ax, 1)])
            x += w + 2
    if name == 'tea': data['spl'] = data['atk'].pop()   # last frame of attack row is the tea puddle
    Image.fromarray(atlas).save(f'{OUT}/chars/{name}.png', optimize=True)
    data.update(s=s, img=f'assets/chars/{name}.png')
    return data

def recolor(src, dst, rule):
    im = Image.open(src); a = np.array(im)[:, :, 3]
    hsv = np.array(im.convert('RGB').convert('HSV')).astype(int)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m, nh, ns = rule(H, S, V)
    H = np.where(m, nh, H) % 256; S = np.where(m, ns, S)
    out = Image.fromarray(np.stack([H, S, V], -1).astype(np.uint8), 'HSV').convert('RGB')
    out = np.dstack([np.array(out), a]); Image.fromarray(out).save(dst, optimize=True)

if __name__ == '__main__':
    FR = {k: process(k, *v) for k, v in SHEETS.items()}
    C = OUT + '/chars/'
    recolor(C+'sheikh.png', C+'sheikh_b.png', lambda H,S,V: ((V<160)&(S>110)&(H>=8)&(H<=30), H+128, S))
    recolor(C+'grandma.png', C+'grandma_b.png', lambda H,S,V: ((H>=50)&(H<=135)&(S>60), H+100, S))
    recolor(C+'delivery.png', C+'delivery_b.png', lambda H,S,V: ((H>=24)&(H<=48)&(S<70)&(S>10)&(V>190), H*0+150, np.clip(S*3+30,0,140)))
    for k in ('sheikh', 'grandma', 'delivery'):
        FR[k+'_b'] = dict(FR[k], img=f'assets/chars/{k}_b.png')
    open(OUT + '/data.js', 'w').write('const FR=' + json.dumps(FR, separators=(',', ':')) + ';\n')
