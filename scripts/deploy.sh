#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
npm install --no-audit --no-fund

echo "==> Building frontend"
npm run build

echo "==> Checking binaries"
YTDLP="${YTDLP_PATH:-./bin/yt-dlp}"
"$YTDLP" --version
node -e "const p=require('ffmpeg-static'); if(!require('fs').existsSync(p)) process.exit(1); console.log('ffmpeg', p)"

echo "==> Starting with PM2"
command -v pm2 >/dev/null 2>&1 || npm install -g pm2
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "==> Health check"
sleep 4
node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/status').then(r=>r.json()).then(j=>console.log('server',j.server)).catch(e=>{console.error('Health check failed:',e.message);process.exit(1)})"

echo "Deploy complete. Run 'pm2 startup' once if you want PM2 to launch on server reboot."
