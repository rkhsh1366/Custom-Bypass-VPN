// Service Worker for AG AntiVPN Selective Router (Manifest V3)

// Default Storage Setup
const DEFAULT_SETTINGS = {
  enabled: true,
  appLang: 'en',
  proxyMode: 'local_proxy', // 'local_proxy' or 'v2ray_sysproxy' or 'direct'
  localProxyHost: '127.0.0.1',
  localProxyPort: 8888,
  localProxyType: 'PROXY', // 'PROXY' or 'SOCKS5'
  bypassDomains: [
    'digikala.com',
    'varzesh3.com',
    'divar.ir',
    'torob.com',
    'snapp.ir',
    'tamin.ir',
    'bmi.ir',
    'melli.ir'
  ],
  forceVpnDomains: [],
  autoIrBypass: true,
  autoRuBypass: false,
  autoCnBypass: false,
  autoTrBypass: false,
  autoByBypass: false
};

// Initialize default storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(null);
  const settingsToSet = {};

  for (const key in DEFAULT_SETTINGS) {
    if (current[key] === undefined) {
      settingsToSet[key] = DEFAULT_SETTINGS[key];
    }
  }

  if (Object.keys(settingsToSet).length > 0) {
    await chrome.storage.local.set(settingsToSet);
  }

  await applyProxyConfig();
});

// Listener for storage changes to instantly update Proxy PAC
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local') {
    await applyProxyConfig();
    await updateActiveTabBadge();
  }
});

// Listener for Tab switches / updates to maintain Badge status
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateTabBadge(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    await updateTabBadge(tabId);
  }
});

// Message Dispatcher from Popup and Options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'GET_STATUS') {
        const settings = await chrome.storage.local.get(null);
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        let tabHost = '';
        let isBypassed = false;
        
        if (activeTab && activeTab.url) {
          try {
            const urlObj = new URL(activeTab.url);
            tabHost = urlObj.hostname.toLowerCase();
            isBypassed = isHostBypassed(tabHost, settings);
          } catch (e) {
            // Non-HTTP page (chrome://, file://, etc.)
          }
        }

        sendResponse({
          success: true,
          settings,
          activeTab: {
            id: activeTab ? activeTab.id : null,
            host: tabHost,
            title: activeTab ? activeTab.title : '',
            isBypassed
          }
        });
      } else if (message.type === 'TOGGLE_TAB_BYPASS') {
        const { host } = message;
        if (!host) {
          sendResponse({ success: false, error: 'No host provided' });
          return;
        }

        const settings = await chrome.storage.local.get(['bypassDomains']);
        let domains = settings.bypassDomains || [];
        const cleanHost = host.toLowerCase().replace(/^www\./, '');

        const index = domains.findIndex(d => d.toLowerCase() === cleanHost);
        let nowBypassed = false;

        if (index >= 0) {
          domains.splice(index, 1);
          nowBypassed = false;
        } else {
          domains.push(cleanHost);
          nowBypassed = true;
        }

        await chrome.storage.local.set({ bypassDomains: domains });
        sendResponse({ success: true, isBypassed: nowBypassed, domains });
      } else if (message.type === 'TOGGLE_MASTER_ENABLE') {
        const { enabled } = message;
        await chrome.storage.local.set({ enabled });
        sendResponse({ success: true, enabled });
      } else if (message.type === 'RELOAD_PROXY') {
        await applyProxyConfig();
        sendResponse({ success: true });
      }
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  })();
  return true; // Keep channel open for async response
});

// Helper: Check if host matches bypass logic
function isHostBypassed(host, settings) {
  if (!settings.enabled || !host) return false;

  const cleanHost = host.toLowerCase().replace(/^www\./, '');

  // Check regional auto bypasses
  if (settings.autoIrBypass && (cleanHost.endsWith('.ir') || cleanHost === 'ir')) return true;
  if (settings.autoRuBypass && (cleanHost.endsWith('.ru') || cleanHost.endsWith('.su') || cleanHost.endsWith('.xn--p1ai') || cleanHost === 'ru')) return true;
  if (settings.autoCnBypass && (cleanHost.endsWith('.cn') || cleanHost === 'cn')) return true;
  if (settings.autoTrBypass && (cleanHost.endsWith('.tr') || cleanHost === 'tr')) return true;
  if (settings.autoByBypass && (cleanHost.endsWith('.by') || cleanHost === 'by')) return true;

  // Check explicit bypass list
  const bypassList = settings.bypassDomains || [];
  for (const pattern of bypassList) {
    const cleanPattern = pattern.toLowerCase().trim().replace(/^www\./, '');
    if (cleanPattern.startsWith('*.')) {
      const suffix = cleanPattern.slice(2);
      if (cleanHost.endsWith('.' + suffix) || cleanHost === suffix) {
        return true;
      }
    } else if (cleanHost === cleanPattern || cleanHost.endsWith('.' + cleanPattern)) {
      return true;
    }
  }

  return false;
}

// Generate PAC Script dynamically
function generatePacScript(settings) {
  const proxyMode = settings.proxyMode || 'local_proxy';
  const proxyHost = settings.localProxyHost || '127.0.0.1';
  const proxyPort = settings.localProxyPort || 8888;
  const proxyType = settings.localProxyType || 'PROXY';

  const bypassDomainsJson = JSON.stringify((settings.bypassDomains || []).map(d => d.toLowerCase().trim()));
  const forceVpnJson = JSON.stringify((settings.forceVpnDomains || []).map(d => d.toLowerCase().trim()));

  const autoIr = Boolean(settings.autoIrBypass);
  const autoRu = Boolean(settings.autoRuBypass);
  const autoCn = Boolean(settings.autoCnBypass);
  const autoTr = Boolean(settings.autoTrBypass);
  const autoBy = Boolean(settings.autoByBypass);

  if (proxyMode === 'v2ray_sysproxy') {
    const vpnProxyTarget = `${proxyType} ${proxyHost}:${proxyPort}`;

    return `
      function FindProxyForURL(url, host) {
        if (!host) return "DIRECT";
        
        var cleanHost = host.toLowerCase().replace(/^www\\./, "");
        var bypassList = ${bypassDomainsJson};
        var forceVpnList = ${forceVpnJson};
        var vpnProxy = ${JSON.stringify(vpnProxyTarget)};

        // 1. Force VPN Check
        for (var i = 0; i < forceVpnList.length; i++) {
          var pattern = forceVpnList[i];
          if (pattern.indexOf("*.") === 0) {
            var suf = pattern.substring(2);
            if (cleanHost.endsWith("." + suf) || cleanHost === suf) return vpnProxy;
          } else if (cleanHost === pattern || cleanHost.endsWith("." + pattern)) {
            return vpnProxy;
          }
        }

        // 2. Auto Regional TLD Bypasses -> Go DIRECT
        if (${autoIr} && (cleanHost.endsWith(".ir") || cleanHost === "ir")) return "DIRECT";
        if (${autoRu} && (cleanHost.endsWith(".ru") || cleanHost.endsWith(".su") || cleanHost.endsWith(".xn--p1ai") || cleanHost === "ru")) return "DIRECT";
        if (${autoCn} && (cleanHost.endsWith(".cn") || cleanHost === "cn")) return "DIRECT";
        if (${autoTr} && (cleanHost.endsWith(".tr") || cleanHost === "tr")) return "DIRECT";
        if (${autoBy} && (cleanHost.endsWith(".by") || cleanHost === "by")) return "DIRECT";

        // 3. Bypass List Check -> Go DIRECT
        for (var j = 0; j < bypassList.length; j++) {
          var bPattern = bypassList[j];
          if (bPattern.indexOf("*.") === 0) {
            var bSuf = bPattern.substring(2);
            if (cleanHost.endsWith("." + bSuf) || cleanHost === bSuf) return "DIRECT";
          } else if (cleanHost === bPattern || cleanHost.endsWith("." + bPattern)) {
            return "DIRECT";
          }
        }

        // Default -> Go through v2rayN Proxy
        return vpnProxy;
      }
    `;
  }

  // Standard Local Proxy / TUN Mode (OpenVPN, Windscribe TUN, v2ray TUN mode)
  const proxyTarget = proxyMode === 'direct'
    ? 'DIRECT'
    : `${proxyType} ${proxyHost}:${proxyPort}`;

  return `
    function FindProxyForURL(url, host) {
      if (!host) return "DIRECT";
      
      var cleanHost = host.toLowerCase().replace(/^www\\./, "");
      var bypassList = ${bypassDomainsJson};
      var forceVpnList = ${forceVpnJson};
      var proxyString = ${JSON.stringify(proxyTarget)};

      // 1. Force VPN Check
      for (var i = 0; i < forceVpnList.length; i++) {
        var pattern = forceVpnList[i];
        if (pattern.indexOf("*.") === 0) {
          var suf = pattern.substring(2);
          if (cleanHost.endsWith("." + suf) || cleanHost === suf) return "DIRECT";
        } else if (cleanHost === pattern || cleanHost.endsWith("." + pattern)) {
          return "DIRECT";
        }
      }

      // 2. Auto Regional TLD Bypasses
      if (${autoIr} && (cleanHost.endsWith(".ir") || cleanHost === "ir")) return proxyString;
      if (${autoRu} && (cleanHost.endsWith(".ru") || cleanHost.endsWith(".su") || cleanHost.endsWith(".xn--p1ai") || cleanHost === "ru")) return proxyString;
      if (${autoCn} && (cleanHost.endsWith(".cn") || cleanHost === "cn")) return proxyString;
      if (${autoTr} && (cleanHost.endsWith(".tr") || cleanHost === "tr")) return proxyString;
      if (${autoBy} && (cleanHost.endsWith(".by") || cleanHost === "by")) return proxyString;

      // 3. Bypass List Check
      for (var j = 0; j < bypassList.length; j++) {
        var bPattern = bypassList[j];
        if (bPattern.indexOf("*.") === 0) {
          var bSuf = bPattern.substring(2);
          if (cleanHost.endsWith("." + bSuf) || cleanHost === bSuf) return proxyString;
        } else if (cleanHost === bPattern || cleanHost.endsWith("." + bPattern)) {
          return proxyString;
        }
      }

      // Default: Go through VPN (DIRECT in Chrome proxy PAC terms)
      return "DIRECT";
    }
  `;
}

// Apply Proxy Configuration to Chrome
async function applyProxyConfig() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);

  if (!settings.enabled) {
    await chrome.proxy.settings.clear({ scope: 'regular' });
    await chrome.action.setBadgeText({ text: 'OFF' });
    await chrome.action.setBadgeBackgroundColor({ color: '#6B7280' });
    return;
  }

  const pacData = generatePacScript(settings);
  const config = {
    mode: 'pac_script',
    pacScript: {
      data: pacData,
      mandatory: true
    }
  };

  try {
    await chrome.proxy.settings.set({ value: config, scope: 'regular' });
    console.log('AG AntiVPN: Proxy PAC successfully updated.');
  } catch (err) {
    console.error('AG AntiVPN: Failed to set proxy settings:', err);
  }
}

// Update badge for specific tab
async function updateTabBadge(tabId) {
  if (!tabId) return;

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url) return;

    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
    if (!settings.enabled) {
      await chrome.action.setBadgeText({ tabId, text: 'OFF' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#6B7280' });
      return;
    }

    let host = '';
    try {
      host = new URL(tab.url).hostname;
    } catch (e) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      return;
    }

    const bypassed = isHostBypassed(host, settings);

    if (bypassed) {
      await chrome.action.setBadgeText({ tabId, text: 'NO-VPN' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#10B981' }); // Emerald Green
    } else {
      await chrome.action.setBadgeText({ tabId, text: 'VPN' });
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#3B82F6' }); // Blue
    }
  } catch (e) {
    // Ignore invalid tab queries
  }
}

async function updateActiveTabBadge() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    await updateTabBadge(activeTab.id);
  }
}
