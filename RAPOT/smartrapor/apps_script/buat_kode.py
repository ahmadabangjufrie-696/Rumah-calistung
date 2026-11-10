"""Membuat gambar tombol SmartRapor dan menyusun Kode.gs dari Kode.template.gs.

    python buat_kode.py

Gambar tombol disisipkan ke Kode.gs sebagai base64, supaya cukup satu berkas
yang ditempel ke Apps Script.
"""
import base64, io, os
from PIL import Image, ImageDraw, ImageFont

DI_SINI = os.path.dirname(os.path.abspath(__file__))
HURUF = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
SKALA = 2  # digambar 2x supaya tajam

TOMBOL = {  # nama: (teks, lebar, tinggi, warna latar, warna teks)
    'NAIK': ('▲  Sebelumnya', 170, 30, (15, 81, 50), (255, 255, 255)),
    'TURUN': ('Berikutnya  ▼', 170, 30, (15, 81, 50), (255, 255, 255)),
    'CETAK1': ('CETAK SISWA INI', 170, 36, (201, 162, 39), (33, 37, 41)),
    'CETAKSEMUA': ('CETAK SEKELAS', 170, 36, (25, 135, 84), (255, 255, 255)),
}


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
    for nama, (t, w, h, bg, fg) in TOMBOL.items():
        png = gambar(t, w, h, bg, fg)
        open(os.path.join(DI_SINI, f'tombol_{nama.lower()}.png'), 'wb').write(png)
        teks = teks.replace(f'__TOMBOL_{nama}__', base64.b64encode(png).decode())
    assert '__TOMBOL_' not in teks
    open(os.path.join(DI_SINI, 'Kode.gs'), 'w', encoding='utf-8').write(teks)
    print('Kode.gs dibuat,', len(teks) // 1024, 'KB')


if __name__ == '__main__':
    main()
