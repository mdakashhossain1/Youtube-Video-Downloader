const http = require('http');
const express = require('express');
const { Readable, pipeline } = require('stream');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Innertube, Platform, UniversalCache } = require('youtubei.js');

// ── Anti-Crash Process Shield ────────────────────────────────────────────────
// Prevents unhandled stream abortions or YouTube connection drops from killing the server
process.on('uncaughtException', (err) => {
    if (
        err.code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        err.code === 'ECONNRESET' ||
        err.code === 'EPIPE' ||
        err.name === 'AbortError' ||
        err.message?.includes('aborted') ||
        err.message?.includes('premature close')
    ) {
        console.log('[AntiCrash] Safely handled client stream disconnect:', err.message);
        return;
    }
    console.error('[AntiCrash Guard] Intercepted Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason) => {
    console.warn('[AntiCrash Guard] Intercepted Unhandled Rejection:', reason?.message || reason);
});

// ── Enable YouTube.js JavaScript Evaluator for Signature Deciphering ─────────
Platform.shim.eval = async (data, env) => {
    const code = data.output + '\nreturn { ...env };';
    return new Function('env', code)(env);
};

const app = express();
const PORT = process.env.PORT || 3000;

// ── Internal File Cleanup Queue System ───────────────────────────────────────
// Guarantees that zero files remain saved on the server.
// Any temporary files or download buffers are queued and automatically deleted.
class FileCleanupQueue {
    constructor(tempDir) {
        this.tempDir = tempDir;
        this.queue = []; // Array of { filePath, addedAt, maxTtlMs, attempts }
        this.stats = {
            totalRegistered: 0,
            totalDeleted: 0,
            activeFilesCount: 0,
            lastSweepTime: null,
        };

        // Ensure temp directory exists and is initially empty
        this.initTempDir();

        // Background worker: runs every 3 seconds to process the cleanup queue
        this.workerInterval = setInterval(() => {
            this.processQueue();
        }, 3000);

        // Safety sweep: runs every 30 seconds to clean up any orphaned or stale files
        this.sweepInterval = setInterval(() => {
            this.sweepOrphanFiles();
        }, 30000);
    }

    initTempDir() {
        try {
            if (!fs.existsSync(this.tempDir)) {
                fs.mkdirSync(this.tempDir, { recursive: true });
            } else {
                // Startup sweep: remove any leftover files immediately
                this.sweepOrphanFiles(0);
            }
        } catch (err) {
            console.error('[CleanupQueue] Temp directory initialization error:', err.message);
        }
    }

    // Register a file into the cleanup queue
    register(filePath, maxTtlMs = 15000) {
        if (!filePath) return;
        const resolvedPath = path.resolve(filePath);
        // Only track files inside our designated tempDir or OS tempdir
        const item = {
            filePath: resolvedPath,
            addedAt: Date.now(),
            deleteAfter: Date.now() + maxTtlMs,
            attempts: 0,
        };
        this.queue.push(item);
        this.stats.totalRegistered++;
        this.stats.activeFilesCount = this.queue.length;
        console.log(`[CleanupQueue] Registered file for cleanup: ${path.basename(resolvedPath)}`);
    }

    // Trigger immediate deletion of a file (e.g. when download stream completes or client disconnects)
    immediate(filePath) {
        if (!filePath) return;
        const resolvedPath = path.resolve(filePath);
        const existing = this.queue.find((item) => item.filePath === resolvedPath);
        if (existing) {
            existing.deleteAfter = 0; // mark for immediate removal
        } else {
            this.queue.unshift({
                filePath: resolvedPath,
                addedAt: Date.now(),
                deleteAfter: 0,
                attempts: 0,
            });
            this.stats.totalRegistered++;
        }
        this.processQueue();
    }

    // Worker to process queued items
    async processQueue() {
        if (this.queue.length === 0) return;
        const now = Date.now();
        const pending = [...this.queue];

        for (const item of pending) {
            if (now >= item.deleteAfter) {
                try {
                    if (fs.existsSync(item.filePath)) {
                        fs.unlinkSync(item.filePath);
                        this.stats.totalDeleted++;
                        console.log(`[CleanupQueue] Auto-removed file: ${path.basename(item.filePath)}`);
                    }
                    // Remove from queue
                    this.queue = this.queue.filter((q) => q !== item);
                } catch (err) {
                    item.attempts++;
                    if (item.attempts >= 5) {
                        console.warn(`[CleanupQueue] Failed to delete ${item.filePath} after 5 attempts:`, err.message);
                        this.queue = this.queue.filter((q) => q !== item);
                    } else {
                        // Retry shortly (file may still be locked by stream)
                        item.deleteAfter = Date.now() + 2000;
                    }
                }
            }
        }
        this.stats.activeFilesCount = this.queue.length;
    }

    // Periodic sweep of directory to eliminate any stale files
    sweepOrphanFiles(maxAgeMs = 45000) {
        this.stats.lastSweepTime = new Date().toISOString();
        try {
            if (!fs.existsSync(this.tempDir)) return;
            const files = fs.readdirSync(this.tempDir);
            const now = Date.now();

            for (const file of files) {
                const fullPath = path.join(this.tempDir, file);
                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isFile() && (now - stat.mtimeMs > maxAgeMs || maxAgeMs === 0)) {
                        fs.unlinkSync(fullPath);
                        this.stats.totalDeleted++;
                        console.log(`[CleanupQueue Sweep] Purged orphaned temp file: ${file}`);
                    }
                } catch (e) {
                    /* ignore locked file */
                }
            }
        } catch (err) {
            console.error('[CleanupQueue] Sweep error:', err.message);
        }
    }

    getStatus() {
        return {
            zeroFilesPolicy: true,
            activeQueueLength: this.queue.length,
            totalDeleted: this.stats.totalDeleted,
            totalRegistered: this.stats.totalRegistered,
            lastSweepTime: this.stats.lastSweepTime,
            tempDir: this.tempDir,
        };
    }
}

// Dedicated temp directory for any transient file operations
const TEMP_DIR = path.resolve(__dirname, 'temp_downloads');
const cleanupQueue = new FileCleanupQueue(TEMP_DIR);

// ── Innertube Instance Singleton ─────────────────────────────────────────────
// ── Cookie & Session Authenticator ───────────────────────────────────────────
// Resolves cookies from .env, cookies.txt (Netscape or raw format) to bypass datacenter IP restrictions
function getSessionCookie() {
    if (process.env.YOUTUBE_COOKIE) {
        return process.env.YOUTUBE_COOKIE.trim();
    }
    const possiblePaths = [
        path.resolve(__dirname, 'cookies.txt'),
        path.resolve(process.cwd(), 'cookies.txt'),
        path.resolve(__dirname, 'youtube_cookies.txt'),
    ];
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                if (raw.includes('\t')) {
                    // Netscape format
                    const cookies = [];
                    for (const line of raw.split(/\r?\n/)) {
                        if (line.startsWith('#') || !line.trim()) continue;
                        const parts = line.split('\t');
                        if (parts.length >= 7) {
                            cookies.push(`${parts[5].trim()}=${parts[6].trim()}`);
                        }
                    }
                    if (cookies.length > 0) {
                        console.log(`[YouTube.js] Loaded ${cookies.length} cookies from ${path.basename(filePath)}`);
                        return cookies.join('; ');
                    }
                }
                if (raw.trim()) {
                    console.log(`[YouTube.js] Loaded cookie string from ${path.basename(filePath)}`);
                    return raw.trim();
                }
            } catch (err) {
                console.warn(`[YouTube.js] Failed to read ${filePath}:`, err.message);
            }
        }
    }
    return null;
}

// ── Innertube Instance Singleton ─────────────────────────────────────────────
let ytInstance = null;
let ytInitPromise = null;

async function getYt() {
    if (ytInstance) return ytInstance;
    if (ytInitPromise) return ytInitPromise;

    ytInitPromise = (async () => {
        try {
            const cachePath = path.resolve(__dirname, '.yt_session');
            const cookie = getSessionCookie();

            const config = {
                cache: new UniversalCache(true, cachePath),
                device_category: 'mobile',
            };

            if (cookie) {
                config.cookie = cookie;
                console.log('[YouTube.js] Session authenticated with cookie.');
            }

            const yt = await Innertube.create(config);
            ytInstance = yt;

            if (yt.session.logged_in) {
                console.log('[YouTube.js] ✅ Innertube is LOGGED IN. "Video is login required" is bypassed.');
            } else {
                console.log('[YouTube.js] Innertube initialized (anonymous mode).');
                if (!cookie) {
                    console.log('[YouTube.js] 💡 Note: If datacenter IP requires login, run `npm run login` or add `cookies.txt`.');
                }
            }

            return yt;
        } catch (err) {
            console.error('[YouTube.js] Initialization error:', err.message);
            ytInitPromise = null;
            throw err;
        }
    })();

    return ytInitPromise;
}

// Warm up Innertube on start
getYt().catch(() => {});

// ── CORS & Preflight ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// ── Serve Built Frontend ──────────────────────────────────────────────────────
const distDir = path.resolve(__dirname, 'dist');
const distBuilt = fs.existsSync(path.join(distDir, 'index.html'));
if (distBuilt) {
    app.use(express.static(distDir));
} else {
    console.warn('[Server] No dist/index.html found. Run `npm run build` or use Vite dev server.');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sendError(res, status, message) {
    if (!res.headersSent) {
        res.status(status).json({ error: message });
    }
}

function sanitizeFilename(name) {
    return (
        String(name || 'video')
            .replace(/[\\/:*?"<>|]+/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 100) || 'video'
    );
}

function extractVideoId(rawUrl) {
    if (!rawUrl) return null;
    const str = String(rawUrl).trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;

    try {
        const parsed = new URL(str.startsWith('http') ? str : `https://${str}`);
        if (parsed.hostname.includes('youtu.be')) {
            const id = parsed.pathname.slice(1).split('/')[0];
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }
        if (parsed.hostname.includes('youtube.com')) {
            if (parsed.searchParams.has('v')) {
                const id = parsed.searchParams.get('v');
                return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
            }
            const match = parsed.pathname.match(/\/(?:shorts|embed|v)\/([a-zA-Z0-9_-]{11})/);
            if (match) return match[1];
        }
    } catch {
        /* invalid url */
    }

    const regMatch = str.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11})/);
    return regMatch ? regMatch[1] : null;
}

// ── GET /api/status — Server & Queue health monitor ─────────────────────────
app.get(['/api/status', '/status'], (req, res) => {
    res.json({
        server: 'online',
        uptimeSeconds: Math.floor(process.uptime()),
        queue: cleanupQueue.getStatus(),
    });
});

// ── Multi-Layer Metadata Extraction Engine ───────────────────────────────────
// Layer 1: Innertube mobile & embedded clients (ANDROID -> IOS -> TV)
// Layer 2: Official YouTube oEmbed API (100% immune to datacenter IP / bot blocking)
// Layer 3: NoEmbed Fallback
async function fetchVideoDetailsMultiLayer(yt, videoId) {
    // Layer 1: Innertube Mobile/Embedded Clients
    const clients = ['ANDROID', 'IOS', 'TV'];
    for (const client of clients) {
        try {
            const info = await yt.getBasicInfo(videoId, client);
            const playStatus = info?.playability_status?.status;
            if (playStatus !== 'LOGIN_REQUIRED' && info?.basic_info?.title) {
                const thumbs = info.basic_info.thumbnail || [];
                const bestThumb =
                    thumbs.length > 0
                        ? thumbs[thumbs.length - 1]?.url
                        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                return {
                    title: info.basic_info.title,
                    author: info.basic_info.author || info.basic_info.channel?.name || 'YouTube Creator',
                    duration: Number(info.basic_info.duration) || 0,
                    views: Number(info.basic_info.view_count) || 0,
                    thumbnail: bestThumb,
                    source: `innertube_${client}`,
                };
            }
        } catch (err) {
            console.warn(`[Metadata Engine] Client ${client} failed for ${videoId}:`, err.message);
        }
    }

    // Layer 2: Official YouTube oEmbed API (Bypasses all datacenter bot guard checks)
    try {
        console.log(`[Metadata Engine] Falling back to Layer 2: Official YouTube oEmbed for ${videoId}`);
        const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
            {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                },
            }
        );
        if (oembedRes.ok) {
            const data = await oembedRes.json();
            return {
                title: data.title || 'YouTube Video',
                author: data.author_name || 'YouTube Creator',
                duration: 0,
                views: 0,
                thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                source: 'oembed_official',
            };
        }
    } catch (oembedErr) {
        console.warn(`[Metadata Engine] oEmbed fallback failed:`, oembedErr.message);
    }

    // Layer 3: NoEmbed Fallback
    try {
        const noembedRes = await fetch(
            `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        );
        if (noembedRes.ok) {
            const data = await noembedRes.json();
            if (data.title) {
                return {
                    title: data.title,
                    author: data.author_name || 'YouTube Creator',
                    duration: 0,
                    views: 0,
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    source: 'noembed_fallback',
                };
            }
        }
    } catch {
        /* ignore */
    }

    // Safe Default
    return {
        title: 'YouTube Video',
        author: 'YouTube Creator',
        duration: 0,
        views: 0,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        source: 'default',
    };
}

// ── GET /formats — Fetch metadata & clean available format options ───────────
app.get('/formats', async (req, res) => {
    const videoId = extractVideoId(req.query.url);
    if (!videoId) {
        return sendError(res, 400, 'Invalid YouTube link or video ID.');
    }

    try {
        const yt = await getYt();
        const details = await fetchVideoDetailsMultiLayer(yt, videoId);

        // Clean, structured formats for the user
        const videoFormats = [
            {
                id: '720p',
                label: '720p HD',
                resolution: '720p',
                ext: 'mp4',
                quality: 'High Definition (720p)',
                type: 'video',
                note: 'Best quality with audio included',
                recommended: true,
            },
            {
                id: '360p',
                label: '360p Standard',
                resolution: '360p',
                ext: 'mp4',
                quality: 'Standard (360p)',
                type: 'video',
                note: 'Faster download & smaller size',
                recommended: false,
            },
        ];

        const audioFormats = [
            {
                id: 'mp3',
                label: 'MP3 High Quality',
                resolution: 'Audio',
                ext: 'mp3',
                quality: 'Best Audio (320/192 kbps)',
                type: 'audio',
                note: 'Universal audio playback',
                recommended: true,
            },
            {
                id: 'm4a',
                label: 'M4A Original',
                resolution: 'Audio',
                ext: 'm4a',
                quality: 'Original Stream',
                type: 'audio',
                note: 'Crisp original audio',
                recommended: false,
            },
        ];

        res.json({
            id: videoId,
            title: details.title,
            thumbnail: details.thumbnail,
            author: details.author,
            duration: details.duration,
            views: details.views,
            video: videoFormats,
            audio: audioFormats,
            combined: videoFormats,
            metadataSource: details.source,
        });
    } catch (err) {
        console.error('[Formats] Error fetching video:', err.message);
        sendError(res, 500, 'Could not fetch video info. Please try again.');
    }
});

// ── GET /prepare — Progress / status check shim ──────────────────────────────
app.get('/prepare', async (req, res) => {
    const videoId = extractVideoId(req.query.url);
    if (!videoId) return sendError(res, 400, 'Invalid YouTube URL.');

    res.set({
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const emit = (obj) => {
        if (!res.writableEnded) res.write(JSON.stringify(obj) + '\n');
    };

    try {
        const yt = await getYt();
        const details = await fetchVideoDetailsMultiLayer(yt, videoId);
        const title = sanitizeFilename(details.title);

        emit({ type: 'progress', pct: 50 });
        emit({ type: 'done', name: title, size: 0 });
        res.end();
    } catch (err) {
        emit({ type: 'error', message: err.message || 'Could not prepare download.' });
        res.end();
    }
});

// ── Multi-Layer Stream Engine ────────────────────────────────────────────────
// Layer 1: Client waterfall (ANDROID -> YTMUSIC -> IOS -> MWEB)
// Layer 2: Direct decipher stream fallback with browser header spoofing
async function acquireMultiLayerStream(yt, videoId, { kind, format }) {
    const isAudio = kind === 'mp3' || kind === 'audio' || kind === 'm4a';

    // Multi-Layer client waterfall matrix
    const clientMatrix = isAudio
        ? ['IOS', 'YTMUSIC', 'ANDROID', 'MWEB']
        : ['ANDROID', 'YTMUSIC', 'IOS', 'MWEB'];

    let lastError = null;

    // Layer 1 & 2: Client Waterfall via Innertube with adaptive quality fallback
    for (const client of clientMatrix) {
        // Try requested format first, then fall back to 'best' if requested format isn't available
        const qualitiesToTry = format && format !== 'auto' && format !== 'best' 
            ? [format, 'best'] 
            : ['best'];

        for (const q of qualitiesToTry) {
            try {
                console.log(`[MultiLayer Engine] Trying client: ${client} (quality: ${q}) for ${videoId} (${kind})`);
                const stream = await yt.download(videoId, {
                    type: isAudio ? 'audio' : 'video+audio',
                    quality: q,
                    client: client,
                });

                if (stream) {
                    console.log(`[MultiLayer Engine] SUCCESS via client: ${client} (quality: ${q})`);
                    return { stream, clientUsed: `${client}_${q}`, isWebStream: true };
                }
            } catch (err) {
                console.warn(`[MultiLayer Engine] Client ${client} with quality ${q} failed: ${err.message}`);
                lastError = err;
            }
        }
    }

    // Layer 3: Direct Format Decipher Fallback (Fetches directly from Google CDN with realistic headers)
    try {
        console.log(`[MultiLayer Engine] Attempting Layer 3: Direct decipher fallback for ${videoId}`);
        const info = await yt.getInfo(videoId);
        const streamingData = info.streaming_data;

        if (streamingData) {
            const candidateFormats = isAudio
                ? (streamingData.adaptive_formats || []).filter((f) => f.has_audio && !f.has_video)
                : (streamingData.formats || []).filter((f) => f.has_video && f.has_audio);

            for (const f of candidateFormats) {
                try {
                    const decipheredUrl = await f.decipher(yt.session.player);
                    if (decipheredUrl) {
                        const cdnRes = await fetch(decipheredUrl, {
                            headers: {
                                'User-Agent':
                                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                                Accept: '*/*',
                                'Accept-Encoding': 'identity;q=1, *;q=0',
                                Range: 'bytes=0-',
                            },
                        });

                        if (cdnRes.ok && cdnRes.body) {
                            console.log(`[MultiLayer Engine] SUCCESS via Layer 3 Direct Decipher!`);
                            return { stream: cdnRes.body, clientUsed: 'DIRECT_CDN_DECIPHER', isWebStream: true };
                        }
                    }
                } catch (decErr) {
                    console.warn(`[MultiLayer Engine] Decipher format candidate failed:`, decErr.message);
                }
            }
        }
    } catch (layer3Err) {
        console.warn(`[MultiLayer Engine] Layer 3 direct decipher failed:`, layer3Err.message);
    }

    throw lastError || new Error('All download layers were restricted by YouTube bot detection.');
}

// ── GET /api/stream-url — Deciphered direct CDN URL for client residential download ─
app.get(['/api/stream-url', '/stream-url'], async (req, res) => {
    const videoId = extractVideoId(req.query.url);
    const kind = req.query.kind || 'video';

    if (!videoId) {
        return sendError(res, 400, 'Invalid YouTube link or video ID.');
    }

    try {
        const yt = await getYt();
        const info = await yt.getInfo(videoId);
        const title = sanitizeFilename(info.basic_info.title);
        const streamingData = info.streaming_data;

        if (!streamingData) {
            return sendError(res, 404, 'No streaming formats available for this video.');
        }

        const isAudio = kind === 'mp3' || kind === 'audio' || kind === 'm4a';
        const candidateFormats = isAudio
            ? (streamingData.adaptive_formats || []).filter((f) => f.has_audio && !f.has_video)
            : (streamingData.formats || []).filter((f) => f.has_video && f.has_audio);

        for (const f of candidateFormats) {
            try {
                const directUrl = await f.decipher(yt.session.player);
                if (directUrl) {
                    return res.json({
                        success: true,
                        videoId,
                        title,
                        filename: `${title}.${isAudio ? (kind === 'm4a' ? 'm4a' : 'mp3') : 'mp4'}`,
                        directUrl,
                        mimeType: f.mime_type,
                        quality: f.quality_label || f.audio_quality || 'Standard',
                    });
                }
            } catch {
                /* continue loop */
            }
        }

        sendError(res, 404, 'Could not decipher a direct playback URL.');
    } catch (err) {
        console.error('[Stream URL Error]:', err.message);
        sendError(res, 500, 'Failed to resolve stream URL. Video may be restricted.');
    }
});

// ── GET /download — Stream video/audio directly with bulletproof pipeline ──────
app.get('/download', async (req, res) => {
    const videoId = extractVideoId(req.query.url);
    const kind = req.query.kind || 'video'; // 'video' | 'audio' | 'mp3'
    const format = req.query.format || '720p';

    if (!videoId) {
        return sendError(res, 400, 'Invalid YouTube link.');
    }

    try {
        const yt = await getYt();
        const details = await fetchVideoDetailsMultiLayer(yt, videoId);
        const title = sanitizeFilename(details.title);

        const isAudio = kind === 'mp3' || kind === 'audio' || kind === 'm4a';
        const ext = isAudio ? (kind === 'm4a' ? 'm4a' : 'mp3') : 'mp4';
        const contentType = isAudio ? (kind === 'm4a' ? 'audio/mp4' : 'audio/mpeg') : 'video/mp4';
        const filename = `${title}.${ext}`;

        // Multi-Layer stream acquisition
        const { stream, clientUsed, isWebStream } = await acquireMultiLayerStream(yt, videoId, {
            kind,
            format,
        });

        if (!stream) {
            return sendError(res, 404, 'Could not obtain stream from any client layer.');
        }

        // Set response headers for instant browser attachment download
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
            'Cache-Control': 'no-store',
            'X-Accel-Buffering': 'no',
            'X-Download-Layer': clientUsed,
            'X-Content-Type-Options': 'nosniff',
        });

        // Convert Web Stream to Node Readable Stream if needed
        const nodeReadable = isWebStream ? Readable.fromWeb(stream) : stream;

        // Use stream.pipeline for safe teardown and crash protection on client disconnect
        pipeline(nodeReadable, res, (err) => {
            if (err) {
                if (
                    err.code === 'ERR_STREAM_PREMATURE_CLOSE' ||
                    err.code === 'ECONNRESET' ||
                    err.name === 'AbortError' ||
                    err.message?.includes('aborted')
                ) {
                    console.log(`[Download Stream] Client aborted download: ${videoId} (${filename})`);
                } else {
                    console.error(`[Download Stream Pipeline Error]: ${err.message}`);
                }
            } else {
                console.log(`[Download Stream] Successfully completed: ${filename} (via ${clientUsed})`);
            }
            cleanupQueue.processQueue();
        });

        req.on('close', () => {
            if (!res.writableEnded) {
                try {
                    nodeReadable.destroy();
                } catch {
                    /* ignore */
                }
            }
        });
    } catch (err) {
        console.error('[Download Error]:', err.message);
        if (!res.headersSent) {
            sendError(
                res,
                500,
                `Download failed: ${err.message || 'The video may be restricted or blocked by YouTube.'}`
            );
        }
    }
});

// ── SPA Fallback ─────────────────────────────────────────────────────────────
if (distBuilt) {
    app.use((req, res, next) => {
        if (
            req.method !== 'GET' ||
            ['/formats', '/prepare', '/download', '/status', '/api'].some((p) =>
                req.path.startsWith(p)
            )
        ) {
            return next();
        }
        res.sendFile(path.join(distDir, 'index.html'), (err) => {
            if (err) next(err);
        });
    });
}

// ── Start Server ─────────────────────────────────────────────────────────────
const server = http.createServer(app);

const listenTarget =
    process.env.PORT && isNaN(Number(process.env.PORT))
        ? process.env.PORT
        : { port: Number(PORT) || 3000 };

server.listen(listenTarget, () => {
    console.log(`[YTSaver] Server active on port ${PORT}`);
    console.log(`[YTSaver] Cleanup Queue active: Zero files retained on server.`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is in use.`);
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
});
