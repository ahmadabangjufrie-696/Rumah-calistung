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
  GURU: 'GURU',
  GURU1: 6,                     // baris mapel pertama di GURU (kolom B tab, D nama, E no. WA / e-mail, F link)
  JML_MAPEL: 28,
  BARIS1: 9,                    // baris siswa pertama di tab mapel
  // halaman yang dikunci (peringatan) di file kelas; tab mapel ikut dikunci saat lembar guru dikirim
  DIKUNCI: ['RAPOR SEKOLAH', 'RAPOR PONDOK', 'RAPOR P5', 'COVER', 'IDENTITAS SEKOLAH', 'KETERANGAN DIRI',
    'DATA ARAB'],
  PDFLIB: 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
};

var TOMBOL = {
  NAIK: { gambar: '__TOMBOL_NAIK__', sel: 'H28', fungsi: 'siswaSebelumnya', w: 170, h: 30 },
  TURUN: { gambar: '__TOMBOL_TURUN__', sel: 'I28', fungsi: 'siswaBerikutnya', w: 170, h: 30 },
  CETAK1: { gambar: '__TOMBOL_CETAK1__', sel: 'H36', fungsi: 'cetakSiswaIni', w: 170, h: 36 },
  CETAKSEMUA: { gambar: '__TOMBOL_CETAKSEMUA__', sel: 'I36', fungsi: 'cetakSekelas', w: 170, h: 36 }
};

// ------------------------------------------------------------------ menu
function onOpen() {
  SpreadsheetApp.getUi().createMenu('SmartRapor')
    .addItem('▲ Siswa sebelumnya', 'siswaSebelumnya')
    .addItem('▼ Siswa berikutnya', 'siswaBerikutnya')
    .addSeparator()
    .addItem('Cetak siswa ini (PDF)', 'cetakSiswaIni')
    .addItem('Cetak sekelas (PDF)', 'cetakSekelas')
    .addSeparator()
    .addItem('Kirim lembar nilai ke guru', 'kirimLembarGuru')
    .addItem('Ambil nilai dari guru', 'ambilNilaiGuru')
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
function cetakSiswaIni() {
  var ss = SpreadsheetApp.getActive();
  var nama = pilihanSekarang_();
  if (!nama) { pesan_('Pilih dulu siswa di BERANDA.'); return; }
  if (!halamanCetak_().length) { pesan_('Centang dulu raport yang mau dicetak di BERANDA (Yang dicetak).'); return; }
  toast_('Membuat PDF ' + nama + ' ...');
  rapikanTinggi_();
  var keadaan = sembunyikanSelainCetak_();
  var pdf;
  try {
    pdf = ambilPdf_();
  } finally {
    pulihkan_(keadaan);
  }
  var file = folderPdf_().createFile(pdf.setName(nama + ' - ' + ss.getName() + '.pdf'));
  tampilkanLink_('PDF raport <b>' + nama + '</b> sudah jadi.', file.getUrl(), 'Buka PDF');
}

// Tombol dan menu tidak bisa memanggil fungsi async secara langsung,
// jadi tombol memanggil fungsi biasa ini, lalu proses bertahapnya berjalan di dalam.
function cetakSekelas() {
  cetakSekelasProses_().catch(function (e) {
    pesan_('Cetak sekelas gagal: ' + e.message + '\n\nFoto pesan ini dan kirim ke admin.');
  });
}

async function cetakSekelasProses_() {
  var ss = SpreadsheetApp.getActive();
  var daftar = daftarSiswa_();
  if (!daftar.length) { pesan_('Data siswa masih kosong. Isi dulu halaman SISWA.'); return; }
  if (!halamanCetak_().length) { pesan_('Centang dulu raport yang mau dicetak di BERANDA (Yang dicetak).'); return; }
  var awal = pilihanSekarang_();
  var blobs = [];
  var keadaan = sembunyikanSelainCetak_();
  try {
    for (var i = 0; i < daftar.length; i++) {
      toast_('Menyiapkan ' + (i + 1) + ' dari ' + daftar.length + ': ' + daftar[i]);
      pilih_(daftar[i]);
      blobs.push(ambilPdf_().setName(daftar[i] + '.pdf'));
    }
  } finally {
    pulihkan_(keadaan);
    if (awal) pilih_(awal);
  }
  var folder = folderPdf_();
  try {
    toast_('Menggabungkan ' + blobs.length + ' raport menjadi satu PDF ...');
    var gabung = await gabungPdf_(blobs);
    var file = folder.createFile(gabung.setName('Raport sekelas - ' + ss.getName() + '.pdf'));
    tampilkanLink_('PDF <b>' + daftar.length + ' siswa</b> sudah jadi dalam satu berkas.', file.getUrl(), 'Buka PDF');
  } catch (e) {
    // cadangan: simpan per siswa dalam satu folder
    var sub = folder.createFolder('Raport sekelas - ' + ss.getName() + ' - ' +
      Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'dd-MM-yyyy HH.mm'));
    blobs.forEach(function (b, k) {
      sub.createFile(b.setName(('0' + (k + 1)).slice(-2) + ' - ' + b.getName()));
    });
    tampilkanLink_('PDF sudah jadi, satu berkas per siswa (penggabungan gagal: ' + e.message + ').',
      sub.getUrl(), 'Buka folder PDF');
  }
}

// sembunyikan semua halaman kecuali halaman cetak; ekspor PDF hanya memuat halaman yang tampil
function sembunyikanSelainCetak_() {
  var ss = SpreadsheetApp.getActive();
  var halaman = halamanCetak_();
  var keadaan = ss.getSheets().map(function (s) { return { sheet: s, tersembunyi: s.isSheetHidden() }; });
  var pertama = ss.getSheetByName(halaman[0]);
  halaman.forEach(function (n) { var s = ss.getSheetByName(n); if (s) s.showSheet(); });
  pertama.activate();
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

function ambilPdf_() {
  var ss = SpreadsheetApp.getActive();
  SpreadsheetApp.flush();
  var url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=pdf' +
    '&size=A4&portrait=true&fitw=true&gridlines=false&printtitle=false&sheetnames=false' +
    '&pagenum=UNDEFINED&fzr=false&horizontal_alignment=CENTER&vertical_alignment=TOP' +
    '&top_margin=0.4&bottom_margin=0.4&left_margin=0.5&right_margin=0.5';
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

function folderPdf_() {
  var ss = SpreadsheetApp.getActive();
  var induk = DriveApp.getFileById(ss.getId()).getParents();
  var tempat = induk.hasNext() ? induk.next() : DriveApp.getRootFolder();
  var ada = tempat.getFoldersByName(SR.FOLDER_PDF);
  return ada.hasNext() ? ada.next() : tempat.createFolder(SR.FOLDER_PDF);
}

// ------------------------------------------------------------------ gabung PDF (pdf-lib)
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

async function gabungPdf_(blobs) {
  var L = pdfLib_();
  var hasil = await L.PDFDocument.create();
  for (var i = 0; i < blobs.length; i++) {
    var dok = await L.PDFDocument.load(new Uint8Array(blobs[i].getBytes()));
    var hal = await hasil.copyPages(dok, dok.getPageIndices());
    hal.forEach(function (p) { hasil.addPage(p); });
  }
  var bytes = await hasil.save();
  var data = Array.prototype.map.call(bytes, function (x) { return x > 127 ? x - 256 : x; });
  return Utilities.newBlob(data, 'application/pdf');
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

// ------------------------------------------------------------------ lembar guru
// Tiap guru menerima file sendiri berisi tab mapelnya saja (nama siswa ikut, nilai mapel lain tidak).
// Nilai di lembar guru ditarik ke file kelas: otomatis tiap 1 jam, atau lewat menu "Ambil nilai dari guru".

function jenisTab_(sh) { return sh.getRange('Q7').getDisplayValue() === 'NILAI RAPOR' ? 'umum' : 'pondok'; }

// sel yang diisi guru (selain nama guru, yang diambil dari halaman GURU)
function selIsian_(jenis) {
  var a = SR.BARIS1, z = SR.BARIS1 + SR.MAKS - 1;
  return jenis === 'umum' ? ['I4', 'C8:J8', 'C' + a + ':J' + z, 'M' + a + ':N' + z] : ['I4', 'C' + a + ':J' + z];
}

function daftarGuru_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SR.GURU);
  if (!sh) return [];
  var v = sh.getRange(SR.GURU1, 2, SR.JML_MAPEL, 4).getDisplayValues();   // B..E
  var hasil = [];
  for (var i = 0; i < v.length; i++) {
    if (!v[i][0]) continue;
    hasil.push({ tab: v[i][0], mapel: v[i][1], nama: v[i][2].trim(), email: kontak_(v[i][3]),
      baris: SR.GURU1 + i });
  }
  return hasil;
}

// kontak guru: nomor WhatsApp (dijadikan 62xxx) atau e-mail
function kontak_(t) {
  t = String(t || '').trim().toLowerCase();
  if (!t || t.indexOf('@') >= 0) return t;
  var d = t.replace(/[^0-9]/g, '');
  if (d.indexOf('0') === 0) d = '62' + d.slice(1);
  else if (d.indexOf('8') === 0) d = '62' + d;
  return d;
}

function kelompokGuru_() {
  var grup = {}, urut = [];
  daftarGuru_().forEach(function (m) {
    if (!m.email) return;
    if (!grup[m.email]) { grup[m.email] = { email: m.email, nama: m.nama, mapel: [] }; urut.push(m.email); }
    if (!grup[m.email].nama) grup[m.email].nama = m.nama;
    grup[m.email].mapel.push(m);
  });
  return urut.map(function (e) { return grup[e]; });
}

function idLembar_(email) { return PropertiesService.getDocumentProperties().getProperty('lembar_' + email); }

function bukaLembar_(email) {
  var id = idLembar_(email);
  if (!id) return null;
  try {
    if (DriveApp.getFileById(id).isTrashed()) return null;
    return SpreadsheetApp.openById(id);
  } catch (e) { return null; }
}

function folderGuru_() {
  var ss = SpreadsheetApp.getActive();
  var induk = DriveApp.getFileById(ss.getId()).getParents();
  var folder = induk.hasNext() ? induk.next() : DriveApp.getRootFolder();
  var nama = 'Lembar Guru - ' + ss.getName();
  var ada = folder.getFoldersByName(nama);
  return ada.hasNext() ? ada.next() : folder.createFolder(nama);
}

function namaKelas_() {
  var ss = SpreadsheetApp.getActive();
  var v = ss.getSheetByName('PENGATURAN').createTextFinder('Kelas').matchEntireCell(true).findNext();
  return v ? v.offset(0, 1).getDisplayValue() : ss.getName();
}

function kirimLembarGuru() {
  var ss = SpreadsheetApp.getActive();
  var guru = kelompokGuru_();
  if (!guru.length) {
    ss.getSheetByName(SR.GURU).activate();
    pesan_('Isi dulu nama dan nomor WhatsApp guru di halaman GURU (kolom kuning).');
    return;
  }
  ss.toast('Menyiapkan lembar guru... (±1 menit)', 'SmartRapor', 60);
  ambil_(true);                                     // simpan dulu nilai yang sudah diisi guru
  var folder = folderGuru_(), kelas = namaKelas_(), hasil = [], gagal = [];
  var shGuru = ss.getSheetByName(SR.GURU);
  guru.forEach(function (g) {
    var lembar = bukaLembar_(g.email);
    if (!lembar) {
      lembar = SpreadsheetApp.create('Nilai ' + kelas + ' - ' + (g.nama || g.email));
      DriveApp.getFileById(lembar.getId()).moveTo(folder);
      PropertiesService.getDocumentProperties().setProperty('lembar_' + g.email, lembar.getId());
    }
    var perlu = g.mapel.map(function (m) { return m.tab; });
    g.mapel.forEach(function (m) {
      var src = ss.getSheetByName(m.tab);
      if (!src) return;
      var dst = lembar.getSheetByName(m.tab);
      if (!dst) {
        dst = src.copyTo(lembar).setName(m.tab);
        jadikanMandiri_(ss, src, dst);
        kunciLembar_(dst, jenisTab_(src));
      } else {
        segarkanNama_(src, dst);
      }
      kunciTabKelas_(src);
    });
    lembar.getSheets().forEach(function (sh) {        // buang lembar kosong bawaan / mapel yang dipindah
      if (perlu.indexOf(sh.getName()) < 0 && lembar.getSheets().length > 1) lembar.deleteSheet(sh);
    });
    lembar.getSheets()[0].activate();
    try {
      var berkas = DriveApp.getFileById(lembar.getId());
      if (g.email.indexOf('@') >= 0) berkas.addEditor(g.email);
      else berkas.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);   // cukup lewat link WA
    } catch (e) { gagal.push(g.nama || g.email); }
    var url = lembar.getUrl();
    var wa = linkWa_(g, perlu.join(', '), kelas, url);
    g.mapel.forEach(function (m) {              // tautan biasa (tanpa rumus: aman untuk pemisah ; atau ,)
      shGuru.getRange(m.baris, 6).setRichTextValue(SpreadsheetApp.newRichTextValue()
        .setText('Kirim WA ke ' + (g.nama || g.email)).setLinkUrl(wa).build());
      shGuru.getRange(m.baris, 7).setRichTextValue(SpreadsheetApp.newRichTextValue()
        .setText('Buka lembar ' + m.tab).setLinkUrl(url).build());
    });
    hasil.push({ nama: g.nama || g.email, mapel: perlu.join(', '), url: url, wa: wa });
  });
  pasangAmbilOtomatis_();
  kunciHalamanCetak_();
  tampilkanDaftarGuru_(hasil, gagal, kelas);
}

// rumus yang merujuk halaman lain (SISWA, PENGATURAN, GURU) diganti nilainya, supaya lembar guru berdiri sendiri
function jadikanMandiri_(ss, src, dst) {
  var rg = dst.getDataRange();
  var rumus = rg.getFormulas(), nilai = src.getRange(rg.getA1Notation()).getValues();
  var grid = rg.getValues(), cache = {};
  var pola = /('(?:[^']|'')+'|[A-Za-z_][A-Za-z0-9_.]*)!\$?[A-Z]{1,3}\$?\d+(:\$?[A-Z]{1,3}\$?\d+)?/g;
  for (var i = 0; i < rumus.length; i++) {
    for (var j = 0; j < rumus[i].length; j++) {
      var f = rumus[i][j];
      if (!f) continue;
      if (f.indexOf('!') < 0) { grid[i][j] = f; continue; }
      // rujukan rentang, atau sel yang hanya berisi rujukan (mis. KKTP): pakai nilainya
      if (/![^,;)]*:/.test(f) || /^=\s*('(?:[^']|'')+'|[A-Za-z_][A-Za-z0-9_.]*)!\$?[A-Z]{1,3}\$?\d+\s*$/.test(f)) {
        grid[i][j] = nilai[i][j]; continue;
      }
      grid[i][j] = f.replace(pola, function (ref) {
        if (!(ref in cache)) {
          var v = ss.getRange(ref).getValue();
          cache[ref] = '"' + String(v).replace(/"/g, '""') + '"';     // teks (nama guru, kalimat deskripsi)
        }
        return cache[ref];
      });
    }
  }
  rg.setValues(grid);
}

function segarkanNama_(src, dst) {
  var a1 = 'A' + SR.BARIS1 + ':B' + (SR.BARIS1 + SR.MAKS - 1);
  dst.getRange(a1).setValues(src.getRange(a1).getValues());
  dst.getRange('C4').setValue(src.getRange('C4').getDisplayValue());
}

// di lembar guru: hanya kotak isian yang bisa diubah
function kunciLembar_(sh, jenis) {
  var p = sh.protect().setDescription('SmartRapor: hanya kotak kuning yang diisi');
  p.setUnprotectedRanges(selIsian_(jenis).map(function (a) { return sh.getRange(a); }));
  p.addEditor(Session.getEffectiveUser());
  p.removeEditors(p.getEditors());
  if (p.canDomainEdit()) p.setDomainEdit(false);
}

// di file kelas: tab mapel diisi lewat lembar guru, beri peringatan bila diubah langsung
function kunciTabKelas_(sh) {
  if (sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) return;
  sh.protect().setDescription('SmartRapor: nilai diisi guru lewat lembar guru').setWarningOnly(true);
}

function kunciHalamanCetak_() {
  var ss = SpreadsheetApp.getActive();
  SR.DIKUNCI.forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (!sh || sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) return;
    sh.protect().setDescription('SmartRapor: halaman ini terisi otomatis').setWarningOnly(true);
  });
}

function ambilNilaiGuru() {
  SpreadsheetApp.getActive().toast('Mengambil nilai dari lembar guru...', 'SmartRapor', 30);
  var n = ambil_(false);
  pesan_(n ? 'Nilai dari ' + n + ' mapel sudah masuk. Lihat BERANDA untuk progresnya.'
    : 'Belum ada lembar guru. Isi halaman GURU, lalu pilih menu SmartRapor › Kirim lembar nilai ke guru.');
}

function ambilNilaiOtomatis() { ambil_(true); }

function ambil_(diam) {
  var ss = SpreadsheetApp.getActive(), n = 0, buka = {};
  daftarGuru_().forEach(function (m) {
    if (!m.email) return;
    if (!(m.email in buka)) buka[m.email] = bukaLembar_(m.email);
    var lembar = buka[m.email];
    var src = lembar && lembar.getSheetByName(m.tab), dst = ss.getSheetByName(m.tab);
    if (!src || !dst) return;
    selIsian_(jenisTab_(dst)).forEach(function (a1) {
      var v = src.getRange(a1).getValues();
      if (a1 === 'I4') {                              // KKTP: hanya bila guru mengubahnya
        if (String(v[0][0]) !== dst.getRange(a1).getDisplayValue()) dst.getRange(a1).setValues(v);
        return;
      }
      dst.getRange(a1).setValues(v);
    });
    n++;
  });
  var sh = ss.getSheetByName(SR.GURU);
  if (sh && n) sh.getRange('F4').setValue('Terakhir diambil: ' +
    Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'dd/MM/yyyy HH:mm'));
  return n;
}

function pasangAmbilOtomatis_() {
  var ada = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'ambilNilaiOtomatis';
  });
  if (!ada) ScriptApp.newTrigger('ambilNilaiOtomatis').timeBased().everyHours(1).create();
}

// link WhatsApp ke nomor guru, berisi pesan dan link lembarnya
function linkWa_(g, mapel, kelas, url) {
  var teks = 'Assalamu\'alaikum ' + (g.nama || '') + '. Ini lembar nilai ' + mapel + ' kelas ' + kelas +
    '. Silakan isi kotak kuning: ' + url;
  var nomor = g.email.indexOf('@') >= 0 ? '' : g.email;
  return 'https://wa.me/' + nomor + '?text=' + encodeURIComponent(teks);
}

function tampilkanDaftarGuru_(hasil, gagal, kelas) {
  var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var baris = hasil.map(function (h) {
    return '<div style="border:1px solid #dee2e6;border-radius:10px;padding:8px 10px;margin:0 0 8px">' +
      '<b>' + esc(h.nama) + '</b><br><span style="font-size:12px;color:#495057">' + esc(h.mapel) + '</span><br>' +
      '<a href="' + esc(h.url) + '" target="_blank" style="font-size:12px">Buka lembar</a> &nbsp; ' +
      '<a href="' + esc(h.wa) + '" target="_blank" ' +
      'style="font-size:12px;color:#198754">Kirim lewat WhatsApp</a></div>';
  }).join('');
  var catatan = gagal.length ? '<p style="color:#842029;font-size:12px">Lembar guru ini belum bisa dibuka lewat link ' +
    '(periksa nomor/e-mail, atau Drive sekolah melarang berbagi link): ' + esc(gagal.join(', ')) + '</p>' : '';
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Poppins,Arial,sans-serif;color:#212529;font-size:14px">' +
    '<p style="margin:0 0 10px">Lembar nilai sudah siap. Tiap guru hanya melihat mapelnya sendiri. ' +
    'Link WA juga tersimpan di halaman GURU (kolom F).</p>' + catatan + baris +
    '<p style="font-size:11px;color:#6c757d">Nilai dari guru masuk ke file ini otomatis tiap 1 jam.</p></div>')
    .setWidth(440).setHeight(Math.min(560, 150 + hasil.length * 82));
  SpreadsheetApp.getUi().showModalDialog(html, 'Lembar guru');
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
