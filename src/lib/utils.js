const YOUTUBE_URL_RE = /^(https?:\/\/)?([\w-]*\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i;

export function isYouTubeUrl(value) {
    if (!value) return false;
    const v = value.trim();
    // Full URL (watch, youtu.be, Shorts, embed) or a bare 11-character video ID
    return YOUTUBE_URL_RE.test(v) || /^[a-zA-Z0-9_-]{11}$/.test(v);
}

export function sanitizeName(name) {
    return String(name || 'video')
        .replace(/[\\/:*?"<>|]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120) || 'video';
}

export function formatDuration(seconds) {
    const s = Math.max(0, Math.round(Number(seconds) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function formatViews(n) {
    n = Number(n) || 0;
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B views';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M views';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K views';
    return n + ' views';
}
