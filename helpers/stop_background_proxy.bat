@echo off
chcp 65001 > nul
title توقف سرویس پس‌زمینه AG AntiVPN

echo 🛑 در حال متوقف‌سازی سرویس پس‌زمینه AG AntiVPN...
taskkill /F /IM pythonw.exe /T 2>nul
taskkill /FI "WINDOWTITLE eq AG AntiVPN*" /F 2>nul

echo.
echo ✅ سرویس پس‌زمینه با موفقیت متوقف شد.
timeout /t 2 > nul
