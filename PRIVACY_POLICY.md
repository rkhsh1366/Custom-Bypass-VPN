# Privacy Policy for Custom Bypass VPN

**Last Updated**: August 10, 2026

## 1. Overview
**Custom Bypass VPN** ("the Extension") is committed to protecting your privacy. This Privacy Policy explains our data practices for the Custom Bypass VPN Chrome extension.

## 2. No Data Collection
**Custom Bypass VPN does NOT collect, store, transmit, or share any personal data, user analytics, browsing history, IP addresses, or sensitive user information.**

All routing decisions, Proxy Auto-Config (PAC) script evaluations, and domain lists are processed **100% locally on your browser and computer**.

## 3. Local Storage Usage
The Extension utilizes Chrome's `chrome.storage.local` API strictly to save your personal extension preferences on your device, including:
- Your custom bypass domain list
- Regional TLD auto-bypass toggle preferences (.IR, .RU, .CN, .TR, .BY)
- Local proxy host and port configuration

This data remains strictly on your local device and is never transmitted to external servers or third parties.

## 4. Permissions Usage
- `proxy`: Used exclusively to apply local Proxy Auto-Config (PAC) scripts to manage tab routing.
- `storage`: Used solely to persist your local extension settings on your device.
- `tabs`: Used only to inspect the active tab's hostname to allow 1-click bypass toggling in the popup window.
- `<all_urls>` host permissions: Required for the PAC engine to evaluate request domain names against your local bypass list.

## 5. Third-Party Sharing
We do not sell, rent, trade, or share any user data with third parties. No analytics, tracking scripts, or remote code are embedded within this extension.

## 6. Contact Us
If you have any questions about this Privacy Policy, please contact the developer at:
**Email**: `r.khoshnud@gmail.com`
**GitHub Repository**: [https://github.com/rkhsh1366/Custom-Bypass-VPN](https://github.com/rkhsh1366/Custom-Bypass-VPN)
