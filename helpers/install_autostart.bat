@echo off
chcp 65001 > nul

echo [1/3] Stopping any existing AG AntiVPN proxy...
taskkill /F /IM pythonw.exe /T 2>nul
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *local_adapter*" /T 2>nul
timeout /t 1 /nobreak > nul

echo [2/3] Starting silent background proxy...
set SCRIPT_DIR=%~dp0
wscript.exe "%SCRIPT_DIR%start_silent_proxy.vbs"
timeout /t 2 /nobreak > nul

echo [3/3] Adding to Windows Startup...
set VBS_PATH=%SCRIPT_DIR%start_silent_proxy.vbs
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set GEN_VBS=%TEMP%\AGCreateShortcut.vbs

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%GEN_VBS%"
echo sLinkFile = "%STARTUP_FOLDER%\AG_AntiVPN_Helper.lnk" >> "%GEN_VBS%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%GEN_VBS%"
echo oLink.TargetPath = "wscript.exe" >> "%GEN_VBS%"
echo oLink.Arguments = """%VBS_PATH%""" >> "%GEN_VBS%"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> "%GEN_VBS%"
echo oLink.Description = "AG AntiVPN Silent Local Proxy Helper" >> "%GEN_VBS%"
echo oLink.Save >> "%GEN_VBS%"
cscript //nologo "%GEN_VBS%"
del "%GEN_VBS%" 2>nul

echo.
echo ========================================
echo   DONE! Proxy is running in background.
echo   It will auto-start on Windows boot.
echo ========================================
timeout /t 3 /nobreak > nul
