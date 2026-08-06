document.addEventListener('DOMContentLoaded', async () => {
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
      badgeBypassed: "NO-VPN (BYPASSED)",
      badgeVpn: "USING VPN",
      badgeDisabled: "NOT APPLICABLE",
      btnOff: "Extension Disabled",
      btnEnableVpn: "⚡ Enable VPN For This Site",
      btnDisableVpn: "⚡ Disable VPN For This Site",
      btnInvalidTab: "Internal Chrome Page",
      helperOnline: "Helper Service Online",
      helperOffline: "Helper Offline (Click to install)",
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
      badgeBypassed: "اینترنت بدون VPN (بای‌پاس)",
      badgeVpn: "اینترنت دارای VPN",
      badgeDisabled: "غیرقابل تغییر",
      btnOff: "افزونه غیرفعال است",
      btnEnableVpn: "⚡ فعال‌سازی مجدد VPN برای این سایت",
      btnDisableVpn: "⚡ غیرفعال‌سازی VPN برای این سایت",
      btnInvalidTab: "صفحه داخلی کروم / بدون دامنه",
      helperOnline: "سرویس پس‌زمینه آنلاین است",
      helperOffline: "روی install_autostart کلیک کنید",
      statusOnline: "🟢 فعال",
      statusOffline: "🔴 خاموش"
    }
  };

  async function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    langToggleBtn.textContent = lang === 'fa' ? 'FA' : 'EN';

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

    const settings = await chrome.storage.local.get(['enabled']);
    updateTabUi(isCurrentlyBypassed, settings.enabled !== false);
  }

  langToggleBtn.addEventListener('click', async () => {
    const newLang = currentLang === 'en' ? 'fa' : 'en';
    await chrome.storage.local.set({ appLang: newLang });
    await applyLanguage(newLang);
  });

  // Fetch Current App State from Service Worker
  async function loadState() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
      if (!response || !response.success) return;

      const { settings, activeTab } = response;
      currentLang = settings.appLang || 'en';
      await applyLanguage(currentLang);

      masterToggle.checked = settings.enabled;

      if (autoIrToggle) autoIrToggle.checked = settings.autoIrBypass !== false;
      if (autoRuToggle) autoRuToggle.checked = Boolean(settings.autoRuBypass);
      if (autoCnToggle) autoCnToggle.checked = Boolean(settings.autoCnBypass);
      if (autoTrToggle) autoTrToggle.checked = Boolean(settings.autoTrBypass);
      if (autoByToggle) autoByToggle.checked = Boolean(settings.autoByBypass);

      bypassedCount.textContent = (settings.bypassDomains || []).length;
      checkHelperHealth(settings.localProxyHost || '127.0.0.1', settings.localProxyPort || 8888);

      if (activeTab && activeTab.host) {
        currentHost = activeTab.host;
        currentDomain.textContent = currentHost;
        isCurrentlyBypassed = activeTab.isBypassed;
        toggleTabBtn.disabled = !settings.enabled;

        updateTabUi(isCurrentlyBypassed, settings.enabled);
      } else {
        const t = I18N[currentLang];
        currentDomain.textContent = t.btnInvalidTab;
        tabStatusBadge.textContent = t.badgeDisabled;
        tabStatusBadge.className = 'badge disabled';
        toggleTabBtn.disabled = true;
        btnText.textContent = t.btnInvalidTab;
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    }
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
      toggleTabBtn.className = 'btn btn-danger';
      btnText.textContent = t.btnEnableVpn;
    } else {
      tabStatusBadge.textContent = t.badgeVpn;
      tabStatusBadge.className = 'badge vpn';
      toggleTabBtn.className = 'btn btn-primary';
      btnText.textContent = t.btnDisableVpn;
    }
  }

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
        bypassedCount.textContent = (res.domains || []).length;
        const settings = await chrome.storage.local.get(['enabled']);
        updateTabUi(isCurrentlyBypassed, settings.enabled !== false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      toggleTabBtn.disabled = false;
    }
  });

  masterToggle.addEventListener('change', async () => {
    const enabled = masterToggle.checked;
    await chrome.runtime.sendMessage({
      type: 'TOGGLE_MASTER_ENABLE',
      enabled
    });
    await loadState();
  });

  // Country TLD Auto-Bypass Listeners
  if (autoIrToggle) {
    autoIrToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({ autoIrBypass: autoIrToggle.checked });
      await loadState();
    });
  }

  if (autoRuToggle) {
    autoRuToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({ autoRuBypass: autoRuToggle.checked });
      await loadState();
    });
  }

  if (autoCnToggle) {
    autoCnToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({ autoCnBypass: autoCnToggle.checked });
      await loadState();
    });
  }

  if (autoTrToggle) {
    autoTrToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({ autoTrBypass: autoTrToggle.checked });
      await loadState();
    });
  }

  if (autoByToggle) {
    autoByToggle.addEventListener('change', async () => {
      await chrome.storage.local.set({ autoByBypass: autoByToggle.checked });
      await loadState();
    });
  }

  openOptionsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  });

  async function checkHelperHealth(host, port) {
    const helperHealthText = document.getElementById('helperHealthText');
    const helperHealthLabel = document.getElementById('helperHealthLabel');
    const helperHealthBox = document.getElementById('helperHealthBox');
    const t = I18N[currentLang];

    if (helperHealthBox) {
      helperHealthBox.style.cursor = 'pointer';
      helperHealthBox.onclick = () => {
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        } else {
          window.open(chrome.runtime.getURL('options/options.html'));
        }
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`http://${host}:${port}/ag-health-check`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok || res.status === 200) {
        helperHealthText.textContent = t.statusOnline;
        helperHealthText.style.color = '#10b981';
        helperHealthLabel.textContent = t.helperOnline;
      } else {
        throw new Error('Not ok');
      }
    } catch (e) {
      helperHealthText.textContent = t.statusOffline;
      helperHealthText.style.color = '#ef4444';
      helperHealthLabel.textContent = t.helperOffline;
    }
  }

  await loadState();
});
