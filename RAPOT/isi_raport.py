"""Copy grades from the Google Sheet data into the raport .xlsm by editing the
sheet XML directly (keeps macros, buttons and shapes intact)."""
import sys, re, zipfile, shutil
from lxml import etree
from openpyxl.utils import column_index_from_string as ci, get_column_letter as gl
sys.path.insert(0, sys.argv[3])
import gsdata as G

SRC, DST = sys.argv[1], sys.argv[2]
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

students = G.STUDENTS
MAXN = 40

# 1) student list (sheet "siswa", rows 7..46)
for i in range(MAXN):
    r = 7 + i
    for c in range(2, 31):  # B..AD constants cleared
        setc('siswa', f'{gl(c)}{r}', None)
    if i < len(students):
        setc('siswa', f'D{r}', students[i])
        setc('siswa', f'F{r}', 'L')
        setc('siswa', f'I{r}', 'Islam')

# 2) mapel umum -> Ff11
summary = {}
for tab, (mcol, txt) in G.UMUM.items():
    data = G.parse(txt) if txt else {}
    no = ci(mcol) + 1
    cols = [no + 4 + j for j in range(8)] + [no + 14, no + 15]
    idx = list(range(8)) + [10, 11]
    filled = 0
    for i in range(MAXN):
        vals = data.get(students[i]) if i < len(students) else None
        row = 388 + i
        got = False
        for c, k in zip(cols, idx):
            v = num(vals[k]) if vals and k < len(vals) else None
            setc('Ff11', f'{gl(c)}{row}', v)
            got = got or v is not None
        filled += got
    summary[tab] = filled

# 3) mapel pondok -> Form Nilai
for tab, (scol, txt) in G.PONDOK.items():
    data = G.parse(txt) if txt else {}
    s = ci(scol)
    filled = 0
    for i in range(MAXN):
        vals = data.get(students[i]) if i < len(students) else None
        row = 9 + i
        got = False
        for j in range(10):
            v = num(vals[j]) if vals and j < len(vals) else None
            setc('Form Nilai', f'{gl(s + j)}{row}', v, force=j >= 8)
            got = got or v is not None
        filled += got
    summary[tab] = filled

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
for k, v in summary.items(): print(f'{k:15s} {v:2d} siswa terisi')
print('\n'.join(log) or 'tidak ada sel rumus yang tertimpa')
