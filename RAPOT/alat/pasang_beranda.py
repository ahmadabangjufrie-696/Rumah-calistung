"""Memasang halaman BERANDA (tombol AMBIL NILAI) ke file raport .xlsm tanpa Excel.

    python pasang_beranda.py RAPORT_ASLI.xlsm [RAPORT_HASIL.xlsm]

Yang dilakukan:
  1. Modul excel/AmbilNilai.bas dimasukkan ke proyek makro raport.
  2. ThisWorkbook diberi Workbook_Open yang memanggil AmbilNilaiGS.BukaBeranda,
     sehingga BERANDA dibuat (bila belum ada) dan dibuka setiap kali raport dibuka.
  3. Proyek makro ditandai agar Excel menyusun ulang (compile) semua kode dari
     teks sumbernya saat file dibuka (_VBA_PROJECT versi 0xFFFF, sesuai MS-OVBA).
File asli tidak diubah. Bagian lain file raport disalin apa adanya.

Rujukan format: [MS-OVBA] (kompresi, stream dir/PROJECT/PROJECTwm) dan [MS-CFB].
"""
import io, os, re, struct, sys, zipfile
import olefile

NAMA_MODUL = 'AmbilNilaiGS'
DI_SINI = os.path.dirname(os.path.abspath(__file__))
BAS = os.path.join(DI_SINI, '..', 'excel', 'AmbilNilai.bas')

KODE_OPEN = ('Private Sub Workbook_Open()\r\n'
             '    On Error Resume Next\r\n'
             '    ' + NAMA_MODUL + '.BukaBeranda\r\n'
             'End Sub\r\n')


# ---------------------------------------------------------------- MS-OVBA 2.4.1
def dekompres(data):
    if not data or data[0] != 1:
        raise ValueError('bukan CompressedContainer')
    out = bytearray()
    i = 1
    while i < len(data):
        header = struct.unpack_from('<H', data, i)[0]
        size = (header & 0x0FFF) + 3
        compressed = header & 0x8000
        chunk_end = min(i + size, len(data))
        i += 2
        start = len(out)
        if not compressed:
            out += data[i:i + 4096]
            i += 4096
            continue
        while i < chunk_end:
            flags = data[i]
            i += 1
            for bit in range(8):
                if i >= chunk_end:
                    break
                if not (flags >> bit) & 1:
                    out.append(data[i])
                    i += 1
                else:
                    token = struct.unpack_from('<H', data, i)[0]
                    i += 2
                    diff = len(out) - start
                    bits = max((diff - 1).bit_length(), 4)
                    length = (token & (0xFFFF >> bits)) + 3
                    offset = (token >> (16 - bits)) + 1
                    for _ in range(length):
                        out.append(out[-offset])
        i = chunk_end
    return bytes(out)


def kompres(data):
    out = bytearray(b'\x01')
    for cs in range(0, len(data), 4096):
        chunk = data[cs:cs + 4096]
        body = bytearray()
        pos = 0
        index = {}
        while pos < len(chunk):
            flag_at = len(body)
            body.append(0)
            flags = 0
            for bit in range(8):
                if pos >= len(chunk):
                    break
                bits = max((pos - 1).bit_length(), 4) if pos > 0 else 4
                max_len = (0xFFFF >> bits) + 3
                best_len, best_off = 0, 0
                if pos + 3 <= len(chunk):
                    for cand in reversed(index.get(chunk[pos:pos + 3], [])):
                        ln = 0
                        lim = min(max_len, len(chunk) - pos)
                        while ln < lim and chunk[cand + ln] == chunk[pos + ln]:
                            ln += 1
                        if ln > best_len:
                            best_len, best_off = ln, pos - cand
                            if ln == lim:
                                break
                if best_len >= 3:
                    token = ((best_off - 1) << (16 - bits)) | (best_len - 3)
                    body += struct.pack('<H', token)
                    flags |= 1 << bit
                    step = best_len
                else:
                    body.append(chunk[pos])
                    step = 1
                for p in range(pos, pos + step):
                    if p + 3 <= len(chunk):
                        index.setdefault(chunk[p:p + 3], []).append(p)
                pos += step
            body[flag_at] = flags
        if len(body) <= 4096:
            out += struct.pack('<H', 0xB000 | (len(body) + 2 - 3)) + body
        elif len(chunk) == 4096:
            out += struct.pack('<H', 0x3FFF) + chunk          # chunk tanpa kompresi
        else:
            raise ValueError('chunk terakhir tidak bisa dikompres')
    return bytes(out)


# ---------------------------------------------------------------- stream dir
def baca_dir(raw):
    rec, i = [], 0
    while i < len(raw):
        rid = struct.unpack_from('<H', raw, i)[0]
        if rid == 0x0009:                     # PROJECTVERSION: Reserved=4, lalu 6 byte
            rec.append((rid, raw[i + 6:i + 12]))
            i += 12
            continue
        size = struct.unpack_from('<I', raw, i + 2)[0]
        rec.append((rid, raw[i + 6:i + 6 + size]))
        i += 6 + size
    return rec


def tulis_dir(rec):
    out = bytearray()
    for rid, data in rec:
        if rid == 0x0009:
            out += struct.pack('<HI', rid, 4) + data
        else:
            out += struct.pack('<HI', rid, len(data)) + data
    return bytes(out)


def kelompok_modul(rec):
    """indeks awal (0x0019) dan akhir (0x002B) tiap modul."""
    hasil, mulai = [], None
    for k, (rid, _) in enumerate(rec):
        if rid == 0x0019:
            mulai = k
        elif rid == 0x002B and mulai is not None:
            hasil.append((mulai, k))
            mulai = None
    return hasil


def ambil(rec, a, b, rid):
    for k in range(a, b + 1):
        if rec[k][0] == rid:
            return k
    return None


# ---------------------------------------------------------------- MS-CFB (penulis sederhana, versi 3)
FREE, ENDC, FATSECT = 0xFFFFFFFF, 0xFFFFFFFE, 0xFFFFFFFD


def tulis_cfb(berkas):
    """berkas: {'PROJECT': bytes, 'VBA/dir': bytes, ...} -> bytes compound file."""
    # pohon
    root = {'nama': 'Root Entry', 'jenis': 5, 'anak': {}}
    for jalur, isi in berkas.items():
        node = root
        bagian = jalur.split('/')
        for b in bagian[:-1]:
            node = node['anak'].setdefault(b, {'nama': b, 'jenis': 1, 'anak': {}})
        node['anak'][bagian[-1]] = {'nama': bagian[-1], 'jenis': 2, 'isi': isi}

    entri = []

    def daftar(node):
        node['id'] = len(entri)
        entri.append(node)
        for a in node.get('anak', {}).values():
            daftar(a)
    daftar(root)

    def kunci(n):
        return (len(n['nama']), n['nama'].upper())

    def susun(daftar_anak):
        """pohon biner seimbang; hasil id akar atau FREE."""
        if not daftar_anak:
            return FREE
        t = len(daftar_anak) // 2
        n = daftar_anak[t]
        n['kiri'] = susun(daftar_anak[:t])
        n['kanan'] = susun(daftar_anak[t + 1:])
        return n['id']

    for n in entri:
        n.setdefault('kiri', FREE)
        n.setdefault('kanan', FREE)
        anak = sorted(n.get('anak', {}).values(), key=kunci)
        n['anak_id'] = susun(anak) if n['jenis'] in (1, 5) else FREE

    # mini stream (< 4096 byte) dan stream biasa
    mini = bytearray()
    minifat = []
    besar = []
    for n in entri:
        if n['jenis'] != 2:
            continue
        isi = n['isi']
        n['ukuran'] = len(isi)
        if len(isi) == 0:
            n['mulai'] = ENDC
        elif len(isi) < 4096:
            awal = len(mini) // 64
            jml = (len(isi) + 63) // 64
            n['mulai'] = awal
            minifat += [awal + k + 1 for k in range(jml - 1)] + [ENDC]
            mini += isi + b'\0' * (jml * 64 - len(isi))
        else:
            besar.append(n)

    sektor = []          # daftar blok 512 byte
    fat = []

    def tambah(data):
        jml = (len(data) + 511) // 512
        awal = len(sektor)
        for k in range(jml):
            sektor.append(data[k * 512:(k + 1) * 512].ljust(512, b'\0'))
        fat.extend([awal + k + 1 for k in range(jml - 1)] + [ENDC])
        return awal

    for n in besar:
        n['mulai'] = tambah(n['isi'])
    root['mulai'] = tambah(bytes(mini)) if mini else ENDC
    root['ukuran'] = len(mini)
    mf_bytes = b''.join(struct.pack('<I', x) for x in minifat)
    mf_mulai = tambah(mf_bytes) if minifat else ENDC
    mf_jml = (len(mf_bytes) + 511) // 512

    d = bytearray()
    for n in entri:
        nama = n['nama'].encode('utf-16-le')
        e = nama.ljust(64, b'\0')
        e += struct.pack('<HBB', len(nama) + 2, n['jenis'], 1)
        e += struct.pack('<III', n['kiri'], n['kanan'], n['anak_id'])
        e += b'\0' * 16 + struct.pack('<I', 0) + b'\0' * 16
        e += struct.pack('<IQ', n.get('mulai', ENDC) if n['jenis'] != 1 else 0, n.get('ukuran', 0))
        d += e
    while len(d) % 512:
        d += (b'\0' * 64 + struct.pack('<HBB', 0, 0, 0) + struct.pack('<III', FREE, FREE, FREE)
              + b'\0' * 48 + struct.pack('<IQ', 0, 0))[:128]
    dir_mulai = tambah(bytes(d))

    # sektor FAT
    jml_fat = 1
    while (len(sektor) + jml_fat) > jml_fat * 128:
        jml_fat += 1
    if jml_fat > 109:
        raise ValueError('file terlalu besar untuk penulis sederhana ini')
    fat_mulai = len(sektor)
    fat.extend([FATSECT] * jml_fat)
    fat.extend([FREE] * (jml_fat * 128 - len(fat)))
    fb = b''.join(struct.pack('<I', x) for x in fat)
    for k in range(jml_fat):
        sektor.append(fb[k * 512:(k + 1) * 512])

    h = bytearray(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1' + b'\0' * 16)
    h += struct.pack('<HHHHH', 0x3E, 3, 0xFFFE, 9, 6) + b'\0' * 6
    h += struct.pack('<IIIIIIIII', 0, jml_fat, dir_mulai, 0, 4096, mf_mulai, mf_jml, ENDC, 0)
    difat = [fat_mulai + k for k in range(jml_fat)] + [FREE] * (109 - jml_fat)
    h += b''.join(struct.pack('<I', x) for x in difat)
    assert len(h) == 512
    return bytes(h) + b''.join(sektor)


# ---------------------------------------------------------------- utama
def pasang(vba_bin, sumber_modul):
    ole = olefile.OleFileIO(io.BytesIO(vba_bin))
    berkas = {}
    for e in ole.listdir(streams=True, storages=False):
        jalur = '/'.join(e)
        berkas[jalur] = ole.openstream(jalur).read()
    ole.close()

    rec = baca_dir(dekompres(berkas['VBA/dir']))
    halaman_kode = struct.unpack('<H', next(d for r, d in rec if r == 0x0003))[0]
    enc = 'cp%d' % halaman_kode
    grup = kelompok_modul(rec)
    nama_ada = [rec[a][1].decode(enc) for a, _ in grup]
    if NAMA_MODUL in nama_ada:
        raise SystemExit(f'Raport ini sudah berisi modul {NAMA_MODUL}. Tidak perlu dipasang lagi.')

    # ThisWorkbook: sumber + Workbook_Open, offset 0
    for a, b in grup:
        if rec[a][1].decode(enc) == 'ThisWorkbook':
            k_off = ambil(rec, a, b, 0x0031)
            off = struct.unpack('<I', rec[k_off][1])[0]
            src = dekompres(berkas['VBA/ThisWorkbook'][off:])
            if b'Workbook_Open' in src:
                raise SystemExit('ThisWorkbook sudah punya Workbook_Open. Pasang manual lewat Alt+F11.')
            if not src.endswith(b'\r\n'):
                src += b'\r\n'
            src += KODE_OPEN.encode(enc)
            berkas['VBA/ThisWorkbook'] = kompres(src)
            rec[k_off] = (0x0031, struct.pack('<I', 0))
            break
    else:
        raise SystemExit('Modul ThisWorkbook tidak ditemukan.')

    # modul baru: salin bentuk modul biasa (0x0021) yang sudah ada
    contoh = next(((a, b) for a, b in grup if ambil(rec, a, b, 0x0021) is not None), None)
    if contoh is None:
        raise SystemExit('Tidak ada modul biasa untuk dijadikan contoh.')
    a, b = contoh
    baru = []
    for rid, data in rec[a:b + 1]:
        if rid in (0x0019, 0x001A):
            data = NAMA_MODUL.encode(enc)
        elif rid in (0x0047, 0x0032):
            data = NAMA_MODUL.encode('utf-16-le')
        elif rid in (0x001C, 0x0048):
            data = b''
        elif rid == 0x0031:
            data = struct.pack('<I', 0)
        elif rid == 0x001E:
            data = struct.pack('<I', 0)
        baru.append((rid, data))
    akhir = grup[-1][1]
    rec[akhir + 1:akhir + 1] = baru
    k = next(i for i, (r, _) in enumerate(rec) if r == 0x000F)
    rec[k] = (0x000F, struct.pack('<H', struct.unpack('<H', rec[k][1])[0] + 1))
    berkas['VBA/dir'] = kompres(tulis_dir(rec))
    berkas['VBA/' + NAMA_MODUL] = kompres(sumber_modul)

    # paksa Excel menyusun ulang dari teks sumber; buang cache lama
    berkas['VBA/_VBA_PROJECT'] = b'\xCC\x61\xFF\xFF\x00\x00\x00'
    for jalur in [j for j in berkas if re.match(r'VBA/__SRP_\d+$', j)]:
        del berkas[jalur]

    # PROJECT
    p = berkas['PROJECT'].decode(enc)
    baris = p.split('\r\n')
    terakhir = max(i for i, t in enumerate(baris) if t.startswith(('Module=', 'Document=')))
    baris.insert(terakhir + 1, 'Module=' + NAMA_MODUL)
    if '[Workspace]' in baris:
        i = baris.index('[Workspace]') + 1
        while i < len(baris) and baris[i]:
            i += 1
        baris.insert(i, NAMA_MODUL + '=0, 0, 0, 0, C')
    berkas['PROJECT'] = '\r\n'.join(baris).encode(enc)

    # PROJECTwm
    if 'PROJECTwm' in berkas:
        wm = berkas['PROJECTwm']
        assert wm.endswith(b'\0\0')
        berkas['PROJECTwm'] = (wm[:-2] + NAMA_MODUL.encode(enc) + b'\0'
                               + NAMA_MODUL.encode('utf-16-le') + b'\0\0' + b'\0\0')
    return tulis_cfb(berkas)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    asli = sys.argv[1]
    hasil = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(asli)[0] + '_BERANDA.xlsm'
    if os.path.abspath(asli) == os.path.abspath(hasil):
        sys.exit('File hasil harus berbeda dari file asli.')
    sumber = open(BAS, 'rb').read().replace(b'\r\n', b'\n').replace(b'\n', b'\r\n')
    zin = zipfile.ZipFile(asli)
    if 'xl/vbaProject.bin' not in zin.namelist():
        sys.exit('File ini tidak berisi makro (.xlsm).')
    zout = zipfile.ZipFile(hasil, 'w', zipfile.ZIP_DEFLATED)
    for info in zin.infolist():
        with zin.open(info) as f:
            f._expected_crc = None          # satu gambar di raport punya checksum rusak
            data = f.read()
        if info.filename == 'xl/vbaProject.bin':
            data = pasang(data, sumber)
        zout.writestr(info, data)
    zout.close()
    print('Selesai:', hasil)


if __name__ == '__main__':
    main()
