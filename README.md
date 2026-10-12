# Cookie Export

A small Chrome extension that saves a site's cookies as a `cookies.txt` file (Netscape format), the format used by `curl`, `gallery-dl` and `yt-dlp`.

It is built to be easy to audit: under 200 lines of JavaScript, no dependencies, no network requests, no analytics.

## How it works

1. Open the site you're logged in to (for example instagram.com).
2. Click the Cookie Export icon.
3. Pick the scope. It defaults to the site without `www.` (for example `*.instagram.com`), which covers the domain and its subdomains. Pick a longer entry to export less.
4. Click **Export cookies.txt**. If you haven't already allowed it, Chrome asks you to allow access to that domain.
5. Choose where to save the file.

When the download finishes or is cancelled, the extension:
- removes its site access, so each export needs a fresh approval;
- deletes the entry from Chrome's download history, because the file is passed to Chrome as a `data:` URL and the entry can retain it.

If the popup closes when Chrome shows the permission prompt, click the icon and **Export** again. Access is usually already granted by then, so it should go straight to saving.

## Permissions

| Permission | Why |
|---|---|
| `cookies` | Read the cookies for the domain you export. |
| `downloads` | Save the file through Chrome's Save As dialog, then remove it from download history. |
| `activeTab` | Read the address of the tab you're on. |
| Optional host access | Requested for one domain at a time, only when you click Export, and removed after the download. The extension has no site access when installed. |

The extension has no content scripts, makes no network requests and stores nothing apart from the file you save.

## Using the file

```bash
gallery-dl --cookies instagram.com-cookies.txt https://www.instagram.com/<profile>/
yt-dlp --cookies youtube.com-cookies.txt <url>
curl -b instagram.com-cookies.txt https://www.instagram.com/
```

Notes:
- yt-dlp also writes updated cookies back to the file you pass it.
- curl silently ignores a cookie file that doesn't exist, so check the path.
- Session cookies are written with an expiry of `0`. gallery-dl and yt-dlp load them anyway. If you read the file with Python's `http.cookiejar.MozillaCookieJar`, pass `ignore_discard=True, ignore_expires=True` to `load()`.

The file contains your logged-in session for that site. Treat it like a password: don't share it, commit it to git, or keep it in a cloud-synced folder. Logging out of the site usually ends the session, but some sites keep it valid. To be sure, sign out of all sessions from the site's security settings and delete the file.

## Install (unpacked)

1. Clone this repo.
2. Go to `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the repo folder.

## Development

```bash
npm test
```

Runs the unit tests with Node's built-in test runner (Node 22 or later). There are no dependencies to install.

## License

MIT. See [LICENSE](LICENSE).
