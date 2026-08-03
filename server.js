const http = require('http');
const express = require('express');
const ytdl = require('youtube-dl-exec'); // yt-dlp wrapper (used for metadata)
const { spawn } = require('child_process');
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

// downloads/ only holds transient, in-progress files. Clear leftovers from a
// previous run so we never serve stale copies and never leak disk space.
function clearDownloadsDir() {
    if (!fs.existsSync(downloadsDir)) return;
    for (const name of fs.readdirSync(downloadsDir)) {
        if (!name.startsWith('.')) fs.unlink(path.join(downloadsDir, name), () => {});
    }
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

// Fetch the full metadata + format list for a video.
async function fetchVideoInfo(videoUrl) {
    return await ytdl(videoUrl, baseFlags({ dumpSingleJson: true }));
}

// Build the raw argv passed to the yt-dlp binary.
function buildYtDlpArgv(videoUrl, job, outputBase, { newline = false } = {}) {
    const argv = [
        videoUrl,
        '-o', `${outputBase}.%(ext)s`,
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--socket-timeout', '60000',
        '--ffmpeg-location', FFMPEG_PATH,
    ];
    if (newline) argv.push('--newline'); // one progress line per update, on stdout
    if (job.args) argv.push(...job.args);
    if (job.mergeFormat) argv.push('--merge-output-format', job.mergeFormat);
    return argv;
}

// Turn a user's request (kind + format id) into a download job.
//   kind=video, format=<fid> : that specific video stream (+ best audio, merged)
//   kind=audio, format=<fid> : that specific audio stream, as-is
//   kind=mp3                 : best audio converted to MP3
//   legacy format=mp4/mp3    : best MP4 (merged) / best MP3
async function resolveJob(videoUrl, kind, format) {
    const info = await fetchVideoInfo(videoUrl);
    const id = info.id || extractVideoId(videoUrl) || 'video';
    const title = sanitizeFilename(info.title || id);
    const formats = info.formats || [];
    const fmt = formats.find((f) => f.format_id === format);
    const hasAudio = fmt && fmt.acodec && fmt.acodec !== 'none';

    const job = { id, title, info, args: null, mergeFormat: null };

    if (kind === 'mp3' || (!kind && format === 'mp3')) {
        // -x + --audio-format mp3 already converts; no --merge-output-format (mp3 is not a container).
        job.prefix = `${id}_mp3`;
        job.args = ['-x', '--audio-format', 'mp3', '--audio-quality', '5'];
        job.container = 'mp3';
    } else if (kind === 'audio' && fmt) {
        job.prefix = `${id}_a_${format}`;
        job.args = ['-f', format];
        job.container = fmt.ext; // m4a / webm / opus...
    } else if (kind === 'video' && fmt) {
        // Video stream chosen by the user → merge with the best compatible audio.
        job.prefix = `${id}_v_${format}`;
        job.args = hasAudio
            ? ['-f', format]
            : ['-f', `${format}+ba[ext=m4a]/${format}+ba`];
        job.mergeFormat = fmt.ext === 'webm' ? 'webm' : 'mp4';
        job.container = job.mergeFormat;
    } else {
        // Legacy / default: best quality MP4.
        job.prefix = `${id}_mp4`;
        job.args = ['-f', 'bv*[ext=mp4][vcodec!=vp9]+ba[ext=m4a]/b[ext=mp4]/b'];
        job.mergeFormat = 'mp4';
        job.container = 'mp4';
    }

    return job;
}

// Human short names for codecs.
function codecName(vcodec) {
    if (!vcodec || vcodec === 'none') return null;
    if (/av01/i.test(vcodec)) return 'AV1';
    if (/vp09|vp9/i.test(vcodec)) return 'VP9';
    if (/avc1/i.test(vcodec)) return 'H.264';
    if (/hev1|hvc1/i.test(vcodec)) return 'H.265';
    return vcodec;
}

// ---- Video metadata + ALL available formats ----
app.get('/formats', async (req, res) => {
    const videoUrl = req.query.url;

    if (!isYouTubeUrl(videoUrl)) {
        return sendError(res, 400, 'Invalid YouTube URL.');
    }

    try {
        const info = await fetchVideoInfo(videoUrl);

        const video = [];
        const audio = [];
        const combined = [];

        for (const f of info.formats || []) {
            const hasV = f.vcodec && f.vcodec !== 'none';
            const hasA = f.acodec && f.acodec !== 'none';
            if (!hasV && !hasA) continue; // storyboards, data streams, etc.

            const entry = {
                id: f.format_id,
                ext: f.ext,
                height: f.height || null,
                width: f.width || null,
                fps: f.fps || null,
                vcodec: hasV ? codecName(f.vcodec) : null,
                acodec: hasA ? (f.acodec === 'none' ? null : f.acodec) : null,
                abr: f.abr || null,
                size: f.filesize || f.filesize_approx || 0,
            };

            if (hasV && hasA) combined.push(entry);
            else if (hasV) video.push(entry);
            else if (hasA) audio.push(entry);
        }

        const byRes = (a, b) =>
            (b.height || 0) - (a.height || 0) || (b.fps || 0) - (a.fps || 0) || a.ext.localeCompare(b.ext);
        const byBitrate = (a, b) => (b.abr || 0) - (a.abr || 0) || a.ext.localeCompare(b.ext);

        video.sort(byRes);
        combined.sort(byRes);
        audio.sort(byBitrate);

        res.json({
            id: info.id || '',
            title: info.title || '',
            thumbnail: info.thumbnail || null,
            author: info.channel || info.uploader || 'Unknown',
            duration: Number(info.duration) || 0,
            views: Number(info.view_count) || 0,
            video,
            audio,
            combined,
        });
    } catch (err) {
        console.error('Error fetching formats:', err.message);
        sendError(res, 500, 'Could not fetch video information. The video may be unavailable or private.');
    }
});

// ---- Legacy single-file metadata endpoint ----
app.get('/info', async (req, res) => {
    const videoUrl = req.query.url;
    if (!isYouTubeUrl(videoUrl)) {
        return sendError(res, 400, 'Invalid YouTube URL.');
    }
    try {
        const info = await fetchVideoInfo(videoUrl);
        res.json({
            id: info.id || '',
            title: info.title || '',
            thumbnail: info.thumbnail || null,
            author: info.channel || info.uploader || 'Unknown',
            duration: Number(info.duration) || 0,
            views: Number(info.view_count) || 0,
        });
    } catch (err) {
        console.error('Error fetching video info:', err.message);
        sendError(res, 500, 'Could not fetch video information. The video may be unavailable or private.');
    }
});

// Run one yt-dlp attempt. Returns { code, stderrTail }.
// `onStdout` (optional) receives each stdout chunk so callers can stream progress.
function runYtDlpOnce(argv, onStdout) {
    return new Promise((resolve) => {
        const child = spawn(YTDLP_PATH, argv, { windowsHide: true });
        let stderrTail = '';
        if (onStdout) child.stdout.setEncoding('utf8');
        if (onStdout) child.stdout.on('data', onStdout);
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (d) => {
            stderrTail = (stderrTail + d).slice(-2000);
        });
        child.on('error', (err) => resolve({ code: 1, stderrTail: err.message, child }));
        child.on('close', (code) => resolve({ code, stderrTail, child }));
    });
}

// ---- Prepare: download the file, streaming live progress as NDJSON ----
// Emits lines like  {"type":"progress","phase":"download","pct":42.3}
//                    {"type":"progress","phase":"merge"}
//                    {"type":"done","name":"...","size":123}
//                    {"type":"error","message":"..."}
app.get('/prepare', async (req, res) => {
    const videoUrl = req.query.url;
    const kind = req.query.kind || 'video';
    const format = req.query.format || 'mp4';

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

    try {
        const job = await resolveJob(videoUrl, kind, format);
        const outputBase = path.join(downloadsDir, job.prefix);

        // Already downloaded earlier? Hand it over instantly.
        const existing = findOutputFile(job.prefix);
        if (existing) {
            emit({ type: 'done', name: job.title + path.extname(existing), size: fs.statSync(existing).size });
            return res.end();
        }

        console.log(`Preparing ${kind} (${format}) for ${job.id}...`);
        const argv = buildYtDlpArgv(videoUrl, job, outputBase, { newline: true });

        let current = null;
        let finished = false;

        const onStdout = (chunk) => {
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
        };

        // Client went away — stop the download to avoid orphan work.
        res.on('close', () => {
            if (!finished && current) current.kill();
        });

        // Attempt (retry once — YouTube occasionally drops the first request).
        let result = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            if (attempt > 1) {
                console.log('Retrying download attempt...');
                cleanOutputFiles(job.prefix);
            }
            result = await runYtDlpOnce(argv, onStdout);
            if (result.code === 0 || attempt === 2) break;
        }

        finished = true;

        if (result.code === 0) {
            const out = findOutputFile(job.prefix);
            if (!out) {
                emit({ type: 'error', message: 'Output file was not created.' });
                return res.end();
            }
            emit({ type: 'done', name: job.title + path.extname(out), size: fs.statSync(out).size });
            return res.end();
        }
        cleanOutputFiles(job.prefix);
        const detail = result.stderrTail.split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 300);
        emit({ type: 'error', message: 'Download failed.' + (detail ? ` ${detail}` : '') });
        res.end();
    } catch (err) {
        console.error('Error in /prepare:', err.message);
        emit({ type: 'error', message: err.message || 'Download failed.' });
        res.end();
    }
});

// ---- Download: serve the prepared file (or prepare it on the fly) ----
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const kind = req.query.kind || 'video';
    const format = req.query.format || 'mp4';

    if (!isYouTubeUrl(videoUrl)) {
        return sendError(res, 400, 'Invalid YouTube URL.');
    }

    ensureDirs();

    try {
        const job = await resolveJob(videoUrl, kind, format);
        const outputBase = path.join(downloadsDir, job.prefix);

        // Already prepared? Serve it straight away (the common case after /prepare).
        const existing = findOutputFile(job.prefix);
        if (existing) {
            return res.download(existing, job.title + path.extname(existing), (err) => {
                if (err) console.error('Error during download:', err);
                cleanOutputFiles(job.prefix);
            });
        }

        // Fallback for direct API calls: download without streaming progress.
        console.log(`Downloading ${kind} (${format}) for ${job.id}...`);
        const argv = buildYtDlpArgv(videoUrl, job, outputBase);

        let result = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            if (attempt > 1) {
                console.log('Retrying download attempt...');
                cleanOutputFiles(job.prefix);
            }
            result = await runYtDlpOnce(argv);
            if (result.code === 0 || attempt === 2) break;
        }

        if (result.code !== 0) {
            cleanOutputFiles(job.prefix);
            const detail = result.stderrTail.split('\n').filter(Boolean).slice(-2).join(' ').slice(0, 200);
            return sendError(res, 500, 'Error processing the video.' + (detail ? ` ${detail}` : ' Please try again.'));
        }

        const outputPath = findOutputFile(job.prefix);
        if (!outputPath) {
            cleanOutputFiles(job.prefix);
            return sendError(res, 500, 'The output file was not created.');
        }

        res.download(outputPath, job.title + path.extname(outputPath), (err) => {
            if (err) console.error('Error during download:', err);
            cleanOutputFiles(job.prefix);
        });
    } catch (err) {
        console.error('Error during download:', err.stderr || err.message);
        sendError(res, 500, 'Error processing the video. Please try again.');
    }
});

// SPA fallback — serve the React app for any unmatched GET route
if (distBuilt) {
    app.use((req, res, next) => {
        if (req.method !== 'GET' || ['/info', '/formats', '/prepare', '/download'].some((p) => req.path.startsWith(p))) {
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
    ensureDirs();
    clearDownloadsDir();
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
