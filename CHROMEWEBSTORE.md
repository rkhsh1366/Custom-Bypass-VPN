# Chrome Web Store Metadata & Publishing Guide

این سند شامل تمامی مشخصات، توضیحات سئو شده چندزبانه (انگلیسی، فارسی، روسی، چینی، ترکی)، توجیه دسترسی‌ها (Permissions Justifications)، و سیاست حریم خصوصی برای انتشار رسمی افزونه **Custom Bypass VPN** در کروم وب استور (Chrome Web Store) می‌باشد.

---

## 📌 1. اطلاعات اصلی انتشار (Store Listing)

- **Extension Name**: Custom Bypass VPN
- **Version**: 1.0.0
- **Summary / Short Description**:
  Selectively bypass system VPN for specific Chrome tabs and domains (.IR, .RU, .CN, .TR, .BY) with dynamic PAC proxy routing.
- **Detailed Description (Multilingual SEO for English, Persian, Russian, Chinese, Turkish)**:

```text
Custom Bypass VPN gives you full control over your browser connection when running a system-wide VPN or proxy (v2rayN, v2Box, OpenVPN, Windscribe, WireGuard, Clash, Sing-Box).

Key Features:
- Selective Tab & Domain Bypass: Choose specific websites or tabs to bypass the VPN and connect directly via your local network interface.
- 1-Click Popup Control: Easily toggle VPN bypass for any active tab directly from the extension popup.
- Multi-Country Regional Auto-Bypass: Built-in 1-click toggles for regional TLDs including Iran (.IR), Russia (.RU / .рф), China (.CN), Turkey (.TR), and Belarus (.BY).
- Real-time Visual Status Badges: Instantly see whether a tab is running through the VPN (blue badge) or bypassing it (emerald badge).
- Broad Compatibility: Works seamlessly with v2rayN (System Proxy & SOCKS5), v2Box, OpenVPN, Windscribe, Clash, Sing-Box, and Nekoray.
- Privacy First: 100% local processing. No tracking, no user data collection, and no external servers.

---

[ فارسی - Persian ]
افزونه Custom Bypass VPN - غیرفعال‌سازی انتخابی VPN برای تب‌ها و دامنه‌ها در مرورگر کروم. 
با این افزونه می‌توانید هنگام روشن بودن VPN (مانند v2rayN، v2Box، OpenVPN، Windscribe، Clash)، دامنه‌ها و تب‌های دلخواه (مانند سایت‌های بانکی و ایرانی) را بدون VPN و با اینترنت مستقیم لپ‌تاپ باز کنید.
- بای‌پاس خودکار دامنه‌های ایران (.IR)، روسیه (.RU)، چین (.CN)، ترکیه (.TR) و بلاروس (.BY).
- پشتیبانی کامل از v2rayN، v2Box، OpenVPN و Windscribe.
- بدون جمع‌آوری اطلاعات و کاملاً حریم‌خصوصی محور.

---

[ Русский - Russian ]
Custom Bypass VPN - Выборочный обход VPN для вкладок и доменов в Google Chrome.
Позволяет отключать VPN для выбранных сайтов (банковские сервисы, локальные домены .RU / .рф), сохраняя работающий VPN для всех остальных вкладок.
- Поддержка v2rayN, v2Box, OpenVPN, Windscribe, Clash и Sing-Box.
- Автоматический обход национальных доменов (.RU, .SU, .рф, .IR, .CN).
- Полная конфиденциальность: обработка 100% локально.

---

[ 中文 - Chinese ]
Custom Bypass VPN - Chrome 浏览器 VPN 选择性分流与域名直连插件。
当您开启全局或系统 VPN（如 v2rayN、v2Box、OpenVPN、Windscribe、Clash）时，轻松实现指定标签页与域名绕过 VPN 直接连接本地网络。
- 支持国家/地区域名一键直连（.CN, .IR, .RU, .TR, .BY）。
- 完美兼容 v2rayN (System Proxy / SOCKS5)、v2Box、Clash 及 OpenVPN。
- 100% 本地 PAC 代理控制，无追踪，零数据收集。

---

[ Türkçe - Turkish ]
Custom Bypass VPN - Chrome için seçmeli VPN yönlendirme ve alan adı bayпас uzantısı.
VPN açıkken (v2rayN, v2Box, OpenVPN, Windscribe) belirli web sitelerini veya sekmeleri VPN olmadan doğrudan yerel ağınız üzerinden çalıştırın.
```

---

## 🔒 2. توجیه دسترسی‌ها برای تیم داوری کروم (Permissions Justification)

هنگام آپلود فایل در پنل Chrome Developer Dashboard، تیم بررسی گوگل دلایل دقیق استفاده از هر دسترسی را از شما می‌پرسد. جملات زیر را عیناً کپی و پیست کنید:

### `proxy`
> **Justification**: The `proxy` permission is required to dynamically set Proxy Auto-Config (PAC) scripts in Chrome, enabling users to route specific web domains through a local proxy or direct interface while keeping other tabs on the system VPN.

### `storage`
> **Justification**: The `storage` permission is used to persist user preferences locally, including custom domain bypass rules, auto-IR routing settings, and proxy port configuration.

### `tabs`
> **Justification**: The `tabs` permission is required to detect the current active tab's domain name so the user can toggle VPN bypass for that specific site directly from the extension popup interface.

### `host_permissions` (`<all_urls>`)
> **Justification**: Host permission for `<all_urls>` is necessary to allow the dynamic PAC proxy engine to evaluate and match request hostnames against the user's custom bypass list across all websites.

---

## 🛡️ 3. بیانیه حریم خصوصی (Privacy & Data Use)

- **Data Collection**: This extension collects **NO** personal data, user analytics, or browsing history. All settings and rule lists are processed and stored 100% locally on the user's browser via `chrome.storage.local`.
- **Single Purpose**: The sole purpose of this extension is to provide dynamic proxy and PAC routing to allow users to select which Chrome tabs bypass system VPN connections.

---

## 🚀 4. مراحل انتشار قدم به قدم (برای کاربر)

### مراحل آپلود توسط شما (در کمتر از ۲ دقیقه):
1. به **[Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)** بروید و با اکانت گوگل خود وارد شوید.
2. بر روی دکمه **"New Item"** کلیک کنید.
3. فایل ZIP آماده شده پروژه را آپلود کنید:
   `c:\Users\rkhos\Projects\AGchromeantivpn\Custom_Bypass_VPN_v1.0.0.zip`
4. بخش **Store listing** را باز کنید و متن توضیحات سئو چندزبانه بالا و آیکون 128x128 را وارد کنید.
5. در بخش **Privacy practices**، توجیه‌های دسترسی‌ها را کپی کنید.
6. دکمه **"Submit for review"** را بزنید!
