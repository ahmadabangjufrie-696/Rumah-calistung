"""Memindahkan nilai dari Google Sheet ke file raport .xlsm dengan mengubah XML
sheet secara langsung (makro, tombol, dan bentuk tetap utuh).

Pemakaian:
  python isi_raport.py RAPORT_ASLI.xlsm [RAPORT_TERISI.xlsm] [--offline] [--tes]

  --offline  pakai salinan CSV di folder data_gs (tanpa internet)
  --tes      timpa daftar siswa di sheet "siswa" dengan nama dari Google Sheet
             (hanya untuk file raport contoh, JANGAN untuk raport asli)
"""
import sys, os, re, zipfile, argparse, difflib
from lxml import etree
from openpyxl.utils import column_index_from_string as ci, get_column_letter as gl
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gsdata as G

ap = argparse.ArgumentParser()
ap.add_argument('asli')
ap.add_argument('hasil', nargs='?')
ap.add_argument('--offline', action='store_true')
ap.add_argument('--tes', action='store_true')
A = ap.parse_args()
SRC = A.asli
DST = A.hasil or os.path.splitext(SRC)[0] + '_TERISI.xlsm'
if os.path.abspath(SRC) == os.path.abspath(DST):
    sys.exit('File hasil harus berbeda dari file raport asli.')
NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
N = '{%s}' % NS
zin = zipfile.ZipFile(SRC)

def read(name):
    with zin.open(name) as f:
        f._expected_crc = None  # one embedded picture has a bad checksum
        return f.read()

# sheet name -> xml part
wbx = etree.fromstring(read('xl/workbook.xml'))
rels = etree.fromstring(read('xl/_rels/workbook.xml.rels'))
rid2t = {r.get('Id'): r.get('Target') for r in rels}
RNS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'
part = {s.get('name'): 'xl/' + rid2t[s.get(RNS)].lstrip('/').replace('xl/', '')
        for s in wbx.iter(N + 'sheet')}
trees = {}
def sheet(name):
    if name not in trees:
        trees[name] = etree.fromstring(read(part[name]))
    return trees[name]

log = []
def setc(sname, ref, val, force=False):
    root = sheet(sname)
    sd = root.find(N + 'sheetData')
    m = re.match(r'([A-Z]+)(\d+)', ref); col, rn = ci(m.group(1)), int(m.group(2))
    row = None
    for r in sd.findall(N + 'row'):
        n = int(r.get('r'))
        if n == rn: row = r; break
        if n > rn:
            row = etree.Element(N + 'row', r=str(rn)); r.addprevious(row); break
    if row is None:
        row = etree.SubElement(sd, N + 'row', r=str(rn))
    cell = None
    for c in row.findall(N + 'c'):
        cc = ci(re.match(r'[A-Z]+', c.get('r')).group())
        if cc == col: cell = c; break
        if cc > col:
            cell = etree.Element(N + 'c', r=ref); c.addprevious(cell); break
    if cell is None:
        if val in (None, ''): return
        cell = etree.SubElement(row, N + 'c', r=ref)
    f = cell.find(N + 'f')
    if f is not None:
        if val in (None, ''): return
        if not force:
            log.append(f'LEWATI rumus {sname}!{ref}'); return
        if f.get('t') == 'shared' and f.get('ref'):
            # cell is the master of a shared formula: give every dependent its own formula first
            from openpyxl.formula.translate import Translator
            si, master = f.get('si'), f.text
            for oc in root.iter(N + 'c'):
                of = oc.find(N + 'f')
                if oc is not cell and of is not None and of.get('t') == 'shared' and of.get('si') == si:
                    of.text = Translator('=' + master, origin=ref).translate_formula(oc.get('r'))[1:]
                    for a in ('t', 'si', 'ref'): of.attrib.pop(a, None)
        log.append(f'rumus diganti nilai GS {sname}!{ref}')
    for ch in list(cell): cell.remove(ch)
    cell.attrib.pop('t', None)
    if val in (None, ''): return
    if isinstance(val, (int, float)):
        etree.SubElement(cell, N + 'v').text = repr(val) if isinstance(val, float) else str(val)
    else:
        cell.set('t', 'inlineStr')
        etree.SubElement(etree.SubElement(cell, N + 'is'), N + 't').text = val

def num(s):
    s = (s or '').strip()
    if not s: return None
    try: f = float(s)
    except ValueError: return None
    return int(f) if f == int(f) else f

def nilai_sel(sname, ref):
    """Isi sel (teks atau angka) seperti tersimpan di file."""
    for c in sheet(sname).iter(N + 'c'):
        if c.get('r') == ref:
            t = c.get('t')
            if t == 'inlineStr':
                return ''.join(c.find(N + 'is').itertext())
            v = c.find(N + 'v')
            if v is None: return ''
            if t == 's': return shared[int(v.text)]
            return v.text or ''
    return ''

try:
    sst = etree.fromstring(read('xl/sharedStrings.xml'))
    shared = [''.join(si.itertext()) for si in sst.iter(N + 'si')]
except KeyError:
    shared = []

MAXN = 40
print('Mengambil nilai dari Google Sheet ...')
GS = G.ambil_semua(os.path.join(HERE, 'data_gs'), offline=A.offline)

# 1) daftar siswa
if A.tes:
    # hanya untuk raport contoh: ganti daftar siswa dengan nama dari tab PKN
    students = [asli for asli, _ in GS['PKN'].values()][:MAXN]
    for i in range(MAXN):
        r = 7 + i
        for c in range(2, 31):  # B..AD dikosongkan
            setc('siswa', f'{gl(c)}{r}', None)
        if i < len(students):
            setc('siswa', f'D{r}', students[i])
            setc('siswa', f'F{r}', 'L')
            setc('siswa', f'I{r}', 'Islam')
else:
    # raport asli: daftar siswa dibaca dari sheet "siswa", tidak diubah
    students = [nilai_sel('siswa', f'D{7 + i}').strip() for i in range(MAXN)]
    while students and not students[-1]: students.pop()
kunci = [G.nama_baku(n) for n in students]

def isi_blok(tab, sname, baris1, kolom, force_dari=None):
    data = GS[tab]
    terisi, kosong = 0, []
    for i in range(MAXN):
        vals = data.get(kunci[i], (None, None))[1] if i < len(kunci) and kunci[i] else None
        got = False
        for j, (c, k) in enumerate(kolom):
            v = num(vals[k]) if vals and k < len(vals) else None
            setc(sname, f'{gl(c)}{baris1 + i}', v,
                 force=force_dari is not None and j >= force_dari)
            got = got or v is not None
        terisi += got
        if i < len(students) and students[i] and not got:
            kosong.append(students[i])
    return terisi, kosong

summary = {}
# 2) mapel umum -> Ff11 (Sumatif 1-8, Non Tes, Tes)
for tab, mcol in G.UMUM.items():
    no = ci(mcol) + 1
    cols = [no + 4 + j for j in range(8)] + [no + 14, no + 15]
    idx = list(range(8)) + [10, 11]
    summary[tab] = isi_blok(tab, 'Ff11', 388, list(zip(cols, idx)))

# 3) mapel pondok -> Form Nilai (10 kolom; 2 kolom Nilai Raport boleh menimpa rumus)
for tab, scol in G.PONDOK.items():
    s = ci(scol)
    summary[tab] = isi_blok(tab, 'Form Nilai', 9, [(s + j, j) for j in range(10)], force_dari=8)

# 4) force Excel to recalculate every formula on open
cp = wbx.find(N + 'calcPr')
if cp is None: cp = etree.SubElement(wbx, N + 'calcPr')
cp.set('fullCalcOnLoad', '1')

out = zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED)
changed = {part[n]: t for n, t in trees.items()}
for info in zin.infolist():
    if info.filename in changed:
        data = etree.tostring(changed[info.filename], xml_declaration=True, encoding='UTF-8', standalone=True)
    elif info.filename == 'xl/workbook.xml':
        data = etree.tostring(wbx, xml_declaration=True, encoding='UTF-8', standalone=True)
    elif info.filename == 'xl/calcChain.xml':
        continue  # Excel rebuilds it; stale entries could trigger a repair prompt
    elif info.filename == 'xl/_rels/workbook.xml.rels':
        data = re.sub(rb'<Relationship [^>]*calcChain[^>]*/>', b'', read(info.filename))
    elif info.filename == '[Content_Types].xml':
        data = re.sub(rb'<Override [^>]*calcChain[^>]*/>', b'', read(info.filename))
    else:
        data = read(info.filename)
    out.writestr(info, data)
out.close()
print(f'\nHasil disimpan: {DST}\n')
print('NILAI PER MAPEL')
for k, (n, kosong) in summary.items():
    ket = 'tab masih kosong di Google Sheet' if n == 0 else f'{n:2d} siswa terisi'
    print(f'  {k:15s} {ket}')
    if n and kosong:
        print(f'  {"":15s} belum ada nilai: ' + ', '.join(kosong))

# nama yang tidak cocok antara Google Sheet dan raport
semua_gs = {}
for data in GS.values():
    for b, (asli, _) in data.items(): semua_gs.setdefault(b, asli)
tak_ada_di_raport = [asli for b, asli in semua_gs.items() if b not in kunci]
tak_ada_di_gs = [n for n, b in zip(students, kunci) if n and b not in semua_gs]
print('\nPENCOCOKAN NAMA')
if not tak_ada_di_raport and not tak_ada_di_gs:
    print('  Semua nama cocok.')
for n in tak_ada_di_raport:
    mirip = difflib.get_close_matches(G.nama_baku(n), [k for k in kunci if k], 1, 0.6)
    saran = f' (mungkin: {students[kunci.index(mirip[0])]})' if mirip else ''
    print(f'  Ada di Google Sheet, tidak ada di raport: {n}{saran}')
for n in tak_ada_di_gs:
    print(f'  Ada di raport, tidak ada di Google Sheet: {n}')

print('\nSEL RUMUS')
ganti = [x.split(' ', 4)[-1] for x in log if x.startswith('rumus diganti')]
lewat = [x.split(' ', 2)[-1] for x in log if x.startswith('LEWATI')]
if ganti: print(f'  {len(ganti)} rumus Nilai Raport pondok diganti nilai Google Sheet: ' + ', '.join(ganti))
if lewat: print(f'  {len(lewat)} sel rumus dilewati (tidak ditimpa): ' + ', '.join(lewat))
if not log: print('  tidak ada sel rumus yang tertimpa')
