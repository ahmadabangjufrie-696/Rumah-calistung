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
  - File contoh terbaru (15 Nov, raport pondok desain C3 rapi): **SmartRapor - Kelas IX B (contoh)** (berbintang)
    id `1n2Rb2K2Kyf85mdZp2SblroglMmSz-QCK0NbSlRZxfLo` (10 siswa buatan). Kode tombol **belum** ditempel.
  - 15 Nov atas permintaan Ustadz dibuang ke Sampah: file contoh lama `1RrOsB1w...`, percobaan C3 pertama `1ZBBI_k1...`,
    dokumen KODE lama 11 Nov `1OAb9Me4...`. Hanya ada SATU file raport contoh dan SATU dokumen KODE.
  - Dokumen kode tombol: **KODE SmartRapor (salin semua ke Apps Script)** id `1p0sB1ILNvZbFaK_9mVuAKO_pNIBqbc7-GWzxhIE-0Q4` (19 Nov: + aplikasi web + tab GURU link WA; dokumen lama dibuang).
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
  File Google berlokal id_ID: rumus lewat API memakai pemisah titik-koma (`;`), bukan koma.
  Catatan kaki raport sekolah (RAPOR SEKOLAH!J1, kolom J tersembunyi) dan P5 (RAPOR P5!G1) dicetakkan tombol cetak
  dengan pdf-lib (tiap halaman diekspor terpisah memakai gid + fetchAll, lalu digabung). Uji: scratchpad nodetes/uji2.js.
  Sel gabungan tidak menyesuaikan tinggi sendiri (tinggi diatur skrip `rapikanTinggi_`). Huruf Amiri tidak ada di
  LibreOffice server (tampil kotak), di Google normal.

## Status terakhir
- Catatan kaki ("NAMA / Kelas Semester ... Tahun Ajaran ...  Halaman x dari y") ditambahkan; kode tombol baru
  (dokumen KODE terbaru) **perlu ditempel ulang** oleh Ustadz, lalu dicoba cetak.
- Selesai & sudah dicoba Ustadz: tombol, cetak siswa ini (PDF berhasil).
- Raport pondok baru saja diperbesar agar memenuhi 1 halaman A4 (perubahan langsung di file). **Menunggu Ustadz mencoba cetak.**
- Cetak sekelas: sudah diperbaiki (pembungkus fungsi biasa), **belum dikonfirmasi** Ustadz.

## Yang perlu dikonfirmasi Ustadz
1. Batas predikat pondok (DATA ARAB): ≥90 ممتازة, ≥75 جيد بالفعل, ≥60 جيد بما فيه الكفاية, <60 ليست جيدة بما فيه الكفاية.
2. Tanggal Hijriah (PENGATURAN) masih contoh `٥ مُحَرَّم ١٤٤٨`.
3. Peringkat raport pondok disembunyikan (PENGATURAN: YA/TIDAK).
4. "Tulisan yang salah" di raport pondok: Ustadz belum menunjuk kata mana; minta foto/lingkari.

## Raport pondok desain C3 (DISETUJUI Ustadz 15 Nov, sudah dipasang)
Contoh desain di `desain_pondok/` (HTML `buat_desain.py` + `foto.js`). Yang dipasang = **Desain_C3**, lengkap dengan
kotak كشف الحضور, tanggal Hijriah + Masehi. **QR keaslian dan lingkaran stempel DIHAPUS atas permintaan Ustadz (15 Nov) — jangan dipasang lagi.**
- `buat_rapor_pondok` di `buat_smartrapor.py`: kolom A-C & L-N = pinggir (garis ganda hijau di tepi B/M, garis emas
  di tepi C/L), isi D..K, F = celah sempit (jarak kotak kehadiran-pembiasaan; di tabel digabung dengan G).
  Huruf Arab: Noto Naskh Arabic (judul Amiri). Jarak tulisan dari garis = 2 spasi di depan & belakang teks.
  Percobaan pertama (huruf Arial, tanpa celah/garis emas, mapel contoh banyak kosong) dinilai Ustadz "jelek".
  Gambar dari `aset/` (dibuat `aset/buat_aset_pondok.py`, huruf di `aset/huruf/`): `kop_c3.png` (tembus pandang,
  di atas B2:H6), `air_c3.png` (tanda air), `sudut_c3.png` (hiasan sudut).
  Kop berupa gambar: untuk sekolah lain ubah KOP_* di `buat_aset_pondok.py` lalu jalankan ulang.
- Lebar kolom ditulis dalam piksel Google (`PX` di `buat_rapor_pondok`; Google: piksel = lebar x 7 - 1). Posisi gambar
  (kop, tanda air, hiasan sudut) dihitung dari piksel ini. Jangan ubah lebar kolom di file Google tanpa
  menyamakan `PX`, nanti logo menutupi bingkai / hiasan sudut bergeser (pernah terjadi, foto Ustadz 15 Nov).
- Kehadiran diambil dari EKSKUL & CATATAN kolom L/M/N (sama dengan raport sekolah).
- Tanggal Masehi Arab dari PENGATURAN "Tanggal raport" (teks "20 Juni 2026" atau tanggal asli).

## Langkah berikutnya
0. Belum dijawab Ustadz (15 Nov): (a) catatan kaki lewat Ctrl+P (Ustadz menunjukkan contoh raport Excel lama yang punya
   catatan kaki saat Ctrl+P; SmartRapor memasang catatan kaki lewat tombol cetak karena nama siswa berganti);
   (b) kotak "Capaian" raport sekolah yang kosong (baris kedua kosong bila semua TP tuntas): diisi kalimat otomatis
   seperti DATA ARAB, atau dibiarkan/dirapatkan? Kolom N RAPOR PONDOK berubah sendiri jadi 60 piksel saat diunggah;
   setelah unggah, setel ke 19 lewat API.
1. Ustadz tempel kode tombol (dokumen KODE) → Pasang tombol.
2. Coba CETAK SISWA INI (catatan kaki), raport pondok 1 lembar A4, CETAK SEKELAS.
3. Periksa batas predikat/tanggal Hijriah/peringkat, tunjukkan "tulisan yang salah".

## Rencana berikutnya
- Rapikan BERANDA (tabel progres & panel cetak), uji cetak sekelas.
- Raport SD dan MA (minta contoh raport).
- Lisensi untuk penjualan, verifikasi aplikasi Google (hilangkan peringatan "tidak aman"), panduan TU.

## Folder lain di `RAPOT/`
Versi lama (Excel + makro): `isi_raport.py`, `gsdata.py`, `excel/AmbilNilai.bas`, `alat/pasang_beranda.py`,
`contoh_google_sheet/`. Sudah ditinggalkan; Ustadz memilih Google Sheets.

## Panel SmartRapor (jendela besar)
- Menu **SmartRapor → ★ Buka Panel SmartRapor**, atau tombol emas **BUKA PANEL SMARTRAPOR** di BERANDA H39 (dipasang lewat "Pasang tombol").
- Tampilan: `apps_script/Panel.html` (disisipkan ke Kode.gs oleh `buat_kode.py`, logo dari `aset/logo_sekolah.jpg`).
- Data dibaca lewat nama rentang `SR_SEKOLAH`, `SR_KELAS`, `SR_SEMESTER`, `SR_TAHUN`, `SR_TINGKAT` (dibuat oleh generator; di file contoh dipasang lewat API).
- Gambar raport: halaman diekspor ke PDF lalu digambar dengan pdf.js 3.11.174 (cdnjs) di jendela.
- Cetak dari panel berjalan bertahap; kemajuan disimpan di CacheService (`SR_PROGRES`) dan ditanyakan panel tiap 1,5 detik.
- PENGATURAN: kelas (tingkat + rombel), fase, semester, tahun, KKTP, tanggal Masehi/Hijriah, peringkat pondok = pilihan dari daftar. SISWA: L/P, agama, status keluarga, anak ke-, diterima di kelas = daftar (tidak ketat).
- Panel terbuka otomatis: menu NYALAKAN/MATIKAN membuat/menghapus pemicu onOpen (per akun, fungsi panelSaatBuka).
- RAPOR SEKOLAH dicetak 2 bagian (rentangCetak_): tabel nilai, lalu mulai EKSTRAKURIKULER di halaman baru; nomor halaman dihitung bersama.

## Aplikasi web SmartRapor (19 Nov) — BELUM dicoba Ustadz di Google
- Server: `apps_script/Web.template.gs` (ditambahkan di akhir Kode.gs oleh `buat_kode.py`), tampilan: `apps_script/Web.html` (WEB_HTML).
- `doGet` → halaman satu-berkas. Masuk: nama + PIN (akun di Properti Skrip `SR_AKUN`, PIN = SHA-256 + garam `SR_GARAM`),
  token di CacheService skrip (6 jam). Peran: `wali` (semua) / `guru` (mapel dicentang, P5 opsional).
- Halaman: Beranda (kemajuan per mapel), Input Nilai (umum: S1–8 + Non Tes/Tes, TP; pondok: Tugas/Lisan/Semester, hitung langsung),
  Kehadiran & Catatan (S/I/A sekelas; ekskul, prestasi, catatan, keputusan, pembiasaan & catatan pondok per siswa), Projek P5,
  Data Siswa, Pengaturan (dibaca dari lembar PENGATURAN: kotak kuning = isian, ada validasi = pilihan, rumus = otomatis),
  Akun Guru, Cetak (sama dengan Panel).
- Penulisan teks memakai awalan `'` supaya NISN "00…" tidak jadi angka. Blok yang ditulis ulang diamankan (`amankan_`).
- Fungsi panel sekarang butuh kunci (`bukaPanel` membuat kunci di cache) dan fungsi menu diberi `ui_()` supaya tidak bisa
  dipanggil dari aplikasi web. Kemajuan cetak: cache skrip `SR_PROGRES_<id>`.
- Uji lokal: scratchpad `web/` (palsu.js = tiruan Apps Script berisi data contoh, uji_server.js, uji_ui.js Playwright).
- Pasang: lihat `apps_script/CARA_PASANG.md` bagian Aplikasi web (Terapkan → Aplikasi web, Jalankan sebagai Saya, akses Siapa saja).
- PERHATIAN: ada DUA file bernama "SmartRapor - Kelas IX B (contoh)": `1fvT0Kmo0NEIoWMXLS9o8WEV6pW9ECkE3PhisTFWiCc8` (lama, tanpa pilihan tanggal; kode web ditempel Ustadz di SINI, tab GURU, nama rentang SR_* ditambahkan lewat API 19 Nov) dan `1n2Rb2K2…` (baru). Rumus via setFormula di file id_ID harus memakai ; (`pemisahRumus_`).
- **Link khusus guru mapel (tab GURU)**: menu SmartRapor › 📲 Siapkan tab GURU membuat tab GURU (B nama, C HP teks, D mapel/P5 PROYEK n,
  E kode acak otomatis lewat onEdit, F rumus HYPERLINK wa.me + ENCODEURL pesan, G "x / n lengkap"). Link aplikasi di GURU!C2.
  Guru membuka `URL?k=KODE` → `doGet` menyisipkan kode → `webGuruMasuk` (tanpa PIN) → hanya mapel itu, tanpa menu.
  Hapus kode = link mati. Ustadz minta ini (19 Nov): guru tidak boleh melihat nilai lain/akun wali; data siswa cukup ditempel di Sheet.
- SISWA kolom B, C, M, U, Z diformat Teks (file Google sudah diubah lewat API, juga di generator) supaya 0 di depan tidak hilang saat tempel.
- (19 Nov, lanjutan) Ustadz mau SEMUA di aplikasi web: halaman **Guru & Link WA** (akun guru di Properti Skrip, field `hp`, `kode`;
  tombol 📲 Kirim WA membuka wa.me dengan pesan + `URL?k=kode`; 🔄 link baru = kode baru). PIN guru tidak wajib (hanya wali).
  Data Siswa: tombol **Tempel data siswa sekaligus**: tempel seluruh tabel + judul; kolom dikenali dari judul (SINONIM di Web.html), L/P dinormalkan, TTL dipisah, kolom No dilewati; `webTempelSiswa(token, mulaiNo, data[[null,..26]])` hanya menulis kolom yang ditempel.
  Tab GURU di Sheet tetap berfungsi (cadangan), tapi jalur utama sekarang aplikasi.
- Ide jual: 1 guru 1 akun → nanti perlu kode lisensi (batas jumlah akun per sekolah). BELUM dibuat.
- (19 Nov sore) Hapus siswa di aplikasi (`webHapusSiswa`: geser naik isian SISWA, mapel, EKSKUL, CATATAN PONDOK, P5; ketik HAPUS).
  Kartu cetak (aplikasi & Panel): rata-rata Sekolah|Pondok, peringkat Sekolah|Pondok (`peringkatPondok`, dari rata pondok dibulatkan),
  tidak hadir Sakit|Izin|Alpa. Ustadz pakai file LAMA 1fvT0K (masih ada stempel = gambar, PENGATURAN tanpa pilihan) → disarankan pindah ke 1n2Rb.
- (19 Nov malam) File LAMA 1fvT0K (yang dipakai Ustadz, sudah berisi data asli: wali Wahyudi) di-upgrade lewat API: PENGATURAN
  sekarang sama dengan file baru (Tingkat/Rombel, Masehi & Hijriah 3 pilihan, Fase/Semester/Tahun/KKTP/Peringkat pilihan,
  kelas angka otomatis) + nama rentang SR_*. Rumus raport sudah ikut bergeser (dicek: raport pondok ٩ / الثاني, tanggal benar).
  Stempel (gambar 50x50) dihapus oleh kode `hapusStempel_` saat file dibuka / Panel / cetak (sekali, tanda di DocumentProperties).
  Isian pilihan di aplikasi memakai <select> + "Tulis sendiri" (datalist dulu menyaring pilihan sehingga tampak hilang).
- (19 Nov) Atas permintaan Ustadz, file contoh `1n2Rb2K2…` DIBUANG ke Sampah. File yang dipakai SATU-SATUNYA:
  **1fvT0Kmo0NEIoWMXLS9o8WEV6pW9ECkE3PhisTFWiCc8** (ada tab GURU, wali Wahyudi, kode aplikasi web terpasang).
- Sapaan guru (Ustadz/Ustadzah, field `sapaan`, `namaSapa_`) dipakai di pesan WA & aplikasi; nama guru otomatis ditulis ke C4
  tab mapel saat akun disimpan dan saat guru membuka mapel lewat link (`tulisNamaGuru_`). Kotak Nama guru terkunci bagi guru link.
