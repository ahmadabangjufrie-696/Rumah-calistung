"""Mengambil nilai langsung dari Google Sheet nilai raport.

Setiap tab diunduh sebagai CSV lewat alamat gviz. Salinan CSV disimpan di
folder `data_gs/` supaya bisa dicek ulang, dan bisa dipakai lagi tanpa internet
dengan pilihan --offline.
"""
import csv, io, os, re, urllib.parse

SHEET_ID = '11KqxudMmizriXM_blIGuY3sJMiEMmPUVIn512qVsJvA'
URL = 'https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv&headers=0&sheet={tab}'

# Mapel umum: tab Google Sheet -> kolom "MAPEL :" di sheet Ff11
UMUM = {
    'PKN': 'CV', 'B. INDO': 'EC', 'MTK': 'FJ', 'IPA': 'GQ', 'IPS': 'HX',
    'B. INGGRIS': 'JE', 'PJOK': 'LS', 'INFORMATIKA': 'MZ',
}
# Mapel pondok: tab Google Sheet -> kolom awal blok (Tugas 1) di sheet Form Nilai
PONDOK = {
    'HADIST': 'C', 'FIQIH': 'AC', 'TAUHID': 'AP', 'NAHWU': 'BC', 'SHOROF': 'BQ',
    'TAFSIR': 'CD', 'TARIKH': 'CQ', 'TASRIF': 'DD', 'S. ALKHAIRAAT': 'HQ',
    'MUHADATSAH': 'ID', 'AL ANGHAAM': 'IQ', 'MAHFUZATH': 'JD',
}


def nama_baku(nama):
    """Nama untuk dicocokkan: huruf besar, titik diberi spasi, spasi dirapikan."""
    return re.sub(r'\s+', ' ', (nama or '').upper().replace('.', '. ')).strip()


def baca_csv(teks):
    """Baris siswa saja: kolom A berisi nomor urut, kolom B nama.
    Hasil: {nama_baku: (nama_asli, [nilai mulai kolom C ...])}"""
    hasil = {}
    for row in csv.reader(io.StringIO(teks)):
        if len(row) > 1 and row[0].strip().isdigit() and row[1].strip():
            hasil[nama_baku(row[1])] = (row[1].strip(), row[2:])
    return hasil


def ambil_tab(tab, folder, offline=False):
    berkas = os.path.join(folder, tab.replace(' ', '_').replace('.', '') + '.csv')
    if offline:
        with open(berkas, encoding='utf-8') as f:
            return baca_csv(f.read())
    import requests
    url = URL.format(id=SHEET_ID, tab=urllib.parse.quote(tab))
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    r.encoding = 'utf-8'
    if r.text.lstrip().startswith('<'):
        raise RuntimeError(f'Tab {tab!r} tidak bisa dibaca. Pastikan link Google Sheet '
                           'dibagikan "siapa saja yang punya link".')
    os.makedirs(folder, exist_ok=True)
    with open(berkas, 'w', encoding='utf-8') as f:
        f.write(r.text)
    return baca_csv(r.text)


def ambil_semua(folder, offline=False):
    """{nama tab: {nama_baku: (nama_asli, nilai)}} untuk semua tab UMUM dan PONDOK."""
    return {tab: ambil_tab(tab, folder, offline) for tab in list(UMUM) + list(PONDOK)}
