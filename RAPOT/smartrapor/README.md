# SmartRapor

Raport Kurikulum Merdeka (sekolah + pondok) dalam **satu Google Sheet per kelas**.
Guru mengisi nilai di tab mapelnya, dan raport langsung terisi lewat rumus, tanpa makro dan tanpa tombol.

## Membuat file
```
python buat_smartrapor.py SmartRapor.xlsx            # kosong, siap pakai
python buat_smartrapor.py SmartRapor_contoh.xlsx --contoh   # dengan siswa & nilai buatan
```
Unggah `.xlsx` ke Google Drive, lalu buka sebagai Google Sheet.

## Halaman
| Halaman | Isi |
|---|---|
| BERANDA | ringkasan kelas, progres nilai per mapel, pilihan siswa yang dicetak |
| PENGATURAN | identitas sekolah, kelas, wali kelas, tanggal, daftar mapel & kalimat deskripsi |
| SISWA | data siswa (diisi sekali) |
| GURU | nama & e-mail guru per mapel; link lembar guru (diisi skrip) |
| 12 tab mapel umum | Sumatif 1–8 + materi/TP, Non Tes, Tes → nilai rapor + deskripsi otomatis |
| 16 tab mapel pondok | Tugas, Lisan, Semester → nilai raport teori & praktik |
| EKSKUL & CATATAN | ekstrakurikuler, prestasi, kehadiran, catatan, keputusan |
| CATATAN PONDOK | pembiasaan diri (التعود على الذات), catatan Arab, jumlah/rata-rata/peringkat |
| P5 PROYEK 1–3 | judul, deskripsi, 7 aspek (dimensi + sub-elemen), nilai BB/MB/BSH/SB, catatan proses |
| DATA ARAB | terbilang 0–100, batas predikat, catatan otomatis menurut rata-rata |
| COVER, IDENTITAS SEKOLAH, KETERANGAN DIRI, RAPOR SEKOLAH, RAPOR PONDOK, RAPOR P5 | halaman cetak |

Deskripsi capaian: materi yang nilainya ≥ KKTP masuk kalimat "sudah menunjukkan kemampuan dalam …",
yang di bawah KKTP masuk "perlu bimbingan dalam …". Kalimatnya diatur di PENGATURAN (`{nama}` = nama siswa).

## Tombol & cetak PDF (Apps Script)
Lihat `apps_script/CARA_PASANG.md`. BERANDA: pilih siswa, ▲▼ pindah siswa, centang yang dicetak
(Cover/Identitas/Keterangan diri, Raport Sekolah, Raport Pondok, Raport P5), lalu CETAK SISWA INI / CETAK SEKELAS.

Catatan: kotak centang di BERANDA (H31:H34) dipasang lewat Google Sheets API setelah unggah
(xlsx tidak bisa menyimpan kotak centang Google).

## Lembar guru (Apps Script)
Menu **SmartRapor › Kirim lembar nilai ke guru** membuat satu Google Sheet per guru (folder `Lembar Guru - <file>`),
berisi salinan tab mapelnya saja: rumus yang merujuk halaman lain diganti nilainya, hanya sel isian yang tidak
dikunci, guru dijadikan editor. Nilai ditarik balik (`ambil_`) tiap 1 jam (pemicu waktu) atau lewat menu
**Ambil nilai dari guru**. Sel isian: umum `I4, C8:J8, C9:J48, M9:N48`; pondok `I4, C9:J48`. Nama guru (C4) = rumus ke GURU.

## Berikutnya
- Lisensi untuk penjualan, verifikasi aplikasi Google.
