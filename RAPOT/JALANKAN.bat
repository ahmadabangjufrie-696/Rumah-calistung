@echo off
REM Seret (drag) file raport .xlsm ke ikon ini, atau klik dua kali lalu ketik namanya.
cd /d "%~dp0"
set "RAPORT=%~1"
if "%RAPORT%"=="" set /p RAPORT=Nama file raport (.xlsm): 
python isi_raport.py "%RAPORT%"
echo.
pause
