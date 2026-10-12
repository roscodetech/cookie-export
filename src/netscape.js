export const HEADER =
  '# Netscape HTTP Cookie File\n' +
  '# Exported by cookie-export. Contains login sessions: keep it private.\n\n';

const UNSAFE = /[\t\r\n]/g;

/**
 * @param {chrome.cookies.Cookie} cookie
 * @returns {string}
 */
function toLine(cookie) {
  const expiry = cookie.session || !cookie.expirationDate ? 0 : Math.floor(cookie.expirationDate);
  const domain = cookie.domain.replace(UNSAFE, '');
  // The subdomain flag must match the leading dot or Python's MozillaCookieJar rejects the line.
  return [
    domain,
    domain.startsWith('.') ? 'TRUE' : 'FALSE',
    cookie.path.replace(UNSAFE, ''),
    cookie.secure ? 'TRUE' : 'FALSE',
    String(expiry),
    cookie.name.replace(UNSAFE, ''),
    cookie.value.replace(UNSAFE, ''),
  ].join('\t');
}

/**
 * Serialise cookies to the Netscape cookies.txt format read by curl, gallery-dl and yt-dlp.
 * @param {chrome.cookies.Cookie[]} cookies
 * @returns {string}
 */
export function toNetscape(cookies) {
  if (!Array.isArray(cookies)) {
    throw new TypeError('toNetscape expects an array of cookies');
  }
  return HEADER + cookies.map(toLine).join('\n') + '\n';
}
