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
  - Panduan TU (Google Doc dari `PANDUAN_TU.md`): **PANDUAN TU SmartRapor** id `1yvdlVF4SOPSDFnv7aRzJAGkOJmKR1pEpBKVYQgYMwSM`.
  - Dokumen kode tombol: **KODE SmartRapor (salin semua ke Apps Script)** id `1OAb9Me4gVNV-X6wkApd3tbNAg6ro0cDEuMagM-1BS6k` (versi aktivasi + semester baru, 11 Nov) (diperbarui 11 Nov: lembar guru + nomor WA;
    dokumen lama dibuang ke sampah. Selalu beri Ustadz LINK langsung ke dokumen ini, Ustadz bingung memilih di Drive).
- Nanti TU menyalin ke **Drive sekolah** (Ustadz tidak mau memakai Drive pribadi untuk dipakai sekolah).

## Berkas
| Berkas | Isi |
|---|---|
| `buat_smartrapor.py` | perakit .xlsx (`python buat_smartrapor.py keluaran.xlsx --contoh`). Unggah ke Drive → otomatis jadi Google Sheet |
| `apps_script/Kode.template.gs` + `buat_kode.py` (+ `rahasia.txt`, tidak di repo) → `Kode.gs` (tidak di repo) | menu SmartRapor, tombol ▲▼, CETAK SISWA INI, CETAK SEKELAS (gabung PDF pdf-lib), rapikan tinggi baris |
| `apps_script/CARA_PASANG.md` | cara menempel kode (Ekstensi → Apps Script → hapus semua → tempel → Simpan → F5 → SmartRapor → Pasang tombol) |
| `aset/` | logo sekolah, kop pondok |
| `README.md` | daftar halaman |
| `PANDUAN_TU.md` | panduan TU klik demi klik (salin, isi, bagikan, cetak). Unggah sebagai HTML → Google Doc; hindari daftar bersarang |

## Halaman di Google Sheet
BERANDA (progres per mapel, nama guru diambil dari GURU, pilih siswa I25 [J25 = nomor, tersembunyi], centang yang dicetak H31:H34, tempat tombol
H28/I28 dan H36/I36), PENGATURAN, GURU (B tab, C mapel, D nama guru, E no. WhatsApp [format teks] atau e-mail, F link "Kirim WA ke …" (wa.me/nomor + pesan + link lembar), G link lembar; baris 6–33; F4 waktu ambil terakhir),
SISWA (kolom AB tersembunyi = "No - Nama"), 12 tab mapel umum (Sumatif 1–8 + baris
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
- **Locale file = id_ID**: rumus lewat Sheets API (update_values / formulaValue) harus memakai pemisah `;`
  (dengan `,` hasilnya #ERROR!). Di Apps Script hindari menulis rumus baru; pakai nilai / RichText.
- Judul tab pondok "NAMA   عربي" (B2) harus diberi arah kiri-ke-kanan (textDirection LEFT_TO_RIGHT / readingOrder=1),
  kalau tidak Google menampilkan Arab di depan. Sudah diperbaiki di file kelas + 11 lembar guru pondok (11 Nov).
- Pelajaran: fungsi `async` tidak bisa dipanggil langsung dari tombol/menu (pakai fungsi biasa pembungkus).
  Sel gabungan tidak menyesuaikan tinggi sendiri (tinggi diatur skrip `rapikanTinggi_`). Huruf Amiri tidak ada di
  LibreOffice server (tampil kotak), di Google normal.

## Status terakhir
- Selesai & sudah dicoba Ustadz: tombol, cetak siswa ini (PDF berhasil), raport pondok huruf Amiri + tinggi baris
  (11 Nov: Ustadz bilang "sudah aman").
- Raport pondok baru saja diperbesar agar memenuhi 1 halaman A4 (perubahan langsung di file). **Menunggu Ustadz mencoba cetak.**
- Cetak sekelas: sudah diperbaiki (pembungkus fungsi biasa). Di folder Drive `PDF SmartRapor` ada "Raport sekelas ...pdf"
  (11 Nov 00:35, dari file lama) — tampaknya pernah berhasil, tetapi **belum dikonfirmasi** Ustadz untuk file terbaru.
- 11 Nov: langkah 5 di BERANDA (I15) diganti "Pilih siswa & centang di kanan bawah, lalu klik tombol CETAK." (langsung di file + perakit).
  Belum ada PDF baru sesudah raport pondok diperbesar (01:13) → masih menunggu Ustadz mencoba cetak.
- 11 Nov: atas permintaan Ustadz, **semua tulisan raport pondok memakai huruf Amiri** (seperti judul تقرير...),
  kecuali 2 baris kop Latin (Arial). Baris mapel 19–34 ditinggikan ke 25 px;
  baris kebiasaan (38–39) dan catatan (41) ke 58 px karena di Google tulisan Amiri 2 baris terpotong. Langsung di file + perakit.
  Uji lokal: Amiri bisa dipasang dari npm `@fontsource/amiri` (woff2 → ttf dengan fontTools ke ~/.fonts).

- 11 Nov: **lembar guru** (permintaan Ustadz: guru hanya melihat mapelnya). Halaman GURU baru + menu
  "Kirim lembar nilai ke guru" / "Ambil nilai dari guru" + pemicu tiap 1 jam + kunci (peringatan) di tab mapel & halaman cetak
  file kelas. C4 tab mapel = rumus ke GURU (sudah dipasang di file). **Ustadz harus menempel kode baru** (dokumen KODE baru),
  lalu mencoba. Atas permintaan Ustadz kontak guru = **nomor WhatsApp** (bukan e-mail): lembar dibagikan "siapa saja
  yang punya link boleh mengedit" (hanya kotak kuning terbuka), tombol WA membuka chat ke nomor itu. E-mail masih diterima.
  Ustadz sudah menempel kode versi e-mail; versi WA perlu ditempel lagi. Belum dicoba di Google.

- 11 Nov: mapel bergantian guru putra/putri (mis. Informatika: Hendrawan putra, Febryangki putri) — dibahas,
  **Ustadz memutuskan: lupakan putri, urus kelas putra/laki saja**. Satu mapel = satu guru per file kelas. Jangan buat fitur
  pembagian per L/P kecuali diminta lagi. Nama guru asli belum ada (tidak ada di Drive); tunggu daftar dari Ustadz.

- 11 Nov: Ustadz sudah mengisi guru asli di GURU dan menjalankan "Kirim lembar nilai ke guru": folder
  `Lembar Guru - SmartRapor - Kelas IX B (contoh)` berisi 19 lembar (sebagian sisa percobaan: "Ustadz Contoh", nama berupa nomor,
  WAHYUDI dua kali). TAJWID belum punya lembar.

- 11 Nov: **AKTIVASI / LISENSI** (Ustadz menjual ke wali kelas, sekali bayar seumur hidup, TANPA server/daftar Drive):
  kode = 8 huruf dari SHA-256(gmail_kecil + '|' + KUNCI), alfabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (byte & 31), format XXXX-XXXX.
  Skrip memeriksa `Session.getEffectiveUser()` vs PENGATURAN "Kode aktivasi" (B46/C46). Belum aktif → kirim lembar guru ditolak,
  cetak tetap jalan tapi judul raport = "SMARTRAPOR BELUM DIAKTIFKAN". Judul raport (RAPOR SEKOLAH A1, RAPOR PONDOK A12,
  RAPOR P5 B2) = rumus ke `'DATA ARAB'!H6`; isinya biasa "(judul raport muncul saat dicetak lewat tombol CETAK)", dikosongkan
  skrip hanya selama cetak oleh pemakai aktif. Data tidak pernah dikunci. Menu "Aktivasi (lihat Gmail & status)".
  - **KUNCI rahasia TIDAK di repo (repo publik!)**: `apps_script/rahasia.txt` (gitignore) dan `Kode.gs` (berisi kunci) tidak
    di-commit lagi. Salinan kunci: Google Doc **RAHASIA SmartRapor (jangan dibagikan)** id `1fC9CJEA-UHfZhskjwhUXGxVhK5AeM_K8aOIEWPCVLsU`.
    Sesi baru: salin kunci itu ke `apps_script/rahasia.txt` sebelum `python buat_kode.py`.
  - Alat pembuat kode untuk HP Ustadz (artifact pribadi, berisi kunci): https://claude.ai/artifact/52CGQTzF9KLGW693Fx7ofS
    Cek: contoh.guru@gmail.com → RM6C-39YR. Kode Gmail Ustadz sudah ditulis di PENGATURAN C46 file contoh.
  - Disarankan ke Ustadz: jadikan repo GitHub **private** (kode produk terbuka untuk umum).
  - Ustadz **harus menempel kode baru** (dokumen KODE 1OAb…) ke file contoh DAN ke MASTER. Belum dicoba di Google.
- 11 Nov: menu **Mulai semester baru (siswa tetap)** / **Mulai kelas baru (siswa baru)** — dipakai pada salinan file:
  kosongkan nilai+materi (tab mapel dari GURU), EKSKUL C7:P46, CATATAN PONDOK C9:G48, P5 (C4,C5,C7:I8,C9:J48),
  [kelas baru: SISWA B5:AA44]; hapus properti lembar_* + GURU F:G; Ganjil→Genap, Genap→Ganjil + tahun ajaran +1.
  Kode aktivasi berlaku selamanya (tidak perlu beli lagi tiap semester).
  - **File MASTER untuk pembeli**: `SmartRapor - MASTER (untuk pembeli)` id `1Bk2KeCI_4pHnkAt9RrHkD3XKrOB3dslgFoplwXcJis0`
    (kosong, dibagikan "siapa saja dengan link: pelihat"; kelas/wali dikosongkan; kotak centang BERANDA sudah dipasang).
    Link untuk pembeli: https://docs.google.com/spreadsheets/d/1Bk2KeCI_4pHnkAt9RrHkD3XKrOB3dslgFoplwXcJis0/copy
    Ustadz harus menempel kode tombol ke MASTER sekali (salinan pembeli ikut membawa kode). Pembeli: buka link → Buat salinan →
    menu SmartRapor › Pasang tombol → izinkan → Aktivasi → tempel kode di PENGATURAN.

- **Daftar PR Ustadz** (Google Doc, berisi semua langkah uji + link): `PR SmartRapor - daftar kerja besok`
  id `1vixiC-Uytc0vxiZgjkt-ae2djOuZwuAAjlIbHbfjEp8` (langkah 5: file asli Ustadz = salinan file contoh + Mulai kelas baru). Sesi berikutnya: tanyakan PR mana yang sudah dikerjakan & hasilnya.

- 11 Nov: folder Drive dirapikan atas permintaan Ustadz (ke sampah): 2 salinan lama "Kelas IX B (contoh)", dokumen KODE lama,
  lembar guru "Ustadz Contoh", 6 PDF percobaan. Lembar yang judulnya berupa nomor HP = lembar Ustadz sendiri (FIQIH,
  S. ALKHAIRAAT), MASIH DIPAKAI. Satu guru punya dua lembar karena nomor WA baris IMLA beda 1 angka dari baris
  TAFSIR/MUFRADAT — tanyakan ke Ustadz nomor yang benar. Jangan tulis nomor HP/nama guru di repo (publik).

## Yang perlu dikonfirmasi Ustadz
1. ~~Batas predikat pondok~~ → **sudah benar** (11 Nov).
2. ~~Tanggal Hijriah~~ → `٤ رَجَب ١٤٤٦` (11 Nov, dipasang di file + perakit).
3. ~~Peringkat raport pondok~~ → **ditampilkan** (PENGATURAN = YA, file + perakit).
4. "Tulisan yang salah" di raport pondok: Ustadz belum menunjuk kata mana; minta foto/lingkari.
5. **Belum diuji Ustadz**: halaman isi nilai guru (12 mapel umum + 16 pondok), cetak sekelas, raport P5, cover,
   identitas, keterangan diri. Ustadz akan menguji dengan mencetak di kertas.

## Rencana berikutnya
- Rapikan BERANDA (tabel progres & panel cetak), uji cetak sekelas.
- Raport SD dan MA (minta contoh raport) — Ustadz: "nanti".
- Lisensi untuk penjualan, verifikasi aplikasi Google (hilangkan peringatan "tidak aman"), panduan TU.

## Folder lain di `RAPOT/`
Versi lama (Excel + makro): `isi_raport.py`, `gsdata.py`, `excel/AmbilNilai.bas`, `alat/pasang_beranda.py`,
`contoh_google_sheet/`. Sudah ditinggalkan; Ustadz memilih Google Sheets.
