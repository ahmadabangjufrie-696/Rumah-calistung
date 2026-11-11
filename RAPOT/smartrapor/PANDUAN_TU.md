# Panduan TU — SmartRapor

SmartRapor adalah raport Kurikulum Merdeka (sekolah + pondok) di Google Sheets.
**Satu file untuk satu kelas.** Guru mengisi nilai di tab mapelnya, raport terisi sendiri.


## A. Persiapan awal (sekali saja, oleh TU)

1. **Masuk ke akun Google sekolah** (bukan akun pribadi), lalu buka **Google Drive**.
2. Klik **+ Baru → Folder baru**, beri nama, misalnya `Raport 2025-2026 Genap`.
3. Buka file **SmartRapor (induk)** yang diberikan, lalu klik **File → Buat salinan**. Beri nama `SmartRapor - INDUK`,
   pilih folder yang baru dibuat, lalu klik **Buat salinan**.
4. Di file `SmartRapor - INDUK`, pasang tombol cetak (lihat **Bagian F**). Cukup sekali,
   karena salinan berikutnya ikut membawa tombolnya.
5. Isi halaman **PENGATURAN** bagian yang sama untuk semua kelas
   (lihat **Bagian B**, kecuali bagian *Kelas & Semester*).

## B. Membuat file untuk tiap kelas

1. Buka `SmartRapor - INDUK` → **File → Buat salinan**.
2. Beri nama sesuai kelas, misalnya `SmartRapor - Kelas VII A` → **Buat salinan**.
3. Ulangi untuk setiap kelas.

Lalu di **tiap file kelas**, buka halaman **PENGATURAN** dan isi kotak kuning:

| Bagian | Yang diisi |
|---|---|
| Identitas sekolah | nama sekolah, NPSN, alamat, kepala sekolah & NIP |
| Kelas & semester | kelas, fase, semester (Ganjil/Genap), tahun pelajaran, tempat & tanggal raport, wali kelas & NIP, KKTP |
| Pondok pesantren | nama pimpinan & wali kelas (tulisan Arab), kelas (angka), tempat & tanggal Hijriah (tulisan Arab), tampilkan peringkat (YA/TIDAK) |
| Daftar mata pelajaran (kanan) | nama mapel di raport dan kalimat deskripsi. Biasanya tidak perlu diubah |

## C. Mengisi data siswa (oleh TU / wali kelas)

1. Buka halaman **SISWA**.
2. Isi satu baris untuk satu siswa: NIS, NISN, nama, nama Arab, L/P, tempat & tanggal lahir, orang tua, dst.
3. Nama siswa otomatis muncul di semua tab mapel. **Jangan menulis nama di tab mapel.**
4. Kalau ada siswa pindah atau baru, ubah di halaman SISWA saja.

## D. Membagikan ke guru

1. Di file kelas, klik tombol **Bagikan** (kanan atas).
2. Ketik e-mail guru-guru yang mengajar di kelas itu → pilih **Editor** → **Kirim**.
3. Sampaikan ke guru: buka tab mapel masing-masing (tab di bawah layar) dan **isi kotak kuning saja**.
   Baris 8 untuk materi / tujuan pembelajaran, mulai baris 9 untuk nilai siswa.
   Kolom lain terisi sendiri. Jangan menghapus baris atau kolom.
4. Wali kelas mengisi **EKSKUL & CATATAN** (ekskul, prestasi, kehadiran, catatan, keputusan)
   dan **CATATAN PONDOK**. Guru P5 mengisi **P5 PROYEK 1–3**.

## E. Memantau

Buka halaman **BERANDA**. Tabel progres menunjukkan setiap mapel:

- **LENGKAP** (hijau): semua siswa sudah dinilai.
- **BELUM LENGKAP** (kuning): sebagian siswa belum dinilai.
- **KOSONG** (merah): guru belum mengisi.

Ingatkan guru yang mapelnya belum lengkap.

## F. Memasang tombol cetak (sekali di file INDUK)

1. Buka dokumen **KODE SmartRapor**, tekan **Ctrl + A** lalu **Ctrl + C**.
2. Di file SmartRapor: menu **Ekstensi → Apps Script**.
3. Hapus semua tulisan yang ada, **Ctrl + V**, lalu klik **Simpan** (ikon disket).
4. Tutup jendela itu, lalu muat ulang file SmartRapor (tekan **F5**).
5. Pilih menu **SmartRapor → Pasang tombol di BERANDA**.
6. Pertama kali, Google meminta izin: **Lanjutkan → pilih akun → Lanjutan → Buka SmartRapor (tidak aman) → Izinkan**.
   Tulisan "tidak aman" muncul karena kodenya buatan sendiri, bukan dari toko Google.

## G. Mencetak raport

Di **BERANDA**, panel kanan bawah:

1. Pilih siswa di kotak kuning **SISWA**, atau klik **▲ / ▼** untuk pindah siswa.
2. Centang yang mau dicetak: Cover, Identitas & Keterangan diri (hanya kelas VII semester 1),
   Raport Sekolah, Raport Pondok, dan/atau Raport P5.
3. Klik **CETAK SISWA INI** (satu siswa) atau **CETAK SEKELAS** (semua siswa jadi satu PDF, tunggu 1–2 menit).
4. PDF tersimpan di folder **PDF SmartRapor**, di folder yang sama dengan file kelas. Buka PDF lalu cetak di printer.

## H. Semester berikutnya

Buat salinan baru dari file kelas semester lalu (**File → Buat salinan**), lalu ganti semester, tahun, dan tanggal
di PENGATURAN. Kosongkan nilai di tab mapel. Data siswa tidak perlu diketik ulang.

## Masalah yang sering terjadi

| Masalah | Penyelesaian |
|---|---|
| Menu SmartRapor tidak muncul | Muat ulang (F5) dan tunggu beberapa detik. Kalau tetap tidak ada, ulangi Bagian F. |
| Nama siswa tidak muncul di tab mapel | Periksa halaman SISWA, nama harus diisi di kolom Nama Peserta Didik. |
| Deskripsi raport kosong | Guru belum mengisi materi/TP di baris 8 tab mapelnya. |
| Tulisan Arab tampil kotak-kotak | Buka di Google Chrome/Edge versi terbaru. |
