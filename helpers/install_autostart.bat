@echo off
chcp 65001 > nul

echo [1/4] Stopping any existing Custom Bypass VPN proxy...
taskkill /F /IM pythonw.exe /T >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *local_adapter*" /T >nul 2>&1

echo [2/4] Starting silent background proxy...
set SCRIPT_DIR=%~dp0
wscript.exe "%SCRIPT_DIR%start_silent_proxy.vbs"

echo [3/4] Adding to Windows Startup...
set VBS_PATH=%SCRIPT_DIR%start_silent_proxy.vbs
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set GEN_VBS=%TEMP%\AGCreateShortcut.vbs

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%GEN_VBS%"
echo sLinkFile = "%STARTUP_FOLDER%\AG_AntiVPN_Helper.lnk" >> "%GEN_VBS%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%GEN_VBS%"
echo oLink.TargetPath = "wscript.exe" >> "%GEN_VBS%"
echo oLink.Arguments = """%VBS_PATH%""" >> "%GEN_VBS%"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> "%GEN_VBS%"
echo oLink.Description = "Custom Bypass VPN Silent Helper" >> "%GEN_VBS%"
echo oLink.Save >> "%GEN_VBS%"
cscript //nologo "%GEN_VBS%"
del "%GEN_VBS%" >nul 2>&1

echo [4/4] Registering 1-click silent protocol launcher (ag-antivpn://)...
reg add "HKCU\Software\Classes\ag-antivpn" /ve /t REG_SZ /d "URL:Custom Bypass VPN Protocol" /f >nul 2>&1
reg add "HKCU\Software\Classes\ag-antivpn" /v "URL Protocol" /t REG_SZ /d "" /f >nul 2>&1
reg add "HKCU\Software\Classes\ag-antivpn\shell\open\command" /ve /t REG_SZ /d "wscript.exe \"%SCRIPT_DIR%start_silent_proxy.vbs\"" /f >nul 2>&1

echo.
echo ========================================================
echo   DONE! Proxy is running in background silently.
echo   Auto-start on Windows boot and 1-Click Popup launch enabled!
echo ========================================================
