
// ==================================================================================== APLIKASI WEB
// SmartRapor dibuka lewat link (laptop / HP). Data tetap di file Google Sheet ini.
// Masuk memakai nama + PIN. Akun disimpan di Properti Skrip (bukan di lembar), PIN disimpan teracak.
var WEB_HTML = __WEB_HTML__;
var MAPEL_NAMA = __MAPEL_NAMA__;
var WEB = { AKUN: 'SR_AKUN', GARAM: 'SR_GARAM', JAM: 21600, CP: 'CATATAN PONDOK', P5: 'P5 PROYEK ',
            ATUR: 'PENGATURAN', KUNING: '#fff4cc', ASPEK: 7, GURU: 'GURU', GURU1: 5, GURU_MAKS: 60 };

// ?k=KODE = link khusus guru mapel (dari tab GURU), tanpa PIN, hanya mapel itu
function doGet(e) {
  var k = e && e.parameter && e.parameter.k ? String(e.parameter.k).replace(/[^A-Za-z0-9]/g, '').slice(0, 40) : '';
  return HtmlService.createHtmlOutput(WEB_HTML.replace('__KODE__', k))
    .setTitle('SmartRapor')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

// ------------------------------------------------------------------ akun
function akunSemua_() {
  var v = PropertiesService.getScriptProperties().getProperty(WEB.AKUN);
  return v ? JSON.parse(v) : [];
}
function simpanAkunSemua_(a) { PropertiesService.getScriptProperties().setProperty(WEB.AKUN, JSON.stringify(a)); }
function garam_() {
  var p = PropertiesService.getScriptProperties(), g = p.getProperty(WEB.GARAM);
  if (!g) { g = Utilities.getUuid(); p.setProperty(WEB.GARAM, g); }
  return g;
}
function sandi_(pin) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    garam_() + '|' + pin, Utilities.Charset.UTF_8));
}
function cekPin_(pin) {
  pin = String(pin == null ? '' : pin).trim();
  if (!/^[0-9]{4,8}$/.test(pin)) throw new Error('PIN harus angka, 4 sampai 8 digit.');
  return pin;
}
function profil_(a) {
  return { id: a.id, nama: a.nama, peran: a.peran, mapel: a.peran === 'wali' ? SR.MAPEL_SEKOLAH.concat(SR.MAPEL_PONDOK) : (a.mapel || []),
           p5: a.peran === 'wali' || !!a.p5 || !!a.p5n, p5n: a.p5n || null, link: !!a.link };
}

// ------------------------------------------------------------------ link khusus guru (tab GURU)
// Satu baris = satu guru + satu mapel. Kode diisi otomatis; hapus kode = link lama tidak berlaku.
function kodeBaru_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 14); }

function guruDariKode_(kode) {
  kode = String(kode || '');
  if (kode.length < 8) return null;
  var ak = akunSemua_().filter(function (x) { return x.kode === kode && x.peran !== 'wali'; })[0];   // akun guru (aplikasi)
  if (ak) return { id: 'k:' + kode, nama: ak.nama, peran: 'guru', mapel: ak.mapel || [], p5: !!ak.p5, link: true };
  var sh = SpreadsheetApp.getActive().getSheetByName(WEB.GURU);
  if (!sh) return null;
  var v = sh.getRange(WEB.GURU1, 2, WEB.GURU_MAKS, 4).getDisplayValues();          // B nama, C HP, D mapel, E kode
  for (var i = 0; i < v.length; i++) {
    if (v[i][3] !== kode || !v[i][0] || !v[i][2]) continue;
    var m = v[i][2].trim(), p5 = m.match(/^P5 PROYEK (\d)$/);
    if (!p5 && !jenisMapel_(m)) return null;
    return { id: 'k:' + kode, nama: v[i][0], peran: 'guru', mapel: p5 ? [] : [m], p5n: p5 ? +p5[1] : null, link: true };
  }
  return null;
}

function webGuruMasuk(kode) {
  var a = guruDariKode_(kode);
  if (!a) throw new Error('Link ini sudah tidak berlaku. Silakan minta link baru ke wali kelas.');
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('SR_T_' + token, a.id, WEB.JAM);
  return { token: token, saya: profil_(a) };
}

// token masuk berlaku 6 jam sejak dipakai terakhir
function saya_(token, wali) {
  var c = CacheService.getScriptCache(), id = token ? c.get('SR_T_' + token) : null;
  var a = !id ? null : id.indexOf('k:') === 0 ? guruDariKode_(id.slice(2))
        : akunSemua_().filter(function (x) { return x.id === id; })[0];
  if (!a) throw new Error('SESI_HABIS');
  c.put('SR_T_' + token, id, WEB.JAM);
  if (wali && a.peran !== 'wali') throw new Error('Halaman ini khusus wali kelas.');
  return a;
}
function bolehMapel_(a, tab) {
  if (!jenisMapel_(tab)) throw new Error('Mapel ' + tab + ' tidak dikenal.');
  if (a.peran !== 'wali' && (a.mapel || []).indexOf(tab) < 0) throw new Error('Ustadz/Ibu tidak memegang mapel ' + tab + '.');
}
function kunci_(fn) {
  var l = LockService.getScriptLock();
  if (!l.tryLock(30000)) throw new Error('File sedang dipakai menyimpan. Coba lagi sebentar.');
  try { return fn(); } finally { SpreadsheetApp.flush(); l.releaseLock(); }
}
function teks_(v, maks) {
  v = String(v == null ? '' : v).replace(/\r/g, '');
  if (v.length > (maks || 500)) v = v.slice(0, maks || 500);
  return v;
}
function tulisTeks_(v, maks) {        // ditulis apa adanya (tidak dianggap rumus / angka / tanggal)
  v = teks_(v, maks);
  return v === '' ? '' : "'" + v;
}

// isi lama yang ditulis ulang: teks tetap teks (mis. "0089..." tidak berubah jadi angka)
function amankan_(V) {
  return V.map(function (r) {
    return r.map(function (x) { return typeof x === 'string' && x !== '' ? "'" + x : x; });
  });
}

function webDepan() {
  return {
    sekolah: namaRentang_('SR_SEKOLAH'), kelas: namaRentang_('SR_KELAS'), semester: namaRentang_('SR_SEMESTER'),
    tahun: namaRentang_('SR_TAHUN'),
    akun: akunSemua_().filter(function (a) { return a.sandi; }).map(function (a) { return { id: a.id, nama: a.nama, peran: a.peran }; })
  };
}

function webMasuk(id, pin) {
  var c = CacheService.getScriptCache(), ks = 'SR_SALAH_' + id, salah = +(c.get(ks) || 0);
  if (salah >= 5) throw new Error('PIN sudah 5 kali salah. Tunggu 5 menit, lalu coba lagi.');
  var a = akunSemua_().filter(function (x) { return x.id === id; })[0];
  if (!a || a.sandi !== sandi_(String(pin == null ? '' : pin).trim())) {
    c.put(ks, String(salah + 1), 300);
    throw new Error('PIN salah. Sisa percobaan: ' + Math.max(0, 4 - salah) + '.');
  }
  c.remove(ks);
  var token = Utilities.getUuid();
  c.put('SR_T_' + token, a.id, WEB.JAM);
  return { token: token, saya: profil_(a) };
}

function webKeluar(token) { if (token) CacheService.getScriptCache().remove('SR_T_' + token); return true; }

function webSaya(token) { return profil_(saya_(token)); }

function webGantiPin(token, lama, baru) {
  var a = saya_(token);
  if (a.sandi !== sandi_(String(lama == null ? '' : lama).trim())) throw new Error('PIN lama salah.');
  baru = cekPin_(baru);
  return kunci_(function () {
    var semua = akunSemua_();
    semua.forEach(function (x) { if (x.id === a.id) x.sandi = sandi_(baru); });
    simpanAkunSemua_(semua);
    return true;
  });
}

// ------------------------------------------------------------------ akun guru (wali kelas)
function webAkun(token) {
  saya_(token, true);
  return {
    akun: akunSemua_().map(function (a) {
      return { id: a.id, nama: a.nama, peran: a.peran, mapel: a.mapel || [], p5: !!a.p5, hp: a.hp || '', kode: a.kode || '', pin: !!a.sandi };
    }),
    url: urlAplikasi_(), kelas: namaRentang_('SR_KELAS'), semester: namaRentang_('SR_SEMESTER'),
    sekolah: SR.MAPEL_SEKOLAH.map(function (t) { return { tab: t, nama: MAPEL_NAMA[t] || t }; }),
    pondok: SR.MAPEL_PONDOK.map(function (t) { return { tab: t, nama: MAPEL_NAMA[t] || t }; })
  };
}

function webSimpanAkun(token, o) {
  var saya = saya_(token, true);
  var nama = teks_(o.nama, 60).trim();
  if (!nama) throw new Error('Nama wajib diisi.');
  var peran = o.peran === 'wali' ? 'wali' : 'guru';
  var semuaMapel = SR.MAPEL_SEKOLAH.concat(SR.MAPEL_PONDOK);
  var mapel = (o.mapel || []).filter(function (t) { return semuaMapel.indexOf(t) >= 0; });
  return kunci_(function () {
    var semua = akunSemua_();
    if (semua.some(function (x) { return x.nama.toLowerCase() === nama.toLowerCase() && x.id !== o.id; }))
      throw new Error('Nama ' + nama + ' sudah ada. Pakai nama lain.');
    var a = o.id ? semua.filter(function (x) { return x.id === o.id; })[0] : null;
    if (o.id && !a) throw new Error('Akun tidak ditemukan.');
    if (!a) {
      a = { id: Utilities.getUuid().slice(0, 8) };
      if (!o.pin && peran === 'wali') throw new Error('PIN wajib diisi untuk wali kelas.');
      semua.push(a);
    }
    if (peran === 'wali' && !a.sandi && !o.pin) throw new Error('Wali kelas wajib punya PIN.');
    if (a.id === saya.id && peran !== 'wali') throw new Error('Ustadz/Ibu tidak bisa menurunkan akun sendiri.');
    a.nama = nama; a.peran = peran; a.mapel = mapel; a.p5 = !!o.p5;
    a.hp = teks_(o.hp, 30).replace(/[^0-9+]/g, '');
    if (peran === 'guru' && !a.kode) a.kode = kodeBaru_();      // link khusus untuk dikirim lewat WA
    if (peran === 'wali') delete a.kode;
    if (o.pin) a.sandi = sandi_(cekPin_(o.pin));
    simpanAkunSemua_(semua);
    return webAkun(token);
  });
}

// link lama dimatikan, dibuat link baru
function webLinkBaru(token, id) {
  saya_(token, true);
  return kunci_(function () {
    var semua = akunSemua_(), a = semua.filter(function (x) { return x.id === id && x.peran !== 'wali'; })[0];
    if (!a) throw new Error('Akun guru tidak ditemukan.');
    a.kode = kodeBaru_();
    simpanAkunSemua_(semua);
    return webAkun(token);
  });
}

function urlAplikasi_() {
  var u = urlWeb_();
  if (!u) { var g = SpreadsheetApp.getActive().getSheetByName(WEB.GURU); if (g) u = g.getRange('C2').getDisplayValue(); }
  return u;
}

function webHapusAkun(token, id) {
  var saya = saya_(token, true);
  if (id === saya.id) throw new Error('Akun sendiri tidak bisa dihapus.');
  return kunci_(function () {
    simpanAkunSemua_(akunSemua_().filter(function (x) { return x.id !== id; }));
    return webAkun(token);
  });
}

// ------------------------------------------------------------------ beranda
function jenisMapel_(tab) {
  return SR.MAPEL_SEKOLAH.indexOf(tab) >= 0 ? 'umum' : SR.MAPEL_PONDOK.indexOf(tab) >= 0 ? 'pondok' : null;
}

function webBeranda(token) {
  var a = profil_(saya_(token)), ss = SpreadsheetApp.getActive();
  var mapel = [];
  a.mapel.forEach(function (tab) {
    var sh = ss.getSheetByName(tab), j = jenisMapel_(tab);
    if (!sh) return;
    var umum = j === 'umum', lebar = umum ? 17 : 12;            // B..R  /  B..M
    var v = sh.getRange(SR.BARIS_MAPEL, 2, SR.MAKS, lebar).getValues();
    var m = { tab: tab, nama: MAPEL_NAMA[tab] || tab, jenis: j, guru: sh.getRange('C4').getDisplayValue(),
              siswa: 0, lengkap: 0, belum: 0, kosong: 0, rata: '' };
    var jml = 0, n = 0;
    v.forEach(function (r) {
      if (!r[0]) return;
      m.siswa++;
      var st = r[lebar - 1];
      if (st === 'Lengkap') m.lengkap++; else if (st === 'Kosong') m.kosong++; else m.belum++;
      var x = r[umum ? 15 : 9];
      if (typeof x === 'number') { jml += x; n++; }
    });
    if (n) m.rata = jml / n;
    mapel.push(m);
  });
  var hasil = { saya: a, mapel: mapel, siswa: daftarSiswa_().length };
  if (a.peran === 'wali') {
    var eks = ss.getSheetByName(SR.EKSKUL);
    var ab = eks ? eks.getRange(SR.EKS1, 12, SR.MAKS, 3).getValues() : [];
    hasil.absen = ab.reduce(function (t, r) {
      return [t[0] + (+r[0] || 0), t[1] + (+r[1] || 0), t[2] + (+r[2] || 0)];
    }, [0, 0, 0]);
  }
  return hasil;
}

// ------------------------------------------------------------------ nilai mapel
function nilai_(v) {
  if (v === '' || v == null) return '';
  var x = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'));
  if (isNaN(x) || x < 0 || x > 100) throw new Error('Nilai "' + v + '" salah. Isi angka 0 sampai 100.');
  return x;
}
function nomor_(no) {
  no = parseInt(no, 10);
  if (!(no >= 1 && no <= SR.MAKS)) throw new Error('Nomor siswa salah.');
  return no;
}

function bacaMapel_(tab) {
  var sh = SpreadsheetApp.getActive().getSheetByName(tab), j = jenisMapel_(tab);
  if (!sh) throw new Error('Tab ' + tab + ' tidak ada di file ini.');
  var umum = j === 'umum';
  var v = sh.getRange(SR.BARIS_MAPEL, 2, SR.MAKS, umum ? 17 : 12).getValues();
  var baris = [];
  v.forEach(function (r, i) {
    if (!r[0]) return;
    var isi = umum ? r.slice(1, 9).concat([r[11], r[12]]) : r.slice(1, 9);
    baris.push({ no: i + 1, nama: String(r[0]), isi: isi,
                 hasil: umum ? { rs: r[9], ra: r[13], rapor: r[15], status: r[16] }
                             : { teori: r[9], praktik: r[10], status: r[11] } });
  });
  var kktp = sh.getRange('I4').getValue();
  return { tab: tab, nama: MAPEL_NAMA[tab] || tab, jenis: j, guru: sh.getRange('C4').getDisplayValue(),
           kktp: typeof kktp === 'number' ? kktp : Number(kktp) || 70,
           tp: umum ? sh.getRange('C8:J8').getDisplayValues()[0] : [], baris: baris };
}

function webMapel(token, tab) { bolehMapel_(saya_(token), tab); return bacaMapel_(tab); }

// kirim = { guru, tp: [8], ubah: [{no, k, v}] }   k: 0-7 sumatif/tugas+lisan+semester, 8-9 non tes/tes (umum)
function webSimpanMapel(token, tab, kirim) {
  bolehMapel_(saya_(token), tab);
  var sh = SpreadsheetApp.getActive().getSheetByName(tab), umum = jenisMapel_(tab) === 'umum';
  kunci_(function () {
    if (kirim.guru != null) sh.getRange('C4').setValue(tulisTeks_(kirim.guru, 80));
    if (umum && kirim.tp && kirim.tp.length === 8)
      sh.getRange('C8:J8').setValues([kirim.tp.map(function (t) { return tulisTeks_(t, 300); })]);
    var ubah = kirim.ubah || [];
    if (!ubah.length) return;
    var rA = sh.getRange(SR.BARIS_MAPEL, 3, SR.MAKS, 8), A = amankan_(rA.getValues());
    var rB = umum ? sh.getRange(SR.BARIS_MAPEL, 13, SR.MAKS, 2) : null, B = rB ? amankan_(rB.getValues()) : null;
    var adaB = false;
    ubah.forEach(function (u) {
      var no = nomor_(u.no), k = parseInt(u.k, 10), v = nilai_(u.v);
      if (k >= 0 && k < 8) A[no - 1][k] = v;
      else if (umum && (k === 8 || k === 9)) { B[no - 1][k - 8] = v; adaB = true; }
      else throw new Error('Kolom nilai salah.');
    });
    rA.setValues(A);
    if (adaB) rB.setValues(B);
  });
  return bacaMapel_(tab);
}

// ------------------------------------------------------------------ pilihan dari daftar di lembar
function pilihanSel_(sel) {
  var dv = sel.getDataValidation();
  if (!dv) return null;
  var t = dv.getCriteriaType(), c = dv.getCriteriaValues();
  if (t === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) return c[0].map(String);
  if (t === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE)
    return [].concat.apply([], c[0].getDisplayValues()).filter(function (x) { return x !== ''; });
  return null;
}

// ------------------------------------------------------------------ kehadiran, ekskul, catatan
function webEkskul(token) {
  saya_(token, true);
  var ss = SpreadsheetApp.getActive(), e = ss.getSheetByName(SR.EKSKUL), cp = ss.getSheetByName(WEB.CP);
  var v = e.getRange(SR.EKS1, 2, SR.MAKS, 15).getDisplayValues();          // B..P
  var c = cp ? cp.getRange(SR.BARIS_MAPEL, 3, SR.MAKS, 5).getDisplayValues() : [];   // C..G
  var siswa = [];
  v.forEach(function (r, i) {
    if (!r[0]) return;
    var p = c[i] || ['', '', '', '', ''];
    siswa.push({ no: i + 1, nama: r[0], eks: r.slice(1, 9), prestasi: r[9], s: r[10], i: r[11], a: r[12],
                 catatan: r[13], keputusan: r[14], pb: p.slice(0, 4), cpondok: p[4] });
  });
  var baris = SR.EKS1;
  return {
    siswa: siswa, adaPondok: !!cp,
    pilihan: {
      kegiatan: pilihanSel_(e.getRange('C' + baris)) || [], ket: pilihanSel_(e.getRange('D' + baris)) || [],
      keputusan: pilihanSel_(e.getRange('P' + baris)) || [],
      perlu: cp ? (pilihanSel_(cp.getRange('C' + SR.BARIS_MAPEL)) || []) : [],
      catatanPondok: cp ? (pilihanSel_(cp.getRange('G' + SR.BARIS_MAPEL)) || []) : [],
      bawaan: cp ? cp.getRange('C8:F8').getDisplayValues()[0] : []
    }
  };
}

function angkaHadir_(v) {
  if (v === '' || v == null) return '';
  var x = parseInt(v, 10);
  if (isNaN(x) || x < 0 || x > 200) throw new Error('Jumlah hari "' + v + '" salah.');
  return x;
}

// ubah = [{no, eks:[8], prestasi, s, i, a, catatan, keputusan, pb:[4], cpondok}] (hanya bagian yang berubah)
function webSimpanEkskul(token, ubah) {
  saya_(token, true);
  var ss = SpreadsheetApp.getActive(), e = ss.getSheetByName(SR.EKSKUL), cp = ss.getSheetByName(WEB.CP);
  kunci_(function () {
    var rE = e.getRange(SR.EKS1, 3, SR.MAKS, 14), E = amankan_(rE.getValues());               // C..P
    var rC = cp ? cp.getRange(SR.BARIS_MAPEL, 3, SR.MAKS, 5) : null, C = rC ? amankan_(rC.getValues()) : null;
    var adaC = false;
    (ubah || []).forEach(function (u) {
      var r = E[nomor_(u.no) - 1];
      if (u.eks) u.eks.forEach(function (x, k) { if (k < 8 && x != null) r[k] = tulisTeks_(x, 200); });
      if (u.prestasi != null) r[8] = tulisTeks_(u.prestasi, 300);
      if (u.s != null) r[9] = angkaHadir_(u.s);
      if (u.i != null) r[10] = angkaHadir_(u.i);
      if (u.a != null) r[11] = angkaHadir_(u.a);
      if (u.catatan != null) r[12] = tulisTeks_(u.catatan, 1000);
      if (u.keputusan != null) r[13] = tulisTeks_(u.keputusan, 100);
      if (C && (u.pb || u.cpondok != null)) {
        var p = C[u.no - 1];
        if (u.pb) u.pb.forEach(function (x, k) { if (k < 4 && x != null) p[k] = tulisTeks_(x, 300); });
        if (u.cpondok != null) p[4] = tulisTeks_(u.cpondok, 500);
        adaC = true;
      }
    });
    rE.setValues(E);
    if (adaC) rC.setValues(C);
  });
  return webEkskul(token);
}

// ------------------------------------------------------------------ P5
function lembarP5_(n) {
  n = parseInt(n, 10);
  var sh = SpreadsheetApp.getActive().getSheetByName(WEB.P5 + n);
  if (!sh) throw new Error('Tab P5 PROYEK ' + n + ' tidak ada.');
  return sh;
}
function bolehP5_(token, n) {
  var a = saya_(token);
  if (a.peran !== 'wali' && !a.p5 && !a.p5n) throw new Error('Ustadz/Ibu belum diberi akses P5. Minta ke wali kelas.');
  if (a.p5n && parseInt(n, 10) !== a.p5n) throw new Error('Link ini hanya untuk P5 PROYEK ' + a.p5n + '.');
  return a;
}

function webP5(token, n) {
  var saya = bolehP5_(token, n);
  var sh = lembarP5_(n), A = WEB.ASPEK;
  var kepala = sh.getRange(7, 3, 2, A).getDisplayValues();
  var v = sh.getRange(SR.BARIS_MAPEL, 2, SR.MAKS, A + 2).getDisplayValues();      // B..J
  var siswa = [];
  v.forEach(function (r, i) { if (r[0]) siswa.push({ no: i + 1, nama: r[0], isi: r.slice(1, A + 1), catatan: r[A + 1] }); });
  var proyek = [];
  for (var k = 1; k <= 3; k++) {
    var s = SpreadsheetApp.getActive().getSheetByName(WEB.P5 + k);
    if (s && (!saya.p5n || saya.p5n === k)) proyek.push({ n: k, judul: s.getRange('C4').getDisplayValue() });
  }
  return { n: parseInt(n, 10), judul: sh.getRange('C4').getDisplayValue(), desk: sh.getRange('C5').getDisplayValue(),
           dimensi: kepala[0], sub: kepala[1], siswa: siswa, proyek: proyek };
}

// kirim = { judul, desk, dimensi:[7], sub:[7], ubah:[{no, k (0-6 aspek, 7 catatan), v}] }
function webSimpanP5(token, n, kirim) {
  bolehP5_(token, n);
  var sh = lembarP5_(n), A = WEB.ASPEK, BOLEH = ['', 'BB', 'MB', 'BSH', 'SB'];
  kunci_(function () {
    if (kirim.judul != null) sh.getRange('C4').setValue(tulisTeks_(kirim.judul, 200));
    if (kirim.desk != null) sh.getRange('C5').setValue(tulisTeks_(kirim.desk, 1500));
    if (kirim.dimensi && kirim.sub && kirim.dimensi.length === A && kirim.sub.length === A)
      sh.getRange(7, 3, 2, A).setValues([kirim.dimensi.map(function (t) { return tulisTeks_(t, 200); }),
                                         kirim.sub.map(function (t) { return tulisTeks_(t, 600); })]);
    var ubah = kirim.ubah || [];
    if (!ubah.length) return;
    var rg = sh.getRange(SR.BARIS_MAPEL, 3, SR.MAKS, A + 1), V = amankan_(rg.getValues());
    ubah.forEach(function (u) {
      var no = nomor_(u.no), k = parseInt(u.k, 10);
      if (k >= 0 && k < A) {
        var x = String(u.v || '').toUpperCase();
        if (BOLEH.indexOf(x) < 0) throw new Error('Pilih BB, MB, BSH, atau SB.');
        V[no - 1][k] = x;
      } else if (k === A) V[no - 1][k] = tulisTeks_(u.v, 600);
      else throw new Error('Kolom P5 salah.');
    });
    rg.setValues(V);
  });
  return webP5(token, n);
}

// ------------------------------------------------------------------ data siswa
function webSiswa(token) {
  saya_(token, true);
  var sh = SpreadsheetApp.getActive().getSheetByName(SR.SISWA);
  var lebar = 27;                                                     // A..AA
  var kepala = sh.getRange(SR.SISWA1 - 1, 1, 1, lebar).getDisplayValues()[0];
  var v = sh.getRange(SR.SISWA1, 1, SR.MAKS, lebar).getDisplayValues();
  var pilihan = {};
  for (var k = 2; k <= lebar; k++) {
    var p = pilihanSel_(sh.getRange(SR.SISWA1, k));
    if (p) pilihan[k - 1] = p;
  }
  return { kolom: kepala, pilihan: pilihan,
           siswa: v.map(function (r, i) { return { no: i + 1, isi: r }; }) };
}

// ubah = { indeksKolom (1..26): nilai }  — kolom 0 (No) tidak boleh diubah
function webSimpanSiswa(token, no, ubah) {
  saya_(token, true);
  no = nomor_(no);
  var sh = SpreadsheetApp.getActive().getSheetByName(SR.SISWA);
  kunci_(function () {
    var baris = SR.SISWA1 + no - 1;
    Object.keys(ubah || {}).forEach(function (k) {          // hanya kotak yang berubah yang ditulis
      var i = parseInt(k, 10);
      if (!(i >= 1 && i <= 26)) throw new Error('Kolom siswa salah.');
      var x = teks_(ubah[k], 300).trim();
      sh.getRange(baris, i + 1).setValue(tulisTeks_(i === 3 ? x.toUpperCase() : x, 300));   // nama huruf besar
    });
  });
  return webSiswa(token);
}

// tempel banyak siswa sekaligus (disalin dari Excel / Google Sheet lain).
// Kolom sudah dikenali di aplikasi: data = [[null, NIS, NISN, Nama, ...]] (indeks 1..26, null = tidak diubah).
function webTempelSiswa(token, mulaiNo, data) {
  saya_(token, true);
  mulaiNo = nomor_(mulaiNo);
  data = (data || []).filter(function (r) { return r && r.some(function (x) { return x != null && String(x).trim(); }); });
  if (!data.length) throw new Error('Belum ada data yang ditempel.');
  if (mulaiNo + data.length - 1 > SR.MAKS)
    throw new Error(data.length + ' siswa tidak muat: mulai nomor ' + mulaiNo + ' hanya cukup sampai nomor ' + SR.MAKS + '.');
  var sh = SpreadsheetApp.getActive().getSheetByName(SR.SISWA);
  kunci_(function () {
    var rg = sh.getRange(SR.SISWA1 + mulaiNo - 1, 2, data.length, 26), V = amankan_(rg.getValues());   // B..AA
    data.forEach(function (r, i) {
      for (var k = 1; k <= 26; k++) {
        if (r[k] == null) continue;
        var x = teks_(r[k], 300).trim();
        V[i][k - 1] = tulisTeks_(k === 3 ? x.toUpperCase() : x, 300);
      }
    });
    rg.setValues(V);
  });
  return webSiswa(token);
}

// hapus siswa (pindah sekolah): baris siswa di SISWA dan semua isian nilainya dibuang,
// siswa sesudahnya naik satu nomor supaya urutan di semua halaman tetap cocok.
function webHapusSiswa(token, no, nama) {
  saya_(token, true);
  no = nomor_(no);
  var ss = SpreadsheetApp.getActive(), sw = ss.getSheetByName(SR.SISWA);
  var sekarang = sw.getRange(SR.SISWA1 + no - 1, 4).getDisplayValue();
  if (String(nama || '') !== sekarang) throw new Error('Data siswa sudah berubah. Muat ulang halaman, lalu coba lagi.');
  var bagian = [[SR.SISWA, SR.SISWA1, 2, 26], [SR.EKSKUL, SR.EKS1, 3, 14], [WEB.CP, SR.BARIS_MAPEL, 3, 5]];
  SR.MAPEL_SEKOLAH.forEach(function (t) { bagian.push([t, SR.BARIS_MAPEL, 3, 8], [t, SR.BARIS_MAPEL, 13, 2]); });
  SR.MAPEL_PONDOK.forEach(function (t) { bagian.push([t, SR.BARIS_MAPEL, 3, 8]); });
  for (var k = 1; k <= 3; k++) bagian.push([WEB.P5 + k, SR.BARIS_MAPEL, 3, WEB.ASPEK + 1]);
  kunci_(function () {
    bagian.forEach(function (b) {
      var sh = ss.getSheetByName(b[0]);
      if (!sh) return;
      var rg = sh.getRange(b[1], b[2], SR.MAKS, b[3]), V = rg.getValues();
      var sisa = V.slice(no - 1).some(function (r) { return r.some(function (x) { return x !== ''; }); });
      if (!sisa) return;                                     // tidak ada isian dari siswa ini ke bawah
      V = amankan_(V);
      V.splice(no - 1, 1);
      V.push(V[0].map(function () { return ''; }));
      rg.setValues(V);
    });
  });
  SpreadsheetApp.flush();
  var daftar = daftarSiswa_();                               // pilihan siswa di BERANDA
  var pilihan = ss.getSheetByName(SR.BERANDA).getRange(SR.PILIH);
  if (daftar.length && !pilihan.getFormulas()[0][0]) pilihan.setValue(daftar[0]);
  return webSiswa(token);
}

// ------------------------------------------------------------------ pengaturan
// Dibaca dari lembar PENGATURAN apa adanya: kotak kuning = boleh diisi, berdaftar = dipilih.
function webPengaturan(token) {
  saya_(token, true);
  var sh = SpreadsheetApp.getActive().getSheetByName(WEB.ATUR);
  var akhir = Math.min(sh.getLastRow(), 120), n = akhir - 4;
  var rg = sh.getRange(5, 2, n, 2);
  var nilai = rg.getDisplayValues(), rumus = rg.getFormulas(), latar = rg.getBackgrounds(),
      tebal = rg.getFontWeights(), dv = sh.getRange(5, 3, n, 1).getDataValidations();
  var isi = [];
  for (var i = 0; i < n; i++) {
    var b = nilai[i][0], c = nilai[i][1], r = i + 5;
    if (!b && !c) continue;
    if (String(latar[i][1]).toLowerCase() === WEB.KUNING) {
      var p = null;
      if (dv[i][0]) p = pilihanSel_(sh.getRange(r, 3));
      isi.push({ r: r, label: b.trim(), sub: /^\s/.test(b), nilai: c, pilihan: p, panjang: c.length > 60 || c.indexOf('\n') >= 0 });
    } else if (rumus[i][1]) {
      isi.push({ r: r, label: b.trim(), sub: /^\s/.test(b), nilai: c, otomatis: true });
    } else if (b && tebal[i][0] === 'bold') {
      isi.push({ judul: b.trim(), petunjuk: c });
    }
  }
  return { isi: isi };
}

function webSimpanPengaturan(token, ubah) {
  saya_(token, true);
  var sh = SpreadsheetApp.getActive().getSheetByName(WEB.ATUR);
  kunci_(function () {
    (ubah || []).forEach(function (u) {
      var r = parseInt(u.r, 10);
      if (!(r >= 5 && r <= 120)) throw new Error('Baris pengaturan salah.');
      var sel = sh.getRange(r, 3);
      if (String(sel.getBackground()).toLowerCase() !== WEB.KUNING) throw new Error('Kotak ini tidak boleh diubah.');
      var v = teks_(u.v, 1000), p = pilihanSel_(sel);
      if (p) {
        if (p.indexOf(v) < 0) throw new Error('"' + v + '" tidak ada dalam daftar pilihan.');
        sel.setValue(/^[0-9]+$/.test(v) ? Number(v) : tulisTeks_(v, 1000));
      } else sel.setValue(tulisTeks_(v, 1000));
    });
  });
  return webPengaturan(token);
}

// ------------------------------------------------------------------ cetak (wali kelas)
function webCetakData(token) { saya_(token, true); return dataPanel_(); }
function webPratinjau(token, no, jenis) {
  saya_(token, true);
  if (!JENIS[jenis]) throw new Error('Jenis raport salah.');
  return pratinjau_(no, jenis);
}
function webCetak(token, o) { saya_(token, true); return cetakPanel_(o || {}); }
function webProgres(token, id) { saya_(token, true); return progres_(id); }

// ------------------------------------------------------------------ dari menu Google Sheet
function urlWeb_() {
  try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; }
}

function aturPinWali() {
  var ui = ui_();
  if (!ui) return;
  var semua = akunSemua_(), wali = semua.filter(function (a) { return a.peran === 'wali'; })[0];
  var nama = wali ? wali.nama : '';
  if (!wali) {
    var jn = ui.prompt('SmartRapor - Aplikasi web', 'Nama wali kelas (untuk masuk ke aplikasi web):', ui.ButtonSet.OK_CANCEL);
    if (jn.getSelectedButton() !== ui.Button.OK) return;
    nama = jn.getResponseText().trim();
    if (!nama) { pesan_('Nama belum diisi.'); return; }
  }
  var jp = ui.prompt('SmartRapor - Aplikasi web', (wali ? 'PIN baru untuk ' + nama : 'PIN untuk ' + nama) +
    '\n(angka 4 sampai 8 digit, jangan diberitahukan ke orang lain):', ui.ButtonSet.OK_CANCEL);
  if (jp.getSelectedButton() !== ui.Button.OK) return;
  var pin;
  try { pin = cekPin_(jp.getResponseText()); } catch (e) { pesan_(e.message); return; }
  if (wali) wali.sandi = sandi_(pin);
  else semua.push({ id: Utilities.getUuid().slice(0, 8), nama: nama, peran: 'wali', mapel: [], p5: true, sandi: sandi_(pin) });
  simpanAkunSemua_(semua);
  pesan_('PIN wali kelas sudah disimpan.\n\nNama: ' + nama + '\n\nLangkah berikutnya: menu SmartRapor › Aplikasi web: buka / lihat link.');
}

function aplikasiWeb() {
  if (!ui_()) return;
  var url = urlWeb_(), g = SpreadsheetApp.getActive().getSheetByName(WEB.GURU);
  if (url && g && !g.getRange('C2').getDisplayValue()) g.getRange('C2').setValue(url);
  var adaWali = akunSemua_().some(function (a) { return a.peran === 'wali'; });
  var langkah = '<ol style="margin:6px 0 0 18px;padding:0;line-height:1.6">' +
    '<li>Buka <b>Ekstensi › Apps Script</b>.</li>' +
    '<li>Klik tombol biru <b>Terapkan</b> (kanan atas) › <b>Deployment baru</b>.</li>' +
    '<li>Klik ikon gerigi ⚙ › pilih <b>Aplikasi web</b>.</li>' +
    '<li>Jalankan sebagai: <b>Saya</b>. Yang memiliki akses: <b>Siapa saja</b>.</li>' +
    '<li>Klik <b>Terapkan</b>, izinkan akses, lalu salin <b>URL aplikasi web</b>.</li></ol>';
  var isi = '<div style="font-family:Poppins,Arial,sans-serif;font-size:13.5px;color:#212529;line-height:1.5">' +
    (adaWali ? '' : '<p style="background:#fdecea;color:#842029;padding:8px 10px;border-radius:8px;margin:0 0 10px">' +
      'Buat dulu PIN wali kelas: menu SmartRapor › <b>Aplikasi web: buat / ganti PIN wali kelas</b>.</p>') +
    (url ? '<p style="margin:0 0 8px">Link aplikasi web SmartRapor:</p>' +
      '<input value="' + url + '" readonly onclick="this.select()" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:8px;font-size:12px">' +
      '<p style="margin:12px 0"><a href="' + url + '" target="_blank" style="background:#0F5132;color:#fff;padding:10px 18px;' +
      'border-radius:10px;text-decoration:none;font-weight:600">Buka aplikasi web</a></p>' +
      '<p style="margin:0;font-size:12px;color:#6c757d">Kirim link ini ke guru lewat WhatsApp. Guru masuk dengan nama + PIN ' +
      'atau lewat link khusus dari tab <b>GURU</b> (menu SmartRapor › 📲 Siapkan tab GURU).<br>Setiap kali kode diganti, lakukan <b>Terapkan › Kelola deployment › ✎ › Versi: Versi baru</b>.</p>'
      : '<p style="margin:0">Aplikasi web belum diterbitkan. Caranya (cukup sekali):</p>' + langkah) + '</div>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(isi).setWidth(460).setHeight(url ? 300 : 330),
    'SmartRapor - Aplikasi web');
}

// ------------------------------------------------------------------ tab GURU: kirim link lewat WhatsApp
var GURU_HP = 'SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(C{r}&"";" ";"");"-";"");"+";"");".";"")';

function siapkanGuru() {
  if (!ui_()) return;
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(WEB.GURU), baru = !sh;
  if (baru) {
    sh = ss.insertSheet(WEB.GURU, Math.min(3, ss.getSheets().length));
    bentukGuru_(sh);
  }
  var url = urlWeb_();
  if (url && !sh.getRange('C2').getDisplayValue()) sh.getRange('C2').setValue(url);
  isiKodeGuru_(sh, WEB.GURU1, WEB.GURU_MAKS);
  sh.activate();
  pesan_((baru ? 'Tab GURU sudah dibuat.\n\n' : '') +
    'Cara pakai:\n1. Isi nama guru, nomor HP (WhatsApp), dan pilih mapel. Satu baris = satu mapel.\n' +
    '2. Klik "📲 Kirim ke WA" di baris itu, lalu klik linknya. WhatsApp terbuka dengan pesan siap kirim.\n\n' +
    'Guru membuka link tanpa PIN dan hanya bisa mengisi mapel itu.\nHapus kode di kolom E bila link lama harus dimatikan (kode baru dibuat otomatis).' +
    (sh.getRange('C2').getDisplayValue() ? '' : '\n\nPENTING: link aplikasi web belum ada di kotak C2. Terbitkan dulu aplikasi web, lalu tempel linknya di C2.'));
}

function bentukGuru_(sh) {
  var HIJAU = '#0F5132', akhir = WEB.GURU1 + WEB.GURU_MAKS - 1;
  sh.getRange('A1').setValue('Guru Mapel · Kirim Link Isi Nilai').setFontSize(16).setFontWeight('bold').setFontColor(HIJAU);
  sh.getRange('A2').setValue('Link aplikasi web:').setFontWeight('bold');
  sh.getRange('C2:E2').merge().setBackground('#fff4cc').setFontSize(9);
  sh.getRange('A3').setValue('Isi nama, nomor HP, pilih mapel (satu baris = satu mapel). Kode dibuat otomatis. ' +
    'Klik "📲 Kirim ke WA" lalu klik linknya. Hapus kode = link lama tidak berlaku.').setFontSize(9).setFontColor('#6c757d');
  var kepala = ['No', 'Nama Guru', 'No. HP (WhatsApp)', 'Mapel', 'Kode (otomatis)', 'Kirim link', 'Nilai lengkap'];
  sh.getRange(4, 1, 1, 7).setValues([kepala]).setFontWeight('bold').setFontColor('#ffffff').setBackground(HIJAU)
    .setHorizontalAlignment('center');
  var n = WEB.GURU_MAKS, no = [], rumus = [];
  for (var i = 0; i < n; i++) {
    var r = WEB.GURU1 + i, hp = GURU_HP.replace(/\{r\}/g, r);
    no.push([i + 1]);
    var nomor = 'IF(LEFT(' + hp + ';1)="0";"62"&MID(' + hp + ';2;20);IF(LEFT(' + hp + ';1)="8";"62"&' + hp + ';' + hp + '))';
    var teks = '"Assalamu\'alaikum "&B' + r + '&"."&CHAR(10)&"Mohon bantuannya mengisi nilai *"&D' + r + '&"* kelas "&SR_KELAS&" semester "&SR_SEMESTER&" lewat link berikut:"&CHAR(10)&$C$2&"?k="&E' + r +
      '&CHAR(10)&CHAR(10)&"Link ini khusus untuk Ustadz/Ibu, mohon tidak disebarkan. Setelah mengisi, tekan tombol Simpan. Jazakumullah khairan."';
    rumus.push([
      '=IF(OR(B' + r + '="";C' + r + '="";D' + r + '="";E' + r + '="";$C$2="");"";HYPERLINK("https://wa.me/"&' + nomor + '&"?text="&ENCODEURL(' + teks + ');"📲 Kirim ke WA"))',
      '=IF(OR(B' + r + '="";D' + r + '="";LEFT(D' + r + ';2)="P5");"";IFERROR(COUNTIF(INDIRECT("\'"&D' + r + '&"\'!M9:R48");"Lengkap")&" / "&COUNTA(SISWA!$D$5:$D$44);""))'
    ]);
  }
  sh.getRange(WEB.GURU1, 1, n, 1).setValues(no).setHorizontalAlignment('center');
  // rumus ditulis dengan pemisah ; (file berbahasa Indonesia). Bila file memakai koma, ; diubah menjadi ,
  var pemisah = pemisahRumus_(sh);
  sh.getRange(WEB.GURU1, 6, n, 2).setFormulas(rumus.map(function (b) {
    return b.map(function (f) { return pemisah === ';' ? f : f.replace(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ','); });
  }));
  sh.getRange(WEB.GURU1, 2, n, 3).setBackground('#fff4cc');
  sh.getRange(WEB.GURU1, 3, n, 1).setNumberFormat('@');
  sh.getRange(WEB.GURU1, 5, n, 1).setFontColor('#9b8f6c').setFontSize(8);
  sh.getRange(WEB.GURU1, 6, n, 2).setHorizontalAlignment('center');
  var pilihan = SR.MAPEL_SEKOLAH.concat(SR.MAPEL_PONDOK, ['P5 PROYEK 1', 'P5 PROYEK 2', 'P5 PROYEK 3']);
  sh.getRange(WEB.GURU1, 4, n, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(pilihan, true).setAllowInvalid(false).build());
  sh.getRange(4, 1, n + 1, 7).setBorder(true, true, true, true, true, true, '#d9d2bd', SpreadsheetApp.BorderStyle.SOLID);
  [5, 26, 18, 16, 14, 16, 13].forEach(function (w, i) { sh.setColumnWidth(i + 1, w * 7); });
  sh.setFrozenRows(4);
  sh.setTabColor('#B8932E');
}

// beri kode acak untuk baris yang sudah ada nama + mapel (dipanggil juga dari onEdit)
function isiKodeGuru_(sh, baris, jumlah) {
  var r1 = Math.max(baris, WEB.GURU1), r2 = Math.min(baris + jumlah - 1, WEB.GURU1 + WEB.GURU_MAKS - 1);
  if (r2 < r1) return;
  var rg = sh.getRange(r1, 2, r2 - r1 + 1, 4), v = rg.getDisplayValues(), ubah = false;
  var kode = v.map(function (r) {
    if (r[0] && r[2] && !r[3]) { ubah = true; return [Utilities.getUuid().replace(/-/g, '').slice(0, 14)]; }
    return [r[3]];
  });
  if (ubah) sh.getRange(r1, 5, kode.length, 1).setValues(kode);
}

// pemisah rumus file ini: coba tulis =SUM(1;2) lalu lihat hasilnya
function pemisahRumus_(sh) {
  var sel = sh.getRange('H1');
  sel.setFormula('=SUM(1;2)');
  SpreadsheetApp.flush();
  var ok = sel.getValue() === 3;
  sel.clearContent();
  return ok ? ';' : ',';
}
