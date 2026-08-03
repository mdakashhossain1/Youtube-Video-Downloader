const http = require('http');
const { spawn } = require('child_process');
const express = require('express');
const ytdl = require('youtube-dl-exec'); // yt-dlp wrapper (used for metadata)
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Simple CORS for the dev setup (Vite on :5173 calls the API on :3000 directly).
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Serve the built React frontend (created by `npm run build`)
const distDir = path.resolve(__dirname, 'dist');
const distBuilt = fs.existsSync(path.join(distDir, 'index.html'));
if (distBuilt) {
    app.use(express.static(distDir));
} else {
    console.warn('No /dist build found. Run `npm run build`, or use `npm run dev` for the Vite dev server.');
}

const tempDir = path.resolve(__dirname, 'temp');
const downloadsDir = path.resolve(__dirname, 'downloads');

// Bundled ffmpeg binary (used by yt-dlp for merging MP4 and encoding MP3).
const FFMPEG_PATH = require('ffmpeg-static');

// yt-dlp binary path (downloaded automatically by youtube-dl-exec at install time).
const YTDLP_PATH = require('youtube-dl-exec').constants.YOUTUBE_DL_PATH;

function ensureDirs() {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
}

function sendError(res, status, message) {
    res.status(status).json({ error: message });
}

function sanitizeFilename(name) {
    return String(name || 'video')
        .replace(/[\\/:*?"<>|]+/g, '')
        .replace(/\s+/g, ' ')
        .trim() || 'video';
}

// Extract the 11-char video ID from any supported URL shape (or null).
function extractVideoId(value) {
    const v = (value || '').trim();
    const m =
        v.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
        v.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
        v.match(/\/(?:embed|v|shorts)\/([a-zA-Z0-9_-]{11})/) ||
        v.match(/^([a-zA-Z0-9_-]{11})$/);
    return m ? m[1] : null;
}

// Remove partial/final files for one download prefix (used on error and cleanup).
function cleanOutputFiles(prefix) {
    if (!fs.existsSync(downloadsDir)) return;
    for (const name of fs.readdirSync(downloadsDir)) {
        if (name.startsWith(prefix)) {
            fs.unlink(path.join(downloadsDir, name), () => {});
        }
    }
}

// The final produced file after yt-dlp finishes. Extension can vary
// (mp4, webm, mkv...), so we pick the newest non-partial file with our prefix.
function findOutputFile(prefix) {
    if (!fs.existsSync(downloadsDir)) return null;
    const matches = fs.readdirSync(downloadsDir)
        .filter((name) => name.startsWith(prefix) && !name.endsWith('.part') && !name.endsWith('.ytdl'))
        .map((name) => path.join(downloadsDir, name))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return matches[0] || null;
}

// Accepts youtube.com/watch, youtu.be, Shorts, embed/v links (also music./m./www.)
const YOUTUBE_URL_RE = /^(https?:\/\/)?([\w-]*\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i;

function isYouTubeUrl(value) {
    if (!value) return false;
    return YOUTUBE_URL_RE.test(value.trim());
}

// Shared flags for every yt-dlp call.
function baseFlags(extra = {}) {
    return {
        noWarnings: true,
        noCheckCertificates: true,
        noPlaylist: true,
        socketTimeout: 30000,
        ffmpegLocation: FFMPEG_PATH,
        ...extra,
    };
}

// Fetch video metadata once (title, thumbnail, author, duration, views).
async function fetchVideoInfo(videoUrl) {
    const info = await ytdl(videoUrl, baseFlags({ dumpSingleJson: true }));
    return {
        id: info.id || '',
        title: info.title || '',
        thumbnail: info.thumbnail || null,
        author: info.channel || info.uploader || 'Unknown',
        duration: Number(info.duration) || 0,
        views: Number(info.view_count) || 0,
    };
}

// Command-line args passed to the yt-dlp binary (used by /prepare so we can
// stream live progress to the client while it downloads).
function getYtDlpArgs(videoUrl, format, outputBase) {
    const common = [
        videoUrl,
        '-o', `${outputBase}.%(ext)s`,
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--socket-timeout', '60000',
        '--ffmpeg-location', FFMPEG_PATH,
        '--newline', // one progress line per update, on stdout
    ];
    if (format === 'mp3') {
        common.push('-x', '--audio-format', 'mp3', '--audio-quality', '5');
    } else {
        common.push(
            '-f', 'bv*[ext=mp4][vcodec!=vp9]+ba[ext=m4a]/b[ext=mp4]/b',
            '--merge-output-format', 'mp4'
        );
    }
    return common;
}

// ---- Video metadata (used by the preview card) ----
app.get('/info', async (req, res) => {
    const videoUrl = req.query.url;

    if (!isYouTubeUrl(videoUrl)) {
        return sendError(res, 400, 'Invalid YouTube URL.');
    }

    try {
        res.json(await fetchVideoInfo(videoUrl));
    } catch (err) {
        console.error('Error fetching video info:', err.message);
        sendError(res, 500, 'Could not fetch video information. The video may be unavailable or private.');
    }
});

// ---- Prepare: download the file, streaming live progress as NDJSON ----
// Emits lines like  {"type":"progress","phase":"download","pct":42.3}
//                    {"type":"progress","phase":"merge"}
//                    {"type":"done","name":"...","size":123}
//                    {"type":"error","message":"..."}
app.get('/prepare', async (req, res) => {
    const videoUrl = req.query.url;
    const format = (req.query.format || 'mp4').toLowerCase();

    if (!isYouTubeUrl(videoUrl)) {
        return sendError(res, 400, 'Invalid YouTube URL.');
    }

    ensureDirs();

    res.set({
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const emit = (obj) => {
        if (!res.writableEnded) res.write(JSON.stringify(obj) + '\n');
    };

    const prefixBase = `${extractVideoId(videoUrl) || 'video'}_${format}`;
    const outputBase = path.join(downloadsDir, prefixBase);

    try {
        const info = await fetchVideoInfo(videoUrl);
        const filename = sanitizeFilename(info.title) || info.id || 'video';

        // Already downloaded earlier? Hand it over instantly.
        const existing = findOutputFile(prefixBase);
        if (existing) {
            emit({ type: 'done', name: filename + path.extname(existing), size: fs.statSync(existing).size });
            return res.end();
        }

        console.log(`Preparing ${format} for ${info.id}...`);
        const child = spawn(YTDLP_PATH, getYtDlpArgs(videoUrl, format, outputBase), { windowsHide: true });

        let stderrTail = '';
        let finished = false;

        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            for (const raw of chunk.split('\n')) {
                const line = raw.trim();
                if (!line) continue;
                if (/\[download\]\s+\d+(?:\.\d+)?%/.test(line)) {
                    const m = line.match(/(\d+(?:\.\d+)?)%/);
                    emit({ type: 'progress', phase: 'download', pct: parseFloat(m[1]) });
                } else if (/\[(Merger|ExtractAudio|ffmpeg|VideoConvertor)\]/.test(line)) {
                    emit({ type: 'progress', phase: 'merge' });
                }
            }
        });

        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (d) => {
            stderrTail = (stderrTail + d).slice(-2000);
        });

        // Client went away — stop the download to avoid orphan work.
        res.on('close', () => {
            if (!finished) child.kill();
        });

        child.on('error', (err) => {
            finished = true;
            emit({ type: 'error', message: err.message });
            res.end();
        });

        child.on('close', (code) => {
            finished = true;
            if (code === 0) {
                const out = findOutputFile(prefixBase);
                if (!out) {
                    emit({ type: 'error', message: 'Output file was not created.' });
                    return res.end();
                }
                emit({ type: 'done', name: filename + path.extname(out), size: fs.statSync(out).size });
                return res.end();
            }
            cleanOutputFiles(prefixBase);
            const detail = stderrTail.split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 300);
            emit({ type: 'error', message: 'Download failed.' + (detail ? ` ${detail}` : '') });
            res.end();
        });
    } catch (err) {
        console.error('Error in /prepare:', err.message);
        emit({ type: 'error', message: err.message || 'Download failed.' });
        res.end();
    }
});

// ---- Download: serve the prepared file (or run yt-dlp as a fallback) ----
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const format = (req.query.format || 'mp4').toLowerCase();

    if (!isYouTubeUrl(videoUrl)) {
        return sendError(res, 400, 'Invalid YouTube URL.');
    }

    ensureDirs();

    const prefixBase = `${extractVideoId(videoUrl) || 'video'}_${format}`;
    const outputBase = path.join(downloadsDir, prefixBase);

    try {
        const info = await fetchVideoInfo(videoUrl);
        const filename = sanitizeFilename(info.title) || info.id || 'video';

        // Already prepared? Serve it straight away (the common case after /prepare).
        const existing = findOutputFile(prefixBase);
        if (existing) {
            return res.download(existing, filename + path.extname(existing), (err) => {
                if (err) console.error('Error during download:', err);
                cleanOutputFiles(prefixBase);
            });
        }

        // Fallback for direct API calls: download without progress.
        if (format === 'mp3') {
            console.log('Downloading and converting to MP3...');
            await ytdl(videoUrl, baseFlags({
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 5,
                output: `${outputBase}.%(ext)s`,
                socketTimeout: 60000,
            }));
        } else {
            console.log('Downloading and merging MP4...');
            await ytdl(videoUrl, baseFlags({
                format: 'bv*[ext=mp4][vcodec!=vp9]+ba[ext=m4a]/b[ext=mp4]/b',
                mergeOutputFormat: 'mp4',
                output: `${outputBase}.%(ext)s`,
                socketTimeout: 60000,
            }));
        }

        const outputPath = findOutputFile(prefixBase);
        if (!outputPath) {
            throw new Error('The output file was not created.');
        }

        res.download(outputPath, filename + path.extname(outputPath), (err) => {
            if (err) console.error('Error during download:', err);
            cleanOutputFiles(prefixBase);
        });
    } catch (err) {
        console.error('Error during download:', err.stderr || err.message);
        cleanOutputFiles(prefixBase);
        const detail = String(err.stderr || err.message || '')
            .split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 200);
        sendError(res, 500, 'Error processing the video.' + (detail ? ` ${detail}` : ' Please try again.'));
    }
});

// SPA fallback — serve the React app for any unmatched GET route
if (distBuilt) {
    app.use((req, res, next) => {
        if (req.method !== 'GET' || req.path.startsWith('/info') || req.path.startsWith('/prepare') || req.path.startsWith('/download')) {
            return next();
        }
        res.sendFile(path.join(distDir, 'index.html'), (err) => {
            if (err) next(err);
        });
    });
}

// exclusive:true disables SO_REUSEADDR so a second instance cannot silently
// double-bind the port on Windows (which previously caused a confusing
// "Server running" followed by an immediate clean exit with code 0).
const server = http.createServer(app);
server.listen({ port: PORT, exclusive: true }, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use — another instance of this server is running.`);
        console.error('Stop that instance first, then start again (run only ONE server).');
    } else {
        console.error('Server error:', err.message);
    }
    process.exit(1);
});
