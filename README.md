# YTSaver — YouTube Video Downloader

A professional YouTube video & audio downloader.

- **Frontend**: React 19 + Vite (dark, responsive UI with video preview, MP4/MP3 toggle, live progress)
- **Backend**: Node.js + Express
- **Download engine**: `youtube-dl-exec` (yt-dlp), with `ffmpeg-static` for merging/encoding

## Requirements

- **Node.js 18+**
- A stable internet connection (YouTube may block downloads from some networks — this is expected on some ISPs/VPNs)

## Setup

```bash
npm install
```

This installs everything, including the bundled `yt-dlp` and `ffmpeg` binaries — no system installs needed.

## Run

### Option A — One command, everything on port 3000 (recommended)

```bash
npm start
```

Serves the pre-built app **and** the API on **http://localhost:3000**.
Open that URL, paste a link, download.

> If you change frontend code, run `npm run build` first so `npm start` serves the latest UI.

### Option B — Development with hot reload

```bash
npm run dev
```

Starts **both** the API (port 3000) and the Vite dev server (port **5173**) together.
Open **http://localhost:5173**.

> ⚠️ The API must be running or the page shows `ECONNREFUSED` when you hit "Get Video". `npm run dev` starts both automatically — don't run `vite` alone (`npm run dev:web`) unless the API is already running (`npm run dev:api`).

## Usage

1. Paste a YouTube link (regular, `youtu.be`, Shorts, embed — or a bare 11-character video ID)
2. Click **Get Video** to load the preview
3. Choose **MP4 · Video** or **MP3 · Audio**
4. Click **Download** — the file saves when ready (HD videos take a moment to prepare)

## Project structure

```
├── index.html              # Vite entry
├── vite.config.mjs         # Vite + dev proxy to the API
├── server.js               # Express API: /info (metadata) and /download
├── src/
│   ├── main.jsx            # React bootstrap
│   ├── App.jsx             # App composition
│   ├── components/         # Navbar, Hero, Downloader, HowItWorks, Features, Faq, Footer
│   ├── lib/                # toast context, icons, utils
│   └── styles.css          # Design system
└── dist/                   # Built frontend (served by npm start)
```

## Troubleshooting

- **`ECONNREFUSED` / "Could not reach the server"** — the API isn't running. Use `npm start` (one port) or `npm run dev` (starts both).
- **"Could not fetch video information"** — video may be private, region-locked, or YouTube is blocking your network.
- **Download hangs on "Preparing…"** — HD videos take a minute or two to download and merge; the file saves automatically when ready.

## Legal

This tool is for personal use. Only download content you own or have permission to download, and respect YouTube's Terms of Service and copyright law.

## License

MIT — see [LICENSE](LICENSE).
