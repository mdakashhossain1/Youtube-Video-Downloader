const fs = require('fs');
const path = require('path');

const RELEASE_BASE = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';
const ASSETS = {
    win32: { asset: 'yt-dlp.exe', file: 'yt-dlp.exe' },
    darwin: { asset: 'yt-dlp_macos', file: 'yt-dlp' },
    linux: { asset: process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux', file: 'yt-dlp' },
};

const BIN_DIR = path.resolve(__dirname, '..', 'bin');
const target = ASSETS[process.platform];
const YTDLP_BIN_PATH = path.join(BIN_DIR, target?.file || 'yt-dlp');

async function ensureYtDlp({ force = false } = {}) {
    if (!target) throw new Error(`Unsupported platform: ${process.platform}`);
    if (!force && fs.existsSync(YTDLP_BIN_PATH)) return YTDLP_BIN_PATH;

    fs.mkdirSync(BIN_DIR, { recursive: true });
    console.log(`[yt-dlp] Downloading ${target.asset}...`);
    const response = await fetch(`${RELEASE_BASE}/${target.asset}`, { redirect: 'follow' });
    if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}`);

    const tempPath = `${YTDLP_BIN_PATH}.download`;
    fs.writeFileSync(tempPath, Buffer.from(await response.arrayBuffer()));
    fs.chmodSync(tempPath, 0o755);
    fs.renameSync(tempPath, YTDLP_BIN_PATH);
    console.log(`[yt-dlp] Installed at ${YTDLP_BIN_PATH}`);
    return YTDLP_BIN_PATH;
}

const YTDLP_ZIPAPP_PATH = path.join(BIN_DIR, 'yt-dlp.zipapp');

async function ensureYtDlpZipapp({ force = false } = {}) {
    if (!force && fs.existsSync(YTDLP_ZIPAPP_PATH)) return YTDLP_ZIPAPP_PATH;

    fs.mkdirSync(BIN_DIR, { recursive: true });
    console.log('[yt-dlp] Downloading Python build (yt-dlp)...');
    const response = await fetch(`${RELEASE_BASE}/yt-dlp`, { redirect: 'follow' });
    if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}`);

    const tempPath = `${YTDLP_ZIPAPP_PATH}.download`;
    fs.writeFileSync(tempPath, Buffer.from(await response.arrayBuffer()));
    fs.renameSync(tempPath, YTDLP_ZIPAPP_PATH);
    return YTDLP_ZIPAPP_PATH;
}

module.exports = { ensureYtDlp, ensureYtDlpZipapp, YTDLP_BIN_PATH };

if (require.main === module) {
    ensureYtDlp({ force: true }).catch((err) => {
        console.error('yt-dlp setup failed:', err.message);
        process.exit(1);
    });
}
