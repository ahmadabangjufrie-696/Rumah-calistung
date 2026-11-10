# SmartRapor

Raport Kurikulum Merdeka (sekolah + pondok) dalam **satu Google Sheet per kelas**.
Guru mengisi nilai di tab mapelnya, dan raport langsung terisi lewat rumus, tanpa makro dan tanpa tombol.

## Membuat file
```
python buat_smartrapor.py SmartRapor.xlsx            # kosong, siap pakai
python buat_smartrapor.py SmartRapor_contoh.xlsx --contoh   # dengan siswa & nilai buatan
```
Unggah `.xlsx` ke Google Drive, lalu buka sebagai Google Sheet.

## Halaman (tahap 1)
| Halaman | Isi |
|---|---|
| BERANDA | ringkasan kelas, progres nilai per mapel, pilihan siswa yang dicetak |
| PENGATURAN | identitas sekolah, kelas, wali kelas, tanggal, daftar mapel & kalimat deskripsi |
| SISWA | data siswa (diisi sekali) |
| 12 tab mapel umum | Sumatif 1–8 + materi/TP, Non Tes, Tes → nilai rapor + deskripsi otomatis |
| 16 tab mapel pondok | Tugas, Lisan, Semester → nilai raport teori & praktik |
| EKSKUL & CATATAN | ekstrakurikuler, prestasi, kehadiran, catatan, keputusan |
| COVER, IDENTITAS SEKOLAH, KETERANGAN DIRI, RAPOR SEKOLAH | halaman cetak |

Deskripsi capaian: materi yang nilainya ≥ KKTP masuk kalimat "sudah menunjukkan kemampuan dalam …",
yang di bawah KKTP masuk "perlu bimbingan dalam …". Kalimatnya diatur di PENGATURAN (`{nama}` = nama siswa).

## Berikutnya
- Tahap 2: raport pondok (bahasa Arab, terbilang, Hijriah, predikat) dan raport P5.
- Tahap 3: Apps Script: menu & panel SmartRapor, cetak PDF sekelas sekaligus, tinggi baris otomatis, lisensi.
