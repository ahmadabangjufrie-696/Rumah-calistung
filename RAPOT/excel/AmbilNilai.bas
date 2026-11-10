Attribute VB_Name = "AmbilNilaiGS"
' =====================================================================
'  AMBIL NILAI DARI GOOGLE SHEET
'  Memindahkan nilai dari Google Sheet kelas ke raport ini.
'
'  - Sheet "PETA NILAI" berisi link Google Sheet kelas dan daftar
'    tab mapel beserta letak kolomnya di raport. Dibuat otomatis
'    saat tombol pertama kali diklik.
'  - Siswa dicocokkan berdasarkan NAMA (bukan nomor urut).
'  - Sel rumus tidak ditimpa, kecuali 2 kolom Nilai Raport mapel pondok
'    (nilai hitungan guru di Google Sheet yang dipakai).
'  - Hasil pengecekan ditulis di sheet "LAPORAN NILAI".
' =====================================================================
Option Explicit

Private Const PETA As String = "PETA NILAI"
Private Const LAPORAN As String = "LAPORAN NILAI"
Private Const MAKS_SISWA As Long = 40
Private Const BARIS_SISWA As Long = 7        ' sheet siswa, siswa ke-1
Private Const BARIS_UMUM As Long = 388       ' sheet Ff11, siswa ke-1
Private Const BARIS_PONDOK As Long = 9       ' sheet Form Nilai, siswa ke-1

Private catatan As Collection

Public Sub AmbilNilai()
    Dim wsPeta As Worksheet, link As String, idSheet As String
    Dim fileSementara As String, wbGS As Workbook
    Dim nama(1 To MAKS_SISWA) As String, kunci(1 To MAKS_SISWA) As String
    Dim jmlSiswa As Long, i As Long, r As Long
    Dim kalk As Long, ff11Dikunci As Boolean
    Dim namaGS As Object, laporanMapel As Collection

    Set catatan = New Collection
    Set laporanMapel = New Collection
    Set namaGS = CreateObject("Scripting.Dictionary")

    Set wsPeta = SiapkanPeta()
    link = Trim(CStr(wsPeta.Range("B2").Value))
    If link = "" Then
        link = Trim(InputBox("Tempel link Google Sheet nilai kelas ini:", "Ambil Nilai"))
        If link = "" Then Exit Sub
        wsPeta.Range("B2").Value = link
    End If
    idSheet = AmbilID(link)
    If idSheet = "" Then
        MsgBox "Link Google Sheet tidak dikenali." & vbCrLf & _
               "Periksa isi sel B2 di sheet " & PETA & ".", vbExclamation
        Exit Sub
    End If

    ' 1) unduh Google Sheet sebagai file Excel sementara
    Application.StatusBar = "Mengunduh nilai dari Google Sheet ..."
    fileSementara = Environ$("TEMP") & "\nilai_gs_" & Format(Now, "yyyymmddhhnnss") & ".xlsx"
    If Not Unduh("https://docs.google.com/spreadsheets/d/" & idSheet & "/export?format=xlsx", fileSementara) Then
        Application.StatusBar = False
        MsgBox "Google Sheet tidak bisa diunduh." & vbCrLf & vbCrLf & _
               "Pastikan:" & vbCrLf & _
               "1. Komputer tersambung ke internet." & vbCrLf & _
               "2. Google Sheet dibagikan: 'Siapa saja yang memiliki link' (Pelihat).", vbExclamation
        Exit Sub
    End If

    kalk = Application.Calculation
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual
    On Error GoTo Gagal

    Set wbGS = Workbooks.Open(fileSementara, UpdateLinks:=0, ReadOnly:=True)
    ThisWorkbook.Activate

    ' 2) daftar siswa dari sheet "siswa" (tidak diubah)
    With ThisWorkbook.Worksheets("siswa")
        For i = 1 To MAKS_SISWA
            nama(i) = Trim(CStr(.Cells(BARIS_SISWA + i - 1, 4).Value))
            kunci(i) = NamaBaku(nama(i))
            If nama(i) <> "" Then jmlSiswa = i
        Next i
    End With

    ' 3) buka kunci Ff11 sementara (kunci tanpa kata sandi)
    With ThisWorkbook.Worksheets("Ff11")
        ff11Dikunci = .ProtectContents
        If ff11Dikunci Then .Unprotect
    End With

    ' 4) isi setiap mapel sesuai PETA NILAI
    r = 5
    Do While Trim(CStr(wsPeta.Cells(r, 1).Value)) <> ""
        laporanMapel.Add IsiMapel(wbGS, _
            Trim(CStr(wsPeta.Cells(r, 1).Value)), _
            UCase(Trim(CStr(wsPeta.Cells(r, 2).Value))), _
            UCase(Trim(CStr(wsPeta.Cells(r, 3).Value))), _
            nama, kunci, jmlSiswa, namaGS)
        r = r + 1
    Loop

    If ff11Dikunci Then ThisWorkbook.Worksheets("Ff11").Protect _
        DrawingObjects:=True, Contents:=True, Scenarios:=True

    wbGS.Close SaveChanges:=False
    Set wbGS = Nothing
    On Error Resume Next
    Kill fileSementara
    On Error GoTo 0

    Application.Calculation = kalk
    Application.CalculateFull
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Application.StatusBar = False

    wsPeta.Range("B3").Value = Now
    TulisLaporan laporanMapel, nama, kunci, jmlSiswa, namaGS
    Exit Sub

Gagal:
    Dim pesan As String
    pesan = Err.Description
    On Error Resume Next
    If Not wbGS Is Nothing Then wbGS.Close SaveChanges:=False
    Kill fileSementara
    If ff11Dikunci Then ThisWorkbook.Worksheets("Ff11").Protect _
        DrawingObjects:=True, Contents:=True, Scenarios:=True
    Application.Calculation = kalk
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Application.StatusBar = False
    MsgBox "Terjadi kesalahan: " & pesan & vbCrLf & _
           "Nilai mungkin baru sebagian terisi. Tutup raport tanpa menyimpan, lalu coba lagi.", vbCritical
End Sub

' Mengisi satu mapel. Hasil: teks ringkasan untuk laporan.
Private Function IsiMapel(wbGS As Workbook, namaTab As String, jenis As String, kolom As String, _
                          nama() As String, kunci() As String, jmlSiswa As Long, namaGS As Object) As String
    Dim ws As Worksheet, data As Variant, barisGS As Object
    Dim i As Long, j As Long, k As Long, b As Long, n As Long
    Dim tujuan As Worksheet, barisAwal As Long, c0 As Long
    Dim kolTujuan(0 To 9) As Long, kolSumber(0 To 9) As Long, jmlKol As Long
    Dim terisi As Long, kosong As String, ada As Boolean, v As Variant, adaNilai As Boolean

    Set ws = CariTab(wbGS, namaTab)
    If ws Is Nothing Then
        IsiMapel = namaTab & vbTab & "tab tidak ada di Google Sheet (dilewati)"
        Exit Function
    End If

    c0 = KolomKeAngka(kolom)
    If c0 = 0 Then
        IsiMapel = namaTab & vbTab & "kolom '" & kolom & "' di PETA NILAI salah (dilewati)"
        Exit Function
    End If

    If jenis = "UMUM" Then
        ' Ff11: kolom No = kolom "MAPEL :" + 1
        Set tujuan = ThisWorkbook.Worksheets("Ff11")
        barisAwal = BARIS_UMUM
        For j = 0 To 7
            kolTujuan(j) = c0 + 1 + 4 + j: kolSumber(j) = j       ' Sumatif 1-8  <- GS kolom C-J
        Next j
        kolTujuan(8) = c0 + 1 + 14: kolSumber(8) = 10            ' Non Tes      <- GS kolom M
        kolTujuan(9) = c0 + 1 + 15: kolSumber(9) = 11            ' Tes          <- GS kolom N
    Else
        ' Form Nilai: 10 kolom mulai "Tugas 1"  <- GS kolom C-L
        Set tujuan = ThisWorkbook.Worksheets("Form Nilai")
        barisAwal = BARIS_PONDOK
        For j = 0 To 9
            kolTujuan(j) = c0 + j: kolSumber(j) = j
        Next j
    End If
    jmlKol = 10

    ' tab GS harus dimulai dari kolom A (No) dan B (Nama)
    If ws.UsedRange.Column <> 1 Then
        IsiMapel = namaTab & vbTab & "tab tidak dimulai dari kolom A (dilewati)"
        Exit Function
    End If

    ' baris siswa di tab GS: kolom A berisi nomor, kolom B nama
    data = ws.UsedRange.Value2
    Set barisGS = CreateObject("Scripting.Dictionary")
    If IsArray(data) Then
        For b = 1 To UBound(data, 1)
            If UBound(data, 2) >= 2 Then
                If AdalahNomor(data(b, 1)) And Trim(CStr(NilaiTeks(data(b, 2)))) <> "" Then
                    barisGS(NamaBaku(CStr(data(b, 2)))) = b
                    namaGS(NamaBaku(CStr(data(b, 2)))) = Trim(CStr(data(b, 2)))
                End If
            End If
        Next b
    End If
    For i = 1 To MAKS_SISWA
        ada = False
        For j = 0 To jmlKol - 1
            v = Empty
            If i <= jmlSiswa And kunci(i) <> "" Then
                If barisGS.Exists(kunci(i)) Then
                    k = 2 + 1 + kolSumber(j)       ' kolom C = 3
                    If k <= UBound(data, 2) Then v = AmbilAngka(data(barisGS(kunci(i)), k))
                End If
            End If
            TulisSel tujuan.Cells(barisAwal + i - 1, kolTujuan(j)), v, (jenis <> "UMUM" And j >= 8)
            If Not IsEmpty(v) Then ada = True: adaNilai = True
        Next j
        If ada Then
            terisi = terisi + 1
        ElseIf i <= jmlSiswa And nama(i) <> "" Then
            kosong = kosong & IIf(kosong = "", "", ", ") & nama(i)
        End If
    Next i

    If Not adaNilai Then
        IsiMapel = namaTab & vbTab & "masih kosong di Google Sheet"
    ElseIf kosong = "" Then
        IsiMapel = namaTab & vbTab & terisi & " siswa terisi"
    Else
        IsiMapel = namaTab & vbTab & terisi & " siswa terisi. Belum ada nilai: " & kosong
    End If
End Function

Private Sub TulisSel(sel As Range, v As Variant, bolehTimpaRumus As Boolean)
    On Error GoTo Salah
    If sel.HasFormula Then
        If IsEmpty(v) Then Exit Sub
        If Not bolehTimpaRumus Then
            catatan.Add "Dilewati (sel rumus): " & sel.Worksheet.Name & "!" & sel.Address(False, False)
            Exit Sub
        End If
        catatan.Add "Rumus diganti nilai Google Sheet: " & sel.Worksheet.Name & "!" & sel.Address(False, False)
    End If
    If IsEmpty(v) Then
        If Not IsEmpty(sel.Value) Then sel.ClearContents
    Else
        sel.Value = v
    End If
    Exit Sub
Salah:
    catatan.Add "Gagal menulis " & sel.Worksheet.Name & "!" & sel.Address(False, False) & ": " & Err.Description
End Sub

Private Sub TulisLaporan(laporanMapel As Collection, nama() As String, kunci() As String, _
                         jmlSiswa As Long, namaGS As Object)
    Dim ws As Worksheet, r As Long, x As Variant, i As Long, d As Object, kk As Variant
    Dim jmlBeda As Long

    Set ws = AmbilSheet(LAPORAN)
    ws.Cells.Clear
    ws.Range("A1").Value = "LAPORAN AMBIL NILAI  -  " & Format(Now, "dd/mm/yyyy hh:nn")
    ws.Range("A1").Font.Bold = True
    r = 3
    ws.Cells(r, 1).Value = "NILAI PER MAPEL": ws.Cells(r, 1).Font.Bold = True: r = r + 1
    For Each x In laporanMapel
        ws.Cells(r, 1).Value = Split(x, vbTab)(0)
        ws.Cells(r, 2).Value = Split(x, vbTab)(1)
        r = r + 1
    Next x

    r = r + 1
    ws.Cells(r, 1).Value = "PENCOCOKAN NAMA": ws.Cells(r, 1).Font.Bold = True: r = r + 1
    Set d = CreateObject("Scripting.Dictionary")
    For i = 1 To jmlSiswa
        If kunci(i) <> "" Then d(kunci(i)) = True
    Next i
    For Each kk In namaGS.Keys
        If Not d.Exists(kk) Then
            ws.Cells(r, 1).Value = "Ada di Google Sheet, tidak ada di raport:"
            ws.Cells(r, 2).Value = namaGS(kk): r = r + 1: jmlBeda = jmlBeda + 1
        End If
    Next kk
    For i = 1 To jmlSiswa
        If nama(i) <> "" And Not namaGS.Exists(kunci(i)) Then
            ws.Cells(r, 1).Value = "Ada di raport, tidak ada di Google Sheet:"
            ws.Cells(r, 2).Value = nama(i): r = r + 1: jmlBeda = jmlBeda + 1
        End If
    Next i
    If jmlBeda = 0 Then ws.Cells(r, 1).Value = "Semua nama cocok.": r = r + 1

    r = r + 1
    ws.Cells(r, 1).Value = "CATATAN SEL": ws.Cells(r, 1).Font.Bold = True: r = r + 1
    If catatan.Count = 0 Then ws.Cells(r, 1).Value = "Tidak ada sel rumus yang tertimpa."
    For Each x In catatan
        ws.Cells(r, 1).Value = x: r = r + 1
    Next x
    ws.Columns("A:B").AutoFit
    ws.Activate

    MsgBox "Nilai sudah diambil dari Google Sheet." & vbCrLf & vbCrLf & _
           IIf(jmlBeda > 0, "Ada " & jmlBeda & " nama yang tidak cocok. ", "Semua nama cocok. ") & _
           "Lihat sheet " & LAPORAN & " untuk rinciannya." & vbCrLf & _
           "Jangan lupa simpan raport.", vbInformation
End Sub

' Membuat sheet PETA NILAI berisi pengaturan bawaan (SMP) bila belum ada.
Private Function SiapkanPeta() As Worksheet
    Dim ws As Worksheet, baris As Variant, i As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(PETA)
    On Error GoTo 0
    If Not ws Is Nothing Then Set SiapkanPeta = ws: Exit Function

    Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
    ws.Name = PETA
    ws.Range("A1").Value = "PENGATURAN AMBIL NILAI DARI GOOGLE SHEET"
    ws.Range("A1").Font.Bold = True
    ws.Range("A2").Value = "Link Google Sheet kelas:"
    ws.Range("A3").Value = "Terakhir diambil:"
    ws.Range("B2").Interior.Color = RGB(255, 242, 204)
    ws.Range("A4:D4").Value = Array("Nama tab di Google Sheet", "Jenis", "Kolom di raport", "Keterangan")
    ws.Range("A4:D4").Font.Bold = True

    baris = Array( _
        "PAI|UMUM|A|Ff11, kolom MAPEL : Pendidikan Agama Islam", _
        "PKN / PPKN|UMUM|CV|Ff11, Pendidikan Pancasila", _
        "B. INDO|UMUM|EC|Ff11, Bahasa Indonesia", _
        "MTK|UMUM|FJ|Ff11, Matematika", _
        "IPA|UMUM|GQ|Ff11, Ilmu Pengetahuan Alam", _
        "IPS|UMUM|HX|Ff11, Ilmu Pengetahuan Sosial", _
        "B. INGGRIS|UMUM|JE|Ff11, Bahasa Inggris", _
        "SENI BUDAYA|UMUM|KL|Ff11, Seni Budaya", _
        "PJOK|UMUM|LS|Ff11, PJOK", _
        "INFORMATIKA|UMUM|MZ|Ff11, Informatika", _
        "PRAKARYA|UMUM|OG|Ff11, Prakarya", _
        "MULOK|UMUM|QV|Ff11, Mulok", _
        "HADIST|PONDOK|C|Form Nilai, kolom Tugas 1: Qur'an Hadist", _
        "BAHASA ARAB|PONDOK|P|Form Nilai, Bahasa Arab", _
        "FIQIH|PONDOK|AC|Form Nilai, Fiqih", _
        "TAUHID|PONDOK|AP|Form Nilai, Tauhid", _
        "NAHWU|PONDOK|BC|Form Nilai, Nahwu", _
        "SHOROF|PONDOK|BQ|Form Nilai, Shorof", _
        "TAFSIR|PONDOK|CD|Form Nilai, Tafsir", _
        "TARIKH|PONDOK|CQ|Form Nilai, Tarikh", _
        "TASRIF|PONDOK|DD|Form Nilai, Tasrif", _
        "TAJWID|PONDOK|DQ|Form Nilai, Tajwid", _
        "S. ALKHAIRAAT|PONDOK|HQ|Form Nilai, Sejarah Al Khairaat", _
        "MUHADATSAH|PONDOK|ID|Form Nilai, Insya' / Muhadatsah", _
        "AL ANGHAAM|PONDOK|IQ|Form Nilai, Al Anghaam", _
        "MAHFUZATH|PONDOK|JD|Form Nilai, Mahfuzat", _
        "MUFRADAT|PONDOK|JQ|Form Nilai, Mufradat", _
        "IMLA / IMLA'|PONDOK|KD|Form Nilai, Imla")
    For i = 0 To UBound(baris)
        ws.Range(ws.Cells(5 + i, 1), ws.Cells(5 + i, 4)).Value = Split(baris(i), "|")
    Next i
    ws.Columns("A:D").AutoFit
    ws.Columns("B").ColumnWidth = 70

    ' tombol AMBIL NILAI
    Dim tombol As Object
    Set tombol = ws.Shapes.AddShape(5, ws.Range("F2").Left, ws.Range("F2").Top, 170, 40)
    tombol.Name = "TombolAmbilNilai"
    tombol.OnAction = "AmbilNilai"
    tombol.Fill.ForeColor.RGB = RGB(0, 112, 60)
    tombol.Line.Visible = False
    With tombol.TextFrame2.TextRange
        .Text = "AMBIL NILAI"
        .Font.Bold = True
        .Font.Size = 14
        .Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
    End With
    tombol.TextFrame2.VerticalAnchor = 3
    tombol.TextFrame2.TextRange.ParagraphFormat.Alignment = 2
    Set SiapkanPeta = ws
End Function

Private Function AmbilSheet(namaSheet As String) As Worksheet
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(namaSheet)
    On Error GoTo 0
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
        ws.Name = namaSheet
    End If
    Set AmbilSheet = ws
End Function

' Nama tab boleh lebih dari satu, dipisah "/" (misal "PKN / PPKN").
Private Function CariTab(wb As Workbook, daftarNama As String) As Worksheet
    Dim ws As Worksheet, t As Variant
    For Each t In Split(daftarNama, "/")
        For Each ws In wb.Worksheets
            If UCase(Replace(Trim(ws.Name), "'", "")) = UCase(Replace(Trim(t), "'", "")) Then
                Set CariTab = ws
                Exit Function
            End If
        Next ws
    Next t
End Function

Private Function Unduh(url As String, tujuan As String) As Boolean
    Dim http As Object, st As Object, isi() As Byte
    On Error GoTo Gagal
    Set http = CreateObject("MSXML2.XMLHTTP")
    ' tambahan "t=" supaya Excel tidak memakai salinan lama
    http.Open "GET", url & "&t=" & Format(Now, "yyyymmddhhnnss"), False
    http.setRequestHeader "Cache-Control", "no-cache"
    http.send
    If http.Status <> 200 Then Exit Function
    isi = http.responseBody
    If UBound(isi) < 4 Then Exit Function
    If Not (isi(0) = 80 And isi(1) = 75) Then Exit Function   ' file Excel diawali "PK"
    Set st = CreateObject("ADODB.Stream")
    st.Type = 1
    st.Open
    st.Write isi
    st.SaveToFile tujuan, 2
    st.Close
    Unduh = True
    Exit Function
Gagal:
    Unduh = False
End Function

Private Function AmbilID(link As String) As String
    Dim p As Long, q As Long, s As String
    p = InStr(1, link, "/d/", vbTextCompare)
    If p = 0 Then
        If Len(link) > 30 And InStr(link, "/") = 0 Then AmbilID = link
        Exit Function
    End If
    s = Mid$(link, p + 3)
    q = InStr(s, "/")
    If q > 0 Then s = Left$(s, q - 1)
    q = InStr(s, "?")
    If q > 0 Then s = Left$(s, q - 1)
    AmbilID = s
End Function

Private Function NamaBaku(ByVal s As String) As String
    s = UCase$(Replace(s, Chr(160), " "))
    s = Replace(s, ".", ". ")
    s = Replace(s, vbTab, " ")
    Do While InStr(s, "  ") > 0
        s = Replace(s, "  ", " ")
    Loop
    NamaBaku = Trim$(s)
End Function

Private Function NilaiTeks(v As Variant) As Variant
    If IsError(v) Then NilaiTeks = "" Else NilaiTeks = v
End Function

Private Function AdalahNomor(v As Variant) As Boolean
    If IsError(v) Or IsEmpty(v) Then Exit Function
    If VarType(v) = vbDouble Then
        AdalahNomor = (v = Int(v) And v > 0)
    ElseIf VarType(v) = vbString Then
        AdalahNomor = (Trim(v) Like "#*" And Not Trim(v) Like "*[!0-9]*")
    End If
End Function

' Angka dari sel GS; selain angka (kosong, teks, #DIV/0!) dianggap kosong.
Private Function AmbilAngka(v As Variant) As Variant
    Dim s As String
    AmbilAngka = Empty
    If IsError(v) Or IsEmpty(v) Then Exit Function
    Select Case VarType(v)
        Case vbDouble, vbInteger, vbLong, vbSingle, vbCurrency, vbDecimal
            AmbilAngka = CDbl(v)
        Case vbString
            s = Replace(Trim(v), ",", ".")
            If s <> "" And Not s Like "*[!0-9.]*" And Len(s) - Len(Replace(s, ".", "")) <= 1 Then
                If s <> "." Then AmbilAngka = Val(s)
            End If
    End Select
End Function

Private Function KolomKeAngka(ByVal kol As String) As Long
    Dim i As Long, c As Long, n As Long
    kol = UCase(Trim(kol))
    If kol = "" Then Exit Function
    For i = 1 To Len(kol)
        c = Asc(Mid$(kol, i, 1))
        If c < 65 Or c > 90 Then KolomKeAngka = 0: Exit Function
        n = n * 26 + (c - 64)
    Next i
    KolomKeAngka = n
End Function
