"""Membuat gambar tombol SmartRapor dan menyusun Kode.gs dari Kode.template.gs.

    python buat_kode.py

Gambar tombol disisipkan ke Kode.gs sebagai base64, supaya cukup satu berkas
yang ditempel ke Apps Script.
"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont

DI_SINI = os.path.dirname(os.path.abspath(__file__))
HURUF = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
SKALA = 2  # digambar 2x supaya tajam

TOMBOL = {  # nama: (teks, lebar, tinggi, warna latar, warna teks)
    'NAIK': ('▲  Sebelumnya', 170, 30, (15, 81, 50), (255, 255, 255)),
    'TURUN': ('Berikutnya  ▼', 170, 30, (15, 81, 50), (255, 255, 255)),
    'CETAK1': ('CETAK SISWA INI', 170, 36, (201, 162, 39), (33, 37, 41)),
    'CETAKSEMUA': ('CETAK SEKELAS', 170, 36, (25, 135, 84), (255, 255, 255)),
    'PANEL': ('★  BUKA PANEL SMARTRAPOR', 345, 40, (15, 81, 50), (232, 198, 106)),
}
LOGO = os.path.join(DI_SINI, '..', 'aset', 'logo_sekolah.jpg')   # logo di kepala panel


def logo_png():
    im = Image.open(LOGO).convert('RGB')
    im.thumbnail((132, 132), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    return base64.b64encode(buf.getvalue()).decode()


def daftar_mapel():
    sys.path.insert(0, os.path.join(DI_SINI, '..'))
    import buat_smartrapor as b
    nama = {t: n for t, n in b.UMUM}
    nama.update({t: n for t, n, _ in b.PONDOK})
    return [t for t, _ in b.UMUM], list(b.URUT_PONDOK), nama


def gambar(teks, w, h, latar, warna):
    W, H = w * SKALA, h * SKALA
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=10 * SKALA, fill=latar)
    f = ImageFont.truetype(HURUF, 13 * SKALA)
    x0, y0, x1, y1 = d.textbbox((0, 0), teks, font=f)
    d.text(((W - (x1 - x0)) / 2 - x0, (H - (y1 - y0)) / 2 - y0), teks, font=f, fill=warna)
    buf = io.BytesIO()
    im.save(buf, 'PNG', optimize=True)
    return buf.getvalue()


def main():
    teks = open(os.path.join(DI_SINI, 'Kode.template.gs'), encoding='utf-8').read()
    teks += open(os.path.join(DI_SINI, 'Web.template.gs'), encoding='utf-8').read()   # aplikasi web
    for nama, (t, w, h, bg, fg) in TOMBOL.items():
        png = gambar(t, w, h, bg, fg)
        open(os.path.join(DI_SINI, f'tombol_{nama.lower()}.png'), 'wb').write(png)
        teks = teks.replace(f'__TOMBOL_{nama}__', base64.b64encode(png).decode())
    sekolah, pondok, nama = daftar_mapel()
    teks = teks.replace('__MAPEL_SEKOLAH__', json.dumps(sekolah)).replace('__MAPEL_PONDOK__', json.dumps(pondok))
    teks = teks.replace('__MAPEL_NAMA__', json.dumps(nama, ensure_ascii=False))
    logo = logo_png()
    for kunci, berkas in (('__PANEL_HTML__', 'Panel.html'), ('__WEB_HTML__', 'Web.html')):
        html = open(os.path.join(DI_SINI, berkas), encoding='utf-8').read().replace('__LOGO__', logo)
        teks = teks.replace(kunci, json.dumps(html, ensure_ascii=False))
    assert '__TOMBOL_' not in teks and '__MAPEL_' not in teks and '__PANEL_HTML' not in teks and '__WEB_' not in teks
    open(os.path.join(DI_SINI, 'Kode.gs'), 'w', encoding='utf-8').write(teks)
    print('Kode.gs dibuat,', len(teks) // 1024, 'KB')


if __name__ == '__main__':
    main()
