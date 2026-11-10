Attribute VB_Name = "AmbilNilaiGS"
' =====================================================================
'  AMBIL NILAI DARI GOOGLE SHEET  +  HALAMAN BERANDA
'
'  Dipasang sekali oleh admin/TU:  Alt+F8  ->  BuatBeranda  ->  Run
'  (atau otomatis lewat alat/pasang_beranda.py, yang juga membuat raport
'   membuka BERANDA setiap kali dibuka)
'
'  Sheet yang dibuat:
'   BERANDA        halaman utama wali kelas (link, tombol, status mapel)
'   PENGATURAN     daftar tab Google Sheet dan kolomnya di raport (disembunyikan)
'   LAPORAN NILAI  rincian hasil terakhir
'
'  Aturan:
'   - Siswa dicocokkan berdasarkan NAMA (bukan nomor urut).
'   - Sel rumus tidak ditimpa, kecuali 2 kolom Nilai Raport mapel pondok.
'   - Daftar siswa di sheet "siswa" tidak diubah.
' =====================================================================
Option Explicit

Private Const BERANDA As String = "BERANDA"
Private Const ATUR As String = "PENGATURAN"
Private Const LAPORAN As String = "LAPORAN NILAI"
Private Const SEL_LINK As String = "C7"
Private Const SEL_WAKTU As String = "C13"
Private Const BARIS_STATUS As Long = 6       ' BERANDA: baris pertama daftar mapel
Private Const MAKS_SISWA As Long = 40
Private Const BARIS_SISWA As Long = 7        ' sheet siswa, siswa ke-1
Private Const BARIS_UMUM As Long = 388       ' sheet Ff11, siswa ke-1
Private Const BARIS_PONDOK As Long = 9       ' sheet Form Nilai, siswa ke-1

Private Const HIJAU As Long = 5205515        ' RGB(11,110,79)
Private Const LATAR As Long = 16316919       ' RGB(247,249,248)
Private Const FONT_UTAMA As String = "Segoe UI"

Private catatan As Collection

' ---------------------------------------------------------------------
'  TOMBOL-TOMBOL
' ---------------------------------------------------------------------
Public Sub AmbilNilai()
    Dim wsB As Worksheet, wsA As Worksheet, link As String, idSheet As String
    Dim fileSementara As String, wbGS As Workbook
    Dim nama(1 To MAKS_SISWA) As String, kunci(1 To MAKS_SISWA) As String
    Dim jmlSiswa As Long, i As Long, r As Long
    Dim kalk As Long, ff11Dikunci As Boolean
    Dim namaGS As Object, hasil As Collection

    Set catatan = New Collection
    Set hasil = New Collection
    Set namaGS = CreateObject("Scripting.Dictionary")

    Set wsB = SiapkanBeranda()
    Set wsA = SiapkanPengaturan()
    link = Trim(CStr(wsB.Range(SEL_LINK).Value))
    If link = "" Then
        wsB.Activate
        wsB.Range(SEL_LINK).Select
        MsgBox "Langkah 1 belum diisi." & vbCrLf & vbCrLf & _
               "Tempel link Google Sheet kelas di kotak kuning, lalu klik AMBIL NILAI lagi.", _
               vbExclamation, "Ambil Nilai"
        Exit Sub
    End If
    idSheet = AmbilID(link)
    If idSheet = "" Then
        MsgBox "Isi kotak kuning bukan link Google Sheet." & vbCrLf & _
               "Contoh link yang benar:" & vbCrLf & _
               "https://docs.google.com/spreadsheets/d/..../edit", vbExclamation, "Ambil Nilai"
        Exit Sub
    End If

    ' 1) unduh Google Sheet sebagai file Excel sementara
    Application.StatusBar = "Mengambil nilai dari Google Sheet, mohon tunggu ..."
    fileSementara = Environ$("TEMP") & "\nilai_gs_" & Format(Now, "yyyymmddhhnnss") & ".xlsx"
    If Not Unduh("https://docs.google.com/spreadsheets/d/" & idSheet & "/export?format=xlsx", fileSementara) Then
        Application.StatusBar = False
        MsgBox "Nilai tidak bisa diambil." & vbCrLf & vbCrLf & _
               "Periksa:" & vbCrLf & _
               "1. Komputer tersambung ke internet." & vbCrLf & _
               "2. Google Sheet sudah dibagikan:" & vbCrLf & _
               "   Bagikan > Siapa saja yang memiliki link > Pelihat.", vbExclamation, "Ambil Nilai"
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

    ' 4) isi setiap mapel sesuai PENGATURAN
    r = 5
    Do While Trim(CStr(wsA.Cells(r, 1).Value)) <> ""
        hasil.Add IsiMapel(wbGS, _
            Trim(CStr(wsA.Cells(r, 1).Value)), _
            UCase(Trim(CStr(wsA.Cells(r, 2).Value))), _
            UCase(Trim(CStr(wsA.Cells(r, 3).Value))), _
            Trim(CStr(wsA.Cells(r, 4).Value)), _
            nama, kunci, jmlSiswa, namaGS)
        r = r + 1
    Loop

    If ff11Dikunci Then ThisWorkbook.Worksheets("Ff11").Protect _
        DrawingObjects:=True, Contents:=True, Scenarios:=True

    wbGS.Close SaveChanges:=False
    Set wbGS = Nothing
    On Error Resume Next
    Kill fileSementara
    Application.Calculation = kalk
    Application.CalculateFull
    Application.EnableEvents = True
    On Error GoTo 0

    TulisHasil hasil, nama, kunci, jmlSiswa, namaGS
    Application.ScreenUpdating = True
    Application.StatusBar = False
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
    MsgBox "Terjadi kesalahan: " & pesan & vbCrLf & vbCrLf & _
           "Tutup raport TANPA menyimpan, buka lagi, lalu coba sekali lagi.", vbCritical, "Ambil Nilai"
End Sub

' Dijalankan sekali oleh admin/TU untuk memasang halaman BERANDA.
Public Sub BuatBeranda()
    Dim ws As Worksheet, linkLama As String
    SiapkanPengaturan
    On Error Resume Next
    linkLama = CStr(ThisWorkbook.Worksheets(BERANDA).Range(SEL_LINK).Value)
    Application.DisplayAlerts = False
    ThisWorkbook.Worksheets(BERANDA).Delete
    Application.DisplayAlerts = True
    On Error GoTo 0
    Set ws = SiapkanBeranda()
    If linkLama <> "" Then
        ws.Unprotect
        ws.Range(SEL_LINK).Value = linkLama
        KunciBeranda ws
    End If
    ws.Activate
    MsgBox "Halaman BERANDA sudah dibuat." & vbCrLf & vbCrLf & _
           "Simpan raport sekarang (Ctrl+S) saat halaman BERANDA terbuka," & vbCrLf & _
           "supaya raport selalu terbuka di halaman ini.", vbInformation, "Selesai"
End Sub

' Dipanggil otomatis saat raport dibuka: membuat BERANDA bila belum ada, lalu membukanya.
Public Sub BukaBeranda()
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(BERANDA)
    On Error GoTo Gagal
    If ws Is Nothing Then
        SiapkanPengaturan
        Set ws = SiapkanBeranda()
    End If
    ws.Activate
    ws.Range("A1").Select
    Exit Sub
Gagal:
    MsgBox "Halaman BERANDA belum bisa dibuat: " & Err.Description & vbCrLf & _
           "Mohon foto pesan ini dan kirim ke admin.", vbExclamation, "BERANDA"
End Sub

Public Sub KeBeranda()
    SiapkanBeranda.Activate
End Sub

Public Sub KeDataSiswa()
    BukaSheet "siswa"
End Sub

Public Sub KeCetakSMP()
    BukaSheet "rapot smp1"
End Sub

Public Sub KeCetakPondok()
    BukaSheet "rapor pondok"
End Sub

Public Sub KeMenuLengkap()
    BukaSheet "menu"
End Sub

Public Sub KeLaporan()
    BukaSheet LAPORAN
End Sub

Private Sub BukaSheet(namaSheet As String)
    On Error GoTo Tidak
    ThisWorkbook.Worksheets(namaSheet).Activate
    ThisWorkbook.Worksheets(namaSheet).Range("A1").Select
    Exit Sub
Tidak:
    MsgBox "Halaman '" & namaSheet & "' belum ada." & _
           IIf(namaSheet = LAPORAN, vbCrLf & "Klik AMBIL NILAI dulu.", ""), vbInformation
End Sub

' ---------------------------------------------------------------------
'  PENGISIAN NILAI
' ---------------------------------------------------------------------
' Hasil: nama mapel | status | keterangan   (dipisah vbTab)
Private Function IsiMapel(wbGS As Workbook, namaTab As String, jenis As String, kolom As String, _
                          namaMapel As String, nama() As String, kunci() As String, _
                          jmlSiswa As Long, namaGS As Object) As String
    Dim ws As Worksheet, data As Variant, barisGS As Object
    Dim i As Long, j As Long, k As Long, b As Long
    Dim tujuan As Worksheet, barisAwal As Long, c0 As Long
    Dim kolTujuan(0 To 9) As Long, kolSumber(0 To 9) As Long
    Dim terisi As Long, kosong As String, jmlKosong As Long
    Dim ada As Boolean, v As Variant, adaNilai As Boolean, label As String

    label = IIf(namaMapel = "", namaTab, namaMapel)
    Set ws = CariTab(wbGS, namaTab)
    If ws Is Nothing Then
        IsiMapel = label & vbTab & "TIDAK ADA" & vbTab & "Tab '" & namaTab & "' tidak ada di Google Sheet"
        Exit Function
    End If
    c0 = KolomKeAngka(kolom)
    If c0 = 0 Then
        IsiMapel = label & vbTab & "TIDAK ADA" & vbTab & "Kolom di PENGATURAN salah"
        Exit Function
    End If
    If ws.UsedRange.Column <> 1 Then
        IsiMapel = label & vbTab & "TIDAK ADA" & vbTab & "Tab tidak dimulai dari kolom A"
        Exit Function
    End If

    If jenis = "UMUM" Then
        ' Ff11: kolom No = kolom "MAPEL :" + 1
        Set tujuan = ThisWorkbook.Worksheets("Ff11")
        barisAwal = BARIS_UMUM
        For j = 0 To 7
            kolTujuan(j) = c0 + 1 + 4 + j: kolSumber(j) = j     ' Sumatif 1-8 <- GS kolom C-J
        Next j
        kolTujuan(8) = c0 + 1 + 14: kolSumber(8) = 10          ' Non Tes     <- GS kolom M
        kolTujuan(9) = c0 + 1 + 15: kolSumber(9) = 11          ' Tes         <- GS kolom N
    Else
        ' Form Nilai: 10 kolom mulai "Tugas 1" <- GS kolom C-L
        Set tujuan = ThisWorkbook.Worksheets("Form Nilai")
        barisAwal = BARIS_PONDOK
        For j = 0 To 9
            kolTujuan(j) = c0 + j: kolSumber(j) = j
        Next j
    End If

    ' baris siswa di tab GS: kolom A berisi nomor, kolom B nama
    data = ws.UsedRange.Value2
    Set barisGS = CreateObject("Scripting.Dictionary")
    If IsArray(data) Then
        If UBound(data, 2) >= 2 Then
            For b = 1 To UBound(data, 1)
                If AdalahNomor(data(b, 1)) Then
                    If Trim(CStr(NilaiTeks(data(b, 2)))) <> "" Then
                        barisGS(NamaBaku(CStr(data(b, 2)))) = b
                        namaGS(NamaBaku(CStr(data(b, 2)))) = Trim(CStr(data(b, 2)))
                    End If
                End If
            Next b
        End If
    End If

    For i = 1 To MAKS_SISWA
        ada = False
        For j = 0 To 9
            v = Empty
            If i <= jmlSiswa And kunci(i) <> "" Then
                If barisGS.Exists(kunci(i)) Then
                    k = 3 + kolSumber(j)                       ' kolom C = 3
                    If k <= UBound(data, 2) Then v = AmbilAngka(data(barisGS(kunci(i)), k))
                End If
            End If
            TulisSel tujuan.Cells(barisAwal + i - 1, kolTujuan(j)), v, (jenis <> "UMUM" And j >= 8)
            If Not IsEmpty(v) Then ada = True
        Next j
        If ada Then
            terisi = terisi + 1: adaNilai = True
        ElseIf i <= jmlSiswa And nama(i) <> "" Then
            kosong = kosong & IIf(kosong = "", "", ", ") & nama(i)
            jmlKosong = jmlKosong + 1
        End If
    Next i

    If Not adaNilai Then
        IsiMapel = label & vbTab & "KOSONG" & vbTab & "Guru belum mengisi nilai"
    ElseIf jmlKosong = 0 Then
        IsiMapel = label & vbTab & "LENGKAP" & vbTab & terisi & " siswa terisi"
    Else
        IsiMapel = label & vbTab & "BELUM LENGKAP" & vbTab & jmlKosong & " siswa belum ada nilai: " & kosong
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

' ---------------------------------------------------------------------
'  HASIL: status di BERANDA + rincian di LAPORAN NILAI
' ---------------------------------------------------------------------
Private Sub TulisHasil(hasil As Collection, nama() As String, kunci() As String, _
                       jmlSiswa As Long, namaGS As Object)
    Dim wsB As Worksheet, wsL As Worksheet, x As Variant, p As Variant
    Dim r As Long, i As Long, d As Object, kk As Variant
    Dim nLengkap As Long, nBelum As Long, nKosong As Long, nBeda As Long

    Set d = CreateObject("Scripting.Dictionary")
    For i = 1 To jmlSiswa
        If kunci(i) <> "" Then d(kunci(i)) = True
    Next i

    ' --- LAPORAN NILAI
    Set wsL = AmbilSheet(LAPORAN)
    wsL.Cells.Clear
    wsL.Cells.Font.Name = FONT_UTAMA
    wsL.Range("A1").Value = "RINCIAN AMBIL NILAI  -  " & Format(Now, "dd/mm/yyyy hh:nn")
    wsL.Range("A1").Font.Size = 14: wsL.Range("A1").Font.Bold = True
    r = 3
    wsL.Cells(r, 1).Value = "NAMA YANG TIDAK COCOK": wsL.Cells(r, 1).Font.Bold = True: r = r + 1
    wsL.Cells(r, 1).Value = "Samakan ejaannya (di Google Sheet tab SISWA atau di sheet siswa), lalu klik AMBIL NILAI lagi."
    wsL.Cells(r, 1).Font.Italic = True: r = r + 1
    For Each kk In namaGS.Keys
        If Not d.Exists(kk) Then
            wsL.Cells(r, 1).Value = "Ada di Google Sheet, tidak ada di raport"
            wsL.Cells(r, 2).Value = namaGS(kk): r = r + 1: nBeda = nBeda + 1
        End If
    Next kk
    For i = 1 To jmlSiswa
        If nama(i) <> "" And Not namaGS.Exists(kunci(i)) Then
            wsL.Cells(r, 1).Value = "Ada di raport, tidak ada di Google Sheet"
            wsL.Cells(r, 2).Value = nama(i): r = r + 1: nBeda = nBeda + 1
        End If
    Next i
    If nBeda = 0 Then wsL.Cells(r, 1).Value = "Semua nama cocok.": r = r + 1

    r = r + 1
    wsL.Cells(r, 1).Value = "NILAI PER MAPEL": wsL.Cells(r, 1).Font.Bold = True: r = r + 1
    For Each x In hasil
        p = Split(x, vbTab)
        wsL.Cells(r, 1).Value = p(0): wsL.Cells(r, 2).Value = p(1): wsL.Cells(r, 3).Value = p(2)
        r = r + 1
    Next x

    r = r + 1
    wsL.Cells(r, 1).Value = "CATATAN SEL": wsL.Cells(r, 1).Font.Bold = True: r = r + 1
    If catatan.Count = 0 Then wsL.Cells(r, 1).Value = "Tidak ada sel rumus yang tertimpa."
    For Each x In catatan
        wsL.Cells(r, 1).Value = x: r = r + 1
    Next x
    wsL.Columns("A").ColumnWidth = 42
    wsL.Columns("B").ColumnWidth = 34
    wsL.Columns("C").ColumnWidth = 80
    TombolKecil wsL, wsL.Range("E1:F2"), "KEMBALI KE BERANDA", "KeBeranda", HIJAU

    ' --- status di BERANDA
    Set wsB = SiapkanBeranda()
    wsB.Unprotect
    With wsB.Range(wsB.Cells(BARIS_STATUS, 7), wsB.Cells(BARIS_STATUS + 39, 9))
        .Clear
        .Interior.Color = LATAR
        .Font.Name = FONT_UTAMA
    End With
    r = BARIS_STATUS
    For Each x In hasil
        p = Split(x, vbTab)
        If p(1) <> "TIDAK ADA" Then
            wsB.Cells(r, 7).Value = p(0)
            wsB.Cells(r, 8).Value = p(1)
            wsB.Cells(r, 9).Value = p(2)
            Select Case p(1)
                Case "LENGKAP"
                    WarnaStatus wsB.Cells(r, 8), RGB(198, 239, 206), RGB(0, 97, 0): nLengkap = nLengkap + 1
                Case "BELUM LENGKAP"
                    WarnaStatus wsB.Cells(r, 8), RGB(255, 235, 156), RGB(156, 87, 0): nBelum = nBelum + 1
                Case Else
                    WarnaStatus wsB.Cells(r, 8), RGB(255, 199, 206), RGB(156, 0, 6): nKosong = nKosong + 1
            End Select
            With wsB.Range(wsB.Cells(r, 7), wsB.Cells(r, 9))
                .Font.Size = 10
                .Borders(xlEdgeBottom).Color = RGB(217, 217, 217)
                .VerticalAlignment = xlCenter
            End With
            r = r + 1
        End If
    Next x
    If r = BARIS_STATUS Then
        wsB.Cells(r, 7).Value = "Tidak ada tab mapel yang cocok di Google Sheet. Periksa link di Langkah 1."
        wsB.Cells(r, 7).Font.Color = RGB(192, 0, 0)
    End If
    wsB.Range(SEL_WAKTU).Value = "Terakhir diambil: " & Format(Now, "dd/mm/yyyy  hh:nn")
    wsB.Range("C17").Value = nLengkap & " lengkap   |   " & nBelum & " belum lengkap   |   " & nKosong & " kosong"
    wsB.Range("C18").Value = IIf(nBeda = 0, "Semua nama siswa cocok.", nBeda & " nama siswa tidak cocok. Klik LIHAT RINCIAN.")
    wsB.Range("C18").Font.Color = IIf(nBeda = 0, RGB(0, 97, 0), RGB(192, 0, 0))
    KunciBeranda wsB
    wsB.Activate
    wsB.Range("A1").Select

    MsgBox "Selesai. Nilai sudah masuk ke raport." & vbCrLf & vbCrLf & _
           "Lengkap: " & nLengkap & vbCrLf & _
           "Belum lengkap: " & nBelum & vbCrLf & _
           "Kosong: " & nKosong & vbCrLf & _
           IIf(nBeda > 0, vbCrLf & "Ada " & nBeda & " nama siswa yang tidak cocok. Klik LIHAT RINCIAN." & vbCrLf, "") & _
           vbCrLf & "Jangan lupa SIMPAN raport (Ctrl+S).", vbInformation, "Ambil Nilai"
End Sub

Private Sub WarnaStatus(sel As Range, warnaLatar As Long, warnaTeks As Long)
    sel.Interior.Color = warnaLatar
    sel.Font.Color = warnaTeks
    sel.Font.Bold = True
    sel.HorizontalAlignment = xlCenter
End Sub

' ---------------------------------------------------------------------
'  TAMPILAN BERANDA
' ---------------------------------------------------------------------
Private Function SiapkanBeranda() As Worksheet
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(BERANDA)
    On Error GoTo 0
    If Not ws Is Nothing Then Set SiapkanBeranda = ws: Exit Function

    Set ws = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Worksheets(1))
    ws.Name = BERANDA
    On Error Resume Next
    ws.Tab.Color = HIJAU
    On Error GoTo 0
    With ws.Cells
        .Font.Name = FONT_UTAMA
        .Font.Size = 11
        .Interior.Color = LATAR
        .VerticalAlignment = xlCenter
    End With
    ws.Columns("A").ColumnWidth = 2
    ws.Columns("B").ColumnWidth = 6
    ws.Columns("C").ColumnWidth = 22
    ws.Columns("D").ColumnWidth = 22
    ws.Columns("E").ColumnWidth = 22
    ws.Columns("F").ColumnWidth = 3
    ws.Columns("G").ColumnWidth = 30
    ws.Columns("H").ColumnWidth = 16
    ws.Columns("I").ColumnWidth = 48

    ' judul
    With ws.Range("A1:I3")
        .Interior.Color = HIJAU
        .Font.Color = vbWhite
    End With
    ws.Rows(1).RowHeight = 10
    ws.Rows(2).RowHeight = 34
    ws.Rows(3).RowHeight = 22
    ws.Range("B2").Value = "RAPORT KELAS  -  HALAMAN UTAMA"
    ws.Range("B2").Font.Size = 20: ws.Range("B2").Font.Bold = True
    On Error Resume Next
    ws.Range("B3").Formula = "=menu!B5&""   |   Kelas ""&menu!H6&""   |   Semester ""&menu!H5&""   |   TP ""&menu!H4"
    On Error GoTo 0
    ws.Range("B3").Font.Size = 10

    ' langkah-langkah (kolom B-E)
    Langkah ws, 5, "1", "Tempel link Google Sheet kelas", "Cukup sekali. Link didapat dari TU / admin sekolah."
    With ws.Range("C7:E7")
        .Merge
        .Interior.Color = RGB(255, 244, 204)
        .Borders.Color = RGB(255, 192, 0)
        .Borders.Weight = xlMedium
        .Font.Size = 9
        .ShrinkToFit = True
    End With
    ws.Rows(7).RowHeight = 28

    Langkah ws, 9, "2", "Klik tombol hijau untuk mengambil nilai", ""
    TombolBesar ws, ws.Range("C11:E12"), "AMBIL NILAI", "AmbilNilai", HIJAU
    ws.Rows(11).RowHeight = 24: ws.Rows(12).RowHeight = 24
    ws.Range(SEL_WAKTU).Font.Size = 9: ws.Range(SEL_WAKTU).Font.Color = RGB(89, 89, 89)
    ws.Range(SEL_WAKTU).Value = "Belum pernah diambil."

    Langkah ws, 15, "3", "Periksa daftar mapel di sebelah kanan", "Hijau = lengkap,  kuning = belum lengkap,  merah = kosong."
    ws.Range("C17").Font.Bold = True
    ws.Range("C18").Font.Size = 10
    TombolKecil ws, ws.Range("C19:D19"), "LIHAT RINCIAN", "KeLaporan", RGB(89, 89, 89)
    ws.Rows(19).RowHeight = 26

    Langkah ws, 21, "4", "Cetak raport", "Setelah semua mapel hijau."
    TombolBesar ws, ws.Range("C23:C24"), "RAPORT SMP", "KeCetakSMP", RGB(46, 117, 182)
    TombolBesar ws, ws.Range("D23:D24"), "RAPORT PONDOK", "KeCetakPondok", RGB(46, 117, 182)
    ws.Rows(23).RowHeight = 24: ws.Rows(24).RowHeight = 24

    ws.Range("C27").Value = "Lainnya:"
    ws.Range("C27").Font.Color = RGB(89, 89, 89)
    TombolKecil ws, ws.Range("C28"), "DATA SISWA", "KeDataSiswa", RGB(118, 113, 113)
    TombolKecil ws, ws.Range("D28"), "MENU LENGKAP", "KeMenuLengkap", RGB(118, 113, 113)
    ws.Rows(28).RowHeight = 26

    ' daftar status mapel (kolom G-I)
    ws.Range("G4").Value = "STATUS NILAI PER MAPEL"
    ws.Range("G4").Font.Bold = True: ws.Range("G4").Font.Size = 12: ws.Range("G4").Font.Color = HIJAU
    ws.Range("G5:I5").Value = Array("Mata Pelajaran", "Status", "Keterangan")
    With ws.Range("G5:I5")
        .Font.Bold = True
        .Font.Color = vbWhite
        .Interior.Color = HIJAU
    End With
    ws.Range("G6").Value = "Klik AMBIL NILAI untuk melihat status."
    ws.Range("G6").Font.Italic = True
    ws.Range("G6").Font.Color = RGB(127, 127, 127)

    On Error Resume Next
    ws.Activate
    ActiveWindow.DisplayGridlines = False
    ActiveWindow.DisplayHeadings = False
    ActiveWindow.Zoom = 100
    On Error GoTo 0
    KunciBeranda ws
    Set SiapkanBeranda = ws
End Function

' Hanya kotak link yang boleh diisi; tombol tetap bisa diklik.
Private Sub KunciBeranda(ws As Worksheet)
    ws.Range(SEL_LINK).MergeArea.Locked = False
    ws.Protect DrawingObjects:=True, Contents:=True, Scenarios:=True
End Sub

Private Sub Langkah(ws As Worksheet, baris As Long, no As String, judul As String, ket As String)
    With ws.Cells(baris, 2)
        .Value = no
        .Font.Size = 16: .Font.Bold = True: .Font.Color = vbWhite
        .Interior.Color = HIJAU
        .HorizontalAlignment = xlCenter
    End With
    ws.Cells(baris, 3).Value = "LANGKAH " & no & "  -  " & judul
    ws.Cells(baris, 3).Font.Bold = True
    ws.Cells(baris, 3).Font.Size = 12
    ws.Rows(baris).RowHeight = 26
    If ket <> "" Then
        ws.Cells(baris + 1, 3).Value = ket
        ws.Cells(baris + 1, 3).Font.Size = 9
        ws.Cells(baris + 1, 3).Font.Color = RGB(89, 89, 89)
    End If
End Sub

Private Sub TombolBesar(ws As Worksheet, tempat As Range, teks As String, makro As String, warna As Long)
    BuatTombol ws, tempat, teks, makro, warna, 16
End Sub

Private Sub TombolKecil(ws As Worksheet, tempat As Range, teks As String, makro As String, warna As Long)
    BuatTombol ws, tempat, teks, makro, warna, 10
End Sub

Private Sub BuatTombol(ws As Worksheet, tempat As Range, teks As String, makro As String, _
                       warna As Long, ukuran As Long)
    Dim t As Object
    On Error Resume Next
    ws.Shapes("Tombol_" & makro).Delete
    On Error GoTo 0
    Set t = ws.Shapes.AddShape(5, tempat.Left + 2, tempat.Top + 2, tempat.Width - 4, tempat.Height - 4)
    t.Name = "Tombol_" & makro
    t.OnAction = makro
    t.Fill.ForeColor.RGB = warna
    t.Line.Visible = False
    t.Placement = 1                              ' ikut ukuran sel
    With t.TextFrame
        .Characters.Text = teks
        .HorizontalAlignment = xlHAlignCenter
        .VerticalAlignment = xlVAlignCenter
        With .Characters.Font
            .Bold = True
            .Size = ukuran
            .Name = FONT_UTAMA
            .Color = RGB(255, 255, 255)
        End With
    End With
End Sub

' ---------------------------------------------------------------------
'  PENGATURAN (daftar tab mapel; disembunyikan)
' ---------------------------------------------------------------------
Private Function SiapkanPengaturan() As Worksheet
    Dim ws As Worksheet, baris As Variant, i As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(ATUR)
    On Error GoTo 0
    If Not ws Is Nothing Then Set SiapkanPengaturan = ws: Exit Function

    Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
    ws.Name = ATUR
    ws.Cells.Font.Name = FONT_UTAMA
    ws.Range("A1").Value = "PENGATURAN AMBIL NILAI  (untuk admin / TU)"
    ws.Range("A1").Font.Bold = True: ws.Range("A1").Font.Size = 14
    ws.Range("A2").Value = "Setiap baris = satu tab di Google Sheet. UMUM = sheet Ff11 (kolom 'MAPEL :'), PONDOK = sheet Form Nilai (kolom 'Tugas 1')."
    ws.Range("A3").Value = "Satu mapel boleh punya beberapa nama tab, dipisah garis miring. Wali kelas tidak perlu membuka halaman ini."
    ws.Range("A4:D4").Value = Array("Nama tab di Google Sheet", "Jenis", "Kolom di raport", "Nama mapel")
    ws.Range("A4:D4").Font.Bold = True

    baris = Array( _
        "PAI|UMUM|A|Pendidikan Agama Islam", _
        "PKN|UMUM|CV|Pendidikan Pancasila", _
        "B. INDO|UMUM|EC|Bahasa Indonesia", _
        "MTK|UMUM|FJ|Matematika", _
        "IPA|UMUM|GQ|Ilmu Pengetahuan Alam", _
        "IPS|UMUM|HX|Ilmu Pengetahuan Sosial", _
        "B. INGGRIS|UMUM|JE|Bahasa Inggris", _
        "SENI BUDAYA|UMUM|KL|Seni Budaya", _
        "PJOK|UMUM|LS|PJOK", _
        "INFORMATIKA|UMUM|MZ|Informatika", _
        "PRAKARYA|UMUM|OG|Prakarya", _
        "MULOK|UMUM|QV|Muatan Lokal", _
        "HADIST|PONDOK|C|Qur'an Hadist", _
        "BAHASA ARAB|PONDOK|P|Bahasa Arab", _
        "FIQIH|PONDOK|AC|Fiqih", _
        "TAUHID|PONDOK|AP|Tauhid", _
        "NAHWU|PONDOK|BC|Nahwu", _
        "SHOROF|PONDOK|BQ|Shorof", _
        "TAFSIR|PONDOK|CD|Tafsir", _
        "TARIKH|PONDOK|CQ|Tarikh", _
        "TASRIF|PONDOK|DD|Tasrif", _
        "TAJWID|PONDOK|DQ|Tajwid", _
        "S. ALKHAIRAAT|PONDOK|HQ|Sejarah Al Khairaat", _
        "MUHADATSAH|PONDOK|ID|Insya' / Muhadatsah", _
        "AL ANGHAAM|PONDOK|IQ|Al Anghaam", _
        "MAHFUZATH|PONDOK|JD|Mahfuzat", _
        "MUFRADAT|PONDOK|JQ|Mufradat", _
        "IMLA / IMLA'|PONDOK|KD|Imla")
    For i = 0 To UBound(baris)
        ws.Range(ws.Cells(5 + i, 1), ws.Cells(5 + i, 4)).Value = Split(baris(i), "|")
    Next i
    ws.Columns("A:D").AutoFit
    On Error Resume Next
    ws.Tab.Color = RGB(166, 166, 166)
    On Error GoTo 0
    ws.Visible = xlSheetHidden
    Set SiapkanPengaturan = ws
End Function

' ---------------------------------------------------------------------
'  ALAT BANTU
' ---------------------------------------------------------------------
Private Function AmbilSheet(namaSheet As String) As Worksheet
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(namaSheet)
    On Error GoTo 0
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
        ws.Name = namaSheet
        On Error Resume Next
        ws.Tab.Color = RGB(166, 166, 166)
        On Error GoTo 0
    End If
    Set AmbilSheet = ws
End Function

' Nama tab boleh lebih dari satu, dipisah "/" (misal "IMLA / IMLA'").
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
    If p = 0 Then Exit Function
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
        AdalahNomor = (Trim(v) Like "#*") And Not (Trim(v) Like "*[!0-9]*")
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
            If s <> "" And s <> "." And Not (s Like "*[!0-9.]*") Then
                If Len(s) - Len(Replace(s, ".", "")) <= 1 Then AmbilAngka = Val(s)
            End If
    End Select
End Function

Private Function KolomKeAngka(ByVal kol As String) As Long
    Dim i As Long, c As Long, n As Long
    kol = UCase(Trim(kol))
    If kol = "" Then Exit Function
    For i = 1 To Len(kol)
        c = Asc(Mid$(kol, i, 1))
        If c < 65 Or c > 90 Then Exit Function
        n = n * 26 + (c - 64)
    Next i
    KolomKeAngka = n
End Function
