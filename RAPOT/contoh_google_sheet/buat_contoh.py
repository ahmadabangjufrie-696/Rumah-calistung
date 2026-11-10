"""Membuat file contoh Google Sheet nilai satu kelas: CONTOH_NILAI_KELAS.xlsx

File ini diunggah TU ke Google Drive sekolah, dibuka dengan Google Sheets,
lalu disalin untuk setiap kelas. Susunan kolomnya sama dengan yang dibaca
tombol AMBIL NILAI di raport (kolom A nomor, B nama, nilai mulai kolom C).

Jalankan: python buat_contoh.py
"""
import os
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter as gl

MAKS = 40            # siswa per kelas
BARIS1 = 8           # baris siswa ke-1 di tab mapel
FONT = 'Arial'

# nama tab -> nama mapel (urutan sama dengan sheet PENGATURAN di raport)
UMUM = [
    ('PAI', 'Pendidikan Agama Islam'), ('PKN', 'Pendidikan Pancasila'),
    ('B. INDO', 'Bahasa Indonesia'), ('MTK', 'Matematika'),
    ('IPA', 'Ilmu Pengetahuan Alam'), ('IPS', 'Ilmu Pengetahuan Sosial'),
    ('B. INGGRIS', 'Bahasa Inggris'), ('SENI BUDAYA', 'Seni Budaya'),
    ('PJOK', 'Pendidikan Jasmani, Olahraga dan Kesehatan'), ('INFORMATIKA', 'Informatika'),
    ('PRAKARYA', 'Prakarya'), ('MULOK', 'Muatan Lokal'),
]
PONDOK = [
    ('HADIST', "Qur'an Hadist"), ('BAHASA ARAB', 'Bahasa Arab'), ('FIQIH', 'Fiqih'),
    ('TAUHID', 'Tauhid'), ('NAHWU', 'Nahwu'), ('SHOROF', 'Shorof'), ('TAFSIR', 'Tafsir'),
    ('TARIKH', 'Tarikh'), ('TASRIF', 'Tasrif'), ('TAJWID', 'Tajwid'),
    ('S. ALKHAIRAAT', 'Sejarah Al Khairaat'), ('MUHADATSAH', "Insya' / Muhadatsah"),
    ('AL ANGHAAM', 'Al Anghaam'), ('MAHFUZATH', 'Mahfuzat'), ('MUFRADAT', 'Mufradat'),
    ('IMLA', 'Imla'),
]
CONTOH_SISWA = [
    'AHMAD FAUZI', 'BUDI SANTOSO', 'CITRA LESTARI', 'DIMAS PRATAMA', 'FATIMAH AZ ZAHRA',
    'HASAN BASRI', 'INDAH PERMATASARI', 'MUHAMMAD RIZKI', 'NUR AISYAH', 'YUSUF MAULANA',
]

HIJAU_TUA, HIJAU_MUDA = '0B6E4F', 'E8F5EE'
KUNING, ABU = 'FFF4CC', 'F2F2F2'
tipis = Side(style='thin', color='BFBFBF')
KOTAK = Border(left=tipis, right=tipis, top=tipis, bottom=tipis)


def isi(ws, ref, nilai=None, bold=False, size=10, warna='000000', latar=None,
        tengah=False, bungkus=False):
    c = ws[ref]
    if nilai is not None:
        c.value = nilai
    c.font = Font(name=FONT, bold=bold, size=size, color=warna)
    if latar:
        c.fill = PatternFill('solid', fgColor=latar)
    c.alignment = Alignment(horizontal='center' if tengah else None,
                            vertical='center', wrap_text=bungkus)
    return c


def judul(ws, teks, sub, sampai):
    ws.merge_cells(f'A1:{sampai}1')
    isi(ws, 'A1', teks, bold=True, size=16, warna='FFFFFF', latar=HIJAU_TUA)
    ws.row_dimensions[1].height = 34
    ws.merge_cells(f'A2:{sampai}2')
    isi(ws, 'A2', sub, size=10, warna='FFFFFF', latar=HIJAU_TUA)
    ws.sheet_view.showGridLines = False


def kepala(ws, baris, kolom_judul):
    for col, teks in kolom_judul.items():
        c = isi(ws, f'{col}{baris}', teks, bold=True, size=9, warna='FFFFFF',
                latar=HIJAU_TUA, tengah=True, bungkus=True)
        c.border = KOTAK
    ws.row_dimensions[baris].height = 42


def validasi_nilai(ws, rentang):
    dv = DataValidation(type='decimal', operator='between', formula1='0', formula2='100',
                        showErrorMessage=True, errorTitle='Nilai salah',
                        error='Isi dengan angka 0 sampai 100.')
    ws.add_data_validation(dv)
    dv.add(rentang)


def tab_mapel(wb, tab, nama, jenis):
    ws = wb.create_sheet(tab)
    akhir = BARIS1 + MAKS - 1
    if jenis == 'UMUM':
        sampai = 'R'
        judul(ws, nama.upper(), 'Mapel umum  |  Isi hanya kotak KUNING  |  Nilai 0 - 100', sampai)
        kol = {'A': 'No', 'B': 'Nama Siswa'}
        kol.update({gl(3 + i): f'Sumatif {i + 1}' for i in range(8)})
        kol.update({'K': 'Rata-rata Sumatif', 'L': '', 'M': 'Non Tes', 'N': 'Tes',
                    'O': 'Rata-rata Akhir Semester', 'P': '', 'Q': 'NILAI RAPOR', 'R': 'Status'})
        masukan = [gl(3 + i) for i in range(8)] + ['M', 'N']
        wajib = ['C', 'N']
    else:
        sampai = 'M'
        judul(ws, nama.upper(), 'Mapel pondok  |  Isi hanya kotak KUNING  |  Nilai 0 - 100', sampai)
        kol = {'A': 'No', 'B': 'Nama Santri', 'C': 'Tugas 1', 'D': 'Tugas 2', 'E': 'Tugas 3',
               'F': 'Tugas 4', 'G': 'Lisan 1', 'H': 'Lisan 2', 'I': 'Lisan 3', 'J': 'Semester',
               'K': 'Nilai Raport Teori', 'L': 'Nilai Raport Praktik', 'M': 'Status'}
        masukan = list('CDEFGHIJ')
        wajib = ['C', 'J']

    # baris 3-5: nama guru, KKTP, cara mengisi
    isi(ws, 'A3', 'Nama Guru', bold=True)
    ws.merge_cells('C3:F3')
    for c in 'CDEF':
        ws[f'{c}3'].fill = PatternFill('solid', fgColor=KUNING)
        ws[f'{c}3'].border = KOTAK
    isi(ws, 'A4', 'KKTP', bold=True)
    isi(ws, 'C4', 70, bold=True, latar=KUNING, tengah=True).border = KOTAK
    ws.merge_cells(f'A5:{sampai}5')
    isi(ws, 'A5', 'Kotak MERAH = nilai wajib belum diisi.   Kotak ORANYE = nilai di bawah KKTP.   '
                  'Nilai tersimpan otomatis, tidak perlu menekan tombol apa pun.',
        size=9, warna='595959', bungkus=True)
    ws.row_dimensions[5].height = 26
    kepala(ws, BARIS1 - 1, kol)

    for i in range(MAKS):
        r = BARIS1 + i
        ws[f'A{r}'] = i + 1
        ws[f'B{r}'] = f'=IF(SISWA!B{4 + i}="","",SISWA!B{4 + i})'
        for col in kol:
            c = ws[f'{col}{r}']
            c.border = KOTAK
            c.font = Font(name=FONT, size=10, bold=(col == 'Q') if jenis == 'UMUM' else col in ('K', 'L'))
            c.alignment = Alignment(horizontal='left' if col == 'B' else 'center', vertical='center')
            if col in masukan:
                c.fill = PatternFill('solid', fgColor=KUNING)
            elif col not in ('A', 'B'):
                c.fill = PatternFill('solid', fgColor=ABU)
        if jenis == 'UMUM':
            ws[f'K{r}'] = f'=IF(COUNT(C{r}:J{r})=0,"",ROUND(AVERAGE(C{r}:J{r}),1))'
            ws[f'O{r}'] = f'=IF(COUNT(M{r}:N{r})=0,"",ROUND(AVERAGE(M{r}:N{r}),1))'
            ws[f'Q{r}'] = f'=IF(COUNT(K{r},O{r})=0,"",ROUND(AVERAGE(K{r},O{r}),0))'
            ws[f'R{r}'] = (f'=IF(B{r}="","",IF(AND(COUNT(C{r}:J{r})>0,COUNT(M{r}:N{r})>0),'
                           f'"Lengkap","Belum lengkap"))')
        else:
            ws[f'K{r}'] = f'=IF(COUNT(C{r}:F{r},J{r})=0,"",ROUND(AVERAGE(C{r}:F{r},J{r}),0))'
            ws[f'L{r}'] = f'=IF(COUNT(G{r}:I{r},J{r})=0,"",ROUND(AVERAGE(G{r}:I{r},J{r}),0))'
            ws[f'M{r}'] = (f'=IF(B{r}="","",IF(AND(COUNT(C{r}:F{r})>0,J{r}<>""),'
                           f'"Lengkap","Belum lengkap"))')

    # warna peringatan
    for col in masukan:
        rng = f'{col}{BARIS1}:{col}{akhir}'
        if col in wajib:
            ws.conditional_formatting.add(rng, FormulaRule(
                formula=[f'AND($B{BARIS1}<>"",{col}{BARIS1}="")'],
                fill=PatternFill('solid', fgColor='FF9B9B'), stopIfTrue=True))
        ws.conditional_formatting.add(rng, FormulaRule(
            formula=[f'AND({col}{BARIS1}<>"",{col}{BARIS1}<$C$4)'],
            fill=PatternFill('solid', fgColor='FFC000')))
        validasi_nilai(ws, rng)
    st = 'R' if jenis == 'UMUM' else 'M'
    rng = f'{st}{BARIS1}:{st}{akhir}'
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'{st}{BARIS1}="Lengkap"'],
                                  fill=PatternFill('solid', fgColor='C6EFCE'),
                                  font=Font(color='006100', bold=True)))
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'{st}{BARIS1}="Belum lengkap"'],
                                  fill=PatternFill('solid', fgColor='FFC7CE'),
                                  font=Font(color='9C0006')))

    ws.column_dimensions['A'].width = 5
    ws.column_dimensions['B'].width = 30
    for col in kol:
        if col not in 'AB':
            ws.column_dimensions[col].width = 10
    if jenis == 'UMUM':
        ws.column_dimensions['L'].width = 2
        ws.column_dimensions['P'].width = 2
        ws.column_dimensions['R'].width = 14
    else:
        ws.column_dimensions['M'].width = 14
    ws.freeze_panes = f'C{BARIS1}'
    ws.sheet_properties.tabColor = '2E75B6' if jenis == 'UMUM' else '0B6E4F'


def buat(tujuan):
    wb = Workbook()
    # PETUNJUK
    ws = wb.active
    ws.title = 'PETUNJUK'
    judul(ws, 'NILAI RAPORT KELAS ....', 'Semester .... Tahun Pelajaran ..../....', 'F')
    langkah = [
        ('UNTUK GURU MATA PELAJARAN', None),
        ('1', 'Klik tab mata pelajaran Anda di bagian bawah layar (misalnya PKN, MTK, FIQIH).'),
        ('2', 'Tulis nama Anda di kotak Nama Guru.'),
        ('3', 'Isi nilai hanya di kotak KUNING, angka 0 sampai 100.'),
        ('4', 'Kotak MERAH berarti nilai wajib belum diisi. Kolom Status menjadi hijau "Lengkap" bila sudah cukup.'),
        ('5', 'Selesai. Nilai tersimpan otomatis. Tidak perlu menekan tombol apa pun.'),
        ('UNTUK WALI KELAS', None),
        ('1', 'Isi nama siswa SEKALI SAJA di tab SISWA. Salin persis dari sheet "siswa" di raport Excel.'),
        ('2', 'Bagikan link Google Sheet ini ke guru mata pelajaran.'),
        ('3', 'Di raport Excel, buka halaman BERANDA, tempel link ini, lalu klik AMBIL NILAI.'),
        ('PENTING', None),
        ('!', 'Jangan mengubah nama tab dan jangan mengurutkan ulang nama siswa.'),
        ('!', 'Mata pelajaran yang tidak diajarkan di kelas ini cukup dibiarkan kosong.'),
    ]
    r = 4
    for no, teks in langkah:
        if teks is None:
            r += 1
            ws.merge_cells(f'A{r}:F{r}')
            isi(ws, f'A{r}', no, bold=True, size=12, warna=HIJAU_TUA)
        else:
            isi(ws, f'A{r}', no, bold=True, size=12, warna='FFFFFF', latar=HIJAU_TUA, tengah=True)
            ws.merge_cells(f'B{r}:F{r}')
            isi(ws, f'B{r}', teks, size=11, bungkus=True)
            ws.row_dimensions[r].height = 30
        r += 1
    ws.column_dimensions['A'].width = 6
    for c in 'BCDEF':
        ws.column_dimensions[c].width = 22
    ws.sheet_properties.tabColor = 'FFC000'

    # SISWA
    ws = wb.create_sheet('SISWA')
    judul(ws, 'DAFTAR SISWA', 'Diisi wali kelas sekali saja. Salin persis dari sheet "siswa" di raport.', 'C')
    kepala(ws, 3, {'A': 'No', 'B': 'Nama Siswa', 'C': 'Keterangan'})
    for i in range(MAKS):
        r = 4 + i
        ws[f'A{r}'] = i + 1
        ws[f'A{r}'].alignment = Alignment(horizontal='center')
        c = ws[f'B{r}']
        c.value = CONTOH_SISWA[i] if i < len(CONTOH_SISWA) else None
        c.fill = PatternFill('solid', fgColor=KUNING)
        for col in 'ABC':
            ws[f'{col}{r}'].border = KOTAK
            ws[f'{col}{r}'].font = Font(name=FONT, size=10)
    isi(ws, 'C4', 'Nama ini hanya CONTOH. Ganti dengan nama siswa kelas Anda.', size=9,
        warna='C00000', bungkus=True).border = KOTAK
    ws.column_dimensions['A'].width = 5
    ws.column_dimensions['B'].width = 36
    ws.column_dimensions['C'].width = 40
    ws.freeze_panes = 'A4'
    ws.sheet_properties.tabColor = 'FFC000'

    for tab, nama in UMUM:
        tab_mapel(wb, tab, nama, 'UMUM')
    for tab, nama in PONDOK:
        tab_mapel(wb, tab, nama, 'PONDOK')
    wb.save(tujuan)


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'CONTOH_NILAI_KELAS.xlsx')
    buat(out)
    print('Dibuat:', out)
