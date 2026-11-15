/**
 * SmartRapor - tombol dan cetak PDF
 * Ditempel sekali di: Ekstensi › Apps Script (ganti seluruh isi Kode.gs), lalu Simpan.
 */
var SR = {
  BERANDA: 'BERANDA',
  SISWA: 'SISWA',
  PILIH: 'I25',                 // kotak pilihan "No - Nama" di BERANDA
  CENTANG: 'H31:H34',           // kotak centang "Yang dicetak" di BERANDA
  SISWA1: 5,                    // baris siswa pertama di SISWA
  MAKS: 40,
  // halaman untuk tiap kotak centang (urutan sama dengan H31:H34)
  CETAK: [['COVER', 'IDENTITAS SEKOLAH', 'KETERANGAN DIRI'], ['RAPOR SEKOLAH'], ['RAPOR PONDOK'], ['RAPOR P5']],
  RAPOR: 'RAPOR SEKOLAH',
  P5: 'RAPOR P5',
  FOLDER_PDF: 'PDF SmartRapor',
  // Panel SmartRapor
  MAPEL_SEKOLAH: __MAPEL_SEKOLAH__,      // tab mapel umum, nilai raport di kolom Q
  MAPEL_PONDOK: __MAPEL_PONDOK__,        // tab mapel pondok, nilai di kolom K
  BARIS_MAPEL: 9,                        // baris siswa pertama di tab mapel
  EKSKUL: 'EKSKUL & CATATAN', EKS1: 7,   // sakit/izin/tanpa ket. di kolom L/M/N
  PDFLIB: 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
};

var TOMBOL = {
  NAIK: { gambar: '__TOMBOL_NAIK__', sel: 'H28', fungsi: 'siswaSebelumnya', w: 170, h: 30 },
  TURUN: { gambar: '__TOMBOL_TURUN__', sel: 'I28', fungsi: 'siswaBerikutnya', w: 170, h: 30 },
  CETAK1: { gambar: '__TOMBOL_CETAK1__', sel: 'H36', fungsi: 'cetakSiswaIni', w: 170, h: 36 },
  CETAKSEMUA: { gambar: '__TOMBOL_CETAKSEMUA__', sel: 'I36', fungsi: 'cetakSekelas', w: 170, h: 36 },
  PANEL: { gambar: '__TOMBOL_PANEL__', sel: 'H39', fungsi: 'bukaPanel', w: 345, h: 40 }
};

// ------------------------------------------------------------------ menu
function onOpen() {
  SpreadsheetApp.getUi().createMenu('SmartRapor')
    .addItem('★ Buka Panel SmartRapor', 'bukaPanel')
    .addItem('Panel terbuka otomatis: NYALAKAN', 'panelOtomatisNyala')
    .addItem('Panel terbuka otomatis: MATIKAN', 'panelOtomatisMati')
    .addSeparator()
    .addItem('▲ Siswa sebelumnya', 'siswaSebelumnya')
    .addItem('▼ Siswa berikutnya', 'siswaBerikutnya')
    .addSeparator()
    .addItem('Cetak siswa ini (PDF)', 'cetakSiswaIni')
    .addItem('Cetak sekelas (PDF)', 'cetakSekelas')
    .addSeparator()
    .addItem('Rapikan tinggi baris raport', 'rapikanTinggi')
    .addItem('Pasang tombol di BERANDA', 'pasangTombol')
    .addToUi();
}

// pilihan siswa diganti lewat daftar: rapikan tinggi baris raport
function onEdit(e) {
  if (!e || !e.range) return;
  var sh = e.range.getSheet();
  if (sh.getName() === SR.BERANDA && e.range.getA1Notation() === SR.PILIH) rapikanTinggi_();
}

// ------------------------------------------------------------------ pindah siswa
function siswaSebelumnya() { geser_(-1); }
function siswaBerikutnya() { geser_(1); }

function geser_(arah) {
  var daftar = daftarSiswa_();
  if (!daftar.length) { pesan_('Data siswa masih kosong. Isi dulu halaman SISWA.'); return; }
  var i = daftar.indexOf(pilihanSekarang_());
  var j = i < 0 ? 0 : i + arah;
  if (j < 0) { toast_('Ini sudah siswa pertama.'); j = 0; }
  if (j > daftar.length - 1) { toast_('Ini sudah siswa terakhir.'); j = daftar.length - 1; }
  pilih_(daftar[j]);
  toast_('Siswa ' + daftar[j]);
}

function daftarSiswa_() {
  var akhir = SR.SISWA1 + SR.MAKS - 1;
  var v = SpreadsheetApp.getActive().getSheetByName(SR.SISWA)
    .getRange('AB' + SR.SISWA1 + ':AB' + akhir).getDisplayValues();
  return v.map(function (r) { return r[0]; }).filter(function (x) { return x; });
}

function pilihanSekarang_() {
  return SpreadsheetApp.getActive().getSheetByName(SR.BERANDA).getRange(SR.PILIH).getDisplayValue();
}

function halamanCetak_() {
  var v = SpreadsheetApp.getActive().getSheetByName(SR.BERANDA).getRange(SR.CENTANG).getValues();
  var hasil = [];
  v.forEach(function (r, i) { if (r[0] === true) hasil = hasil.concat(SR.CETAK[i]); });
  return hasil;
}

function pilih_(teks) {
  SpreadsheetApp.getActive().getSheetByName(SR.BERANDA).getRange(SR.PILIH).setValue(teks);
  SpreadsheetApp.flush();
  rapikanTinggi_();
}

// ------------------------------------------------------------------ tinggi baris raport
function rapikanTinggi() { rapikanTinggi_(); toast_('Tinggi baris raport sudah dirapikan.'); }

function jumlahBaris_(teks, perBaris) {
  if (!teks) return 1;
  return String(teks).split('\n').reduce(function (n, s) {
    return n + Math.max(1, Math.ceil(s.length / perBaris));
  }, 0);
}

function rapikanTinggi_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SR.RAPOR);
  if (!sh) return;
  SpreadsheetApp.flush();
  var desk = sh.getRange(10, 5, 24, 1).getDisplayValues();     // E10:E33, 12 mapel x 2 baris
  for (var k = 0; k < desk.length; k++) {
    var n = jumlahBaris_(desk[k][0], 85);
    var tinggi = (k % 2 === 0) ? Math.max(40, n * 14 + 10) : Math.max(22, n * 14 + 8);
    sh.setRowHeight(10 + k, tinggi);
  }
  var a = sh.getRange(34, 1, 30, 1).getDisplayValues();       // cari baris catatan wali kelas
  for (var i = 0; i < a.length; i++) {
    if (a[i][0].indexOf('Catatan Wali Kelas') === 0) {
      sh.setRowHeight(34 + i, Math.max(40, jumlahBaris_(a[i][0], 120) * 15 + 10));
      break;
    }
  }
  rapikanP5_();
}

// RAPOR P5: kolom G berisi penanda baris (H judul projek, D dimensi, S sub-elemen, C catatan).
// Aspek yang tidak diisi dirapatkan supaya tidak menyisakan ruang kosong.
function rapikanP5_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SR.P5);
  if (!sh) return;
  var n = sh.getLastRow();
  var data = sh.getRange(1, 2, n, 6).getDisplayValues();       // B..G
  for (var i = 0; i < n; i++) {
    var tanda = data[i][5], teks = data[i][0];
    if (!tanda) continue;
    var h;
    if (!teks) h = 2;
    else if (tanda === 'D') h = 18;
    else if (tanda === 'S') h = Math.max(30, jumlahBaris_(teks, 85) * 14 + 8);
    else h = Math.max(20, jumlahBaris_(teks, 115) * 14 + 8);
    sh.setRowHeight(i + 1, h);
  }
}

// ------------------------------------------------------------------ cetak
// Setiap halaman cetak diekspor sendiri (paralel), catatan kaki dicetakkan di bawah tiap halaman
// RAPOR SEKOLAH dan RAPOR P5, lalu semuanya digabung menjadi satu PDF.
var KAKI = { 'RAPOR SEKOLAH': 'J1', 'RAPOR P5': 'G1' };   // sel berisi teks catatan kaki

function cetakSiswaIni() {
  cetakSiswaIniProses_().catch(function (e) {
    pesan_('Cetak gagal: ' + e.message + '\n\nFoto pesan ini dan kirim ke admin.');
  });
}

async function cetakSiswaIniProses_() {
  var nama = pilihanSekarang_();
  if (!nama) { pesan_('Pilih dulu siswa di BERANDA.'); return; }
  var halaman = halamanCetak_();
  if (!halaman.length) { pesan_('Centang dulu raport yang mau dicetak di BERANDA (Yang dicetak).'); return; }
  toast_('Membuat PDF ' + nama + ' ...');
  var h = await prosesCetak_({ halaman: halaman, siswa: [nama] });
  tampilkanLink_(h.pesan, h.url, h.label);
}

// Tombol dan menu tidak bisa memanggil fungsi async secara langsung,
// jadi tombol memanggil fungsi biasa ini, lalu proses bertahapnya berjalan di dalam.
function cetakSekelas() {
  cetakSekelasProses_().catch(function (e) {
    pesan_('Cetak sekelas gagal: ' + e.message + '\n\nFoto pesan ini dan kirim ke admin.');
  });
}

async function cetakSekelasProses_() {
  var daftar = daftarSiswa_();
  if (!daftar.length) { pesan_('Data siswa masih kosong. Isi dulu halaman SISWA.'); return; }
  var halaman = halamanCetak_();
  if (!halaman.length) { pesan_('Centang dulu raport yang mau dicetak di BERANDA (Yang dicetak).'); return; }
  var h = await prosesCetak_({ halaman: halaman, siswa: daftar, sekelas: true });
  tampilkanLink_(h.pesan, h.url, h.label);
}

// Inti cetak (dipakai tombol BERANDA dan Panel).
// o = { halaman: [nama tab], siswa: ['No - Nama', ...], sekelas: bool, id: penanda panel }
async function prosesCetak_(o) {
  var ss = SpreadsheetApp.getActive();
  var daftar = o.siswa, n = daftar.length, awal = pilihanSekarang_(), semua = [];
  try {
    for (var i = 0; i < n; i++) {
      var t = n > 1 ? 'Menyiapkan ' + (i + 1) + ' dari ' + n + ': ' + daftar[i] : 'Menyiapkan ' + daftar[i] + ' ...';
      lapor_(o.id, t, Math.round(i / n * 85));
      if (n > 1) toast_(t);
      if (daftar[i] !== pilihanSekarang_()) pilih_(daftar[i]); else rapikanTinggi_();
      eksporBagian_(o.halaman).forEach(function (b) { b.siswa = daftar[i]; semua.push(b); });
    }
  } finally {
    if (n > 1 && awal) pilih_(awal);
  }
  var folder = folderPdf_();
  var namaFile = (n > 1 ? 'Raport sekelas' : daftar[0]) + ' - ' + o.halaman.join(', ') + ' - ' + ss.getName() + '.pdf';
  var berhasil = (n > 1 ? 'PDF <b>' + n + ' siswa</b> sudah jadi dalam satu berkas.' :
    'PDF <b>' + daftar[0] + '</b> sudah jadi.');
  lapor_(o.id, n > 1 ? 'Menggabungkan ' + n + ' siswa menjadi satu PDF ...' : 'Menyusun PDF ...', 92);
  try {
    var pdf = await susunPdf_(semua);
    var file = folder.createFile(pdf.setName(namaFile));
    return { url: file.getUrl(), pesan: berhasil, label: 'Buka PDF' };
  } catch (e) {
    if (n === 1) {                       // satu siswa: satu ekspor tanpa catatan kaki
      if (daftar[0] !== pilihanSekarang_()) pilih_(daftar[0]);
      var f1 = folder.createFile(cadanganSatuPdf_(o.halaman).setName(namaFile));
      return { url: f1.getUrl(), label: 'Buka PDF',
               pesan: berhasil + '<br><span style="color:#b02a37">Catatan kaki belum bisa ditambahkan (' + e.message + ').</span>' };
    }
    // sekelas: simpan tiap halaman per siswa dalam satu folder (tanpa catatan kaki)
    var sub = folder.createFolder('Raport sekelas - ' + ss.getName() + ' - ' +
      Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'dd-MM-yyyy HH.mm'));
    semua.forEach(function (b, k) {
      sub.createFile(b.blob.setName(('00' + (k + 1)).slice(-3) + ' - ' + b.siswa + ' - ' + b.sheet + '.pdf'));
    });
    return { url: sub.getUrl(), label: 'Buka folder PDF',
             pesan: 'PDF sudah jadi per halaman (penggabungan gagal: ' + e.message + ').' };
  }
}

// Ekspor tiap halaman yang dicentang untuk siswa yang sedang dipilih.
// Hasil: [{sheet, blob, kaki}] sesuai urutan cetak.
function eksporBagian_(halaman) {
  var ss = SpreadsheetApp.getActive();
  SpreadsheetApp.flush();
  var nama = (halaman || halamanCetak_()).filter(function (n) { return ss.getSheetByName(n); });
  var hasil = nama.map(function (n) {
    var sh = ss.getSheetByName(n);
    return { sheet: n, url: urlEkspor_(sh.getSheetId()),
             kaki: KAKI[n] ? sh.getRange(KAKI[n]).getDisplayValue() : '' };
  });
  var permintaan = hasil.map(function (h) {
    return { url: h.url, headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true };
  });
  var jawab = UrlFetchApp.fetchAll(permintaan);
  hasil.forEach(function (h, i) {
    var r = jawab[i];
    h.blob = r.getResponseCode() === 200 ? r.getBlob().setContentType('application/pdf') : ambilPdf_(h.url);
  });
  return hasil;
}

function urlEkspor_(gid) {
  return 'https://docs.google.com/spreadsheets/d/' + SpreadsheetApp.getActive().getId() + '/export?format=pdf' +
    (gid === undefined ? '' : '&gid=' + gid) +
    '&size=A4&portrait=true&fitw=true&gridlines=false&printtitle=false&sheetnames=false' +
    '&pagenum=UNDEFINED&fzr=false&horizontal_alignment=CENTER&vertical_alignment=TOP' +
    '&top_margin=0.4&bottom_margin=0.5&left_margin=0.5&right_margin=0.5';
}

function ambilPdf_(url) {
  url = url || urlEkspor_();
  for (var k = 0; k < 6; k++) {
    var r = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (r.getResponseCode() === 200) return r.getBlob().setContentType('application/pdf');
    if (r.getResponseCode() === 429) { Utilities.sleep(4000 * (k + 1)); continue; }
    throw new Error('Gagal membuat PDF (kode ' + r.getResponseCode() + ').');
  }
  throw new Error('Google sedang sibuk. Tunggu sebentar lalu coba lagi.');
}

// Cadangan bila pdf-lib gagal: satu ekspor berisi semua halaman yang dicentang (tanpa catatan kaki).
function cadanganSatuPdf_(halaman) {
  var keadaan = sembunyikanSelainCetak_(halaman || halamanCetak_());
  try { return ambilPdf_(); } finally { pulihkan_(keadaan); }
}

function sembunyikanSelainCetak_(halaman) {
  var ss = SpreadsheetApp.getActive();
  var keadaan = ss.getSheets().map(function (s) { return { sheet: s, tersembunyi: s.isSheetHidden() }; });
  halaman.forEach(function (n) { var s = ss.getSheetByName(n); if (s) s.showSheet(); });
  ss.getSheetByName(halaman[0]).activate();
  keadaan.forEach(function (k) {
    if (halaman.indexOf(k.sheet.getName()) < 0 && !k.tersembunyi) k.sheet.hideSheet();
  });
  SpreadsheetApp.flush();
  return keadaan;
}

function pulihkan_(keadaan) {
  keadaan.forEach(function (k) { if (!k.tersembunyi) k.sheet.showSheet(); });
  var b = SpreadsheetApp.getActive().getSheetByName(SR.BERANDA);
  if (b) b.activate();
  SpreadsheetApp.flush();
}

function folderPdf_() {
  var ss = SpreadsheetApp.getActive();
  var induk = DriveApp.getFileById(ss.getId()).getParents();
  var tempat = induk.hasNext() ? induk.next() : DriveApp.getRootFolder();
  var ada = tempat.getFoldersByName(SR.FOLDER_PDF);
  return ada.hasNext() ? ada.next() : tempat.createFolder(SR.FOLDER_PDF);
}

// ------------------------------------------------------------------ susun PDF + catatan kaki (pdf-lib)
function pdfLib_() {
  if (typeof PDFLib !== 'undefined') return PDFLib;
  var g = globalThis;
  if (typeof g.self === 'undefined') g.self = g;
  if (typeof g.window === 'undefined') g.window = g;
  if (typeof g.setTimeout === 'undefined') g.setTimeout = function (f, t) { if (t) Utilities.sleep(t); f(); return 0; };
  if (typeof g.clearTimeout === 'undefined') g.clearTimeout = function () {};
  var kode = UrlFetchApp.fetch(SR.PDFLIB).getContentText();
  (0, eval)(kode);
  return g.PDFLib;
}

// huruf standar PDF hanya mengenal huruf Latin; huruf lain dibuang dari catatan kaki
function teksLatin_(t) { return String(t || '').replace(/[^\x20-\x7E\xA0-\xFF]/g, ''); }

async function susunPdf_(bagian) {
  var L = pdfLib_();
  var hasil = await L.PDFDocument.create();
  var huruf = await hasil.embedFont(L.StandardFonts.HelveticaOblique);   // huruf miring
  var ukuran = 8;
  for (var i = 0; i < bagian.length; i++) {
    var dok = await L.PDFDocument.load(new Uint8Array(bagian[i].blob.getBytes()));
    var hal = await hasil.copyPages(dok, dok.getPageIndices());
    var kaki = teksLatin_(bagian[i].kaki);
    hal.forEach(function (p, k) {
      hasil.addPage(p);
      if (!kaki) return;
      var lebar = p.getWidth();
      var kanan = 'Halaman ' + (k + 1) + ' dari ' + hal.length;
      p.drawText(kaki, { x: 36, y: 18, size: ukuran, font: huruf });
      p.drawText(kanan, { x: lebar - 36 - huruf.widthOfTextAtSize(kanan, ukuran), y: 18, size: ukuran, font: huruf });
    });
  }
  var bytes = await hasil.save();
  var data = Array.prototype.map.call(bytes, function (x) { return x > 127 ? x - 256 : x; });
  return Utilities.newBlob(data, 'application/pdf');
}


// ------------------------------------------------------------------ Panel SmartRapor
// Jendela besar: daftar siswa, ringkasan nilai, gambar raport, dan tombol cetak.
var JENIS = { sekolah: 'RAPOR SEKOLAH', pondok: 'RAPOR PONDOK', p5: 'RAPOR P5', cover: 'COVER',
              identitas: 'IDENTITAS SEKOLAH', diri: 'KETERANGAN DIRI' };
var URUT_JENIS = ['cover', 'identitas', 'diri', 'sekolah', 'pondok', 'p5'];
var PANEL_HTML = __PANEL_HTML__;

function bukaPanel() {
  var html = HtmlService.createHtmlOutput(PANEL_HTML).setWidth(1240).setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, ' ');
}

// Panel terbuka sendiri saat file dibuka. Berlaku untuk akun yang menyalakannya saja
// (setiap guru menyalakan sendiri bila mau).
function panelOtomatisNyala() {
  hapusPemicuPanel_();
  ScriptApp.newTrigger('panelSaatBuka').forSpreadsheet(SpreadsheetApp.getActive()).onOpen().create();
  pesan_('Panel otomatis sudah NYALA.\n\nMulai sekarang, setiap kali Ustadz/Ibu membuka file ini, ' +
    'Panel SmartRapor langsung terbuka sendiri.\n\nUntuk mematikan: menu SmartRapor › Panel terbuka otomatis: MATIKAN.');
}

function panelOtomatisMati() {
  var n = hapusPemicuPanel_();
  pesan_(n ? 'Panel otomatis sudah MATI.\n\nPanel bisa dibuka lewat tombol emas di BERANDA.' :
    'Panel otomatis memang belum dinyalakan.');
}

function hapusPemicuPanel_() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'panelSaatBuka') { ScriptApp.deleteTrigger(t); n++; }
  });
  return n;
}

function panelSaatBuka(e) {
  try {
    var pembuka = e && e.user ? String(e.user.getEmail ? e.user.getEmail() : e.user) : '';
    var pemilik = Session.getEffectiveUser().getEmail();
    if (pembuka && pemilik && pembuka !== pemilik) return;   // hanya untuk yang menyalakan
    bukaPanel();
  } catch (err) { /* jangan ganggu pembukaan file */ }
}

function namaRentang_(nama) {
  var r = SpreadsheetApp.getActive().getRangeByName(nama);
  return r ? r.getDisplayValue() : '';
}

function dataPanel() {
  var ss = SpreadsheetApp.getActive();
  var sw = ss.getSheetByName(SR.SISWA).getRange(SR.SISWA1, 1, SR.MAKS, 5).getDisplayValues();
  var siswa = [];
  sw.forEach(function (r, i) {
    if (r[3]) siswa.push({ no: i + 1, nis: r[1], nisn: r[2], nama: r[3], arab: r[4], kurang: [] });
  });
  // nilai: hanya mapel yang sudah mulai diisi guru yang dihitung
  function bacaMapel(tabs, kolom, wadah) {
    tabs.forEach(function (tab) {
      var sh = ss.getSheetByName(tab);
      if (!sh) return;
      var v = sh.getRange(kolom + SR.BARIS_MAPEL + ':' + kolom + (SR.BARIS_MAPEL + SR.MAKS - 1)).getValues();
      var dipakai = v.some(function (r) { return typeof r[0] === 'number'; });
      if (!dipakai) return;
      siswa.forEach(function (s) {
        var x = v[s.no - 1][0];
        if (typeof x === 'number') { s[wadah] = (s[wadah] || []).concat(x); }
        else s.kurang.push(tab);
      });
    });
  }
  bacaMapel(SR.MAPEL_SEKOLAH, 'Q', '_s');
  bacaMapel(SR.MAPEL_PONDOK, 'K', '_p');
  var eks = ss.getSheetByName(SR.EKSKUL);
  var absen = eks ? eks.getRange(SR.EKS1, 12, SR.MAKS, 3).getValues() : [];
  siswa.forEach(function (s) {
    var rata = function (a) { return a && a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : ''; };
    s.rata = rata(s._s); s.pondok = rata(s._p);
    var a = absen[s.no - 1] || ['', '', ''];
    s.sakit = a[0] || 0; s.izin = a[1] || 0; s.alpa = a[2] || 0;
    delete s._s; delete s._p;
  });
  var dinilai = siswa.filter(function (s) { return s.rata !== ''; });
  siswa.forEach(function (s) {
    s.peringkat = s.rata === '' ? '' : 1 + dinilai.filter(function (t) { return t.rata > s.rata + 1e-9; }).length;
  });
  var pilihan = pilihanSekarang_();
  var dipilih = pilihan ? parseInt(pilihan, 10) : null;
  var tingkat = namaRentang_('SR_TINGKAT'), semester = namaRentang_('SR_SEMESTER');
  return {
    sekolah: namaRentang_('SR_SEKOLAH'), kelas: namaRentang_('SR_KELAS'), semester: semester,
    tahun: namaRentang_('SR_TAHUN'), siswa: siswa, jumlahDinilai: dinilai.length,
    dipilih: siswa.some(function (s) { return s.no === dipilih; }) ? dipilih : null,
    saranCover: /^VII \(/.test(tingkat) && semester === 'Ganjil'
  };
}

function teksSiswa_(no) {
  var cocok = daftarSiswa_().filter(function (t) { return parseInt(t, 10) === no; });
  if (!cocok.length) throw new Error('Siswa nomor ' + no + ' tidak ditemukan di tab SISWA.');
  return cocok[0];
}

// gambar raport untuk panel: PDF satu halaman cetak, dikirim sebagai base64
function pratinjau(no, jenis) {
  var teks = teksSiswa_(no);
  if (teks !== pilihanSekarang_()) pilih_(teks);
  var sh = SpreadsheetApp.getActive().getSheetByName(JENIS[jenis]);
  if (!sh) throw new Error('Halaman ' + JENIS[jenis] + ' tidak ada di file ini.');
  SpreadsheetApp.flush();
  return Utilities.base64Encode(ambilPdf_(urlEkspor_(sh.getSheetId())).getBytes());
}

function lapor_(id, teks, persen, akhir) {
  if (!id) return;
  var isi = { id: id, teks: teks, persen: persen };
  if (akhir) for (var k in akhir) isi[k] = akhir[k];
  CacheService.getUserCache().put('SR_PROGRES', JSON.stringify(isi), 1800);
}

function progresCetak() {
  var v = CacheService.getUserCache().get('SR_PROGRES');
  return v ? JSON.parse(v) : null;
}

// Dipanggil panel. Proses cetak berjalan bertahap; panel menanyakan kemajuannya lewat progresCetak().
function cetakPanel(o) {
  var halaman = URUT_JENIS.filter(function (j) { return o.jenis.indexOf(j) >= 0; })
    .map(function (j) { return JENIS[j]; })
    .filter(function (n) { return SpreadsheetApp.getActive().getSheetByName(n); });
  lapor_(o.id, 'Memulai ...', 0);
  var daftar;
  try {
    if (!halaman.length) throw new Error('Halaman yang dipilih tidak ada di file ini.');
    daftar = o.sekelas ? daftarSiswa_() : [teksSiswa_(o.no)];
    if (!daftar.length) throw new Error('Data siswa masih kosong. Isi dulu tab SISWA.');
  } catch (e) {
    lapor_(o.id, '', 100, { selesai: true, galat: e.message });
    return true;
  }
  prosesCetak_({ id: o.id, halaman: halaman, siswa: daftar, sekelas: o.sekelas })
    .then(function (h) { lapor_(o.id, '', 100, { selesai: true, url: h.url, pesan: h.pesan }); })
    .catch(function (e) { lapor_(o.id, '', 100, { selesai: true, galat: e.message }); });
  return true;
}

// ------------------------------------------------------------------ tombol di BERANDA
function pasangTombol() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SR.BERANDA);
  sh.getImages().forEach(function (img) {
    if ((img.getAltTextTitle() || '').indexOf('SR_') === 0) img.remove();
  });
  Object.keys(TOMBOL).forEach(function (k) {
    var t = TOMBOL[k];
    var sel = sh.getRange(t.sel);
    var blob = Utilities.newBlob(Utilities.base64Decode(t.gambar), 'image/png', k + '.png');
    var img = sh.insertImage(blob, sel.getColumn(), sel.getRow(), 4, 2);
    img.setWidth(t.w).setHeight(t.h);
    img.setAltTextTitle('SR_' + k);
    img.assignScript(t.fungsi);
  });
  sh.activate();
  pesan_('Tombol sudah terpasang di BERANDA.\n\nKlik tombolnya untuk pindah siswa atau mencetak PDF.');
}

// ------------------------------------------------------------------ bantu
function toast_(teks) { SpreadsheetApp.getActive().toast(teks, 'SmartRapor', 4); }

function pesan_(teks) { SpreadsheetApp.getUi().alert('SmartRapor', teks, SpreadsheetApp.getUi().ButtonSet.OK); }

function tampilkanLink_(teks, url, label) {
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Poppins,Arial,sans-serif;padding:6px 4px;color:#212529">' +
    '<p style="margin:0 0 14px;font-size:14px">' + teks + '</p>' +
    '<a href="' + url + '" target="_blank" style="display:inline-block;background:#0F5132;color:#fff;' +
    'padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:600">' + label + '</a>' +
    '<p style="margin:14px 0 0;font-size:11px;color:#6c757d">Di halaman PDF, tekan tombol cetak (ikon printer).</p>' +
    '</div>').setWidth(380).setHeight(170);
  SpreadsheetApp.getUi().showModalDialog(html, 'SmartRapor');
}
