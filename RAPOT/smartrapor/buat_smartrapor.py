"""SmartRapor - perakit file Google Sheet raport satu kelas (tahap 1).

    python buat_smartrapor.py [keluaran.xlsx] [--contoh]

Menghasilkan satu file .xlsx yang diunggah ke Google Drive lalu dibuka sebagai
Google Sheet. Semua perhitungan memakai rumus biasa (tanpa makro), jadi nilai
langsung masuk ke raport begitu guru mengisi.

--contoh  mengisi data contoh (nama siswa buatan dan nilai acak) untuk uji.

Halaman:
  BERANDA            ringkasan kelas dan progres nilai per mapel
  PENGATURAN         identitas sekolah, kelas, wali kelas, daftar mapel
  SISWA              data siswa (diisi sekali)
  tab mapel          diisi guru: 12 mapel umum, 16 mapel pondok
  EKSKUL & CATATAN   ekstrakurikuler, prestasi, kehadiran, catatan, keputusan
  COVER, IDENTITAS SEKOLAH, KETERANGAN DIRI, RAPOR SEKOLAH   halaman cetak
"""
import os, random, sys
from openpyxl import Workbook
from openpyxl.drawing.image import Image as Gambar
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter as gl
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.pagebreak import Break

DI_SINI = os.path.dirname(os.path.abspath(__file__))
MAKS = 40                      # siswa per kelas

# ---------------------------------------------------------------- gaya
APP = 'Poppins'                # huruf halaman aplikasi
CETAK = 'Times New Roman'      # huruf raport cetak
HIJAU, HIJAU2, EMAS = '0F5132', '198754', 'C9A227'
KREM, ABU, ABU2, PUTIH = 'FFF8E1', 'F4F6F5', 'E9ECEF', 'FFFFFF'
KUNING = 'FFF4CC'
tipis = Side(style='thin', color='BFBFBF')
hitam = Side(style='thin', color='000000')
tebal = Side(style='medium', color='000000')
KOTAK = Border(left=tipis, right=tipis, top=tipis, bottom=tipis)
GARIS = Border(left=hitam, right=hitam, top=hitam, bottom=hitam)


def isi(ws, ref, nilai=None, font=APP, size=10, bold=False, italic=False, warna='212529',
        latar=None, h=None, v='center', bungkus=False, border=None, underline=None):
    c = ws[ref]
    if nilai is not None:
        c.value = nilai
    c.font = Font(name=font, size=size, bold=bold, italic=italic, color=warna, underline=underline)
    if latar:
        c.fill = PatternFill('solid', fgColor=latar)
    c.alignment = Alignment(horizontal=h, vertical=v, wrap_text=bungkus)
    if border:
        c.border = border
    return c


def gabung(ws, rng, nilai=None, **kw):
    ws.merge_cells(rng)
    awal = rng.split(':')[0]
    return isi(ws, awal, nilai, **kw)


def kotak_rentang(ws, rng, border=GARIS):
    for baris in ws[rng]:
        for c in baris:
            c.border = border


def latar_rentang(ws, rng, warna):
    for baris in ws[rng]:
        for c in baris:
            c.fill = PatternFill('solid', fgColor=warna)


def lebar(ws, daftar):
    for kol, w in daftar.items():
        ws.column_dimensions[kol].width = w


def pita_judul(ws, judul, sub, sampai):
    latar_rentang(ws, f'A1:{sampai}3', HIJAU)
    ws.row_dimensions[1].height = 8
    ws.row_dimensions[2].height = 30
    ws.row_dimensions[3].height = 20
    isi(ws, 'B2', judul, size=16, bold=True, warna=PUTIH)
    isi(ws, 'B3', sub, size=9, warna='D1E7DD')
    ws.sheet_view.showGridLines = False


def q(tab):
    return "'" + tab.replace("'", "''") + "'"


# ---------------------------------------------------------------- data dasar
PENGATURAN = [  # kunci, label, nilai bawaan
    ('_', 'IDENTITAS SEKOLAH', None),
    ('sekolah', 'Nama sekolah', 'SMP AL-KHAIRAAT TANJUNG SELOR'),
    ('judul1', 'Judul cover baris 1', 'Sekolah Menengah Pertama'),
    ('judul2', 'Judul cover baris 2', 'AL Khairaat Tanjung Selor'),
    ('npsn', 'NPSN', '30402541'),
    ('alamat', 'Alamat sekolah', 'Ponpes Al Khairaat Jln. Jelarai, Kec.Tanjung Selor, Kab.Bulungan Kalimantan Utara'),
    ('kodepos', 'Kode pos', '77212'),
    ('kelurahan', 'Desa / Kelurahan', 'Tanjung Selor Hilir'),
    ('kecamatan', 'Kecamatan', 'Tanjung Selor'),
    ('kabupaten', 'Kabupaten / Kota', 'Bulungan'),
    ('provinsi', 'Provinsi', 'Kalimantan Utara'),
    ('telepon', 'Telepon', '(0552) 23155'),
    ('email', 'E-mail', 'alkhairaatpesantren@gmail.com'),
    ('website', 'Website', 'http://www.alkhairaattanjungselor.sch.id'),
    ('kementerian', 'Tulisan bawah cover', 'Kementerian Pendidikan Dasar dan Menengah\nRepublik Indonesia'),
    ('kepsek', 'Kepala sekolah', 'Hj. Sy. Amina, S.Pd.'),
    ('nip_kepsek', 'NIP kepala sekolah', ''),
    ('_', 'KELAS & SEMESTER', None),
    ('kelas', 'Kelas', 'IX ( Sembilan ) B'),
    ('fase', 'Fase', 'D'),
    ('semester', 'Semester', 'Genap'),
    ('tahun', 'Tahun pelajaran', '2025/2026'),
    ('tempat', 'Tempat penandatanganan', 'Tanjung Selor'),
    ('tanggal', 'Tanggal raport', '20 Juni 2026'),
    ('wali', 'Wali kelas', 'Ahmad Jufri'),
    ('nip_wali', 'NIP wali kelas', ''),
    ('kktp', 'KKTP bawaan (nilai tuntas)', 70),
    ('keputusan', 'Kalimat keputusan (akhir catatan)',
     'Berdasarkan putusan rapat dewan guru serta memperhatikan capaian pembelajaran semester ganjil dan '
     'semester genap, maka siswa dinyatakan {keputusan}.'),
]
SEL = {}            # kunci -> alamat mutlak di PENGATURAN

UMUM = [  # tab, nama di raport
    ('PAI', 'Pendidikan Agama dan Budi Pekerti'), ('PKN', 'Pendidikan Pancasila'),
    ('B. INDO', 'Bahasa Indonesia'), ('MTK', 'Matematika'),
    ('IPA', 'Ilmu Pengetahuan Alam'), ('IPS', 'Ilmu Pengetahuan Sosial'),
    ('B. INGGRIS', 'Bahasa Inggris'), ('SENI BUDAYA', 'Seni Budaya*) : Seni Rupa'),
    ('PJOK', 'Pendidikan Olah Raga dan Kesehatan'), ('INFORMATIKA', 'Informatika'),
    ('PRAKARYA', 'Prakarya*) : Rekayasa'), ('MULOK', 'Muatan Lokal'),
]
PONDOK = [  # tab, nama, nama Arab
    ('HADIST', "Qur'an Hadist", 'حديث القرآن'), ('BAHASA ARAB', 'Bahasa Arab', 'اللغة العربية والإنشاء'),
    ('FIQIH', 'Fiqih', 'فقه'), ('TAUHID', 'Tauhid', 'التوحيد'), ('NAHWU', 'Nahwu', 'نحو'),
    ('SHOROF', 'Shorof', 'صرف'), ('TAFSIR', 'Tafsir', 'تفسير'), ('TARIKH', 'Tarikh', 'تاريخ'),
    ('TASRIF', 'Tasrif', 'تصريف'), ('TAJWID', 'Tajwid', 'التجويد'),
    ('S. ALKHAIRAAT', 'Sejarah Al Khairaat', 'تاريخ الخيرات'), ('MUHADATSAH', "Insya' / Muhadatsah", 'محادثة'),
    ('AL ANGHAAM', 'Al Anghaam', 'الأنغام'), ('MAHFUZATH', 'Mahfuzat', 'محفوظات'),
    ('MUFRADAT', 'Mufradat', 'مفردات'), ('IMLA', 'Imla', 'إملاء'),
]
KAL_TUNTAS = 'Ananda {nama} sudah menunjukkan kemampuan dalam'
KAL_BIMBING = 'Ananda {nama} perlu bimbingan dalam'
MAPEL_SEL = {}      # tab -> {'nama':addr,'tuntas':addr,'bimbing':addr}

BARIS1 = 9          # baris siswa pertama di tab mapel
SISWA1 = 5          # baris siswa pertama di SISWA
EKS1 = 7            # baris siswa pertama di EKSKUL & CATATAN
EKS = 'EKSKUL & CATATAN'


def rentang_siswa(tab, kol, awal=BARIS1):
    return f'{q(tab)}!${kol}${awal}:${kol}${awal + MAKS - 1}'


# ---------------------------------------------------------------- PENGATURAN
def buat_pengaturan(wb):
    ws = wb.create_sheet('PENGATURAN')
    pita_judul(ws, 'Pengaturan', 'Isi sekali setiap semester. Semua halaman raport mengambil data dari sini.', 'H')
    lebar(ws, {'A': 2, 'B': 34, 'C': 62, 'D': 3, 'E': 16, 'F': 40, 'G': 46, 'H': 40})
    r = 5
    for kunci, label, nilai in PENGATURAN:
        if kunci == '_':
            r += 1 if r > 5 else 0
            gabung(ws, f'B{r}:C{r}', label, bold=True, size=10, warna=HIJAU)
            ws[f'B{r}'].border = Border(bottom=Side(style='medium', color=EMAS))
            ws[f'C{r}'].border = Border(bottom=Side(style='medium', color=EMAS))
            r += 1
            continue
        isi(ws, f'B{r}', label, size=10, warna='495057')
        c = isi(ws, f'C{r}', nilai, size=10, bold=True, latar=KUNING, bungkus=True, border=KOTAK)
        if '\n' in str(nilai):
            ws.row_dimensions[r].height = 30
        SEL[kunci] = f'PENGATURAN!$C${r}'
        r += 1
    # tabel mapel
    gabung(ws, 'E5:H5', 'DAFTAR MATA PELAJARAN', bold=True, size=10, warna=HIJAU)
    for c in 'EFGH':
        ws[f'{c}5'].border = Border(bottom=Side(style='medium', color=EMAS))
    for i, t in enumerate(['Tab', 'Nama di raport', 'Kalimat bila tuntas', 'Kalimat bila belum tuntas']):
        isi(ws, f'{"EFGH"[i]}6', t, size=9, bold=True, warna=PUTIH, latar=HIJAU2, h='center', border=KOTAK)
    r = 7
    for tab, nama in UMUM:
        tuntas, bimbing = KAL_TUNTAS, KAL_BIMBING
        if tab == 'B. INGGRIS':
            tuntas, bimbing = '{nama} has shown proficiency in', '{nama} needs guidance in'
        isi(ws, f'E{r}', tab, size=9, bold=True, border=KOTAK)
        for kol, val in zip('FGH', (nama, tuntas, bimbing)):
            isi(ws, f'{kol}{r}', val, size=9, latar=KUNING, border=KOTAK, bungkus=True)
        MAPEL_SEL[tab] = {'nama': f'PENGATURAN!$F${r}', 'tuntas': f'PENGATURAN!$G${r}',
                          'bimbing': f'PENGATURAN!$H${r}'}
        r += 1
    isi(ws, f'E{r + 1}', 'Tulisan {nama} otomatis diganti nama siswa.', size=8, italic=True, warna='6C757D')
    ws.freeze_panes = 'A5'
    ws.sheet_properties.tabColor = EMAS
    return ws


# ---------------------------------------------------------------- SISWA
KOLOM_SISWA = [
    ('No', 5), ('NIS', 10), ('NISN', 13), ('Nama Peserta Didik', 30), ('Nama (tulisan Arab)', 22),
    ('L/P', 5), ('Tempat Lahir', 14), ('Tanggal Lahir', 12), ('Agama', 9), ('Status dalam Keluarga', 14),
    ('Anak ke-', 7), ('Alamat Peserta Didik', 24), ('No. Telepon', 14), ('Sekolah Asal', 24),
    ('Diterima di Kelas', 9), ('Diterima Tanggal', 12), ('Nama Ayah', 20), ('Nama Ayah (Arab)', 18),
    ('Nama Ibu', 20), ('Alamat Orang Tua', 24), ('Telepon Orang Tua', 14), ('Pekerjaan Ayah', 14),
    ('Pekerjaan Ibu', 14), ('Nama Wali', 18), ('Alamat Wali', 20), ('Telepon Wali', 14), ('Pekerjaan Wali', 14),
]
KS = {nama: gl(i + 1) for i, (nama, _) in enumerate(KOLOM_SISWA)}


def siswa(kol, idx):
    """rumus isi kolom SISWA untuk nomor siswa di sel idx"""
    return f'INDEX(SISWA!${KS[kol]}${SISWA1}:${KS[kol]}${SISWA1 + MAKS - 1},{idx})'


def buat_siswa(wb):
    ws = wb.create_sheet('SISWA')
    akhir = gl(len(KOLOM_SISWA))
    pita_judul(ws, 'Data Siswa', 'Diisi wali kelas sekali saja. Urutan siswa di sini dipakai semua halaman.', akhir)
    for i, (nama, w) in enumerate(KOLOM_SISWA):
        col = gl(i + 1)
        ws.column_dimensions[col].width = w
        isi(ws, f'{col}4', nama, size=9, bold=True, warna=PUTIH, latar=HIJAU2, h='center', bungkus=True,
            border=KOTAK)
    ws.row_dimensions[4].height = 32
    for i in range(MAKS):
        r = SISWA1 + i
        isi(ws, f'A{r}', i + 1, size=9, h='center', border=KOTAK)
        for j in range(1, len(KOLOM_SISWA)):
            isi(ws, f'{gl(j + 1)}{r}', size=9, latar=KUNING if j == 3 else None, border=KOTAK)
    # daftar pilihan "No - Nama" untuk BERANDA (kolom AB disembunyikan)
    for i in range(MAKS):
        r = SISWA1 + i
        ws[f'AB{r}'] = f'=IF(D{r}="","",A{r}&" - "&D{r})'
    ws.column_dimensions['AB'].hidden = True
    ws.freeze_panes = f'E{SISWA1}'
    ws.sheet_properties.tabColor = EMAS


# ---------------------------------------------------------------- tab mapel
def validasi_nilai(ws, rng):
    dv = DataValidation(type='decimal', operator='between', formula1='0', formula2='100',
                        showErrorMessage=True, errorTitle='Nilai salah', error='Isi angka 0 sampai 100.')
    ws.add_data_validation(dv)
    dv.add(rng)


def kepala_mapel(ws, judul, sub, sampai):
    pita_judul(ws, judul, sub, sampai)
    isi(ws, 'A4', 'Nama Guru', size=9, bold=True)
    ws.merge_cells('C4:F4')
    for c in 'CDEF':
        ws[f'{c}4'].fill = PatternFill('solid', fgColor=KUNING)
        ws[f'{c}4'].border = KOTAK
    isi(ws, 'C4', size=10, bold=True)
    isi(ws, 'H4', 'KKTP', size=9, bold=True, h='right')
    isi(ws, 'I4', f'={SEL["kktp"]}', size=10, bold=True, latar=KUNING, h='center', border=KOTAK)
    gabung(ws, f'A5:{sampai}5', 'Isi hanya kotak KUNING.  MERAH = nilai wajib belum diisi.  '
           'ORANYE = di bawah KKTP.  Nilai tersimpan otomatis.', size=8, warna='6C757D')


def buat_mapel_umum(wb, tab, nama):
    ws = wb.create_sheet(tab)
    kepala_mapel(ws, nama.upper(), 'Mapel umum  ·  Sumatif lingkup materi + sumatif akhir semester', 'T')
    hdr = {'A': 'No', 'B': 'Nama Siswa'}
    hdr.update({gl(3 + i): f'Sumatif {i + 1}' for i in range(8)})
    hdr.update({'K': 'Rata-rata Sumatif', 'L': '', 'M': 'Non Tes', 'N': 'Tes', 'O': 'Rata-rata Akhir Sem.',
                'P': '', 'Q': 'NILAI RAPOR', 'R': 'Status', 'S': 'Capaian (tuntas)',
                'T': 'Capaian (perlu bimbingan)'})
    for col, t in hdr.items():
        isi(ws, f'{col}7', t, size=8, bold=True, warna=PUTIH, latar=HIJAU2, h='center', bungkus=True,
            border=KOTAK)
    ws.row_dimensions[7].height = 34
    # baris materi / TP
    gabung(ws, 'A8:B8', 'Materi / Tujuan Pembelajaran  ➜', size=8, bold=True, warna=HIJAU, h='right')
    for i in range(8):
        isi(ws, f'{gl(3 + i)}8', size=8, latar=KREM, bungkus=True, v='top', border=KOTAK)
    ws.row_dimensions[8].height = 54
    akhir = BARIS1 + MAKS - 1
    m = MAPEL_SEL[tab]
    for i in range(MAKS):
        r = BARIS1 + i
        isi(ws, f'A{r}', i + 1, size=9, h='center', border=KOTAK)
        isi(ws, f'B{r}', f'=IF({siswa("Nama Peserta Didik", i + 1)}="","",'
                         f'{siswa("Nama Peserta Didik", i + 1)})', size=9, border=KOTAK)
        for col in hdr:
            if col in 'AB':
                continue
            c = ws[f'{col}{r}']
            c.border = KOTAK
            c.font = Font(name=APP, size=9, bold=col == 'Q')
            c.alignment = Alignment(horizontal='center', vertical='center')
            if col in 'CDEFGHIJMN':
                c.fill = PatternFill('solid', fgColor=KUNING)
            elif col not in 'LP':
                c.fill = PatternFill('solid', fgColor=ABU)
        ws[f'K{r}'] = f'=IF(COUNT(C{r}:J{r})=0,"",ROUND(AVERAGE(C{r}:J{r}),1))'
        ws[f'O{r}'] = f'=IF(COUNT(M{r}:N{r})=0,"",ROUND(AVERAGE(M{r}:N{r}),1))'
        ws[f'Q{r}'] = f'=IF(COUNT(K{r},O{r})=0,"",ROUND(AVERAGE(K{r},O{r}),0))'
        ws[f'R{r}'] = (f'=IF(B{r}="","",IF(AND(COUNT(C{r}:J{r})>0,COUNT(M{r}:N{r})>0),"Lengkap",'
                       f'IF(COUNT(C{r}:J{r},M{r}:N{r})=0,"Kosong","Belum lengkap")))')
        tuntas = '&'.join(f'IF(AND({c}{r}<>"",{c}$8<>""),IF({c}{r}>=$I$4,{c}$8&"; ",""),"")'
                          for c in 'CDEFGHIJ')
        bimbing = '&'.join(f'IF(AND({c}{r}<>"",{c}$8<>""),IF({c}{r}<$I$4,{c}$8&"; ",""),"")'
                           for c in 'CDEFGHIJ')
        ws[f'U{r}'] = '=' + tuntas
        ws[f'V{r}'] = '=' + bimbing
        ws[f'S{r}'] = f'=IF(OR(B{r}="",U{r}=""),"",SUBSTITUTE({m["tuntas"]},"{{nama}}",B{r})&" "&U{r})'
        ws[f'T{r}'] = f'=IF(OR(B{r}="",V{r}=""),"",SUBSTITUTE({m["bimbing"]},"{{nama}}",B{r})&" "&V{r})'
        for col in 'ST':
            ws[f'{col}{r}'].alignment = Alignment(horizontal='left', vertical='center', wrap_text=False)
            ws[f'{col}{r}'].font = Font(name=APP, size=8, color='495057')
    peringatan(ws, list('CDEFGHIJMN'), ['C', 'N'], 'R')
    lebar(ws, {'A': 5, 'B': 28, 'K': 10, 'L': 1.5, 'O': 10, 'P': 1.5, 'Q': 10, 'R': 13, 'S': 40, 'T': 40,
               'U': 4, 'V': 4})
    for col in 'CDEFGHIJMN':
        ws.column_dimensions[col].width = 11
    ws.column_dimensions['U'].hidden = True
    ws.column_dimensions['V'].hidden = True
    ws.freeze_panes = f'C{BARIS1}'
    ws.sheet_properties.tabColor = '2E75B6'


def buat_mapel_pondok(wb, tab, nama, arab):
    ws = wb.create_sheet(tab)
    kepala_mapel(ws, f'{nama.upper()}   {arab}', 'Mapel pondok  ·  Tugas, lisan/praktik, dan semester', 'M')
    grup = [('C7:F7', 'Nilai Pengetahuan (Tugas)'), ('G7:I7', 'Nilai Lisan / Praktik'),
            ('J7:J7', 'Semester'), ('K7:L7', 'Nilai Raport')]
    for rng, t in grup:
        if rng.split(':')[0] != rng.split(':')[1]:
            ws.merge_cells(rng)
        isi(ws, rng.split(':')[0], t, size=8, bold=True, warna=PUTIH, latar=HIJAU2, h='center', border=KOTAK)
    for col, t in {'A': 'No', 'B': 'Nama Santri', 'C': 'Tugas 1', 'D': 'Tugas 2', 'E': 'Tugas 3',
                   'F': 'Tugas 4', 'G': 'Lisan 1', 'H': 'Lisan 2', 'I': 'Lisan 3', 'J': 'Semester',
                   'K': 'Teori', 'L': 'Praktik', 'M': 'Status'}.items():
        isi(ws, f'{col}8', t, size=8, bold=True, warna=PUTIH, latar=HIJAU2, h='center', border=KOTAK)
    for c in 'ABM':
        ws.merge_cells(f'{c}7:{c}8')
        isi(ws, f'{c}7', ws[f'{c}8'].value if False else {'A': 'No', 'B': 'Nama Santri', 'M': 'Status'}[c],
            size=8, bold=True, warna=PUTIH, latar=HIJAU2, h='center', border=KOTAK)
    for i in range(MAKS):
        r = BARIS1 + i
        isi(ws, f'A{r}', i + 1, size=9, h='center', border=KOTAK)
        isi(ws, f'B{r}', f'=IF({siswa("Nama Peserta Didik", i + 1)}="","",'
                         f'{siswa("Nama Peserta Didik", i + 1)})', size=9, border=KOTAK)
        for col in 'CDEFGHIJKLM':
            c = ws[f'{col}{r}']
            c.border = KOTAK
            c.font = Font(name=APP, size=9, bold=col in 'KL')
            c.alignment = Alignment(horizontal='center', vertical='center')
            c.fill = PatternFill('solid', fgColor=KUNING if col in 'CDEFGHIJ' else ABU)
        ws[f'K{r}'] = f'=IF(COUNT(C{r}:F{r},J{r})=0,"",ROUND(AVERAGE(C{r}:F{r},J{r}),0))'
        ws[f'L{r}'] = f'=IF(COUNT(G{r}:I{r},J{r})=0,"",ROUND(AVERAGE(G{r}:I{r},J{r}),0))'
        ws[f'M{r}'] = (f'=IF(B{r}="","",IF(AND(COUNT(C{r}:F{r})>0,J{r}<>""),"Lengkap",'
                       f'IF(COUNT(C{r}:J{r})=0,"Kosong","Belum lengkap")))')
    peringatan(ws, list('CDEFGHIJ'), ['C', 'J'], 'M')
    lebar(ws, {'A': 5, 'B': 28, 'M': 13})
    for col in 'CDEFGHIJKL':
        ws.column_dimensions[col].width = 10
    ws.freeze_panes = f'C{BARIS1}'
    ws.sheet_properties.tabColor = HIJAU2


def peringatan(ws, masukan, wajib, kol_status):
    akhir = BARIS1 + MAKS - 1
    for col in masukan:
        rng = f'{col}{BARIS1}:{col}{akhir}'
        if col in wajib:
            ws.conditional_formatting.add(rng, FormulaRule(
                formula=[f'AND($B{BARIS1}<>"",{col}{BARIS1}="")'],
                fill=PatternFill('solid', fgColor='FF9B9B'), stopIfTrue=True))
        ws.conditional_formatting.add(rng, FormulaRule(
            formula=[f'AND({col}{BARIS1}<>"",{col}{BARIS1}<$I$4)'],
            fill=PatternFill('solid', fgColor='FFC000')))
        validasi_nilai(ws, rng)
    rng = f'{kol_status}{BARIS1}:{kol_status}{akhir}'
    for teks, bg, fg in (('Lengkap', 'D1E7DD', '0F5132'), ('Belum lengkap', 'FFF3CD', '856404'),
                         ('Kosong', 'F8D7DA', '842029')):
        ws.conditional_formatting.add(rng, FormulaRule(
            formula=[f'{kol_status}{BARIS1}="{teks}"'], fill=PatternFill('solid', fgColor=bg),
            font=Font(color=fg, bold=True)))


# ---------------------------------------------------------------- EKSKUL & CATATAN
KE = {'nama': 'B', 'eks': ['C', 'E', 'G', 'I'], 'ket': ['D', 'F', 'H', 'J'], 'prestasi': 'K',
      'sakit': 'L', 'izin': 'M', 'alpa': 'N', 'catatan': 'O', 'keputusan': 'P'}


def eks(kol, idx):
    return f'INDEX({q(EKS)}!${kol}${EKS1}:${kol}${EKS1 + MAKS - 1},{idx})'


def buat_ekskul(wb):
    ws = wb.create_sheet(EKS)
    pita_judul(ws, 'Ekstrakurikuler & Catatan Wali Kelas', 'Diisi wali kelas. Pilihan bisa dipilih dari daftar '
               'atau diketik sendiri.', 'P')
    grup = [('C5:J5', 'EKSTRAKURIKULER'), ('K5:K5', 'PRESTASI'), ('L5:N5', 'KETIDAKHADIRAN'),
            ('O5:P5', 'CATATAN WALI KELAS')]
    for rng, t in grup:
        a, b = rng.split(':')
        if a != b:
            ws.merge_cells(rng)
        isi(ws, a, t, size=8, bold=True, warna=PUTIH, latar=HIJAU, h='center', border=KOTAK)
    hdr = {'A': 'No', 'B': 'Nama Siswa', 'C': 'Kegiatan 1', 'D': 'Keterangan 1', 'E': 'Kegiatan 2',
           'F': 'Keterangan 2', 'G': 'Kegiatan 3', 'H': 'Keterangan 3', 'I': 'Kegiatan 4', 'J': 'Keterangan 4',
           'K': 'Prestasi yang pernah diraih', 'L': 'Sakit', 'M': 'Izin', 'N': 'Tanpa Ket.',
           'O': 'Catatan wali kelas', 'P': 'Keputusan'}
    for col, t in hdr.items():
        isi(ws, f'{col}6', t, size=8, bold=True, warna=PUTIH, latar=HIJAU2, h='center', bungkus=True,
            border=KOTAK)
    ws.row_dimensions[6].height = 30
    for i in range(MAKS):
        r = EKS1 + i
        isi(ws, f'A{r}', i + 1, size=9, h='center', border=KOTAK)
        isi(ws, f'B{r}', f'=IF({siswa("Nama Peserta Didik", i + 1)}="","",'
                         f'{siswa("Nama Peserta Didik", i + 1)})', size=9, border=KOTAK)
        for col in 'CDEFGHIJKLMNOP':
            isi(ws, f'{col}{r}', size=9, latar=KUNING, border=KOTAK, bungkus=col in 'O',
                h='center' if col in 'LMN' else None)
    akhir = EKS1 + MAKS - 1
    daftar = [
        ('"Pramuka,Qiraah,Olah Raga,Muhadhoroh,Kaligrafi,Hadroh,Tahfidz,Paskibra,PMR"',
         [f'{c}{EKS1}:{c}{akhir}' for c in KE['eks']]),
        ('"Aktif mengikuti kegiatan,Aktif mengikuti kegiatan dan perlu berlatih lebih giat,'
         'Aktif mengikuti kegiatan dan tingkatkan lagi untuk percaya diri,Kurang aktif mengikuti kegiatan"',
         [f'{c}{EKS1}:{c}{akhir}' for c in KE['ket']]),
        ('"-,naik kelas VIII,naik kelas IX,LULUS,belum bisa naik kelas"', [f'P{EKS1}:P{akhir}']),
    ]
    for rumus, rngs in daftar:
        dv = DataValidation(type='list', formula1=rumus, showErrorMessage=False, allow_blank=True)
        ws.add_data_validation(dv)
        for rr in rngs:
            dv.add(rr)
    lebar(ws, {'A': 5, 'B': 26, 'C': 13, 'D': 26, 'E': 13, 'F': 26, 'G': 13, 'H': 26, 'I': 13, 'J': 26,
               'K': 30, 'L': 7, 'M': 7, 'N': 8, 'O': 60, 'P': 18})
    ws.freeze_panes = f'C{EKS1}'
    ws.sheet_properties.tabColor = EMAS


# ---------------------------------------------------------------- BERANDA
def buat_beranda(wb):
    ws = wb.active
    ws.title = 'BERANDA'
    ws.sheet_view.showGridLines = False
    lebar(ws, {'A': 2, 'B': 32, 'C': 20, 'D': 9, 'E': 22, 'F': 17, 'G': 3, 'H': 26, 'I': 40})
    latar_rentang(ws, 'A1:I4', HIJAU)
    ws.row_dimensions[1].height = 10
    ws.row_dimensions[2].height = 36
    isi(ws, 'B2', 'SmartRapor', size=24, bold=True, warna=PUTIH)
    isi(ws, 'E2', 'Raport Kurikulum Merdeka · Sekolah & Pondok', size=9, warna=EMAS, h='right')
    ws.merge_cells('E2:I2')
    ws['E2'].alignment = Alignment(horizontal='right', vertical='center')
    gabung(ws, 'B3:I3', f'={SEL["sekolah"]}&"   •   Kelas "&{SEL["kelas"]}&"   •   Semester "&{SEL["semester"]}'
                        f'&"   •   "&{SEL["tahun"]}', size=10, warna='D1E7DD')
    ws.row_dimensions[4].height = 8
    latar_rentang(ws, 'A4:I4', EMAS)
    # kartu angka
    kartu = [('B', 'C', 'SISWA', f'=COUNTA(SISWA!$D${SISWA1}:$D${SISWA1 + MAKS - 1})', HIJAU),
             ('E', 'E', 'MAPEL LENGKAP', '=COUNTIF($F$12:$F$39,"LENGKAP")', '198754'),
             ('F', 'F', 'BELUM LENGKAP', '=COUNTIF($F$12:$F$39,"BELUM LENGKAP")', 'B58105'),
             ('H', 'I', 'MAPEL KOSONG', '=COUNTIF($F$12:$F$39,"KOSONG")', 'B02A37')]
    for a, b, judul, rumus, warna in kartu:
        if a != b:
            ws.merge_cells(f'{a}6:{b}6')
            ws.merge_cells(f'{a}7:{b}7')
        isi(ws, f'{a}6', judul, size=8, bold=True, warna='6C757D', h='center', latar=PUTIH)
        isi(ws, f'{a}7', rumus, size=26, bold=True, warna=warna, h='center', latar=PUTIH)
        for c in (range(ord(a), ord(b) + 1)):
            col = chr(c)
            ws[f'{col}6'].border = Border(top=Side(style='thick', color=warna), left=tipis, right=tipis)
            ws[f'{col}7'].border = Border(bottom=tipis, left=tipis, right=tipis)
            ws[f'{col}6'].fill = PatternFill('solid', fgColor=PUTIH)
            ws[f'{col}7'].fill = PatternFill('solid', fgColor=PUTIH)
    ws.row_dimensions[6].height = 22
    ws.row_dimensions[7].height = 44
    # progres per mapel
    isi(ws, 'B9', 'PROGRES NILAI PER MAPEL', size=11, bold=True, warna=HIJAU)
    isi(ws, 'B10', 'Terisi otomatis saat guru mengisi Google Sheet ini.', size=8, warna='6C757D')
    for col, t in zip('BCDEF', ['Mata Pelajaran', 'Guru', 'Terisi', 'Progres', 'Status']):
        isi(ws, f'{col}11', t, size=9, bold=True, warna=PUTIH, latar=HIJAU2, h='center')
    r = 12
    jml = 'COUNTA(SISWA!$D$%d:$D$%d)' % (SISWA1, SISWA1 + MAKS - 1)
    for tab, nama in UMUM:
        baris_progres(ws, r, tab, nama, 'Q', jml)
        r += 1
    for tab, nama, _ in PONDOK:
        baris_progres(ws, r, tab, nama, 'K', jml)
        r += 1
    rng = f'F12:F{r - 1}'
    for teks, bg, fg in (('LENGKAP', 'D1E7DD', '0F5132'), ('BELUM LENGKAP', 'FFF3CD', '856404'),
                         ('KOSONG', 'F8D7DA', '842029')):
        ws.conditional_formatting.add(rng, FormulaRule(formula=[f'F12="{teks}"'],
                                      fill=PatternFill('solid', fgColor=bg), font=Font(color=fg, bold=True)))
    # langkah cepat
    isi(ws, 'H9', 'LANGKAH MUDAH', size=11, bold=True, warna=HIJAU)
    langkah = [('1', 'Isi PENGATURAN', 'Identitas sekolah, kelas, wali kelas, tanggal.'),
               ('2', 'Isi data SISWA', 'Cukup sekali, nama muncul di semua tab.'),
               ('3', 'Bagikan link ke guru', 'Guru mengisi kotak kuning di tab mapelnya.'),
               ('4', 'Isi EKSKUL & CATATAN', 'Ekskul, prestasi, catatan, keputusan.'),
               ('5', 'Cetak', 'Buka halaman RAPOR, pilih nomor siswa, unduh PDF.')]
    r = 11
    for no, judul, ket in langkah:
        isi(ws, f'H{r}', f'{no}.  {judul}', size=10, bold=True, warna=HIJAU, latar=PUTIH)
        isi(ws, f'I{r}', ket, size=8, warna='495057', latar=PUTIH)
        ws[f'H{r}'].border = Border(left=Side(style='thick', color=EMAS), bottom=tipis)
        ws[f'I{r}'].border = Border(bottom=tipis)
        r += 1
    isi(ws, 'H18', 'Status warna:', size=9, bold=True, warna='495057')
    isi(ws, 'H19', 'LENGKAP', size=8, bold=True, warna='0F5132', latar='D1E7DD', h='center')
    isi(ws, 'I19', 'semua siswa sudah dinilai', size=8, warna='495057')
    isi(ws, 'H20', 'BELUM LENGKAP', size=8, bold=True, warna='856404', latar='FFF3CD', h='center')
    isi(ws, 'I20', 'sebagian siswa belum dinilai', size=8, warna='495057')
    isi(ws, 'H21', 'KOSONG', size=8, bold=True, warna='842029', latar='F8D7DA', h='center')
    isi(ws, 'I21', 'guru belum mengisi', size=8, warna='495057')
    kartu_cetak(ws)
    isi(ws, 'B42', 'SmartRapor © 2026', size=8, warna='ADB5BD')
    ws.sheet_properties.tabColor = HIJAU


def baris_progres(ws, r, tab, nama, kol, jml):
    terisi = f'COUNT({rentang_siswa(tab, kol)})'
    isi(ws, f'B{r}', nama.replace('*) : ', ' - '), size=9, latar=PUTIH, border=Border(bottom=tipis))
    isi(ws, f'C{r}', f'=IF({q(tab)}!$C$4="","-",{q(tab)}!$C$4)', size=8, warna='6C757D', latar=PUTIH,
        border=Border(bottom=tipis))
    isi(ws, f'D{r}', f'={terisi}&" / "&{jml}', size=9, h='center', latar=PUTIH, border=Border(bottom=tipis))
    isi(ws, f'E{r}', f'=IF({jml}=0,"",REPT("█",ROUND({terisi}/{jml}*12,0))&REPT("░",12-ROUND({terisi}/{jml}*12,0)))',
        size=9, warna=HIJAU2, latar=PUTIH, border=Border(bottom=tipis))
    isi(ws, f'F{r}', f'=IF({jml}=0,"-",IF({terisi}=0,"KOSONG",IF({terisi}>={jml},"LENGKAP","BELUM LENGKAP")))',
        size=8, bold=True, h='center', latar=PUTIH, border=Border(bottom=tipis))
    ws.row_dimensions[r].height = 19


# ---------------------------------------------------------------- halaman cetak
PILIHAN_CETAK = ['Raport saja', 'Cover + Keterangan diri + Raport', 'Cover + Keterangan diri saja']
PILIH = 'BERANDA!$J$25'   # nomor siswa yang dicetak (dari pilihan nama di BERANDA!I25)


def pemilih(ws, kol=None):
    """semua halaman cetak memakai satu pilihan siswa di BERANDA"""
    return PILIH


def kartu_cetak(ws):
    """kotak pilihan siswa untuk dicetak, di BERANDA"""
    isi(ws, 'H23', 'CETAK RAPORT', size=11, bold=True, warna=HIJAU)
    isi(ws, 'H24', 'Klik kotak kuning, lalu pilih nama siswa:', size=8, warna='495057')
    isi(ws, 'H25', 'SISWA ➜', size=9, bold=True, warna=PUTIH, latar=HIJAU, h='center')
    isi(ws, 'I25', f'=SISWA!$AB${SISWA1}', size=12, bold=True, warna=HIJAU, latar=KUNING, h='center',
        border=Border(left=tebal, right=tebal, top=tebal, bottom=tebal))
    ws.row_dimensions[25].height = 30
    # nomor siswa dari pilihan "4 - NAMA" (kolom J disembunyikan)
    isi(ws, 'J25', '=IFERROR(VALUE(LEFT(I25,FIND(" ",I25)-1)),1)', size=8, warna=PUTIH)
    ws.column_dimensions['J'].hidden = True
    isi(ws, 'H26', 'Urutan', size=8, warna='6C757D', h='right')
    isi(ws, 'I26', f'="Siswa ke-"&J25&" dari "&COUNTA(SISWA!$D${SISWA1}:$D${SISWA1 + MAKS - 1})', size=9,
        bold=True, warna=HIJAU)
    # baris 28 dan 30: tempat tombol (dipasang Apps Script: menu SmartRapor › Pasang tombol)
    isi(ws, 'H27', 'Pindah siswa', size=8, bold=True, warna='6C757D')
    ws.row_dimensions[28].height = 34
    isi(ws, 'H29', 'Yang dicetak  ➜', size=8, bold=True, warna='6C757D', h='right')
    isi(ws, 'I29', 'Raport saja', size=9, bold=True, warna=HIJAU, latar=KUNING,
        border=Border(left=tipis, right=tipis, top=tipis, bottom=tipis))
    dv2 = DataValidation(type='list', formula1=f'"{",".join(PILIHAN_CETAK)}"', showErrorMessage=True,
                         error='Pilih dari daftar.')
    ws.add_data_validation(dv2)
    dv2.add('I29')
    ws.row_dimensions[30].height = 40
    isi(ws, 'H32', 'Tanpa tombol: buka halaman COVER / KETERANGAN DIRI / RAPOR SEKOLAH,', size=7,
        warna='ADB5BD')
    isi(ws, 'H33', 'lalu File › Cetak.', size=7, warna='ADB5BD')
    dv = DataValidation(type='list', formula1=f'SISWA!$AB${SISWA1}:$AB${SISWA1 + MAKS - 1}',
                        showErrorMessage=True, error='Pilih nama dari daftar.')
    ws.add_data_validation(dv)
    dv.add('I25')


def siapkan_cetak(ws, area, lanskap=False, satu_halaman=False):
    ws.print_area = area
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.orientation = 'landscape' if lanskap else 'portrait'
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 1 if satu_halaman else 0
    ws.page_margins.left = ws.page_margins.right = 0.5
    ws.page_margins.top = ws.page_margins.bottom = 0.5
    ws.print_options.horizontalCentered = True
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.tabColor = '6F42C1'


def tulis(ws, ref, nilai, size=11, bold=False, h=None, bungkus=False, italic=False, underline=None,
          font=CETAK, v='center'):
    return isi(ws, ref, nilai, font=font, size=size, bold=bold, h=h, bungkus=bungkus, italic=italic,
               underline=underline, warna='000000', v=v)


def buat_rapor_sekolah(wb):
    ws = wb.create_sheet('RAPOR SEKOLAH')
    idx = pemilih(ws)
    lebar(ws, {'A': 5.5, 'B': 15, 'C': 13, 'D': 8, 'E': 36, 'F': 14, 'G': 18, 'H': 3, 'I': 3})
    gabung(ws, 'A1:G1', 'PENCAPAIAN PEMBELAJARAN PESERTA DIDIK', font=CETAK, size=12, bold=True, h='center',
           warna='000000')
    nama = siswa('Nama Peserta Didik', idx)
    kiri = [(3, 'Nama Sekolah', f'": "&{SEL["sekolah"]}', False), (4, 'Alamat', f'": "&{SEL["alamat"]}', False),
            (6, 'Nama', f'": "&{nama}', True),
            (7, 'NISN / NIS', f'": "&{siswa("NISN", idx)}&" / "&{siswa("NIS", idx)}', True)]
    for r, lbl, rumus, tebal_ in kiri:
        tulis(ws, f'A{r}', lbl, size=10)
        ws.merge_cells(f'A{r}:B{r}')
        rng = f'C{r}:E{r + 1}' if r == 4 else f'C{r}:E{r}'
        ws.merge_cells(rng)
        tulis(ws, f'C{r}', '=' + rumus, size=10, bold=tebal_, bungkus=True, v='top' if r == 4 else 'center')
    kanan = [(3, 'Kelas', SEL['kelas']), (4, 'Semester', SEL['semester']), (5, 'Tahun Pelajaran', SEL['tahun'])]
    for r, lbl, ref in kanan:
        tulis(ws, f'F{r}', lbl, size=10)
        tulis(ws, f'G{r}', f'=": "&{ref}', size=10)
    ws.row_dimensions[8].height = 6
    # tabel nilai
    def kepala_tabel(r):
        for rng, t in (('A{0}:A{0}', 'No'), ('B{0}:C{0}', 'Mata Pelajaran'), ('D{0}:D{0}', 'Nilai'),
                       ('E{0}:G{0}', 'Capaian Pembelajaran')):
            rr = rng.format(r)
            if rr.split(':')[0] != rr.split(':')[1]:
                ws.merge_cells(rr)
            isi(ws, rr.split(':')[0], t, font='Arial', size=10, bold=True, h='center', warna='000000',
                latar='E7E6E6')
            kotak_rentang(ws, rr)
        ws.row_dimensions[r].height = 24
    kepala_tabel(9)
    r = 10
    for no, (tab, _) in enumerate(UMUM, 1):
        nilai = f'INDEX({rentang_siswa(tab, "Q")},{idx})'
        ws.merge_cells(f'A{r}:A{r + 1}')
        ws.merge_cells(f'B{r}:C{r + 1}')
        ws.merge_cells(f'D{r}:D{r + 1}')
        ws.merge_cells(f'E{r}:G{r}')
        ws.merge_cells(f'E{r + 1}:G{r + 1}')
        tulis(ws, f'A{r}', no, size=10, h='center')
        tulis(ws, f'B{r}', f'={MAPEL_SEL[tab]["nama"]}', size=10, bungkus=True)
        tulis(ws, f'D{r}', f'=IF({nilai}="","-",{nilai})', size=10, h='center')
        for k, kol in ((0, 'S'), (1, 'T')):
            desk = f'INDEX({rentang_siswa(tab, kol)},{idx})'
            tulis(ws, f'E{r + k}', f'=IF({nilai}="","-",{desk})', size=10, bungkus=True, v='top')
        kotak_rentang(ws, f'A{r}:G{r + 1}')
        # sel gabungan tidak menyesuaikan tinggi sendiri: beri ruang cukup
        ws.row_dimensions[r].height = 66
        ws.row_dimensions[r + 1].height = 30
        r += 2
        if no == 4:
            ws.row_breaks.append(Break(id=r - 1))
        if no in (4, 10):
            pass
    tulis(ws, f'G{r}', '*) Pilihan', size=9, italic=True, h='right')
    r += 1
    tulis(ws, f'A{r}', 'EKSTRAKURIKULER', size=10, bold=True)
    r += 1
    for rng, t in (('A{0}:A{0}', 'No'), ('B{0}:C{0}', 'Kegiatan Ekstrakurikuler'), ('D{0}:G{0}', 'Keterangan')):
        rr = rng.format(r)
        if rr.split(':')[0] != rr.split(':')[1]:
            ws.merge_cells(rr)
        tulis(ws, rr.split(':')[0], t, size=10, bold=True, h='center', bungkus=True)
        kotak_rentang(ws, rr)
        ws[rr.split(':')[0]].fill = PatternFill('solid', fgColor='E7E6E6')
    r += 1
    for k in range(4):
        ws.merge_cells(f'B{r}:C{r}')
        ws.merge_cells(f'D{r}:G{r}')
        keg = eks(KE['eks'][k], idx)
        tulis(ws, f'A{r}', f'=IF({keg}="","",{k + 1})', size=10, h='center')
        tulis(ws, f'B{r}', f'=IF({keg}="","",{keg})', size=10)
        tulis(ws, f'D{r}', f'=IF({eks(KE["ket"][k], idx)}="","",{eks(KE["ket"][k], idx)})', size=10, bungkus=True)
        kotak_rentang(ws, f'A{r}:G{r}')
        ws.row_dimensions[r].height = 20
        r += 1
    ws.merge_cells(f'A{r}:C{r}')
    ws.merge_cells(f'D{r}:G{r}')
    tulis(ws, f'A{r}', 'Prestasi yang Pernah Diraih', size=10, h='center')
    tulis(ws, f'D{r}', f'=IF({eks(KE["prestasi"], idx)}="","-",{eks(KE["prestasi"], idx)})', size=10, bungkus=True)
    kotak_rentang(ws, f'A{r}:G{r}')
    ws.row_dimensions[r].height = 22
    r += 1
    ws.merge_cells(f'A{r}:G{r}')
    kalimat = (f'IF(OR({eks(KE["keputusan"], idx)}="",{eks(KE["keputusan"], idx)}="-"),"",'
               f'" "&SUBSTITUTE({SEL["keputusan"]},"{{keputusan}}",{eks(KE["keputusan"], idx)}))')
    tulis(ws, f'A{r}', f'="Catatan Wali Kelas : "&{eks(KE["catatan"], idx)}&{kalimat}', size=10, italic=True,
          bungkus=True, v='top')
    kotak_rentang(ws, f'A{r}:G{r}')
    ws.row_dimensions[r].height = 62
    r += 2
    ws.merge_cells(f'F{r}:G{r}')
    tulis(ws, f'F{r}', f'={SEL["tempat"]}&", "&{SEL["tanggal"]}', size=10)
    r += 1
    ws.merge_cells(f'A{r}:B{r}')
    ws.merge_cells(f'C{r}:E{r}')
    ws.merge_cells(f'F{r}:G{r}')
    tulis(ws, f'A{r}', 'Orang Tua/Wali,', size=10, h='center')
    tulis(ws, f'C{r}', 'Wali Kelas,', size=10, h='center')
    tulis(ws, f'F{r}', 'Kepala Sekolah', size=10)
    r += 4
    ws.merge_cells(f'A{r}:B{r}')
    ws.merge_cells(f'C{r}:E{r}')
    ws.merge_cells(f'F{r}:G{r}')
    ortu = f'IF({siswa("Nama Wali", idx)}<>"",{siswa("Nama Wali", idx)},{siswa("Nama Ayah", idx)})'
    tulis(ws, f'A{r}', f'={ortu}', size=10, bold=True, underline='single', h='center')
    tulis(ws, f'C{r}', f'={SEL["wali"]}', size=10, bold=True, underline='single', h='center')
    tulis(ws, f'F{r}', f'={SEL["kepsek"]}', size=10, bold=True, underline='single')
    r += 1
    ws.merge_cells(f'C{r}:E{r}')
    ws.merge_cells(f'F{r}:G{r}')
    tulis(ws, f'C{r}', f'=IF({SEL["nip_wali"]}="","","NIP. "&{SEL["nip_wali"]})', size=9, h='center')
    tulis(ws, f'F{r}', f'=IF({SEL["nip_kepsek"]}="","","NIP. "&{SEL["nip_kepsek"]})', size=9)
    siapkan_cetak(ws, f'A1:G{r}')


def buat_cover(wb):
    ws = wb.create_sheet('COVER')
    idx = pemilih(ws, 'J')
    lebar(ws, {'A': 4, 'B': 10, 'C': 14, 'D': 14, 'E': 14, 'F': 14, 'G': 10, 'H': 4})
    for r in range(1, 46):
        ws.row_dimensions[r].height = 16.5
    putus = Side(style='dashDot', color='000000')
    for r in range(2, 45):
        ws[f'A{r}'].border = Border(left=putus)
        ws[f'H{r}'].border = Border(right=putus)
    for c in 'ABCDEFGH':
        ws[f'{c}2'].border = Border(top=putus, left=putus if c == 'A' else None, right=putus if c == 'H' else None)
        ws[f'{c}44'].border = Border(bottom=putus, left=putus if c == 'A' else None,
                                    right=putus if c == 'H' else None)
    for r, rumus in ((7, '"Rapor"'), (8, SEL['judul1']), (9, SEL['judul2'])):
        gabung(ws, f'B{r}:G{r}', '=' + rumus, font='Arial', size=16, bold=True, h='center', warna='000000')
    logo = os.path.join(DI_SINI, 'aset', 'logo_sekolah.jpg')
    if os.path.exists(logo):
        g = Gambar(logo)
        g.width, g.height = 190, 190
        ws.add_image(g, 'D12')
    gabung(ws, 'B25:G25', 'Nama Peserta Didik', font='Arial', size=14, bold=True, h='center', warna='000000')
    gabung(ws, 'B26:G27', f'={siswa("Nama Peserta Didik", idx)}', font='Arial', size=15, bold=True, h='center',
           warna='000000')
    biru = Side(style='medium', color='2F5597')
    kotak_rentang(ws, 'B26:G27', Border(left=biru, right=biru, top=biru, bottom=biru))
    gabung(ws, 'B30:G30', 'Nomor Induk Sekolah Nasional  /  Nomor Induk Sekolah', font='Arial', size=10,
           bold=True, h='center', warna='000000')
    gabung(ws, 'B31:G32', f'={siswa("NISN", idx)}&"  /  "&{siswa("NIS", idx)}', font='Arial', size=15,
           bold=True, h='center', warna='000000')
    kotak_rentang(ws, 'B31:G32', Border(left=biru, right=biru, top=biru, bottom=biru))
    gabung(ws, 'B39:G41', f'={SEL["kementerian"]}', font='Arial', size=13, bold=True, h='center',
           warna='000000', bungkus=True)
    siapkan_cetak(ws, 'A1:H45', satu_halaman=True)


def buat_identitas(wb):
    ws = wb.create_sheet('IDENTITAS SEKOLAH')
    lebar(ws, {'A': 4, 'B': 4, 'C': 22, 'D': 3, 'E': 50, 'F': 4})
    putus = Side(style='dashDot', color='000000')
    for r in range(2, 45):
        ws[f'A{r}'].border = Border(left=putus)
        ws[f'F{r}'].border = Border(right=putus)
    for c in 'ABCDEF':
        ws[f'{c}2'].border = Border(top=putus, left=putus if c == 'A' else None, right=putus if c == 'F' else None)
        ws[f'{c}44'].border = Border(bottom=putus, left=putus if c == 'A' else None,
                                    right=putus if c == 'F' else None)
    for r, rumus in ((7, '"Identitas"'), (8, SEL['judul1']), (9, SEL['judul2'])):
        gabung(ws, f'B{r}:E{r}', '=' + rumus, font='Arial', size=16, bold=True, h='center', warna='000000')
    baris = [('Nama Sekolah', 'sekolah'), ('NPSN', 'npsn'), ('Alamat Sekolah', 'alamat'), ('Kode Pos', 'kodepos'),
             ('Desa / Kelurahan', 'kelurahan'), ('Kecamatan', 'kecamatan'), ('Kabupaten / Kota', 'kabupaten'),
             ('Provinsi', 'provinsi'), ('Telpon', 'telepon'), ('E-mail', 'email'), ('Website', 'website')]
    r = 13
    for lbl, k in baris:
        tulis(ws, f'C{r}', lbl, size=11, bold=True, font='Arial')
        tulis(ws, f'D{r}', ':', size=11, bold=True, font='Arial', h='center')
        tulis(ws, f'E{r}', f'={SEL[k]}', size=11, bold=True, font='Arial', bungkus=True, v='top')
        ws.row_dimensions[r].height = 30 if k == 'alamat' else 20
        r += 1
    siapkan_cetak(ws, 'A1:F45', satu_halaman=True)


def buat_keterangan_diri(wb):
    ws = wb.create_sheet('KETERANGAN DIRI')
    idx = pemilih(ws, 'J')
    lebar(ws, {'A': 5, 'B': 30, 'C': 3, 'D': 40, 'E': 8, 'F': 18, 'G': 4})
    gabung(ws, 'A1:F1', 'KETERANGAN TENTANG DIRI PESERTA DIDIK', font='Arial', size=13, bold=True, h='center',
           warna='000000')
    item = [('1.', 'Nama Peserta Didik (Lengkap)', siswa('Nama Peserta Didik', idx)),
            ('2.', 'Nomor Induk Siswa Nasional / NIS', f'{siswa("NISN", idx)}&"  /  "&{siswa("NIS", idx)}'),
            ('3.', 'Tempat/Tanggal Lahir', f'{siswa("Tempat Lahir", idx)}&", "&{siswa("Tanggal Lahir", idx)}'),
            ('4.', 'Jenis Kelamin', f'IF({siswa("L/P", idx)}="L","Laki-laki",IF({siswa("L/P", idx)}="P",'
                                    f'"Perempuan",""))'),
            ('5.', 'Agama', siswa('Agama', idx)), ('6.', 'Status dalam Keluarga', siswa('Status dalam Keluarga', idx)),
            ('7.', 'Anak ke ...', siswa('Anak ke-', idx)), ('8.', 'Alamat Peserta Didik', siswa('Alamat Peserta Didik', idx)),
            ('9.', 'Nomor Telepon Rumah', siswa('No. Telepon', idx)), ('10.', 'Sekolah Asal', siswa('Sekolah Asal', idx)),
            ('11.', 'Diterima di Sekolah ini', None), ('', 'Di Kelas', siswa('Diterima di Kelas', idx)),
            ('', 'Pada Tanggal', siswa('Diterima Tanggal', idx)), ('12.', 'Nama Orang Tua', None),
            ('', 'a. Ayah', siswa('Nama Ayah', idx)), ('', 'b. Ibu', siswa('Nama Ibu', idx)),
            ('13.', 'Alamat Orang Tua', siswa('Alamat Orang Tua', idx)),
            ('', 'Nomor Telepon Rumah', siswa('Telepon Orang Tua', idx)), ('14.', 'Pekerjaan Orang Tua', None),
            ('', 'a. Ayah', siswa('Pekerjaan Ayah', idx)), ('', 'b. Ibu', siswa('Pekerjaan Ibu', idx)),
            ('15.', 'Nama Wali Peserta Didik', siswa('Nama Wali', idx)),
            ('16.', 'Alamat Wali Peserta Didik', siswa('Alamat Wali', idx)),
            ('', 'Nomor Telepon Rumah', siswa('Telepon Wali', idx)),
            ('17.', 'Pekerjaan Wali Peserta Didik', siswa('Pekerjaan Wali', idx))]
    r = 4
    garis_bawah = Border(bottom=Side(style='hair', color='000000'))
    for no, lbl, rumus in item:
        tulis(ws, f'A{r}', no, size=11, font='Calibri', h='right')
        tulis(ws, f'B{r}', lbl, size=11, font='Calibri')
        if rumus:
            tulis(ws, f'C{r}', ':', size=11, font='Calibri', h='center')
            c = tulis(ws, f'D{r}', f'=IF(({rumus})="","-",{rumus})', size=11, bold=True, font='Calibri',
                      bungkus=True)
            c.border = garis_bawah
        ws.row_dimensions[r].height = 21
        r += 1
    r += 1
    kotak_rentang(ws, f'B{r}:B{r + 6}', Border())
    gabung(ws, f'B{r}:B{r + 6}', 'Pas Foto\n3 x 4', font='Calibri', size=10, h='center', warna='6C757D',
           bungkus=True)
    kotak_rentang(ws, f'B{r}:B{r + 6}')
    ws.merge_cells(f'D{r}:F{r}')
    tulis(ws, f'D{r}', f'={SEL["tempat"]}&", "&{SEL["tanggal"]}', size=11, font='Calibri')
    ws.merge_cells(f'D{r + 1}:F{r + 1}')
    tulis(ws, f'D{r + 1}', 'Kepala Sekolah', size=11, font='Calibri')
    ws.merge_cells(f'D{r + 5}:F{r + 5}')
    tulis(ws, f'D{r + 5}', f'={SEL["kepsek"]}', size=11, bold=True, underline='single', font='Calibri')
    ws.merge_cells(f'D{r + 6}:F{r + 6}')
    tulis(ws, f'D{r + 6}', f'=IF({SEL["nip_kepsek"]}="","","NIP. "&{SEL["nip_kepsek"]})', size=10, font='Calibri')
    siapkan_cetak(ws, f'A1:F{r + 7}')


# ---------------------------------------------------------------- data contoh
NAMA_CONTOH = ['AHMAD FAUZAN HAKIM', 'BAGAS SATRIA NUGRAHA', 'DAFFA RIZKY RAMADHAN', 'FARHAN ALFARIZI',
               'HAIKAL MUHAMMAD ZIKRI', 'IRFAN MAULANA YUSUF', 'KHALID ABDURRAHMAN', 'MUHAMMAD NAUFAL ARKAN',
               'RAFI ARDIANSYAH', 'ZAKI ABDILLAH']
TP_CONTOH = {
    'PAI': ['menjelaskan kandungan Q.S. Al-Baqarah ayat 30 tentang khalifah di bumi',
            'menjelaskan makna iman kepada qada dan qadar', 'mendeskripsikan pengertian seni islami',
            'menjelaskan pengertian mazhab dalam fikih'],
    'PKN': ['mengidentifikasi tantangan dalam menjaga harmoni dan solidaritas global',
            'menjelaskan tenggang rasa, toleransi, dan kolaborasi di tengah masyarakat',
            'menjelaskan komitmen kebangsaan dalam kebinekaan global'],
    'B. INDO': ['membaca dan memahami teks eksplanasi', 'menulis teks tanggapan', 'memahami petikan novel'],
    'MTK': ['memahami transformasi geometri (translasi, refleksi, rotasi)',
            'menyelesaikan masalah peluang dan pemilihan sampel', 'menghitung luas permukaan bangun ruang'],
    'IPA': ['mendeskripsikan muatan listrik dan gejala listrik statis', 'mendeskripsikan ciri-ciri reaksi kimia',
            'membandingkan kromosom, DNA, dan gen'],
    'IPS': ['menjelaskan upaya pembangunan dan dampaknya', 'menganalisis potensi Indonesia menjadi negara maju',
            'mendeskripsikan kerja sama internasional'],
    'B. INGGRIS': ['describing materials and functions of things', 'asking and giving information on online safety',
                   'writing a procedural text'],
    'SENI BUDAYA': ['mendokumentasikan proses berkarya melalui jurnal visual', 'memberikan ulasan terhadap lukisan'],
    'PJOK': ['mempraktikkan variasi gerak dalam aktivitas berirama', 'menganalisis latihan kebugaran jasmani'],
    'INFORMATIKA': ['memahami perintah dalam pemrograman Scratch', 'menjaga keamanan data diri dari kejahatan digital'],
}


def isi_contoh(wb):
    rnd = random.Random(7)
    ws = wb['SISWA']
    kota = ['Tanjung Selor', 'Tarakan', 'Berau', 'Bulungan', 'Samarinda']
    for i, nm in enumerate(NAMA_CONTOH):
        r = SISWA1 + i
        data = {'NIS': str(226001 + i), 'NISN': f'00{rnd.randint(80000000, 99999999)}', 'Nama Peserta Didik': nm,
                'L/P': 'L', 'Tempat Lahir': rnd.choice(kota),
                'Tanggal Lahir': f'{rnd.randint(1, 28):02d}/{rnd.randint(1, 12):02d}/2011', 'Agama': 'Islam',
                'Status dalam Keluarga': 'Anak Kandung', 'Anak ke-': rnd.randint(1, 4),
                'Alamat Peserta Didik': f'Jl. Contoh No. {rnd.randint(1, 99)}', 'No. Telepon': '08xx-xxxx-xxxx',
                'Sekolah Asal': 'SD Contoh Tanjung Selor', 'Diterima di Kelas': 'VII', 'Diterima Tanggal': '15/07/2023',
                'Nama Ayah': 'Bapak ' + nm.split()[0].title(), 'Nama Ibu': 'Ibu ' + nm.split()[-1].title(),
                'Alamat Orang Tua': f'Jl. Contoh No. {rnd.randint(1, 99)}', 'Telepon Orang Tua': '08xx-xxxx-xxxx',
                'Pekerjaan Ayah': rnd.choice(['Wiraswasta', 'PNS', 'Petani', 'Pedagang']),
                'Pekerjaan Ibu': rnd.choice(['Ibu Rumah Tangga', 'Guru', 'Wiraswasta'])}
        for k, v in data.items():
            ws[f'{KS[k]}{r}'] = v
    for tab, tps in TP_CONTOH.items():
        w = wb[tab]
        w['C4'] = 'Guru ' + tab.title()
        for j, tp in enumerate(tps):
            w[f'{gl(3 + j)}8'] = tp
        for i in range(len(NAMA_CONTOH)):
            if tab == 'MTK' and i == 3:
                continue                                   # contoh siswa belum dinilai
            r = BARIS1 + i
            for j in range(len(tps)):
                w[f'{gl(3 + j)}{r}'] = rnd.randint(64, 96)
            w[f'N{r}'] = rnd.randint(68, 95)
    for tab in ('HADIST', 'FIQIH', 'NAHWU', 'TASRIF'):
        w = wb[tab]
        w['C4'] = 'Ustadz Contoh'
        for i in range(len(NAMA_CONTOH)):
            r = BARIS1 + i
            for col in 'CDEFGHIJ':
                if tab == 'TASRIF' and col in 'GHI':
                    continue
                w[f'{col}{r}'] = rnd.randint(70, 95)
    e = wb[EKS]
    for i in range(len(NAMA_CONTOH)):
        r = EKS1 + i
        e[f'C{r}'], e[f'D{r}'] = 'Pramuka', 'Aktif mengikuti kegiatan'
        e[f'E{r}'], e[f'F{r}'] = 'Qiraah', 'Aktif mengikuti kegiatan dan perlu berlatih lebih giat'
        if i % 2 == 0:
            e[f'G{r}'], e[f'H{r}'] = 'Muhadhoroh', 'Aktif mengikuti kegiatan dan tingkatkan lagi untuk percaya diri'
        e[f'K{r}'] = 'Juara 2 MTQ tingkat kecamatan' if i == 0 else ''
        e[f'L{r}'], e[f'M{r}'], e[f'N{r}'] = rnd.randint(0, 3), rnd.randint(0, 2), 0
        e[f'O{r}'] = ('Selamat atas prestasi baik yang ananda raih di semester ini. Pertahankan semangat belajar '
                      'dan terus menjadi pribadi yang lebih baik.')
        e[f'P{r}'] = 'naik kelas IX' if i != 9 else 'LULUS'


# ---------------------------------------------------------------- utama
def buat(tujuan, contoh=False):
    wb = Workbook()
    buat_pengaturan(wb)                 # dibuat lebih dulu: alamat sel dipakai halaman lain
    buat_beranda(wb)                    # wb.active (lembar pertama)
    buat_siswa(wb)
    for tab, nama in UMUM:
        buat_mapel_umum(wb, tab, nama)
    for tab, nama, arab in PONDOK:
        buat_mapel_pondok(wb, tab, nama, arab)
    buat_ekskul(wb)
    buat_cover(wb)
    buat_identitas(wb)
    buat_keterangan_diri(wb)
    buat_rapor_sekolah(wb)
    # urutan lembar: BERANDA, PENGATURAN, SISWA, ...
    wb.move_sheet('BERANDA', offset=-wb.index(wb['BERANDA']))
    if contoh:
        isi_contoh(wb)
    wb.active = 0
    wb.save(tujuan)
    return tujuan


if __name__ == '__main__':
    arg = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = arg[0] if arg else os.path.join(DI_SINI, 'SmartRapor.xlsx')
    print('Dibuat:', buat(out, '--contoh' in sys.argv))
