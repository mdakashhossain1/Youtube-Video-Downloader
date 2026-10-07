const fs = require('fs');
const path = require('path');

const RELEASE_BASE = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';
const ASSETS = {
    win32: { asset: 'yt-dlp.exe', file: 'yt-dlp.exe' },
    darwin: { asset: 'yt-dlp_macos', file: 'yt-dlp' },
    linux: { asset: process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux', file: 'yt-dlp' },
};

async function main() {
    const target = ASSETS[process.platform];
    if (!target) throw new Error(`Unsupported platform: ${process.platform}`);

    const binDir = path.resolve(__dirname, '..', 'bin');
    const destination = path.join(binDir, target.file);
    fs.mkdirSync(binDir, { recursive: true });

    console.log(`Downloading ${target.asset}...`);
    const response = await fetch(`${RELEASE_BASE}/${target.asset}`, { redirect: 'follow' });
    if (!response.ok) throw new Error(`Download failed with HTTP ${response.status}`);

    fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
    fs.chmodSync(destination, 0o755);
    console.log(`yt-dlp installed at ${destination}`);
}

main().catch((err) => {
    console.error('yt-dlp setup failed:', err.message);
    process.exit(1);
});
