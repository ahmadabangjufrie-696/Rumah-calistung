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
