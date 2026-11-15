"""Membuat gambar untuk raport pondok desain C3 (dijalankan sekali; hasil PNG disimpan di aset/).

  kop_c3.png      kop: logo kanan, nama Arab hijau, nama Latin, alamat, latar tembus pandang
  sudut_c3.png    hiasan sudut (emas)
  stempel_c3.png  lingkaran tempat stempel
  air_c3.png      tanda air logo samar (tembus pandang)

Perlu: Python Pillow, Node + Playwright. Ubah KOP_* di bawah untuk sekolah lain.
"""
import base64, json, os, subprocess, sys
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
H = os.path.join(D, 'huruf')
LOGO = os.path.join(D, 'logo_sekolah.jpg')
KOP_AR = 'معهد الخيرات الإسلامي تانجونج سيلور'
KOP_LAT = 'PONDOK PESANTREN ALKHAIRAAT TANJUNG SELOR'
KOP_ALAMAT = 'Jln. Jelarai, Tanjung Selor Timur, Kab. Bulungan, Kalimantan Utara · Telp. (0552) 23155'
HIJAU, EMAS = '#0F5132', '#B8932E'
KOP_W, KOP_H = 709, 104       # sama dengan lebar kolom B..H di RAPOR PONDOK (piksel)

def b64(p):
    return base64.b64encode(open(p, 'rb').read()).decode()

HURUF = f"""
@font-face {{ font-family: Ruqaa; font-weight: 700; src: url('file://{H}/aref-ruqaa-arabic-700-normal.woff2'); }}
@font-face {{ font-family: Cormorant; font-weight: 700; src: url('file://{H}/cormorant-garamond-latin-700-normal.woff2'); }}
@font-face {{ font-family: Poppins; src: url('file://{H}/poppins-latin-400-normal.woff2'); }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }} html, body {{ background: transparent; }}
"""

KOP = f"""<!doctype html><html><head><meta charset="utf-8"><style>{HURUF}
.k {{ position: relative; width: {KOP_W}px; height: {KOP_H}px; }}
.k img {{ position: absolute; right: 2px; top: 4px; width: 96px; }}
.t {{ position: absolute; left: 110px; right: 110px; top: 2px; text-align: center; }}
.ar {{ font-family: Ruqaa; font-weight: 700; font-size: 31px; color: {HIJAU}; line-height: 1.25; padding-bottom: 9px; direction: rtl; }}
.lat {{ font-family: Cormorant; font-weight: 700; font-size: 17px; letter-spacing: .8px; white-space: nowrap; color: {HIJAU}; }}
.al {{ font-family: Poppins; font-size: 9.5px; color: {HIJAU}; margin-top: 2px; white-space: nowrap; }}
</style></head><body><div class="k" id="x"><img src="data:image/jpeg;base64,{b64(LOGO)}">
<div class="t"><div class="ar">{KOP_AR}</div><div class="lat">{KOP_LAT}</div><div class="al">{KOP_ALAMAT}</div></div></div></body></html>"""

SUDUT = f"""<!doctype html><html><head><meta charset="utf-8"><style>{HURUF}</style></head><body>
<div id="x" style="width:30px;height:30px;background:#fff;padding:2px">
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
<g fill="none" stroke="{EMAS}" stroke-width="2.6">
<polygon points="50,6 61,39 94,50 61,61 50,94 39,61 6,50 39,39"/>
<polygon points="50,20 71,29 80,50 71,71 50,80 29,71 20,50 29,29"/>
<circle cx="50" cy="50" r="11"/></g><circle cx="50" cy="50" r="4" fill="{EMAS}"/></svg></div></body></html>"""

STEMPEL = f"""<!doctype html><html><head><meta charset="utf-8"><style>{HURUF}
#x {{ width: 52px; height: 52px; border: 1.5px dashed #aaa; border-radius: 50%; font: 8px Poppins; color: #aaa;
      display: flex; align-items: center; justify-content: center; }}</style></head><body><div id="x">STEMPEL</div></body></html>"""

JS = """const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 3 });
  for (const [html, png] of JSON.parse(process.argv[2])) {
    await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
    await p.locator('#x').screenshot({ path: png, omitBackground: true }); }
  await b.close(); })();"""


def main():
    tmp = os.path.join(D, '_tmp')
    os.makedirs(tmp, exist_ok=True)
    kerja = []
    for nama, html in (('kop_c3', KOP), ('sudut_c3', SUDUT), ('stempel_c3', STEMPEL)):
        f = os.path.join(tmp, nama + '.html')
        open(f, 'w').write(html)
        kerja.append([f, os.path.join(D, nama + '.png')])
    js = os.path.join(tmp, 'foto.js')
    open(js, 'w').write(JS)
    subprocess.run(['node', js, json.dumps(kerja)], check=True)
    # tanda air: logo diperbesar, putih jadi tembus pandang, sisanya sangat samar
    im = Image.open(LOGO).convert('RGB').resize((600, 600), Image.LANCZOS)
    out = Image.new('RGBA', im.size)
    px = [(r, g, b, int((255 - min(r, g, b)) / 255 * 255 * 0.06)) for r, g, b in im.get_flattened_data()]
    out.putdata(px)
    out.save(os.path.join(D, 'air_c3.png'))
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    print('selesai')


if __name__ == '__main__':
    sys.exit(main())
