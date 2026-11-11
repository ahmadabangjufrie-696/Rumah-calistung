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
  NAIK: { gambar: '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', sel: 'H28', fungsi: 'siswaSebelumnya', w: 170, h: 30 },
  TURUN: { gambar: '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', sel: 'I28', fungsi: 'siswaBerikutnya', w: 170, h: 30 },
  CETAK1: { gambar: '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', sel: 'H36', fungsi: 'cetakSiswaIni', w: 170, h: 36 },
  CETAKSEMUA: { gambar: 'iVBORw0KGgoAAAANSUhEUgAAAVQAAABICAYAAACp8Q3hAAAK1UlEQVR42u3ceVAUVx4H8G8PDPcNCgICCl7cQmQVNOCBRy4voEQrm40ao9lEd7OJ59Za5cYkm2g2164uRs1lXC02higBRV2PxQPFeKSAoETiERERFeQ+Zv9wY2h6kDl6hmn3+6mySt7MNN3vvf7O7zU9I8BIfd5I0YCI6CFwbVmmYMzrDXoxQ5SIGK5GBiqDlIgYrEYGKoOUiBis3QerimFKRCRPYalimBIRyROqKoYpEZE8oapimBIRyROqKoYpEZE8oapimBIRyROqKnYJEZE8VKxOiYjkqVJZoRIRyVmhsjolIjK+SmWFSkQkZ4VKRETGE7jcJyJihUpExEAlImKgEhERA5WIiIFKRMRAJSJioBIREQOViIiBSkSkeNb/bwfsaGOHp4bEIyEgHJE+/eHp4AJnWwc0t7Wiqu4Ozt+8goIrJcgtLcD5m1dFr107aQHSo8bo9fs2n8rFij0bAQAFC/4Of9deRu3/Z6fzsCQ3Q9TmZueEMy9tgNpKOpyjMhahrPqnB25T23HN2r4a//7htOS5w/wHY0vacjjZ2Iva1xzehnfyM/U+Hnd7Z8yIHI3R/aIxsFdfuNk5QqMBbjfeRU1TPa7XVqOk6jKKb/yIY5eKcfHWNZ32X59xMVUfmHu/dGXsfJFz7BioCmUlqPDb4VPwwq+egoudo7QjVFYIcOuNALfeGBscg2WJM/H77L9h27kDFn9sU0ITtJ4cAJAakYg3D26V5fcM7xuKz1KXwdHGTtT+5sGteP/ol3pvb1xwDN574kW42ztLHvN2coe3kzsGePphZFCE1rDpCXL3gVLnixLHjkt+mTjb2mN7+kosTUzXGqZdceh00liq1IikLh9LCUuEShCM/h0JgeHYkrZcEiSrD2wxKEgiffpj47RXtZ6QlkruPlDqfFHi2LFClYlaZYWPpr6CEQGhovaGliZsOJmNrOIjKL9VAZUgwM/FCyMDI/BMzAQM8PTTafv6LL/i1r2gtX31+Dl4NmaiqG32l28jt7Sg220Ge/hiaJ+QLh/3dfFEfGA4/lN+zuA+HBUUiU9SlsDO2kbUvmr/p1hfsNOgbS55NF1UJdW3NOHP+z9FXlkhqupq4Ghjh4Fe/hjTfyjSIpLg7eSu1/aNXRabqg/k3i99yTFfTD12DFQL9mzsJIwKihS13WqoRerWVSiqLBe1l1ZdQWnVFWwuzEV61Bg0t7VY/PGldao2WtrbUNtUD48O1UNqeKLBgZrULxqbpy+GrbVa1L5y38fYcCLbsDc5K2uMDAwXtb2bn4lPvt1z/+fmhhYcv1yM45eL8fbhbZgRORpeDq490sem6AOlzheljR2X/DKysVJjYfw0Sfvi3AxJmHakgQZfnNmHzO8OWfTxCRAwLWyUqO3AD6eRVZwvant80HDJMlUXY4Nj8HGKNEj+mLfJqCDxcnCVXMO7WlPV5fNb29vw+em9ePfIv8zex6bqA6XOFyWNHQNVZiMCQkXvvABw4eZVZH9/7KE4voSgcPi5eInasorzkVUkPkEc1LZ4fNBwvbY9LiQWm6a9ChsrteiNZvmej7CpMMeo/W5pa5W0zXnkMfRytKwqxpR9oNT5opSx45LfRIHamdzXr7akrXjg4+HvzUZ1Q61Jji81PFH0c2NrM3afP4H65ib8VHMTvi6eouduP3dA90slna7paqDBktwMfH56r9H7XVV/BxW11fBx9rjfFuM7AAUL1uFQ+Vkcv1KMcxUXcaaiDDWNdT02LqboA6XPF3OMHQPVQnk7eUjadL3HztJpqyL2XjiFuuZGAMDXJUcwP+7J+4/FB4bBz8XrgcuzB10CeSVnPbae2S/b/m8szMGKpFmiNltrNZJDYpEcEgsAaNdoUFRZjp0lR/HZt3m43Xi3x/rbFH2g1PmitLHjkl8mrrYOkrafJ5DSPT5oOBzUtpLl2/3/d1rGCRCQEv6oYWGiufdPTuuOZ3V7jVolCAj37odliTNxbP6HSA55pOcC1QR9oNT5orSxY4UqkztN9ZI2R5nvLe2p22A630t4t7kBe8sK7/98pqIM5bcqEOTu02EZl4T3juh/v6RKELD2sfkQBMhWobVrNFi46wPsLDmK+XFPYnjAEAjo+v5HFztHbJj6MsZvXozSqitmHxe5+uBhmC+mHjtWqBbq+t1qSVuwh6/ij8vXxRPxAWGitt3nT6CptaVTBXJE9HN/jz6I9Ruo0+/ovNQTIGDNpPmYFT1O1mPJu3AS079Yicj352LeV2uxvmAnTl79Hq3tbZLn2lip8ZtO1zVNyVx9oNT5YsljxwrVBI5eKsLCEeLbpkb3j8bKfco+Lm2fZpke9iimh3W/pE8NT0Th1dJun7cibyNmRY27f03s50B5a+I8CIAsf5zq6GZ9DXaVHMOuknt3YLjbO2NF0izMjBorel6Edz+z9bO5+0Cp88USx44Vqgkcu1wk+YtpiKef3rcQWdwJYuC1UACYPCRBdBtQV1raWjF3xxrkXSiUVGl/mTgPT0cnm/QYbzXUYunuDWhsbRZXAFZWZuvnnu4DJc0XSxs7BqoJNLW24AMtn7F+a+I8hPYO6vJ1AgSkR43R6R3c3GJ8ByBEx4/FauNq54gJAx7RK1D2nD8p6Z83Jz6HZ4aON3g/ts/4E5L6RT/w2pu92gbWKvFJWFFbbdb+NmUfKHW+KGXsuOQ3gU0nczAuOBYJHT4u527vjJ1Pv4aME9n4ujgfF//3WX5/114YGRiBXw8dj4Fe/liRZ3nfjpPS6V5CDTSI+fB5XL97S+vz1SorfLdoM5xtf/mqudSIJOwsOapzoDy3Yw0ypv4BEwYMEwXK6xPmQhAEfHxqt97HEdd3MEYGReDS7UpkFefj2OUiFFX+iOqGWtirbRHWOxCLR82QnJSHLp41e5+bqg+UOl+UNHYMVLlPhvY2zNmxBp+mLEWc/+AO76C2WBQ/DYu0fDRVH93dqF1++zri178oy7GorawxJTRB1Ha24ocuT46fj//gxTN4YvAvlzmS+kWhl6MrbtTd0bkP5+1Yi39MeRkTB8aJA2X8vUDZXJhr0DEFuPXGSyOm4qURU7t97qXbldh6dn+PjItcfSDHfum6DVPPF1ONHZf8Fq6msQ7Tt6zEmsPbUKPlVqqu1FvYPavJIbFws3MSteV1Wopq0/H2GODed79ODR2l9xvT81+9g2++Py55bHXyHMyOnaTX9vS9H7jkxiXM+OcqyXU5c785y9kHSp0vShw7Vqgya9O04538TGScyMbk0AQkBIQh0icYHg7O976xv7UFN+ru4EL1VRRcLkFO6XHJN/b3tLTwJElbXtmpbl+3r+wU2jUa0V960yISkXFil96BMj/rr1g3+XeSP+y9ljwbKkHARye/0Wlb0R/OQ5z/YAzzG4QIn/4IcvOGj7MHnGzsoVKpUNfciIraahRVliOntAA5pQVab8fpiVCVqw+UOl+UOnbmIPR5I0UDIiLikp+IiIFKRMRAJSIiBioREQOViIiBSkTEQCUiIgYqEREDlYiIgUpERFBdW5YpsBuIiIxzbVmmwAqViIhLfiIiCwxULvuJiIxb7rNCJSIyxZKfVSoRkeHVKStUIiJTVKisUomIDK9OtVaoDFUiIv3DtMslP0OViEi/MO0yUBmqRET6Z6PK0BcSETFM9QhUhioRke5ZqFdY9nkjRcNuJSIGqQyBymAlIgapzIHKcCUihqjUfwHzcH10npaXQAAAAABJRU5ErkJggg==', sel: 'I36', fungsi: 'cetakSekelas', w: 170, h: 36 }
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
    g.mapel.forEach(function (m) {              // tautan biasa (tanpa rumus: aman untuk pemisah ; atau ,)
      shGuru.getRange(m.baris, 6).setRichTextValue(SpreadsheetApp.newRichTextValue()
        .setText('Buka lembar ' + m.tab).setLinkUrl(url).build());
    });
    hasil.push({ nama: g.nama || g.email, mapel: perlu.join(', '), url: url,
      wa: g.email.indexOf('@') >= 0 ? '' : g.email });
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

function tampilkanDaftarGuru_(hasil, gagal, kelas) {
  var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var baris = hasil.map(function (h) {
    var wa = 'Assalamu\'alaikum ' + h.nama + '. Ini lembar nilai ' + h.mapel + ' kelas ' + kelas +
      '. Silakan isi kotak kuning: ' + h.url;
    return '<div style="border:1px solid #dee2e6;border-radius:10px;padding:8px 10px;margin:0 0 8px">' +
      '<b>' + esc(h.nama) + '</b><br><span style="font-size:12px;color:#495057">' + esc(h.mapel) + '</span><br>' +
      '<a href="' + esc(h.url) + '" target="_blank" style="font-size:12px">Buka lembar</a> &nbsp; ' +
      '<a href="https://wa.me/' + h.wa + '?text=' + encodeURIComponent(wa) + '" target="_blank" ' +
      'style="font-size:12px;color:#198754">Kirim lewat WhatsApp</a></div>';
  }).join('');
  var catatan = gagal.length ? '<p style="color:#842029;font-size:12px">Lembar guru ini belum bisa dibuka lewat link ' +
    '(periksa nomor/e-mail, atau Drive sekolah melarang berbagi link): ' + esc(gagal.join(', ')) + '</p>' : '';
  var html = HtmlService.createHtmlOutput(
    '<div style="font-family:Poppins,Arial,sans-serif;color:#212529;font-size:14px">' +
    '<p style="margin:0 0 10px">Lembar nilai sudah siap. Tiap guru hanya melihat mapelnya sendiri. ' +
    'Link juga tersimpan di halaman GURU.</p>' + catatan + baris +
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
