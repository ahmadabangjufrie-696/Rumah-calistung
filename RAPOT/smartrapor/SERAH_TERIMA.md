# Serah terima SmartRapor (untuk sesi Claude berikutnya)

Pemilik: Ustadz Ahmad Jufri. **Balas selalu dalam Bahasa Indonesia yang sederhana, panggil "Ustadz", hindari istilah teknis/Inggris.**
Ustadz bukan programmer; tunjukkan langkah klik demi klik. Ustadz memakai laptop Windows (Excel/Chrome/Edge) dan HP.

## Apa ini
**SmartRapor** = raport Kurikulum Merdeka (SMP + Pondok Pesantren Al-Khairaat Tanjung Selor) di **Google Sheets**,
satu file per kelas. Guru mengisi nilai di tab mapel, raport terisi otomatis lewat rumus. Rencana: dijual ke sekolah lain
(paket per sekolah). Dibuat baru dari nol (bukan salinan aplikasi Excel lama buatan Hasanuddin, S.E.).

## Lokasi
- Kode: repo `ahmadabangjufrie-696/rumah-calistung`, cabang `ccr-a2be243b-zifjyz`, folder `RAPOT/smartrapor/`.
- Google Drive Ustadz, folder **SmartRapor (pengembangan)** (id `1eNMWSH69RC5ysRpjgDNyMhxcmrMnsO-p`):
  - File contoh terbaru: **SmartRapor - Kelas IX B (contoh)** id `1RrOsB1wzFYdhMeXDG2L2GHZ2lKGxZK2BGDrwohq-mGg`
    (10 siswa buatan; kode tombol mungkin sudah ditempel Ustadz di file ini).
  - Dokumen kode tombol: **KODE SmartRapor (salin semua ke Apps Script)** id `1pjpuqZ26hQdPUUqMHmDxPEfool4jjWnmca7pRpx5v74`.
- Nanti TU menyalin ke **Drive sekolah** (Ustadz tidak mau memakai Drive pribadi untuk dipakai sekolah).

## Berkas
| Berkas | Isi |
|---|---|
| `buat_smartrapor.py` | perakit .xlsx (`python buat_smartrapor.py keluaran.xlsx --contoh`). Unggah ke Drive → otomatis jadi Google Sheet |
| `apps_script/Kode.template.gs` + `buat_kode.py` → `Kode.gs` | menu SmartRapor, tombol ▲▼, CETAK SISWA INI, CETAK SEKELAS (gabung PDF pdf-lib), rapikan tinggi baris |
| `apps_script/CARA_PASANG.md` | cara menempel kode (Ekstensi → Apps Script → hapus semua → tempel → Simpan → F5 → SmartRapor → Pasang tombol) |
| `aset/` | logo sekolah, kop pondok |
| `README.md` | daftar halaman |

## Halaman di Google Sheet
BERANDA (progres per mapel, pilih siswa I25 [J25 = nomor, tersembunyi], centang yang dicetak H31:H34, tempat tombol
H28/I28 dan H36/I36), PENGATURAN, SISWA (kolom AB tersembunyi = "No - Nama"), 12 tab mapel umum (Sumatif 1–8 + baris
materi/TP baris 8, Non Tes, Tes → nilai rapor kolom Q, deskripsi S/T), 16 tab mapel pondok (Tugas, Lisan, Semester →
K teori, L praktik), EKSKUL & CATATAN (keputusan per siswa: naik kelas VIII/IX, LULUS, belum bisa naik kelas),
CATATAN PONDOK, P5 PROYEK 1–3, COVER, IDENTITAS SEKOLAH, KETERANGAN DIRI, RAPOR SEKOLAH, RAPOR PONDOK, RAPOR P5,
DATA ARAB (terbilang, batas predikat, catatan otomatis). Siswa pertama di tab mapel = baris 9.

## Cara kerja perubahan (penting)
- **Perubahan kecil**: kerjakan langsung di file Google yang ada lewat Google Sheets API (update_values / update_spreadsheet),
  lalu samakan di `buat_smartrapor.py`. Dengan begitu Ustadz **tidak perlu menempel ulang kode tombol**.
- **Unggah file baru** hanya bila perlu (gambar tidak bisa diubah lewat API). Setelah unggah, kotak centang BERANDA
  H31:H34 harus dipasang lewat API (`setDataValidation` BOOLEAN), dan Ustadz harus menempel kode tombol lagi.
- Uji: LibreOffice (`soffice --headless --convert-to xlsx/pdf`) untuk rumus & tampilan; Node + tiruan Apps Script untuk
  kode tombol (`node --check`, lalu tiruan layanan). Apps Script tidak bisa dijalankan dari server; Ustadz yang mencoba.
- Pelajaran: fungsi `async` tidak bisa dipanggil langsung dari tombol/menu (pakai fungsi biasa pembungkus).
  Sel gabungan tidak menyesuaikan tinggi sendiri (tinggi diatur skrip `rapikanTinggi_`). Huruf Amiri tidak ada di
  LibreOffice server (tampil kotak), di Google normal.

## Status terakhir
- Selesai & sudah dicoba Ustadz: tombol, cetak siswa ini (PDF berhasil).
- Raport pondok baru saja diperbesar agar memenuhi 1 halaman A4 (perubahan langsung di file). **Menunggu Ustadz mencoba cetak.**
- Cetak sekelas: sudah diperbaiki (pembungkus fungsi biasa), **belum dikonfirmasi** Ustadz.

## Yang perlu dikonfirmasi Ustadz
1. Batas predikat pondok (DATA ARAB): ≥90 ممتازة, ≥75 جيد بالفعل, ≥60 جيد بما فيه الكفاية, <60 ليست جيدة بما فيه الكفاية.
2. Tanggal Hijriah (PENGATURAN) masih contoh `٥ مُحَرَّم ١٤٤٨`.
3. Peringkat raport pondok disembunyikan (PENGATURAN: YA/TIDAK).
4. "Tulisan yang salah" di raport pondok: Ustadz belum menunjuk kata mana; minta foto/lingkari.

## Rencana berikutnya
- Rapikan BERANDA (tabel progres & panel cetak), uji cetak sekelas.
- Raport SD dan MA (minta contoh raport).
- Lisensi untuk penjualan, verifikasi aplikasi Google (hilangkan peringatan "tidak aman"), panduan TU.

## Folder lain di `RAPOT/`
Versi lama (Excel + makro): `isi_raport.py`, `gsdata.py`, `excel/AmbilNilai.bas`, `alat/pasang_beranda.py`,
`contoh_google_sheet/`. Sudah ditinggalkan; Ustadz memilih Google Sheets.
