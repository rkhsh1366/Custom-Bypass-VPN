document.addEventListener('DOMContentLoaded', async () => {
  const addDomainForm = document.getElementById('addDomainForm');
  const domainInput = document.getElementById('domainInput');
  const domainList = document.getElementById('domainList');
  const filterInput = document.getElementById('filterInput');

  const addPresetBank = document.getElementById('addPresetBank');
  const addPresetNews = document.getElementById('addPresetNews');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const btnAddDomain = document.getElementById('btnAddDomain');

  const proxyConfigForm = document.getElementById('proxyConfigForm');
  const proxyMode = document.getElementById('proxyMode');
  const proxyHost = document.getElementById('proxyHost');
  const proxyPort = document.getElementById('proxyPort');
  const proxyType = document.getElementById('proxyType');
  const vpnPresetSelect = document.getElementById('vpnPresetSelect');

  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');
  const saveStatus = document.getElementById('saveStatus');
  const optLangToggleBtn = document.getElementById('optLangToggleBtn');

  const optTitle = document.getElementById('optTitle');
  const optSubtitle = document.getElementById('optSubtitle');
  const lblBypassHeading = document.getElementById('lblBypassHeading');
  const lblBypassSub = document.getElementById('lblBypassSub');
  const lblProxyHeading = document.getElementById('lblProxyHeading');
  const lblProxySub = document.getElementById('lblProxySub');
  const lblVpnPreset = document.getElementById('lblVpnPreset');
  const lblProxyMode = document.getElementById('lblProxyMode');
  const lblProxyHost = document.getElementById('lblProxyHost');
  const lblProxyPort = document.getElementById('lblProxyPort');
  const lblProxyType = document.getElementById('lblProxyType');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const lblBackupHeading = document.getElementById('lblBackupHeading');

  let currentDomains = [];
  let currentLang = 'en';

  const I18N = {
    en: {
      title: "Custom Bypass VPN - Advanced Settings",
      subtitle: "Domain rules management, local proxy config & multi-VPN routing",
      saveSaved: "Settings saved",
      saveSuccess: "Proxy settings saved successfully",
      listSaved: "Domain list saved",
      bypassHeading: "🌐 VPN Bypass Domain Rules",
      bypassSub: "Domains listed here will bypass the VPN and connect directly via your local network interface.",
      domainPlaceholder: "e.g. digikala.com or *.ir",
      addBtn: "+ Add Domain",
      addBank: "🏦 Add Iranian Banks",
      addNews: "📰 Add News & Sports",
      clearAll: "🗑️ Clear All Domains",
      searchPlaceholder: "🔍 Search domain rules...",
      emptyList: "No domain rules added yet.",
      emptyMatch: "No matching domains found.",
      proxyHeading: "⚙️ Local Proxy Configuration",
      proxySub: "Configure local proxy host, port and routing engine",
      vpnPreset: "Smart VPN Preset Selection:",
      proxyMode: "Bypass Routing Mode:",
      proxyHost: "Local Proxy Host:",
      proxyPort: "Local Proxy Port:",
      proxyType: "Proxy Protocol:",
      saveConfigBtn: "Save Proxy Settings",
      backupHeading: "📥 Backup & Restore",
      exportBtn: "📤 Export Settings (JSON)",
      importBtn: "📥 Import Settings",
      deleteBtn: "Delete 🗑️",
      confirmClear: "Are you sure you want to clear all bypass domains?"
    },
    fa: {
      title: "تنظیمات پیشرفته Custom Bypass VPN",
      subtitle: "مدیریت دامنه‌ها، پورت پروکسی لوکال و راهنمای بای‌پاس VPN ویندوز",
      saveSaved: "تنظیمات ذخیره شده است",
      saveSuccess: "تنظیمات پروکسی با موفقیت بروزرسانی شد",
      listSaved: "تغییرات لیست ذخیره شد",
      bypassHeading: "🌐 لیست دامنه‌های بدون VPN (Bypass List)",
      bypassSub: "دامنه‌های موجود در این لیست مستقیماً بدون عبور از OpenVPN بارگذاری می‌شوند.",
      domainPlaceholder: "مثال: digikala.com یا *.ir",
      addBtn: "+ افزودن دامنه",
      addBank: "🏦 افزودن بانک‌های ایرانی",
      addNews: "📰 افزودن خبری/ورزشی",
      clearAll: "🗑️ پاکسازی کامل لیست",
      searchPlaceholder: "🔍 جستجو در دامنه‌ها...",
      emptyList: "هیچ دامنه‌ای ثبت نشده است",
      emptyMatch: "دامنه متناظری یافت نشد",
      proxyHeading: "⚙️ تنظیمات پروکسی لوکال",
      proxySub: "تنظیم آدرس و پورت اتصال به کارت شبکه فیزیکی لپ‌تاپ",
      vpnPreset: "انتخاب هوشمند نوع VPN شما:",
      proxyMode: "حالت مسیریابی بای‌پاس:",
      proxyHost: "آدرس پروکسی لوکال:",
      proxyPort: "پورت پروکسی لوکال:",
      proxyType: "پروتکل پروکسی:",
      saveConfigBtn: "ذخیره تنظیمات پروکسی",
      backupHeading: "📥 پشتیبان‌گیری و انتقال",
      exportBtn: "📤 خروجی گرفتن از تنظیمات (JSON)",
      importBtn: "📥 وارد کردن تنظیمات",
      deleteBtn: "حذف 🗑️",
      confirmClear: "آیا از پاکسازی تمام دامنه‌های لیست بای‌پاس اطمینان دارید؟"
    }
  };

  async function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    if (optLangToggleBtn) optLangToggleBtn.textContent = lang === 'fa' ? 'EN | FA (فارسی)' : 'EN | FA (English)';

    const t = I18N[lang];
    if (optTitle) optTitle.textContent = t.title;
    if (optSubtitle) optSubtitle.textContent = t.subtitle;
    if (saveStatus) saveStatus.textContent = t.saveSaved;
    if (lblBypassHeading) lblBypassHeading.textContent = t.bypassHeading;
    if (lblBypassSub) lblBypassSub.textContent = t.bypassSub;
    if (domainInput) domainInput.placeholder = t.domainPlaceholder;
    if (btnAddDomain) btnAddDomain.textContent = t.addBtn;
    if (addPresetBank) addPresetBank.textContent = t.addBank;
    if (addPresetNews) addPresetNews.textContent = t.addNews;
    if (clearAllBtn) clearAllBtn.textContent = t.clearAll;
    if (filterInput) filterInput.placeholder = t.searchPlaceholder;

    if (lblProxyHeading) lblProxyHeading.textContent = t.proxyHeading;
    if (lblProxySub) lblProxySub.textContent = t.proxySub;
    if (lblVpnPreset) lblVpnPreset.textContent = t.vpnPreset;
    if (lblProxyMode) lblProxyMode.textContent = t.proxyMode;
    if (lblProxyHost) lblProxyHost.textContent = t.proxyHost;
    if (lblProxyPort) lblProxyPort.textContent = t.proxyPort;
    if (lblProxyType) lblProxyType.textContent = t.proxyType;
    if (btnSaveConfig) btnSaveConfig.textContent = t.saveConfigBtn;
    if (lblBackupHeading) lblBackupHeading.textContent = t.backupHeading;
    if (exportBtn) exportBtn.textContent = t.exportBtn;
    if (importBtn) importBtn.textContent = t.importBtn;

    renderDomainList();
  }

  if (optLangToggleBtn) {
    optLangToggleBtn.addEventListener('click', async () => {
      const newLang = currentLang === 'en' ? 'fa' : 'en';
      await chrome.storage.local.set({ appLang: newLang });
      await applyLanguage(newLang);
    });
  }

  if (vpnPresetSelect) {
    vpnPresetSelect.addEventListener('change', () => {
      const mode = vpnPresetSelect.value;
      if (mode === 'openvpn' || mode === 'v2ray_tun') {
        proxyMode.value = 'local_proxy';
        proxyHost.value = '127.0.0.1';
        proxyPort.value = 8888;
        proxyType.value = 'PROXY';
      } else if (mode === 'v2ray_sysproxy') {
        proxyMode.value = 'v2ray_sysproxy';
        proxyHost.value = '127.0.0.1';
        proxyPort.value = 10808;
        proxyType.value = 'SOCKS5';
      } else if (mode === 'clash') {
        proxyMode.value = 'local_proxy';
        proxyHost.value = '127.0.0.1';
        proxyPort.value = 7890;
        proxyType.value = 'PROXY';
      }
    });
  }

  const BANK_PRESETS = [
    'bmi.ir', 'melli.ir', 'bankmellat.ir', 'tejaratbank.ir', 'bsi.ir',
    'bch.ir', 'sb24.com', 'parsian-bank.ir', 'pasargadbank.com', 'shaparak.ir',
    'emtipay.com', 'zarinpal.com', 'sadadpsp.ir'
  ];

  const NEWS_PRESETS = [
    'varzesh3.com', 'football360.ir', 'tasnimnews.com', 'farsnews.ir',
    'isna.ir', 'irna.ir', 'yjc.ir', 'tabnak.ir', 'khabaronline.ir'
  ];

  async function loadSettings() {
    const data = await chrome.storage.local.get({
      appLang: 'en',
      bypassDomains: [],
      proxyMode: 'local_proxy',
      localProxyHost: '127.0.0.1',
      localProxyPort: 8888,
      localProxyType: 'PROXY'
    });

    currentLang = data.appLang || 'en';
    currentDomains = data.bypassDomains || [];
    proxyMode.value = data.proxyMode || 'local_proxy';
    proxyHost.value = data.localProxyHost || '127.0.0.1';
    proxyPort.value = data.localProxyPort || 8888;
    proxyType.value = data.localProxyType || 'PROXY';

    await applyLanguage(currentLang);
  }

  function renderDomainList() {
    const filter = filterInput.value.toLowerCase().trim();
    domainList.innerHTML = '';
    const t = I18N[currentLang];

    const filtered = currentDomains.filter(d => d.toLowerCase().includes(filter));

    if (filtered.length === 0) {
      domainList.innerHTML = `<li class="empty-state">${filter ? t.emptyMatch : t.emptyList}</li>`;
      return;
    }

    filtered.forEach(domain => {
      const li = document.createElement('li');
      li.className = 'domain-item';

      const span = document.createElement('span');
      span.className = 'domain-text';
      span.textContent = domain;

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = t.deleteBtn;
      delBtn.addEventListener('click', () => removeDomain(domain));

      li.appendChild(span);
      li.appendChild(delBtn);
      domainList.appendChild(li);
    });
  }

  async function saveDomains() {
    await chrome.storage.local.set({ bypassDomains: currentDomains });
    showNotification(I18N[currentLang].listSaved);
    renderDomainList();
  }

  addDomainForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = domainInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!val) return;

    if (!currentDomains.includes(val)) {
      currentDomains.unshift(val);
      await saveDomains();
    }

    domainInput.value = '';
  });

  async function removeDomain(domain) {
    currentDomains = currentDomains.filter(d => d !== domain);
    await saveDomains();
  }

  filterInput.addEventListener('input', renderDomainList);

  addPresetBank.addEventListener('click', async () => {
    let added = 0;
    BANK_PRESETS.forEach(d => {
      if (!currentDomains.includes(d)) {
        currentDomains.push(d);
        added++;
      }
    });
    if (added > 0) await saveDomains();
  });

  addPresetNews.addEventListener('click', async () => {
    let added = 0;
    NEWS_PRESETS.forEach(d => {
      if (!currentDomains.includes(d)) {
        currentDomains.push(d);
        added++;
      }
    });
    if (added > 0) await saveDomains();
  });

  clearAllBtn.addEventListener('click', async () => {
    if (confirm(I18N[currentLang].confirmClear)) {
      currentDomains = [];
      await saveDomains();
    }
  });

  proxyConfigForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
      proxyMode: proxyMode.value,
      localProxyHost: proxyHost.value.trim(),
      localProxyPort: parseInt(proxyPort.value, 10),
      localProxyType: proxyType.value
    };

    await chrome.storage.local.set(config);
    await chrome.runtime.sendMessage({ type: 'RELOAD_PROXY' });
    showNotification(I18N[currentLang].saveSuccess);
  });

  exportBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get(null);
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ag_antivpn_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', () => importFileInput.click());

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (typeof parsed === 'object') {
          await chrome.storage.local.set(parsed);
          await loadSettings();
          await chrome.runtime.sendMessage({ type: 'RELOAD_PROXY' });
          showNotification(I18N[currentLang].saveSuccess);
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  });

  function showNotification(msg) {
    saveStatus.textContent = msg;
    saveStatus.style.color = '#10b981';
    setTimeout(() => {
      saveStatus.textContent = I18N[currentLang].saveSaved;
      saveStatus.style.color = '';
    }, 2500);
  }

  await loadSettings();
});
