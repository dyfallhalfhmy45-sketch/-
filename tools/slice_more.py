"""Slices the extra characters + banner and merges them into assets/data.js (run after slice_sprites.py)"""
import numpy as np, json, os, sys
from PIL import Image
from scipy import ndimage as ndi
from slice_sprites import fg_mask, SRC, OUT

P = 'A_2D_pixel_art_sprite_sheet_for_a_retro_16-bit_arcade_fighti__%d_.jpg'
def rule_t2r(H,S,V): return (H>=100)&(H<=145)&(S>40), H-120, np.clip(S*1.5,0,255), np.clip(V*1.45+10,0,255)   # teal robe -> red robe
# map: anim -> list of (row, index); rc: frames to recolor; cuts: (y0,y1,x0,x1) erased
CFG = {
 'pen':   dict(f=25,it=5,tgt=285,ns=1,cuts=[(285,315,580,680),(515,550,430,810),(750,785,430,820)],
               map=dict(idle=[(0,i) for i in range(5)],walk=[(1,i) for i in range(6)],atk=[(0,0)]+[(2,i) for i in range(6)])),
 'fan':   dict(f=24,it=4,tgt=285,cuts=[],
               map=dict(idle=[(0,i) for i in range(4)],walk=[(1,i) for i in range(3)],atk=[(1,3),(1,4),(2,1),(2,2),(2,3)])),
 'tray':  dict(f=21,it=4,tgt=285,ns=1,cuts=[(10,48,10,180),(282,322,10,135),(552,590,10,135)],
               map=dict(idle=[(0,i) for i in range(5)],walk=[(1,i) for i in range(5)],atk=[(2,1),(2,2),(2,3)])),
 'vac':   dict(f=20,it=2,ncols={1:7,2:7},tgt=275,ns=1,cuts=[(535,612,60,400),(525,598,1020,1230)],rc={(1,0):1,(1,1):1,(1,2):1,(1,3):1},
               map=dict(idle=[(0,2),(0,3),(0,5),(0,6)],walk=[(1,0),(1,1),(1,2),(1,3),(1,5),(1,6)],atk=[(2,1),(2,2),(2,5)])),
 'mega':  dict(f=19,it=4,tgt=285,ns=1,cuts=[(15,45,10,150),(270,300,10,150),(510,540,10,150),(260,295,990,1248),(510,545,500,800)],
               map=dict(idle=[(0,i) for i in range(4)],walk=[(1,i) for i in range(4)],atk=[(2,i) for i in range(5)])),
 'hunch': dict(f=18,it=5,tgt=235,cuts=[],
               map=dict(idle=[(0,i) for i in range(7)],walk=[(1,i) for i in range(7)],atk=[(2,i) for i in range(6)])),
 'wheel': dict(f=17,it=5,tgt=285,cuts=[],
               map=dict(idle=[(0,i) for i in range(6)],walk=[(1,i) for i in range(7)],atk=[(2,i) for i in range(6)])),
 'kid':   dict(f=16,it=4,minh=40,tgt=250,cuts=[],
               map=dict(idle=[(0,i) for i in range(5)],walk=[(1,i) for i in range(8)],atk=[(2,i) for i in range(4)],fx=[(2,4),(2,5),(2,6)])),
 'teach': dict(f=15,it=3,ncols={0:7},tgt=290,cuts=[],
               map=dict(idle=[(0,i) for i in range(2,7)],walk=[(1,i) for i in range(6)],atk=[(2,i) for i in range(4)])),
 'chef':  dict(f=14,it=2,ncols={2:5},tgt=285,cuts=[],
               map=dict(idle=[(0,i) for i in range(5)],walk=[(1,i) for i in range(5)],atk=[(1,0),(2,0),(2,2),(2,4)])),
 'lizard':dict(f=13,it=5,tgt=300,cuts=[],
               map=dict(idle=[(0,i) for i in range(6)],walk=[(1,i) for i in range(6)],atk=[(2,i) for i in range(5)])),
 'sling': dict(f=11,it=4,tgt=250,cuts=[],
               map=dict(idle=[(0,i) for i in range(7)],walk=[(1,i) for i in range(7)],atk=[(2,i) for i in range(5)])),
 'graf':  dict(f=29,it=4,tgt=275,ncols={0:6,1:7,2:7},cuts=[(40,78,38,82),(268,302,38,82),(468,502,38,82),(500,538,30,1248)],
               map=dict(idle=[(0,i) for i in range(5)],walk=[(1,i) for i in range(6)],atk=[(2,i) for i in range(6)])),
 'sage':  dict(f=28,it=4,tgt=290,ns=1,ncols={0:9,1:9,2:6},cuts=[(535,578,30,1248)],
               map=dict(idle=[(0,i) for i in range(9)],walk=[(1,i) for i in range(9)],atk=[(2,i) for i in range(6)])),
 'dates': dict(f=27,it=4,tgt=290,ns=1,cuts=[(560,722,1160,1248),(735,832,0,1248)],
               map=dict(idle=[(0,i) for i in range(4)],walk=[(0,i) for i in range(4)],atk=[(2,i) for i in range(6)])),
 'bedu':  dict(f=26,it=4,tgt=290,cuts=[(500,538,430,800),(765,812,770,1248)],
               map=dict(idle=[(0,i) for i in range(5)],walk=[(1,i) for i in range(6)],atk=[(2,i) for i in range(5)])),
 'coin':  dict(f=30,it=13,tgt=62,minh=40,cuts=[],
               map=dict(spin=[(0,i) for i in range(5)],flat=[(1,0),(1,1)],pile=[(1,2)],burst=[(2,3),(2,4),(2,5)])),
}

def shadow_off(rgb, fg):
    r, g, b = [rgb[..., i].astype(int) for i in range(3)]
    sh = (b - r >= 6) & (rgb.min(2) >= 165) & (rgb.max(2) - rgb.min(2) <= 70) & (b >= g)
    return fg & ~sh

def recolor_crop(crop, rule):
    hsv = np.array(Image.fromarray(crop).convert('HSV')).astype(int)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    res = rule(H, S, V); m, nh, ns = res[:3]
    hsv[..., 0] = np.where(m, nh, H) % 256; hsv[..., 1] = np.where(m, ns, S)
    if len(res) > 3: hsv[..., 2] = np.where(m, res[3], V)
    return np.array(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB'))

def comps_of(name, c):
    rgb = np.array(Image.open(SRC + P % c['f']).convert('RGB'))
    fg = fg_mask(rgb)
    for y0, y1, x0, x1 in c['cuts']: fg[y0:y1, x0:x1] = False
    if c.get('ns'): fg = shadow_off(rgb, fg)
    lab, _ = ndi.label(ndi.binary_dilation(fg, iterations=c['it']))
    out = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        m = (lab[sl] == i) & fg[sl]
        if m.sum() < 1200: continue
        ys, xs = np.nonzero(m)
        y0, y1, x0, x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
        if y1 - y0 < c.get('minh', 85): continue
        out.append(dict(cy=sl[0].start+(y0+y1)/2, cx=sl[1].start+x0, m=m[y0:y1, x0:x1], crop=rgb[sl][y0:y1, x0:x1], x=sl[1].start+x0, y=sl[0].start+y0))
    out.sort(key=lambda k: k['cy'])
    rows, cur = [], [out[0]]
    for k in out[1:]:
        if k['cy'] - cur[-1]['cy'] > 100: rows.append(cur); cur = []
        cur.append(k)
    rows.append(cur)
    rows = [sorted(r, key=lambda k: k['cx']) for r in rows]
    for r, n in c.get('ncols', {}).items():
        while len(rows[r]) < n:
            k = max(rows[r], key=lambda q: q['m'].shape[1]); rows[r].remove(k)
            m = k['m']; w = m.shape[1]; lo, hi = int(w*.3), int(w*.7)
            sp = lo + int(np.argmin(m[:, lo:hi].sum(0)))
            for a, b in ((0, sp), (sp, w)):
                mm = m[:, a:b]; ys, xs = np.nonzero(mm)
                y0, y1, x0, x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
                rows[r].append(dict(cy=k['cy'], cx=k['cx']+a+x0, m=mm[y0:y1, x0:x1], crop=k['crop'][y0:y1, a+x0:a+x1], x=0, y=0))
            rows[r].sort(key=lambda q: q['cx'])
    return rows

def build(name, c, analyze=False):
    rows = comps_of(name, c)
    print(name, [len(r) for r in rows], [[(k['cx'], k['m'].shape[1], k['m'].shape[0]) for k in r] for r in rows] if analyze else '')
    if analyze: return None
    sel = {a: [rows[r][i] for r, i in lst] for a, lst in c['map'].items()}
    rcmap = c.get('rc', {})
    frames = []
    for a, lst in c['map'].items():
        for (r, i), k in zip(lst, sel[a]):
            crop = recolor_crop(k['crop'], rule_t2r) if (r, i) in rcmap else k['crop']
            frames.append((a, crop, k['m']))
    hs = [m.shape[0] for a, _, m in frames if a in ('idle', 'walk', 'spin')]
    s = round(c['tgt'] / float(np.median(hs)), 4)
    H = max(m.shape[0] for _, _, m in frames); Wt = sum(m.shape[1] + 2 for _, _, m in frames)
    atlas = np.zeros((H, Wt, 4), np.uint8); x = 0; data = {}
    for a, crop, m in frames:
        h, w = m.shape
        atlas[:h, x:x+w, :3] = crop; atlas[:h, x:x+w, 3] = m * 255
        ax = float(np.nonzero(m[int(h*.7):])[1].mean())
        data.setdefault(a, []).append([x, 0, w, h, round(ax, 1)]); x += w + 2
    save_png(atlas, f'{OUT}/chars/{name}.png')
    data.update(s=s, img=f'assets/chars/{name}.png')
    return data

def save_png(arr, path):
    im = Image.fromarray(arr)
    q = im.quantize(256, method=Image.FASTOCTREE, dither=Image.NONE)
    q.save(path, optimize=True)

def bomb():
    im = np.array(Image.open(SRC + 'لقطة_شاشة_1-11-2026_181918_www_bing_com.jpeg').convert('RGB')).astype(int)
    bg = np.abs(im - im[3, 3]).sum(2) < 40
    lab, _ = ndi.label(bg)
    keep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(keep))
    ys, xs = np.nonzero(fg); y0, y1, x0, x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    a = np.dstack([im[y0:y1, x0:x1].astype(np.uint8), (fg[y0:y1, x0:x1] * 255).astype(np.uint8)])
    Image.fromarray(a).save(f'{OUT}/bomb.png', optimize=True)
    return {'img': 'assets/bomb.png', 'w': int(x1-x0), 'h': int(y1-y0)}

def banner():
    rgb = np.array(Image.open(SRC + 'A_2D_pixel.jpg').convert('RGB')).astype(int)
    m = (rgb.max(2) - rgb.min(2)) > 70
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    a = np.dstack([rgb[y0:y1, x0:x1].astype(np.uint8), (m[y0:y1, x0:x1] * 255).astype(np.uint8)])
    im = Image.fromarray(a); im.thumbnail((900, 400)); im.save(f'{OUT}/shawarma.png', optimize=True)

if __name__ == '__main__':
    an = len(sys.argv) > 1 and sys.argv[1] == 'a'
    dp = OUT + '/data.js'
    FR = json.loads(open(dp).read()[len('const FR='):].rstrip().rstrip(';'))
    for n, c in CFG.items():
        d = build(n, c, an)
        if d: FR[n] = d
    if not an:
        for fn in os.listdir(OUT + '/chars'):       # shrink every atlas (palette PNG)
            p = f'{OUT}/chars/{fn}'; im = Image.open(p)
            if im.mode == 'RGBA': save_png(np.array(im), p)
        banner(); FR['bomb'] = bomb()
        open(dp, 'w').write('const FR=' + json.dumps(FR, separators=(',', ':')) + ';\n')
