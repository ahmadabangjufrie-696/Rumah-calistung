"""Membuat 3 contoh desain raport pondok (A, B, C) sebagai HTML A4."""
import base64, io, os, sys
import qrcode

D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, '/home/user/Rumah-calistung/RAPOT/smartrapor')
from buat_smartrapor import terbilang_arab, ANGKA_ARAB  # noqa: E402

LOGO = '/home/user/Rumah-calistung/RAPOT/smartrapor/aset/logo_sekolah.jpg'
F = os.path.join(D, 'font')


def ar(n):
    return ''.join(ANGKA_ARAB[int(c)] if c.isdigit() else c for c in str(n))


def b64(path):
    return base64.b64encode(open(path, 'rb').read()).decode()


def qr_png(teks, warna='#0F3D2E'):
    q = qrcode.QRCode(border=1, box_size=6)
    q.add_data(teks)
    img = q.make_image(fill_color=warna, back_color='white')
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    return base64.b64encode(buf.getvalue()).decode()


MAPEL = [('حديث القرآن', 80, 72), ('اللغة العربية والإنشاء', 81, 88), ('فقه', 87, 83), ('التوحيد', 83, 84),
         ('نحو', 87, 82), ('صرف', 78, 80), ('تفسير', 85, 79), ('التجويد', 90, 92), ('تاريخ الخيرات', 76, 78),
         ('تاريخ', 71, 79), ('تصريف', 78, 86), ('مفردات', 84, 85), ('محادثة', 80, 83), ('الأنغام', 88, 90),
         ('محفوظات', 79, 82), ('إملاء', 86, 84)]


def predikat(t, p):
    r = (t + p) / 2
    return ('ممتازة', 'sb') if r >= 90 else ('جيد بالفعل', 'b') if r >= 75 else \
        ('جيد بما فيه الكفاية', 'c') if r >= 60 else ('ليست جيدة بما فيه الكفاية', 'k')


JUMLAH = sum(t for _, t, _ in MAPEL)
RATA = round(JUMLAH / len(MAPEL))
PEMBIASAAN = ['نشيطون ومعتادون على صلاة الفرائض جماعة في المسجد والسنة',
              'اعتاد على دراسة الكتب والمجاهدة وحفظ القرآن والسور القصيرة والأحاديث النبوية',
              'حافظ دائما على نظافة البيئة والمهاجع والنظام والأناقة',
              'نشيطون ومعتادون على المشاركة في جمعية تكليم']
CATATAN = 'استمر في زيادة دافع التعلم الخاص بك حتى تتمكن من أن تصبح طالبا متميزا وتجعل والديك فخورين'
QR = qr_png('SmartRapor | Ahmad Fauzan Hakim | NIS 226001 | IX B | Genap 2025/2026 | Kode: SR-7F3K-92QA')

FONTS = f"""
@font-face {{ font-family: Amiri; src: url('file://{F}/fontsource-amiri-5.3.0/files/amiri-arabic-400-normal.woff2'); }}
@font-face {{ font-family: Amiri; font-weight: 700; src: url('file://{F}/fontsource-amiri-5.3.0/files/amiri-arabic-700-normal.woff2'); }}
@font-face {{ font-family: Ruqaa; font-weight: 700; src: url('file://{F}/fontsource-aref-ruqaa-5.3.0/files/aref-ruqaa-arabic-700-normal.woff2'); }}
@font-face {{ font-family: Naskh; src: url('file://{F}/fontsource-noto-naskh-arabic-5.3.0/files/noto-naskh-arabic-arabic-400-normal.woff2'); }}
@font-face {{ font-family: Naskh; font-weight: 700; src: url('file://{F}/fontsource-noto-naskh-arabic-5.3.0/files/noto-naskh-arabic-arabic-700-normal.woff2'); }}
@font-face {{ font-family: Poppins; src: url('file://{F}/fontsource-poppins-5.3.0/files/poppins-latin-400-normal.woff2'); }}
@font-face {{ font-family: Poppins; font-weight: 600; src: url('file://{F}/fontsource-poppins-5.3.0/files/poppins-latin-600-normal.woff2'); }}
@font-face {{ font-family: Poppins; font-weight: 700; src: url('file://{F}/fontsource-poppins-5.3.0/files/poppins-latin-700-normal.woff2'); }}
@font-face {{ font-family: Cormorant; font-weight: 700; src: url('file://{F}/fontsource-cormorant-garamond-5.3.0/files/cormorant-garamond-latin-700-normal.woff2'); }}
"""

DASAR = """
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 794px; height: 1123px; background: #fff; }
body { direction: rtl; font-family: Naskh, Amiri, serif; color: #1b1b1b; }
.halaman { position: relative; width: 794px; height: 1123px; overflow: hidden; }
table { border-collapse: collapse; width: 100%; }
.ltr { direction: ltr; }
"""


def baris_tabel(kelas_pred=True):
    out = []
    for i, (n, t, p) in enumerate(MAPEL, 1):
        pr, k = predikat(t, p)
        badge = f'<span class="badge {k}">{pr}</span>' if kelas_pred else pr
        out.append(f'<tr><td class="no">{ar(i)}</td><td class="mp">{n}</td><td class="ang">{ar(t)}</td>'
                   f'<td class="kata">{terbilang_arab(t)}</td><td class="ang">{ar(p)}</td>'
                   f'<td class="kata">{terbilang_arab(p)}</td><td class="pr">{badge}</td></tr>')
    return '\n'.join(out)


KEPALA_TABEL = """<thead><tr><th rowspan="2" class="no">رقم</th><th rowspan="2">مجال الدراسة</th>
<th colspan="4">قيمة المعرفة</th><th rowspan="2">وصف تقدم التعلم</th></tr>
<tr><th>قيمة تيوري</th><th>درجات الرسالة</th><th>مارس / شفهي</th><th>درجات الرسالة</th></tr></thead>"""

ORNAMEN = """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<g fill="none" stroke="WARNA" stroke-width="2.2">
<polygon points="50,6 61,39 94,50 61,61 50,94 39,61 6,50 39,39"/>
<polygon points="50,20 71,29 80,50 71,71 50,80 29,71 20,50 29,29"/>
<circle cx="50" cy="50" r="11"/></g><circle cx="50" cy="50" r="4" fill="WARNA"/></svg>"""


def ornamen(warna):
    return 'data:image/svg+xml;base64,' + base64.b64encode(ORNAMEN.replace('WARNA', warna).encode()).decode()


def desain_a(hitam_putih=False, kop_hijau=False, tanda_air=None, garis_warna=False):
    if hitam_putih:
        H, E, MUDA, GARIS, PUTIH_TEKS, LATAR_HEAD = '#000', '#555', '#fff', '#000', '#000', '#fff'
    else:
        H, E, MUDA, GARIS, PUTIH_TEKS, LATAR_HEAD = '#0F5132', '#B8932E', '#F3F8F5', '#0F5132', '#fff', '#0F5132'
    if garis_warna:
        E, GARIS = '#B8932E', '#0F5132'
    BK = '#0F5132' if (garis_warna or not hitam_putih) else H
    KOP = '#0F5132' if (kop_hijau or not hitam_putih) else H
    orn = ornamen(E if (garis_warna or not hitam_putih) else '#333')
    logo = b64(LOGO)
    if tanda_air is None:
        tanda_air = not hitam_putih
    wm = f'<img class="wm" src="data:image/jpeg;base64,{logo}">' if tanda_air else ''
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}{DASAR}
.halaman {{ padding: 26px 30px; }}
.bingkai {{ position: absolute; inset: 14px; border: 3px double {BK}; }}
.bingkai2 {{ position: absolute; inset: 20px; border: 1px solid {E}; }}
.sudut {{ position: absolute; width: 38px; height: 38px; background: #fff url('{orn}') center/30px no-repeat; }}
.s1 {{ top: 4px; right: 4px; }} .s2 {{ top: 4px; left: 4px; }} .s3 {{ bottom: 4px; right: 4px; }} .s4 {{ bottom: 4px; left: 4px; }}
.wm {{ position: absolute; width: 420px; left: 187px; top: 380px; opacity: {'.08' if hitam_putih else '.06'}; }}
.isi {{ position: relative; padding: 14px 18px 0; }}
.kop {{ display: flex; align-items: center; gap: 14px; padding-bottom: 6px; }}
.kop img {{ width: 92px; }}
.kop .teks {{ flex: 1; text-align: center; }}
.kop .ar {{ font-family: Ruqaa; font-weight: 700; font-size: 30px; color: {KOP}; line-height: 1.25; }}
.kop .lat {{ font-family: Cormorant; font-weight: 700; font-size: 16.5px; letter-spacing: .8px; white-space: nowrap; color: {KOP}; direction: ltr; }}
.kop .alamat {{ font-family: Poppins; font-size: 9.5px; color: {KOP}; direction: ltr; margin-top: 2px; }}
.garis {{ height: 5px; border-top: 2px solid {E}; border-bottom: 1px solid {E}; margin: 4px 0 10px; }}
h1 {{ text-align: center; font-family: Amiri; font-weight: 700; font-size: 22px; color: {H}; margin-bottom: 8px; }}
h1 span {{ display: inline-block; border-bottom: 2px solid {E}; padding: 0 18px 2px; }}
.info {{ display: grid; grid-template-columns: 1fr 1fr; gap: 3px 30px; font-size: 14px; font-weight: 700; margin-bottom: 9px; }}
.info b {{ color: {H}; }}
.nilai th {{ background: {LATAR_HEAD}; color: {PUTIH_TEKS}; font-size: 12.5px; padding: 4px 3px; border: 1px solid {GARIS}; }}
.nilai td {{ border: 1px solid {GARIS}; font-size: 12.5px; padding: 1px 5px; height: 21.5px; }}
.nilai tbody tr:nth-child(even) td {{ background: {MUDA}; }}
.no {{ width: 32px; text-align: center; }} .ang {{ text-align: center; width: 64px; font-weight: 700; }}
.nilai th {{ white-space: nowrap; }}
.kata {{ width: 120px; }} .pr {{ text-align: center; width: 135px; }} .mp {{ font-weight: 700; }}
.total td {{ font-weight: 700; background: {MUDA if not hitam_putih else '#fff'}; border: 1px solid {GARIS}; padding: 3px 6px; font-size: 13px; }}
.dua {{ display: grid; grid-template-columns: 1.55fr 1fr; gap: 10px; margin-top: 9px; }}
.kotak {{ border: 1px solid {GARIS}; }}
.kotak h3 {{ background: {LATAR_HEAD}; color: {PUTIH_TEKS}; font-size: 13px; text-align: center; padding: 3px; border-bottom: 1px solid {GARIS}; }}
.kotak li {{ list-style: none; font-size: 11.5px; padding: 3px 7px; border-bottom: 1px dotted #999; }}
.kotak li:last-child {{ border-bottom: 0; }}
.hadir td {{ font-size: 12.5px; padding: 4px 8px; border-bottom: 1px dotted #999; }}
.hadir td:last-child {{ text-align: center; font-weight: 700; width: 60px; }}
.cat {{ border: 1px solid {GARIS}; border-right: 5px solid {BK if garis_warna else E}; margin-top: 9px; padding: 6px 10px; font-size: 13px; }}
.cat b {{ color: {H}; }}
.ttd {{ display: grid; grid-template-columns: 1fr 1fr 1fr; margin-top: 10px; text-align: center; font-size: 13.5px; font-weight: 700; }}
.ttd .tgl {{ grid-column: 1 / -1; text-align: right; font-size: 13px; margin-bottom: 2px; }}
.ttd .ruang {{ height: 52px; position: relative; }}
.cap {{ position: absolute; left: 50%; top: 2px; transform: translateX(-50%); width: 50px; height: 50px; border: 1.5px dashed #999;
       border-radius: 50%; font: 8px Poppins; color: #999; display: flex; align-items: center; justify-content: center; }}
.ttd .nm {{ text-decoration: underline; }}
.qrkop {{ width: 92px; text-align: center; font: 7.5px Poppins; color: #555; direction: ltr; }}
.qrkop img {{ width: 70px; display: block; margin: 0 auto 1px; }}
</style></head><body><div class="halaman">
<div class="bingkai"></div><div class="bingkai2"></div>
<div class="sudut s1"></div><div class="sudut s2"></div><div class="sudut s3"></div><div class="sudut s4"></div>
{wm}
<div class="isi">
<div class="kop"><img src="data:image/jpeg;base64,{logo}"><div class="teks">
<div class="ar">معهد الخيرات الإسلامي تانجونج سيلور</div>
<div class="lat">PONDOK PESANTREN ALKHAIRAAT TANJUNG SELOR</div>
<div class="alamat">Jln. Jelarai, Tanjung Selor Timur, Kab. Bulungan, Kalimantan Utara · Telp. (0552) 23155</div>
</div><div class="qrkop"><img src="data:image/png;base64,{QR}"><div>Cek keaslian</div></div></div>
<div class="garis"></div>
<h1><span>تقرير عن نتائج تعلم الطالب</span></h1>
<div class="info"><div>اسم الطالب : <b>أحمد فوزان حكيم</b></div><div>الفصل / الفصل الدراسي : <b>٩ / الثاني</b></div>
<div>رقم التسجيل : <b>٢٢٦٠٠١</b></div><div>العام الدراسي : <b>٢٠٢٥ / ٢٠٢٦</b></div></div>
<table class="nilai">{KEPALA_TABEL}<tbody>{baris_tabel(False)}</tbody></table>
<table class="total"><tr><td>مجموع الدرجات : {ar(JUMLAH)}</td><td>المعدل العام : {ar(RATA)}</td><td>الترتيب العلمي : ٣</td></tr></table>
<div class="dua"><div class="kotak"><h3>التعود على الذات</h3><ul>{''.join(f'<li>{ar(i)}. {t}</li>' for i, t in enumerate(PEMBIASAAN, 1))}</ul></div>
<div class="kotak"><h3>كشف الحضور</h3><table class="hadir"><tr><td>مرض</td><td>٢ أيام</td></tr><tr><td>إذن</td><td>١ يوم</td></tr>
<tr><td>بدون إذن</td><td>-</td></tr></table></div></div>
<div class="cat"><b>ملاحظة ولي الفصل :</b> {CATATAN}</div>
<div class="ttd"><div class="tgl">تانجونج سيلور، ٥ محرم ١٤٤٨ هـ / ٢٠ يونيو ٢٠٢٦ م</div>
<div>مدير المعهد</div><div>ولي الفصل</div><div>ولي الطالب</div>
<div class="ruang"><div class="cap">STEMPEL</div></div><div class="ruang"></div><div class="ruang"></div>
<div class="nm">مطهر الجفري، ماجستير</div><div class="nm">أحمد الجفري</div><div class="nm">السيد أحمد</div></div>
</div>
</div></body></html>"""


def desain_b():
    H, H2, E = '#0B3B2C', '#14674A', '#C9A227'
    logo = b64(LOGO)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}{DASAR}
.pita {{ background: linear-gradient(120deg, {H} 0%, {H2} 100%); color: #fff; padding: 16px 34px 14px; position: relative; }}
.pita::after {{ content: ''; position: absolute; left: 0; right: 0; bottom: -6px; height: 6px; background: {E}; }}
.pita .baris {{ display: flex; align-items: center; gap: 18px; }}
.bulat {{ width: 92px; height: 92px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 4px rgba(201,162,39,.85); overflow: hidden; }}
.bulat img {{ width: 72px; border-radius: 50%; }}
.pita .ar {{ font-family: Ruqaa; font-weight: 700; font-size: 31px; line-height: 1.2; }}
.pita .lat {{ font-family: Poppins; font-weight: 600; font-size: 14px; letter-spacing: 2px; direction: ltr; text-align: right; color: #F1DFA4; }}
.pita .alamat {{ font-family: Poppins; font-size: 9px; direction: ltr; text-align: right; opacity: .85; margin-top: 2px; }}
.isi {{ padding: 20px 34px 0; }}
h1 {{ font-family: Amiri; font-weight: 700; font-size: 21px; color: {H}; display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }}
h1::before, h1::after {{ content: ''; flex: 1; height: 1px; background: #cfd8d3; }}
.kartu {{ display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }}
.kartu div {{ background: #F4F8F6; border-radius: 10px; padding: 6px 10px; border-right: 4px solid {H2}; }}
.kartu small {{ display: block; font-size: 10.5px; color: #6b7c74; }}
.kartu b {{ font-size: 15px; color: {H}; }}
.nilai th {{ font-size: 11.5px; color: #6b7c74; font-weight: 700; padding: 4px; border-bottom: 2px solid {H}; }}
.nilai thead tr:first-child th {{ color: {H}; font-size: 12.5px; border-bottom: 1px solid #cfd8d3; }}
.nilai td {{ font-size: 12.5px; padding: 0 6px; height: 22px; border-bottom: 1px solid #e3e9e6; }}
.nilai th {{ white-space: nowrap; }}
.no {{ width: 30px; text-align: center; color: #8a9a93; }} .ang {{ text-align: center; width: 64px; font-weight: 700; color: {H}; }}
.kata {{ width: 118px; color: #44524c; }} .pr {{ text-align: center; width: 150px; }} .mp {{ font-weight: 700; }}
.badge {{ display: inline-block; padding: 0 10px; border-radius: 20px; font-size: 11px; line-height: 19px; font-weight: 700; }}
.badge.sb {{ background: #D7F0E1; color: #0F5132; }} .badge.b {{ background: #DDEBFA; color: #1A4E8A; }}
.badge.c {{ background: #FFF1CC; color: #855D00; }} .badge.k {{ background: #F8D7DA; color: #842029; }}
.ringkas {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }}
.ringkas div {{ background: {H}; color: #fff; border-radius: 10px; padding: 5px 12px; display: flex; justify-content: space-between; align-items: center; }}
.ringkas b {{ font-size: 19px; color: #F1DFA4; }} .ringkas span {{ font-size: 12.5px; }}
.dua {{ display: grid; grid-template-columns: 1.6fr 1fr; gap: 10px; margin-top: 10px; }}
.blok {{ border: 1px solid #dde5e1; border-radius: 10px; padding: 6px 10px; }}
.blok h3 {{ font-size: 13px; color: {H}; margin-bottom: 3px; }}
.blok li {{ font-size: 11.5px; list-style: none; padding: 1.5px 0; }}
.blok li::before {{ content: '◆ '; color: {E}; font-size: 9px; }}
.hadir {{ display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; gap: 6px; margin-top: 4px; }}
.hadir b {{ display: block; font-size: 20px; color: {H}; }} .hadir small {{ font-size: 11px; color: #6b7c74; }}
.cat {{ background: #FBF6E6; border-radius: 10px; padding: 7px 12px; margin-top: 10px; font-size: 13px; border-right: 4px solid {E}; }}
.cat b {{ color: {H}; }}
.ttd {{ display: grid; grid-template-columns: 1fr 1fr 1fr; margin-top: 10px; text-align: center; font-size: 13.5px; }}
.ttd .tgl {{ grid-column: 1 / -1; text-align: right; font-size: 12.5px; color: #44524c; margin-bottom: 2px; }}
.ttd .jb {{ color: #6b7c74; }} .ttd .ruang {{ height: 44px; }}
.ttd .nm {{ font-weight: 700; color: {H}; border-top: 1px solid #b9c6c0; margin: 0 22px; padding-top: 2px; }}
.kaki {{ position: absolute; left: 0; right: 0; bottom: 0; height: 40px; background: #F4F8F6; border-top: 3px solid {E};
         display: flex; align-items: center; justify-content: space-between; padding: 0 34px; direction: ltr; font: 9px Poppins; color: #6b7c74; }}
.kaki img {{ width: 34px; }} .kaki .q {{ display: flex; align-items: center; gap: 8px; }}
</style></head><body><div class="halaman">
<div class="pita"><div class="baris"><div class="bulat"><img src="data:image/jpeg;base64,{logo}"></div><div>
<div class="ar">معهد الخيرات الإسلامي تانجونج سيلور</div>
<div class="lat">PONDOK PESANTREN ALKHAIRAAT TANJUNG SELOR</div>
<div class="alamat">Jln. Jelarai, Tanjung Selor Timur, Kab. Bulungan, Kalimantan Utara · Telp. (0552) 23155</div></div></div></div>
<div class="isi">
<h1>تقرير عن نتائج تعلم الطالب</h1>
<div class="kartu"><div><small>اسم الطالب</small><b>أحمد فوزان حكيم</b></div><div><small>رقم التسجيل</small><b>٢٢٦٠٠١</b></div>
<div><small>الفصل / الفصل الدراسي</small><b>٩ / الثاني</b></div><div><small>العام الدراسي</small><b>٢٠٢٥ / ٢٠٢٦</b></div></div>
<table class="nilai">{KEPALA_TABEL}<tbody>{baris_tabel(True)}</tbody></table>
<div class="ringkas"><div><span>مجموع الدرجات</span><b>{ar(JUMLAH)}</b></div><div><span>المعدل العام</span><b>{ar(RATA)}</b></div>
<div><span>الترتيب العلمي</span><b>٣</b></div></div>
<div class="dua"><div class="blok"><h3>التعود على الذات</h3><ul>{''.join(f'<li>{t}</li>' for t in PEMBIASAAN)}</ul></div>
<div class="blok"><h3>كشف الحضور</h3><div class="hadir"><div><b>٢</b><small>مرض</small></div><div><b>١</b><small>إذن</small></div>
<div><b>-</b><small>بدون إذن</small></div></div></div></div>
<div class="cat"><b>ملاحظة ولي الفصل :</b> {CATATAN}</div>
<div class="ttd"><div class="tgl">تانجونج سيلور، ٥ محرم ١٤٤٨ هـ / ٢٠ يونيو ٢٠٢٦ م</div>
<div class="jb">مدير المعهد</div><div class="jb">ولي الفصل</div><div class="jb">ولي الطالب</div>
<div class="ruang"></div><div class="ruang"></div><div class="ruang"></div>
<div class="nm">مطهر الجفري، ماجستير</div><div class="nm">أحمد الجفري</div><div class="nm">السيد أحمد</div></div>
</div>
<div class="kaki"><div>SmartRapor · Raport Pondok · Semester Genap 2025/2026</div>
<div class="q">Pindai untuk cek keaslian<img src="data:image/png;base64,{QR}"></div></div>
</div></body></html>"""


for nama, html in (('A', desain_a()), ('B', desain_b()), ('C', desain_a(hitam_putih=True)),
                   ('C2', desain_a(hitam_putih=True, kop_hijau=True, tanda_air=True)),
                   ('C3', desain_a(hitam_putih=True, kop_hijau=True, tanda_air=True, garis_warna=True))):
    open(os.path.join(D, f'desain_{nama}.html'), 'w', encoding='utf-8').write(html)
print('ok')
