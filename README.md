# YTSaver — YouTube Video & Audio Downloader

A modern, high-performance YouTube video and audio downloader built with React 19, Vite, and Node.js.

- **Frontend**: React 19 + Vite (modern dark UI with magnetic interactions, responsive layout, MP4/MP3 format picker)
- **Backend**: Node.js + Express (Stream pipeline architecture, zero files retained on server)
- **Multi-Layer Engine**: `youtubei.js` with client matrix waterfall (`ANDROID` → `YTMUSIC` → `IOS` → `MWEB`), anti-crash pipeline, and YouTube official `oEmbed` fallback.

---

## Requirements

- **Node.js 18+**
- NPM or PNPM

---

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Build the frontend
npm run build

# 3. Start the server
npm start
```

---

## 🔑 Shared Hosting & VPS Setup (Bypassing "Video is login required")

If you are hosting on **cPanel Shared Hosting** or a **VPS / Cloud Provider** (e.g. `viedown.com`), YouTube often flags datacenter IP addresses with:
> `Video is login required: Sign in to confirm you're not a bot`

To resolve this permanently, you only need to authenticate the server **once**. End users / visitors will **never** be asked to log in.

### Method 1: 1-Click Google Device Authentication (Recommended)

1. Open your server's terminal (cPanel Terminal or SSH) in the project directory.
2. Run the login script:
   ```bash
   npm run login
   ```
3. The terminal will display:
   ```text
   =============================================================
   🔑 YTSaver / viedown - 1-Click Google Device Authentication
   =============================================================

   👉 STEP 1: On your phone or PC browser, open this link:
      https://www.google.com/device

   👉 STEP 2: Enter this code:
      ABCD-EFGH

   ⏳ Waiting for you to authorize the device...
   ```
4. On your **personal laptop or mobile phone** browser, go to **[https://www.google.com/device](https://www.google.com/device)**.
5. Enter the code shown in your terminal, sign in with any Google account (a secondary or free throwaway account is fine), and click **Allow**.
6. The terminal will automatically detect authorization and display:
   ```text
   🎉 SUCCESS! Authentication complete!
   Tokens saved permanently to: .yt_session
   Your server is now verified. "Video is login required" is permanently resolved.
   ```
7. Restart your Node.js application in cPanel or run `npm start`.

---

### Method 2: Using `cookies.txt` (Alternative)

If you prefer exporting cookies manually:
1. Install a browser extension like **"Get cookies.txt LOCALLY"** or **"Cookie-Editor"** in Chrome/Firefox.
2. Log into YouTube, open the extension, and export your cookies.
3. Save the exported file as `cookies.txt` in the root folder of your project on the server (or set `YOUTUBE_COOKIE="..."` in your `.env` file).
4. The server automatically detects, parses, and loads `cookies.txt` on startup.

---

## Environment Configuration

Create a `.env` file in the root directory if you need custom values:

```env
# Port on which the Express server listens (Default: 3000)
PORT=3000

# Node environment ('development' or 'production')
NODE_ENV=production

# Frontend API URL (leave empty when backend and frontend are unified on same domain)
VITE_API_URL=

# Optional: Direct Cookie String (Alternative to cookies.txt)
# YOUTUBE_COOKIE=PREF=...; SID=...; HSID=...;

# Optional: HTTP/SOCKS5 Proxy (If routing outbound traffic through a proxy)
# HTTP_PROXY=http://username:password@proxy-ip:port
```

---

## How to Run

### Production (Unified Server on Single Domain)
```bash
npm run build
npm start
```
Serves the compiled frontend and API together on port `3000` (or `process.env.PORT`).

### Development (With Hot Module Reload)
```bash
npm run dev
```
Starts both the API backend (port `3000`) and the Vite development server (port `5173`) concurrently.

---

## Architectural Highlights

1. **Anti-Crash Stream Pipeline**:
   - Replaced unmanaged `.pipe()` with Node's native `stream.pipeline()`.
   - Client socket drops, premature cancellations, and network resets are caught safely without crashing the Node.js process.
2. **Multi-Client Waterfall**:
   - Automatically cascades requests through `ANDROID` → `YTMUSIC` → `IOS` → `MWEB`.
   - Adaptive quality fallback ensures that low-resolution or legacy videos smoothly fall back to `best` quality if 720p is not available.
3. **Multi-Layer Metadata Engine**:
   - Bypasses datacenter metadata blocks via mobile client extraction and YouTube's official public `oEmbed` API.
4. **Zero Files Retained Policy**:
   - Streams directly from YouTube CDN to the client response with background cleanup sweeping, ensuring 0 disk consumption.

---

## License

MIT — feel free to use and customize for your projects.
