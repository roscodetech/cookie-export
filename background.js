// When an export finishes or is cancelled: drop the download-history entry (its data: URL
// holds the whole cookie file) and revoke all site access, so nothing lingers.

async function revokeAllSites() {
  const { origins = [] } = await chrome.permissions.getAll();
  if (origins.length > 0) await chrome.permissions.remove({ origins });
}

chrome.downloads.onChanged.addListener(async ({ id, state }) => {
  const done = state?.current === 'complete' || state?.current === 'interrupted';
  if (!done) return;
  const [item] = await chrome.downloads.search({ id });
  if (item?.byExtensionId !== chrome.runtime.id) return;
  await chrome.downloads.erase({ id });
  await revokeAllSites();
});
