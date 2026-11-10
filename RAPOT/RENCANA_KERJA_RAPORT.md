# Rencana Kerja: Otomatisasi Raport (SMP Al-Khairaat Tanjung Selor)

Catatan serah terima untuk melanjutkan pekerjaan di Claude Code.
Pemilik: Ustadz Ahmad Jufri. Balas selalu dalam Bahasa Indonesia, tanpa istilah bahasa Inggris, dan panggil beliau "Ustadz".

## 1. Masalah yang mau diselesaikan

Setiap ujian, wali kelas membagikan link Google Sheet ke guru mata pelajaran. Setiap guru mengisi nilai di tab mapelnya sendiri.
Setelah semua nilai masuk, wali kelas menyalin nilai itu satu per satu ke aplikasi raport Excel (.xlsm). Pekerjaan ini makan waktu.

**Tujuan:** nilai dari Google Sheet pindah otomatis ke file raport Excel, sehingga wali kelas tinggal mengecek lalu mencetak.

## 2. Sudah sampai mana

| Tahap | Status |
|---|---|
| Membaca semua tab Google Sheet nilai (20 mapel) | ✅ Selesai |
| Memetakan kolom Google Sheet ke kolom raport Excel | ✅ Selesai (lihat bagian 4) |
| Tes mengisi raport contoh dengan nilai VIII B | ✅ Berhasil: 286 nilai dicek, semuanya sama dengan Google Sheet |
| Makro dan tombol menu aplikasi raport tetap utuh setelah diisi | ✅ Teruji |
| Menyambungkan Claude ke PC agar file raport dibaca langsung dari folder | ⏳ Belum. Dipindah ke Claude Code |
| Mengambil nilai Google Sheet langsung lewat internet | ✅ Selesai: `gsdata.py` mengunduh 20 tab sebagai CSV (salinan di `data_gs/`) |
| Daftar siswa dibaca dari raport asli + laporan nama yang tidak cocok | ✅ Selesai: diuji dengan raport tiruan |
| Hasil script baru dibandingkan dengan script lama (data sama) | ✅ Sama persis |
| Menjalankan dengan file raport kelas yang sebenarnya (data siswa asli) | ⏳ Menunggu file raport yang benar |

Catatan: file raport yang dipakai untuk tes hanyalah contoh. Isinya data kelas IX dengan siswa yang berbeda.
Untuk tes, daftar siswanya diganti dengan 26 siswa VIII B.

## 3. Sumber data

- **Google Sheet nilai:** "NILAI RAPORT ASAS SEMESTER GENAP VIII B 2025_2026"
  `https://docs.google.com/spreadsheets/d/11KqxudMmizriXM_blIGuY3sJMiEMmPUVIn512qVsJvA`
  Link dibagikan untuk "siapa saja yang punya link (lihat saja)".
  Satu tab bisa diambil sebagai CSV dengan alamat:
  `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&headers=0&sheet=<NAMA TAB>`
- **Nama tab (20):** PKN, B. INDO, MTK, IPA, IPS, B. INGGRIS, PJOK, INFORMATIKA, HADIST, FIQIH, TAUHID, NAHWU, SHOROF, TAFSIR, TARIKH, TASRIF, S. ALKHAIRAAT, MUHADATSAH, AL ANGHAAM, MAHFUZATH
- **File raport:** aplikasi raport Kurikulum Merdeka berbentuk `.xlsm` (bermakro, buatan Hasanuddin, S.E.).
  Sheet yang dipakai: `siswa`, `Ff11` (input mapel umum), `Form Nilai` (input mapel pondok), `menu`.

## 4. Peta kolom (inti pekerjaan)

### a. Daftar siswa → sheet `siswa`
- Siswa ke-1 ada di baris 7, dan seterusnya. Maksimal 40 siswa (baris 7–46).
- Kolom D = nama, F = L/P, I = agama (harus "Islam", karena rumus mapel memeriksa kolom ini). B = NIS, C = NISN.

### b. Mapel umum → sheet `Ff11`
- Setiap mapel punya blok sendiri. Baris 3 berisi tulisan "MAPEL :". Kolom "No" = kolom "MAPEL :" + 1.
- Siswa ke-1 ada di baris 388, siswa ke-40 di baris 427.
- Sumatif 1–8 = kolom No+4 s.d. No+11, Non Tes = No+14, Tes = No+15. Nilai Rapor = No+18 (rumus, jangan ditimpa).
- Google Sheet: kolom C–J = Sumatif 1–8, M = Non Tes, N = Tes.

| Tab Google Sheet | Kolom "MAPEL :" di Ff11 |
|---|---|
| PKN | CV (Pendidikan Pancasila) |
| B. INDO | EC |
| MTK | FJ |
| IPA | GQ |
| IPS | HX |
| B. INGGRIS | JE |
| PJOK | LS |
| INFORMATIKA | MZ |

PAI (kolom A), Seni Budaya (KL), Prakarya (OG), Pilihan, dan Mulok tidak ada di Google Sheet.

### c. Mapel pondok → sheet `Form Nilai`
- Siswa ke-1 ada di baris 9, siswa ke-40 di baris 48.
- Setiap blok berisi 10 kolom input yang dimulai dari kolom "Tugas 1": Tugas 1–4, Lisan 1–3, Semester, Nilai Raport teori, Nilai Raport praktik.
- Google Sheet: kolom C–L sama urutannya.

| Tab Google Sheet | Kolom awal di Form Nilai |
|---|---|
| HADIST | C (Qur'an Hadist) |
| FIQIH | AC |
| TAUHID | AP |
| NAHWU | BC |
| SHOROF | BQ |
| TAFSIR | CD |
| TARIKH | CQ |
| TASRIF | DD |
| S. ALKHAIRAAT | HQ (Sejarah Al Khairaat) |
| MUHADATSAH | ID (Insya' / محادثة) |
| AL ANGHAAM | IQ |
| MAHFUZATH | JD |

Mapel pondok di raport yang tidak ada di Google Sheet: Bahasa Arab, Tajwid, Gawaid, Ushul Fiqhi, Paraid, Qiraah, Musthalah, Balagha, Aqidah Akhlak, Mufradat, Imla.

## 5. Aturan penting (hasil pelajaran dari tes)

1. **Jangan simpan file raport dengan openpyxl.** Tombol menu dan bentuk di file akan hilang. Script `isi_raport.py` mengubah isi XML sheet secara langsung supaya makro dan tombol tetap utuh.
2. **Jangan menimpa sel rumus**, kecuali Nilai Raport mapel pondok. Di sebagian blok pondok (Tasrif, dan baris 3 siswa terakhir di beberapa mapel), template memakai rumus yang hitungannya berbeda dari Google Sheet. Keputusannya: **nilai dari Google Sheet (hitungan guru mapel) yang dipakai.**
3. Cocokkan siswa berdasarkan **nama**, bukan nomor urut. Beberapa tab tidak memuat semua siswa (misalnya MTK, FIQIH, S. ALKHAIRAAT, dan MUHADATSAH tidak memuat Adiyastha dan Ahmad Mustofa).
4. Salah satu gambar di file raport punya checksum rusak. Script sudah menanganinya. Jangan anggap filenya rusak.
5. Setelah diisi, file diatur agar Excel menghitung ulang semua rumus saat dibuka (`fullCalcOnLoad`). `calcChain.xml` dibuang supaya Excel tidak menampilkan peringatan perbaikan.
6. Simpan hasil sebagai **file baru**. File raport asli jangan diubah.

## 6. Temuan data saat tes (Google Sheet VIII B)

- Mapel yang **sudah terisi:** PKN, B. Indonesia, MTK, IPS, PJOK, Hadist, Fiqih, Tarikh, Tasrif, S. Alkhairaat, Muhadatsah.
- Mapel yang **masih kosong:** IPA, B. Inggris, Informatika, Tauhid, Nahwu, Shorof, Tafsir, Al Anghaam, Mahfuzath.
- Adiyastha M. Faqih dan Ahmad Mustofa Lutfhi belum punya nilai di hampir semua mapel.
- Di tab PJOK, Nilai Rapor M. Abdurrahman Al K. kosong karena rumusnya terhapus. Di raport nilainya terhitung otomatis menjadi 79,5.
- Tab Tasrif tidak punya nilai lisan, sehingga rumus praktik di raport akan menghasilkan #DIV/0! kalau tidak ditimpa nilai Google Sheet.

## 7. Langkah berikutnya di Claude Code

1. Taruh `isi_raport.py`, `gsdata.py`, dan file raport kelas yang benar di satu folder di PC.
2. Ubah `gsdata.py` supaya **mengambil nilai langsung dari Google Sheet** (alamat CSV di bagian 3), tidak lagi diketik manual.
3. **Daftar siswa diambil dari sheet `siswa` di raport yang asli**, jangan ditimpa. Bagian "1) student list" di `isi_raport.py` hanya untuk tes dan harus dimatikan untuk raport asli. Lalu laporkan nama yang tidak cocok antara Google Sheet dan raport, karena ejaannya bisa berbeda.
4. Jalankan: `python isi_raport.py <raport_asli.xlsm> <raport_terisi.xlsm> <folder_script>`
5. Cek hasilnya: buka di Excel, lalu cocokkan beberapa Nilai Rapor dengan Google Sheet. Laporkan mapel atau siswa yang nilainya masih kosong.
6. Kalau sudah lancar, jadikan satu perintah atau satu klik yang bisa dipakai setiap semester.

Kebutuhan di PC: Python 3, lalu `pip install lxml openpyxl requests`.

## 8. Cara pakai (versi sekarang)

1. Pasang Python 3, lalu buka Command Prompt di folder RAPOT dan jalankan: `pip install -r requirements.txt`
2. Taruh file raport kelas yang asli di folder RAPOT.
3. Seret file raport `.xlsm` ke `JALANKAN.bat` (atau klik dua kali lalu ketik nama filenya).
4. Hasilnya tersimpan sebagai file baru `<nama raport>_TERISI.xlsm`. File asli tidak diubah.
5. Baca laporan di layar: mapel yang masih kosong, siswa yang belum punya nilai, dan nama yang ejaannya berbeda.
   Kalau ada nama berbeda, samakan ejaannya (di Google Sheet atau di sheet `siswa`), lalu jalankan lagi.

Pilihan tambahan (lewat Command Prompt):
- `python isi_raport.py RAPORT.xlsm --offline` memakai salinan CSV terakhir di `data_gs/` tanpa internet.
- `python isi_raport.py RAPORT.xlsm --tes` mengganti daftar siswa dengan nama dari Google Sheet. Hanya untuk file raport contoh.

Untuk kelas lain, ganti `SHEET_ID` di baris atas `gsdata.py` dengan ID Google Sheet kelas tersebut.

## 9. Cara utama: Google Sheet per kelas + halaman BERANDA di raport Excel

Panduan lengkap untuk TU, wali kelas, dan guru ada di `PANDUAN.md`.

- **Satu Google Sheet untuk satu kelas**, disimpan di **Drive sekolah** (dikelola TU), bukan Drive pribadi.
  Contohnya `contoh_google_sheet/CONTOH_NILAI_KELAS.xlsx` (dibuat oleh `buat_contoh.py`). Isinya:
  tab PETUNJUK, tab SISWA (nama diisi sekali), dan 28 tab mapel dengan kotak kuning untuk diisi, peringatan merah/oranye,
  serta kolom Status. Rumusnya sudah dicocokkan dengan Sheet VIII B: 198 nilai sama.
- **Raport Excel** mendapat halaman **BERANDA** (`excel/AmbilNilai.bas`, dipasang dengan Alt+F8 → BuatBeranda):
  4 langkah, tombol AMBIL NILAI, daftar status mapel berwarna, tombol cetak raport SMP/Pondok.
  Bentuk raport yang dicetak tidak diubah.
- Letak 28 mapel sudah dicocokkan dengan raport SMP asli. Uji dari awal sampai akhir (contoh Google Sheet → raport asli)
  sudah berhasil lewat program Python, yang memakai aturan kolom yang sama.
- **Kode tombol belum diuji di Excel sungguhan.** Uji dulu di satu kelas sebelum dibagikan.
