/**
 * Candidate cookie scopes for a hostname, narrowest first, stopping at two labels.
 * The user picks one; we don't ship a public suffix list, so the default skips only "www.".
 * @param {string} hostname
 * @returns {string[]}
 */
export function scopeCandidates(hostname) {
  const labels = hostname.toLowerCase().split('.');
  if (labels.length < 2 || hostname.startsWith('[')) return [hostname];
  return labels.slice(0, -1).map((_, i) => labels.slice(i).join('.'));
}

/**
 * @param {string} hostname
 * @returns {string}
 */
export function defaultScope(hostname) {
  const candidates = scopeCandidates(hostname);
  return candidates[0].startsWith('www.') && candidates.length > 1 ? candidates[1] : candidates[0];
}

/**
 * Match pattern covering the domain and all its subdomains, both schemes.
 * @param {string} domain
 * @returns {{ origins: string[] }}
 */
export function scopePermission(domain) {
  return { origins: [`*://*.${domain}/*`] };
}
