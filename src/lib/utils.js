import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind class strings, later classes winning (shadcn/ui convention).
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

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

export function formatBytes(bytes) {
    const b = Number(bytes);
    if (!b || b <= 0) return null;
    if (b >= 1024 * 1024 * 1024) return (b / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (b >= 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
    if (b >= 1024) return (b / 1024).toFixed(0) + ' KB';
    return b + ' B';
}

// Map a yt-dlp audio codec to a friendly label.
export function audioCodecName(acodec) {
    if (!acodec) return '';
    const a = String(acodec);
    if (/mp4a/.test(a)) return 'AAC';
    if (/opus/i.test(a)) return 'Opus';
    if (/vorbis/i.test(a)) return 'Vorbis';
    return a.toUpperCase();
}
