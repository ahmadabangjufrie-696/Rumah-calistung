# Cara memasang tombol SmartRapor (sekali saja, ±2 menit)

Dilakukan **sekali** pada file SmartRapor induk. Salinan untuk tiap kelas ("Buat salinan") otomatis membawa tombolnya.

1. Buka dokumen **KODE SmartRapor**, tekan **Ctrl + A** lalu **Ctrl + C** (salin semua).
2. Buka file **SmartRapor** → menu **Ekstensi → Apps Script**.
3. Di jendela baru, hapus semua tulisan yang ada, lalu **Ctrl + V** (tempel). Klik ikon **Simpan** (disket).
4. Tutup jendela Apps Script, lalu **muat ulang** (refresh) file SmartRapor.
5. Muncul menu **SmartRapor** di bagian atas. Pilih **SmartRapor → Pasang tombol di BERANDA**.
6. Google meminta izin (pertama kali saja): **Lanjutkan → pilih akun → Lanjutan → Buka SmartRapor (tidak aman) → Izinkan**.
   Peringatan "tidak aman" muncul karena kodenya buatan sendiri, bukan dari toko Google.
7. Tombol **▲ Sebelumnya, Berikutnya ▼, CETAK SISWA INI, CETAK SEKELAS** muncul di BERANDA.

PDF tersimpan di folder **PDF SmartRapor**, di folder yang sama dengan file SmartRapor.

`Kode.gs` dibuat oleh `buat_kode.py` dari `Kode.template.gs` (gambar tombol disisipkan sebagai base64).

## Aplikasi web SmartRapor (dibuka lewat link, laptop & HP)

Setelah kode ditempel (langkah 1–4 di atas):

1. Di file SmartRapor: menu **SmartRapor → 🌐 Aplikasi web: buat / ganti PIN wali kelas**. Isi nama wali kelas lalu PIN (4–8 angka).
2. Buka **Ekstensi → Apps Script** → tombol biru **Terapkan** (kanan atas) → **Deployment baru**.
3. Klik ikon gerigi ⚙ di samping "Pilih jenis" → **Aplikasi web**.
4. **Jalankan sebagai: Saya**. **Yang memiliki akses: Siapa saja**. Klik **Terapkan**, izinkan bila diminta.
5. Salin **URL aplikasi web** (berakhiran `/exec`). Itulah link SmartRapor. Bisa juga dilihat lagi di menu
   **SmartRapor → 🌐 Aplikasi web: buka / lihat link**.
6. Buka link, masuk dengan nama + PIN wali kelas. Di halaman **Akun Guru**, buat akun tiap guru (nama, PIN, mapel yang dipegang).
   Kirim link ke guru lewat WhatsApp beserta nama dan PIN masing-masing.

**Setiap kali kode diganti** (tempel kode baru): Terapkan → **Kelola deployment** → ikon pensil ✎ → Versi: **Versi baru** → Terapkan.
Linknya tetap sama.

Keamanan: tanpa PIN yang benar tidak ada data yang bisa dibuka. PIN 5 kali salah → dikunci 5 menit.
Guru hanya bisa membuka mapel yang dicentang wali kelas. Kehadiran, catatan, data siswa, pengaturan, cetak, akun = khusus wali kelas.

## Kirim link isi nilai ke guru mapel lewat WhatsApp (tanpa PIN)

1. Menu **SmartRapor → 📲 Siapkan tab GURU**. Tab **GURU** dibuat (sekali saja).
2. Pastikan link aplikasi web ada di kotak kuning **C2** (bila kosong, tempel linknya).
3. Isi per baris: **Nama guru**, **No. HP** (08…), pilih **Mapel**. Satu baris = satu mapel (guru 2 mapel = 2 baris).
4. Kode terisi sendiri. Klik **📲 Kirim ke WA** → klik linknya → WhatsApp terbuka dengan pesan siap kirim → Kirim.
5. Guru membuka link: langsung ke halaman nilai mapel itu saja, tanpa PIN, tanpa melihat mapel lain atau raport.
6. Mematikan link (misal guru berganti): hapus kodenya di kolom E. Kode baru dibuat otomatis, kirim lagi.
Kolom **Nilai lengkap** menunjukkan berapa siswa yang sudah lengkap nilainya.
