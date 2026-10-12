import { toNetscape } from './src/netscape.js';
import { scopeCandidates, defaultScope, scopePermission } from './src/domains.js';

const MAX_DATA_URL_CHARS = 1_500_000; // Chrome caps URLs at ~2 MB

const scopeEl = document.getElementById('scope');
const exportBtn = document.getElementById('export');
const revokeBtn = document.getElementById('revoke');
const statusEl = document.getElementById('status');

const setStatus = (text) => { statusEl.textContent = text; };

/** @returns {Promise<URL | null>} the active tab's URL if it is http(s) */
async function activeTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  const url = new URL(tab.url);
  return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
}

/** @param {string} domain */
const fileNameFor = (domain) => `${domain.replace(/[^a-z0-9.-]/gi, '_')}-cookies.txt`;

/** @param {unknown} err */
const isUserCancel = (err) => err instanceof Error && /cancel/i.test(err.message);

async function exportCookies() {
  const domain = scopeEl.value;
  // First await in the click handler: permissions.request needs the user gesture.
  if (!(await chrome.permissions.request(scopePermission(domain)))) {
    setStatus('Access not granted. Nothing exported.');
    return;
  }
  revokeBtn.hidden = false;

  const cookies = await chrome.cookies.getAll({ domain });
  if (cookies.length === 0) {
    setStatus(`No cookies for ${domain}. Are you logged in?`);
    return;
  }

  const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(toNetscape(cookies));
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    setStatus('Too many cookies to export in one file. Try a narrower scope.');
    return;
  }

  try {
    await chrome.downloads.download({ url: dataUrl, filename: fileNameFor(domain), saveAs: true });
    setStatus(`Download started (${cookies.length} cookies). Site access is removed when it finishes.`);
  } catch (err) {
    if (!isUserCancel(err)) throw err;
    setStatus('Save cancelled.');
  }
}

async function revoke() {
  const removed = await chrome.permissions.remove(scopePermission(scopeEl.value));
  revokeBtn.hidden = removed;
  setStatus(removed ? 'Access revoked.' : 'Could not revoke access.');
}

async function refreshRevoke() {
  revokeBtn.hidden = !(await chrome.permissions.contains(scopePermission(scopeEl.value)));
}

async function init() {
  const url = await activeTabUrl();
  if (!url) {
    setStatus('Open a website (http or https) first.');
    exportBtn.disabled = true;
    scopeEl.disabled = true;
    return;
  }

  const preferred = defaultScope(url.hostname);
  for (const domain of scopeCandidates(url.hostname)) {
    scopeEl.add(new Option(`*.${domain}`, domain, false, domain === preferred));
  }
  await refreshRevoke();

  const run = (fn) => () => fn().catch((err) => setStatus(`Error: ${err.message}`));
  scopeEl.addEventListener('change', run(refreshRevoke));
  exportBtn.addEventListener('click', run(exportCookies));
  revokeBtn.addEventListener('click', run(revoke));
}

init().catch((err) => setStatus(`Error: ${err.message}`));
