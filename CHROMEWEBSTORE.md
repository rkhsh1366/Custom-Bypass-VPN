# Chrome Web Store Resubmission Guide (Policy Compliant)

این راهنما شامل توضیحات جدید اصلاح‌شده بدون نام برندهای تجاری (برای رفع ارور Keyword Spam) و لینک اختصاصی Privacy Policy (برای رفع ارور User Data Privacy) می‌باشد.

---

## 📌 1. اصلاح ایراد اول: متن توضیحات جدید (Store Listing -> Description)

گوگل لیست کردن نام نرم‌افزارها مانند v2rayN, OpenVPN, Windscribe, Clash و ... را **Keyword Spam** دانسته است. متن اصلاح‌شده زیر تمام ویژگی‌ها را کاملاً حرفه‌ای و بدون تکرار نام برندها بیان می‌کند.

تمام متن زیر را کپی کرده و در کادر **Description** در داشبورد گوگل قرار دهید:

```text
Custom Bypass VPN gives you full control over your browser connections when running system-wide VPN software or local proxies.

Key Features:
- Selective Tab & Domain Bypass: Route specific websites or individual Chrome tabs directly through your local network interface while keeping other browsing traffic encrypted.
- 1-Click Popup Control: Easily toggle VPN bypass for any active tab directly from the extension popup interface.
- Multi-Country Regional Auto-Bypass: Built-in 1-click toggles for regional top-level domains (.IR, .RU, .CN, .TR, and .BY).
- Real-time Visual Badges: Instantly see whether a tab is running through the VPN (blue badge) or bypassing it (emerald badge).
- Universal Proxy Compatibility: Seamlessly integrates with system proxy mode, local HTTP/SOCKS5 proxies, and TUN network adapters.
- 100% Privacy Focused: Fully local PAC routing engine. Zero tracking, zero data collection, and zero external analytics servers.

---

[ فارسی - Persian ]
افزونه Custom Bypass VPN - مدیریت انتخابی مسیریابی و غیرفعال‌سازی VPN برای تب‌ها و دامنه‌ها در کروم.
با این افزونه می‌توانید هنگام روشن بودن فیلترشکن، دامنه‌ها و تب‌های دلخواه (مانند سایت‌های بانکی و خدمت‌رسانی) را بدون VPN و با اینترنت مستقیم باز کنید.
- بای‌پاس خودکار دامنه‌های کشوری (.IR, .RU, .CN, .TR, .BY).
- سازگار با انواع پروکسی‌های لوکال، SOCKS5 و آداپتورهای سیستم‌عامل.
- کاملاً رایگان، بدون جمع‌آوری اطلاعات و حفظ کامل حریم خصوصی.

---

[ Русский - Russian ]
Custom Bypass VPN - Выборочный обход VPN для вкладок и доменов в Google Chrome.
Позволяет отключать VPN для выбранных сайтов (банковские сервисы, локальные домены), сохраняя работающий VPN для всех остальных вкладок.
- Автоматический обход национальных доменов (.RU, .SU, .рф, .IR, .CN, .TR, .BY).
- Полная конфиденциальность: обработка 100% локально.

---

[ 中文 - Chinese ]
Custom Bypass VPN - Chrome 浏览器选择性 VPN 分流与域名直连插件。
当您开启系统 VPN 或代理时，轻松实现指定标签页与域名绕过 VPN 直接连接本地网络。
- 支持国家/地区域名一键直连（.CN, .IR, .RU, .TR, .BY）。
- 100% 本地 PAC 代理控制，无追踪，零数据收集。
```

---

## 🔒 2. اصلاح ایراد دوم: لینک اختصاصی Privacy Policy URL

گوگل لینک‌های عمومی مانند google.com یا github.com را قبول نمی‌کند و باید لینکی که مستقیماً سند حریم خصوصی این افزونه را نمایش می‌دهد وارد کنید.

یکی از دو لینک اختصاصی زیر را در کادر **Privacy policy URL\*** (پایین صفحه Privacy) قرار دهید:

```text
https://raw.githubusercontent.com/rkhsh1366/Custom-Bypass-VPN/main/PRIVACY_POLICY.md
```
یا (در صورت فعال بودن GitHub Pages):
```text
https://rkhsh1366.github.io/Custom-Bypass-VPN/PRIVACY_POLICY.html
```

---

## 🚀 3. مراحل ارسال مجدد در داشبورد گوگل (Re-submission)

1. وارد **[Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)** شوید.
2. روی افزونه **Custom Bypass VPN** کلیک کنید.
3. در تب **Store listing**، متن جدید کادر Description بالا را کپی و جایگزین متن قبلی کنید.
4. در تب **Privacy**، لینک جدید Privacy Policy را در کادر `Privacy policy URL` قرار دهید.
5. دکمه **Save draft** و سپس دکمه **Submit for review** را کلیک کنید!
