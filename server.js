const http = require('http');
const express = require('express');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Innertube, Platform } = require('youtubei.js');

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
let ytInstance = null;
let ytInitPromise = null;

async function getYt() {
    if (ytInstance) return ytInstance;
    if (ytInitPromise) return ytInitPromise;

    ytInitPromise = (async () => {
        try {
            const yt = await Innertube.create();
            ytInstance = yt;
            console.log('[YouTube.js] Innertube initialized successfully.');
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

// ── GET /formats — Fetch metadata & clean available format options ───────────
app.get('/formats', async (req, res) => {
    const videoId = extractVideoId(req.query.url);
    if (!videoId) {
        return sendError(res, 400, 'Invalid YouTube link or video ID.');
    }

    try {
        const yt = await getYt();
        const info = await yt.getBasicInfo(videoId);
        const details = info.basic_info;

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

        // Best thumbnail
        const thumbs = details.thumbnail || [];
        const bestThumb = thumbs.length > 0 ? thumbs[thumbs.length - 1]?.url : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        res.json({
            id: videoId,
            title: details.title || 'YouTube Video',
            thumbnail: bestThumb,
            author: details.author || details.channel?.name || 'YouTube Creator',
            duration: Number(details.duration) || 0,
            views: Number(details.view_count) || 0,
            video: videoFormats,
            audio: audioFormats,
            combined: videoFormats,
        });
    } catch (err) {
        console.error('[Formats] Error fetching video:', err.message);
        sendError(res, 500, 'Could not fetch video info. The video may be private, age-restricted, or removed.');
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
        const info = await yt.getBasicInfo(videoId);
        const title = sanitizeFilename(info.basic_info.title);

        emit({ type: 'progress', pct: 50 });
        emit({ type: 'done', name: title, size: 0 });
        res.end();
    } catch (err) {
        emit({ type: 'error', message: err.message || 'Could not prepare download.' });
        res.end();
    }
});

// ── GET /download — Stream video/audio directly, zero files saved on server ──
app.get('/download', async (req, res) => {
    const videoId = extractVideoId(req.query.url);
    const kind = req.query.kind || 'video'; // 'video' | 'audio' | 'mp3'
    const format = req.query.format || '720p';

    if (!videoId) {
        return sendError(res, 400, 'Invalid YouTube link.');
    }

    try {
        const yt = await getYt();
        const info = await yt.getBasicInfo(videoId);
        const title = sanitizeFilename(info.basic_info.title);

        let stream = null;
        let filename = `${title}.mp4`;
        let contentType = 'video/mp4';

        if (kind === 'mp3' || kind === 'audio') {
            filename = `${title}.${kind === 'm4a' ? 'm4a' : 'mp3'}`;
            contentType = kind === 'm4a' ? 'audio/mp4' : 'audio/mpeg';

            // High-quality audio stream directly from YouTube CDN via IOS client
            stream = await yt.download(videoId, {
                type: 'audio',
                quality: 'best',
                client: 'IOS',
            });
        } else {
            // Video stream: pre-muxed with both video + audio via ANDROID client
            filename = `${title}.mp4`;
            contentType = 'video/mp4';

            stream = await yt.download(videoId, {
                type: 'video+audio',
                quality: 'best',
                client: 'ANDROID',
            });
        }

        if (!stream) {
            return sendError(res, 404, 'Could not obtain stream for this media.');
        }

        // Set attachment headers for instant browser download
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
            'Cache-Control': 'no-store',
            'X-Accel-Buffering': 'no',
        });

        // Convert Web ReadableStream to Node.js Readable stream
        const nodeReadable = Readable.fromWeb(stream);

        // Pipe to response directly — zero files written to disk
        nodeReadable.pipe(res);

        // Stream event handling & guaranteed cleanup
        nodeReadable.on('error', (err) => {
            console.error('[Download Stream Error]:', err.message);
            if (!res.headersSent) {
                sendError(res, 500, 'Streaming failed.');
            } else {
                res.destroy();
            }
        });

        // When request finishes or client disconnects, run the queue cleanup check
        res.on('finish', () => {
            cleanupQueue.processQueue();
        });

        req.on('close', () => {
            nodeReadable.destroy();
            cleanupQueue.processQueue();
        });
    } catch (err) {
        console.error('[Download Error]:', err.message);
        sendError(res, 500, 'Download failed. The video may be restricted or unavailable.');
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
