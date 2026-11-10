# Tombol "Ambil Nilai" di Raport Excel

Tombol ini memindahkan nilai dari Google Sheet kelas ke raport, tanpa salin-tempel.
Tidak perlu memasang program apa pun. Cukup Excel dan internet.

Alurnya:

**Guru mapel mengisi Google Sheet kelas → wali kelas klik AMBIL NILAI → cek → cetak.**

---

## A. Untuk Ustadz: memasang tombol di raport induk (sekali saja)

Pasang sekali di raport induk, lalu bagikan file raport itu ke wali kelas.

1. **Buat cadangan** file raport induk (salin file `.xlsm`-nya).
2. Buka raport induk di Excel. Kalau muncul pita kuning, klik **Enable Content / Aktifkan Konten**.
3. Tekan **Alt + F11**. Jendela kode makro terbuka.
4. Di jendela itu, klik menu **File → Import File...**, lalu pilih berkas **`AmbilNilai.bas`**.
   Di daftar sebelah kiri akan muncul modul baru bernama **AmbilNilaiGS**.
5. Tutup jendela kode makro (klik X).
6. Tekan **Alt + F8**, pilih **AmbilNilai**, lalu klik **Run / Jalankan**.
   - Sheet baru **PETA NILAI** akan dibuat, lengkap dengan tombol hijau **AMBIL NILAI**.
   - Saat diminta link Google Sheet, klik **Cancel** saja, karena ini raport induk.
7. Simpan raport (**Ctrl + S**) tetap sebagai `.xlsm`.

Raport induk siap dibagikan.

### Sheet PETA NILAI

| Sel / Kolom | Isi |
|---|---|
| B2 | Link Google Sheet kelas (diisi wali kelas) |
| B3 | Waktu terakhir nilai diambil |
| Mulai baris 5 | Daftar tab mapel: **nama tab di Google Sheet**, **jenis** (UMUM = sheet Ff11, PONDOK = sheet Form Nilai), dan **kolom di raport** |

- Isi bawaannya sudah untuk raport SMP (12 mapel umum dan 16 mapel pondok).
- Satu mapel boleh punya beberapa nama tab, dipisah garis miring. Contoh: `IMLA / IMLA'`.
- Tab yang tidak ada di Google Sheet dilewati, tidak membuat salah.
- Untuk raport SD atau MA yang letak kolomnya berbeda, cukup ubah tabel ini. Kodenya tidak perlu diubah.

---

## B. Untuk wali kelas: setiap kali mengambil nilai

1. Buka raport kelas, lalu klik **Enable Content / Aktifkan Konten** kalau diminta.
2. Buka sheet **PETA NILAI**.
3. Pertama kali saja: tempel **link Google Sheet kelas** di sel **B2**.
4. Klik tombol **AMBIL NILAI**. Tunggu beberapa detik.
5. Sheet **LAPORAN NILAI** terbuka dan berisi:
   - jumlah siswa yang sudah terisi per mapel, dan nama siswa yang belum punya nilai;
   - mapel yang masih kosong di Google Sheet;
   - **nama yang tidak cocok** antara Google Sheet dan sheet `siswa`. Samakan ejaannya, lalu klik AMBIL NILAI lagi.
6. Cek beberapa Nilai Rapor, lalu **simpan** raport.

Tombol boleh diklik berkali-kali. Setiap kali guru menambah atau membetulkan nilai, klik lagi dan nilai terbaru akan masuk.

---

## C. Syarat Google Sheet kelas

1. **Dibagikan:** klik **Bagikan → Akses umum → Siapa saja yang memiliki link → Pelihat**.
   Guru mapel diberi akses **Editor** supaya bisa mengisi.
2. **Satu tab untuk satu mapel.** Nama tabnya sama dengan kolom A di sheet PETA NILAI (misalnya `PKN`, `MTK`, `HADIST`).
3. **Susunan setiap tab** sama seperti Google Sheet VIII B:
   - kolom **A** = nomor urut, kolom **B** = nama siswa;
   - **Mapel umum:** kolom C–J = Sumatif 1–8, kolom M = Non Tes, kolom N = Tes;
   - **Mapel pondok:** kolom C–F = Tugas 1–4, G–I = Lisan 1–3, J = Semester, K = Nilai Raport teori, L = Nilai Raport praktik.
4. Nama siswa sebaiknya **disalin dari sheet `siswa` di raport**, supaya ejaannya sama.

---

## D. Aturan yang dijaga tombol ini

- Daftar siswa di raport **tidak diubah**. Siswa dicocokkan berdasarkan **nama**, bukan nomor urut. Beda titik atau spasi (misalnya "MOCH.TEGAR" dengan "MOCH. TEGAR") tetap dianggap cocok.
- **Sel rumus tidak ditimpa**, kecuali 2 kolom Nilai Raport mapel pondok, karena yang dipakai nilai hitungan guru di Google Sheet.
- Sheet Ff11 dibuka kuncinya sebentar, lalu dikunci lagi.
- Nilai yang bukan angka (kosong, tulisan, `#DIV/0!`) dianggap kosong.

## E. Kalau ada masalah

| Pesan | Yang perlu dicek |
|---|---|
| "Google Sheet tidak bisa diunduh" | Internet tersambung? Google Sheet sudah dibagikan "Siapa saja yang memiliki link"? |
| "Link Google Sheet tidak dikenali" | Isi B2 harus link lengkap, misalnya `https://docs.google.com/spreadsheets/d/.../edit` |
| "tab tidak ada di Google Sheet" | Nama tab di Google Sheet berbeda dengan kolom A di PETA NILAI. Samakan, atau tambahkan nama lain dengan tanda `/` |
| Tombol tidak bereaksi | Makro belum diaktifkan. Tutup file, buka lagi, lalu klik Enable Content |
