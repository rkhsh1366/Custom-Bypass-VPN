document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('masterToggle');
  const tabStatusBadge = document.getElementById('tabStatusBadge');
  const currentDomain = document.getElementById('currentDomain');
  const toggleTabBtn = document.getElementById('toggleTabBtn');
  const btnText = document.getElementById('btnText');

  const autoIrToggle = document.getElementById('autoIrToggle');
  const autoRuToggle = document.getElementById('autoRuToggle');
  const autoCnToggle = document.getElementById('autoCnToggle');
  const autoTrToggle = document.getElementById('autoTrToggle');
  const autoByToggle = document.getElementById('autoByToggle');

  const bypassedCount = document.getElementById('bypassedCount');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const langToggleBtn = document.getElementById('langToggleBtn');

  const lblActiveTab = document.getElementById('lblActiveTab');
  const lblRegionalTitle = document.getElementById('lblRegionalTitle');
  const lblAutoIrTitle = document.getElementById('lblAutoIrTitle');
  const lblAutoRuTitle = document.getElementById('lblAutoRuTitle');
  const lblAutoCnTitle = document.getElementById('lblAutoCnTitle');
  const lblAutoTrTitle = document.getElementById('lblAutoTrTitle');
  const lblAutoByTitle = document.getElementById('lblAutoByTitle');

  const lblBypassedCount = document.getElementById('lblBypassedCount');
  const lblOpenOptions = document.getElementById('lblOpenOptions');

  let currentHost = '';
  let isCurrentlyBypassed = false;
  let currentLang = 'en';
  let isStartingProxy = false;
  let cachedSettings = {};

  const I18N = {
    en: {
      activeTab: "Active Tab Domain:",
      regionalTitle: "Regional Auto-Bypass (TLDs):",
      autoIrTitle: "🇮🇷 Bypass .IR (Iran)",
      autoRuTitle: "🇷🇺 Bypass .RU / .рф (Russia)",
      autoCnTitle: "🇨🇳 Bypass .CN (China)",
      autoTrTitle: "🇹🇷 Bypass .TR (Turkey)",
      autoByTitle: "🇧🇾 Bypass .BY (Belarus)",
      bypassedCount: "Custom Rules",
      openOptions: "⚙️ Advanced Settings & VPN Rules",
      badgeOff: "EXTENSION OFF",
      badgeBypassed: "DIRECT (NO VPN)",
      badgeVpn: "USING VPN",
      badgeDisabled: "NOT APPLICABLE",
      btnOff: "Extension Disabled",
      btnEnableVpn: "🛡️ Route This Site Through VPN",
      btnDisableVpn: "⚡ Bypass VPN For This Site",
      btnInvalidTab: "Internal Chrome Page",
      helperOnline: "Helper Service Online",
      helperOffline: "Click to start (Run install_autostart.bat)",
      helperStarting: "Starting silent proxy...",
      statusOnline: "🟢 Active",
      statusOffline: "🔴 Offline"
    },
    fa: {
      activeTab: "تب و دامنه جاری:",
      regionalTitle: "بای‌پاس خودکار کشوری (TLDs):",
      autoIrTitle: "🇮🇷 بای‌پاس .IR (ایران)",
      autoRuTitle: "🇷🇺 بای‌پاس .RU / .рф (روسیه)",
      autoCnTitle: "🇨🇳 بای‌پاس .CN (چین)",
      autoTrTitle: "🇹🇷 بای‌پاس .TR (ترکیه)",
      autoByTitle: "🇧🇾 بای‌پاس .BY (بلاروس)",
      bypassedCount: "قوانین سفارشی",
      openOptions: "⚙️ تنظیمات پیشرفته و لیست دامنه‌ها",
      badgeOff: "افزونه خاموش",
      badgeBypassed: "مستقیم (بدون VPN)",
      badgeVpn: "متصل به VPN",
      badgeDisabled: "غیرقابل تغییر",
      btnOff: "افزونه غیرفعال است",
      btnEnableVpn: "🛡️ اتصال مجدد این سایت به VPN",
      btnDisableVpn: "⚡ بای‌پاس و عبور بدون VPN این سایت",
      btnInvalidTab: "صفحه داخلی کروم / بدون دامنه",
      helperOnline: "سرویس پس‌زمینه آنلاین است",
      helperOffline: "روی install_autostart.bat کلیک کنید",
      helperStarting: "در حال راه‌اندازی پس‌زمینه...",
      statusOnline: "🟢 فعال",
      statusOffline: "🔴 خاموش"
    }
  };

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    if (langToggleBtn) langToggleBtn.textContent = lang === 'fa' ? 'FA' : 'EN';

    const t = I18N[lang];
    if (lblActiveTab) lblActiveTab.textContent = t.activeTab;
    if (lblRegionalTitle) lblRegionalTitle.textContent = t.regionalTitle;
    if (lblAutoIrTitle) lblAutoIrTitle.textContent = t.autoIrTitle;
    if (lblAutoRuTitle) lblAutoRuTitle.textContent = t.autoRuTitle;
    if (lblAutoCnTitle) lblAutoCnTitle.textContent = t.autoCnTitle;
    if (lblAutoTrTitle) lblAutoTrTitle.textContent = t.autoTrTitle;
    if (lblAutoByTitle) lblAutoByTitle.textContent = t.autoByTitle;

    if (lblBypassedCount) lblBypassedCount.textContent = t.bypassedCount;
    if (lblOpenOptions) lblOpenOptions.textContent = t.openOptions;

    updateTabUi(isCurrentlyBypassed, cachedSettings.enabled !== false);
  }

  function updateTabUi(bypassed, enabled) {
    const t = I18N[currentLang];

    if (!enabled) {
      tabStatusBadge.textContent = t.badgeOff;
      tabStatusBadge.className = 'badge disabled';
      toggleTabBtn.className = 'btn btn-primary';
      btnText.textContent = t.btnOff;
      return;
    }

    if (bypassed) {
      tabStatusBadge.textContent = t.badgeBypassed;
      tabStatusBadge.className = 'badge bypassed';
      toggleTabBtn.className = 'btn btn-secondary-vpn';
      btnText.textContent = t.btnEnableVpn;
    } else {
      tabStatusBadge.textContent = t.badgeVpn;
      tabStatusBadge.className = 'badge vpn';
      toggleTabBtn.className = 'btn btn-primary';
      btnText.textContent = t.btnDisableVpn;
    }
  }

  // Fast Instant Initialization from Local Storage
  chrome.storage.local.get(null, (settings) => {
    cachedSettings = settings || {};
    currentLang = cachedSettings.appLang || 'en';
    applyLanguage(currentLang);

    if (masterToggle) masterToggle.checked = cachedSettings.enabled !== false;
    if (autoIrToggle) autoIrToggle.checked = cachedSettings.autoIrBypass !== false;
    if (autoRuToggle) autoRuToggle.checked = Boolean(cachedSettings.autoRuBypass);
    if (autoCnToggle) autoCnToggle.checked = Boolean(cachedSettings.autoCnBypass);
    if (autoTrToggle) autoTrToggle.checked = Boolean(cachedSettings.autoTrBypass);
    if (autoByToggle) autoByToggle.checked = Boolean(cachedSettings.autoByBypass);

    if (bypassedCount) bypassedCount.textContent = (cachedSettings.bypassDomains || []).length;

    // Fetch active tab asynchronously
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs && tabs[0];
      if (activeTab && activeTab.url) {
        try {
          const urlObj = new URL(activeTab.url);
          if (urlObj.protocol.startsWith('http')) {
            currentHost = urlObj.hostname.toLowerCase();
            if (currentDomain) currentDomain.textContent = currentHost;

            // Check if host is bypassed
            chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
              if (res && res.success && res.activeTab) {
                isCurrentlyBypassed = res.activeTab.isBypassed;
                if (toggleTabBtn) toggleTabBtn.disabled = !(cachedSettings.enabled !== false);
                updateTabUi(isCurrentlyBypassed, cachedSettings.enabled !== false);
              }
            });
          } else {
            setInvalidTabUi();
          }
        } catch (e) {
          setInvalidTabUi();
        }
      } else {
        setInvalidTabUi();
      }
    });

    // Run health check detached in background without blocking UI
    setTimeout(() => {
      checkHelperHealth(cachedSettings.localProxyHost || '127.0.0.1', cachedSettings.localProxyPort || 8888, cachedSettings.proxyMode);
    }, 50);
  });

  function setInvalidTabUi() {
    const t = I18N[currentLang];
    if (currentDomain) currentDomain.textContent = t.btnInvalidTab;
    if (tabStatusBadge) {
      tabStatusBadge.textContent = t.badgeDisabled;
      tabStatusBadge.className = 'badge disabled';
    }
    if (toggleTabBtn) toggleTabBtn.disabled = true;
    if (btnText) btnText.textContent = t.btnInvalidTab;
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', async () => {
      const newLang = currentLang === 'en' ? 'fa' : 'en';
      await chrome.storage.local.set({ appLang: newLang });
      cachedSettings.appLang = newLang;
      applyLanguage(newLang);
    });
  }

  if (toggleTabBtn) {
    toggleTabBtn.addEventListener('click', async () => {
      if (!currentHost) return;

      toggleTabBtn.disabled = true;
      try {
        const res = await chrome.runtime.sendMessage({
          type: 'TOGGLE_TAB_BYPASS',
          host: currentHost
        });

        if (res && res.success) {
          isCurrentlyBypassed = res.isBypassed;
          if (bypassedCount) bypassedCount.textContent = (res.domains || []).length;
          updateTabUi(isCurrentlyBypassed, cachedSettings.enabled !== false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        toggleTabBtn.disabled = false;
      }
    });
  }

  if (masterToggle) {
    masterToggle.addEventListener('change', async () => {
      const enabled = masterToggle.checked;
      cachedSettings.enabled = enabled;
      await chrome.runtime.sendMessage({
        type: 'TOGGLE_MASTER_ENABLE',
        enabled
      });
      updateTabUi(isCurrentlyBypassed, enabled);
    });
  }

  // Country TLD Auto-Bypass Listeners
  const tlds = [
    { el: autoIrToggle, key: 'autoIrBypass' },
    { el: autoRuToggle, key: 'autoRuBypass' },
    { el: autoCnToggle, key: 'autoCnBypass' },
    { el: autoTrToggle, key: 'autoTrBypass' },
    { el: autoByToggle, key: 'autoByBypass' }
  ];

  tlds.forEach(({ el, key }) => {
    if (el) {
      el.addEventListener('change', async () => {
        cachedSettings[key] = el.checked;
        await chrome.storage.local.set({ [key]: el.checked });
      });
    }
  });

  if (openOptionsBtn) {
    openOptionsBtn.addEventListener('click', () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options/options.html'));
      }
    });
  }

  function triggerSilentProtocolLaunch() {
    try {
      let iframe = document.getElementById('helperLauncherFrame');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'helperLauncherFrame';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }
      iframe.src = 'ag-antivpn://start';
    } catch (e) {
      console.error('Failed to launch silent protocol:', e);
    }
  }

  async function checkHelperHealth(host, port, proxyMode) {
    const helperHealthText = document.getElementById('helperHealthText');
    const helperHealthLabel = document.getElementById('helperHealthLabel');
    const helperHealthBox = document.getElementById('helperHealthBox');
    const t = I18N[currentLang];

    if (proxyMode === 'v2ray_sysproxy') {
      if (helperHealthText) {
        helperHealthText.textContent = t.statusOnline;
        helperHealthText.style.color = '#10b981';
      }
      if (helperHealthLabel) {
        helperHealthLabel.textContent = currentLang === 'fa' ? 'v2rayN System Proxy' : 'v2rayN SysProxy Mode';
      }
      return;
    }

    if (helperHealthBox) {
      helperHealthBox.style.cursor = 'pointer';
      helperHealthBox.onclick = async () => {
        const isCurrentlyOnline = helperHealthText.textContent.includes('🟢') || helperHealthText.textContent.includes('Active');
        
        if (isCurrentlyOnline) {
          if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
          else window.open(chrome.runtime.getURL('options/options.html'));
          return;
        }

        // Trigger Silent Protocol Launch
        isStartingProxy = true;
        helperHealthText.textContent = '⏳ ...';
        helperHealthText.style.color = '#3b82f6';
        helperHealthLabel.textContent = t.helperStarting;

        triggerSilentProtocolLaunch();

        let attempts = 0;
        const intervalId = setInterval(async () => {
          attempts++;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            const res = await fetch(`http://${host}:${port}/ag-health-check`, {
              method: 'GET',
              cache: 'no-store',
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok || res.status === 200) {
              clearInterval(intervalId);
              isStartingProxy = false;
              helperHealthText.textContent = t.statusOnline;
              helperHealthText.style.color = '#10b981';
              helperHealthLabel.textContent = t.helperOnline;
              return;
            }
          } catch (e) {
            // Retrying...
          }

          if (attempts >= 10) {
            clearInterval(intervalId);
            isStartingProxy = false;
            helperHealthText.textContent = t.statusOffline;
            helperHealthText.style.color = '#ef4444';
            helperHealthLabel.textContent = t.helperOffline;

            const msg = currentLang === 'fa'
              ? "برای فعال‌سازی سرویس پس‌زمینه، فایل install_autostart.bat را یک‌بار در پوشه پروژه اجرا کنید."
              : "To enable background proxy helper, run install_autostart.bat once in your project folder.";
            alert(msg);
          }
        }, 300);
      };
    }

    if (isStartingProxy) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`http://${host}:${port}/ag-health-check`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok || res.status === 200) {
        if (helperHealthText) {
          helperHealthText.textContent = t.statusOnline;
          helperHealthText.style.color = '#10b981';
        }
        if (helperHealthLabel) {
          helperHealthLabel.textContent = t.helperOnline;
        }
      } else {
        throw new Error('Not ok');
      }
    } catch (e) {
      if (!isStartingProxy) {
        if (helperHealthText) {
          helperHealthText.textContent = t.statusOffline;
          helperHealthText.style.color = '#ef4444';
        }
        if (helperHealthLabel) {
          helperHealthLabel.textContent = t.helperOffline;
        }
      }
    }
  }
});
