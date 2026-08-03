import { useEffect, useRef, useState } from 'react';
import { useToast } from '../lib/toast';
import { isYouTubeUrl, formatDuration, formatViews } from '../lib/utils';
import { IconDownload, IconEye, IconFilm, IconInfo, IconLink, IconMusic, IconPlay, IconSearch } from '../lib/icons';

// In dev, the Vite page (5173) talks to the API (3000) directly, so big file
// transfers never pass through the Vite proxy. In production the built app is
// served by the API itself and relative URLs work.
const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

function Thumb({ src }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return (
            <div className="thumb-fallback">
                <IconPlay />
            </div>
        );
    }
    return <img src={src} alt="Video thumbnail" onError={() => setFailed(true)} />;
}

export default function Downloader() {
    const toast = useToast();
    const inputRef = useRef(null);

    const [url, setUrl] = useState('');
    const [parsing, setParsing] = useState(false);
    const [video, setVideo] = useState(null);
    const [format, setFormat] = useState('mp4');
    const [busy, setBusy] = useState(false);
    // progress: null (hidden) | { label, fraction, indeterminate }
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    async function parseVideo() {
        const value = url.trim();
        if (!value) {
            toast('Please paste a YouTube link first.', 'error');
            inputRef.current?.focus();
            return;
        }
        if (!isYouTubeUrl(value)) {
            toast('That doesn’t look like a valid YouTube link.', 'error');
            return;
        }

        setParsing(true);
        try {
            const res = await fetch(API + '/info?url=' + encodeURIComponent(value));
            let data = {};
            try {
                data = await res.json();
            } catch {
                /* non-JSON response */
            }
            if (!res.ok) {
                throw new Error(data.error || 'Could not fetch the video. Is the link valid?');
            }
            setVideo(data);
            setProgress(null);
        } catch (err) {
            setVideo(null);
            toast(err.message || 'Something went wrong. Please try again.', 'error');
        } finally {
            setParsing(false);
        }
    }

    // Native browser download of the file the server already prepared.
    function triggerDownload() {
        const a = document.createElement('a');
        a.href = API + '/download?url=' + encodeURIComponent(url.trim()) + '&format=' + format;
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function startDownload() {
        if (!video) return;

        setBusy(true);
        setProgress({ label: 'Preparing download…', indeterminate: true });

        try {
            // Stream live progress from the server while it downloads + merges.
            const res = await fetch(
                API + '/prepare?url=' + encodeURIComponent(url.trim()) + '&format=' + format
            );

            if (!res.ok) {
                let message = 'Download failed. Please try again.';
                try {
                    const data = await res.json();
                    if (data && data.error) message = data.error;
                } catch {
                    /* ignore */
                }
                throw new Error(message);
            }
            if (!res.body) throw new Error('Streaming is not supported in this browser.');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let maxPct = 0;

            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let nl;
                while ((nl = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.slice(0, nl).trim();
                    buffer = buffer.slice(nl + 1);
                    if (!line) continue;

                    let msg;
                    try {
                        msg = JSON.parse(line);
                    } catch {
                        continue;
                    }

                    if (msg.type === 'progress') {
                        if (typeof msg.pct === 'number') maxPct = Math.max(maxPct, msg.pct);
                        if (msg.phase === 'merge') {
                            setProgress({ label: 'Finalizing video…', fraction: 0.93 });
                        } else if (maxPct > 0) {
                            setProgress({ label: 'Downloading…', fraction: (maxPct / 100) * 0.9 });
                        } else {
                            setProgress({ label: 'Downloading…', indeterminate: true });
                        }
                    } else if (msg.type === 'done') {
                        // File is ready — let the browser save it natively.
                        setProgress({ label: 'Saving file…', indeterminate: true });
                        triggerDownload();
                        toast('Download started! Check your browser downloads.', 'success');
                        setTimeout(() => setProgress(null), 3000);
                    } else if (msg.type === 'error') {
                        throw new Error(msg.message || 'Download failed.');
                    }
                }
            }
        } catch (err) {
            setProgress(null);
            const message =
                err.name === 'TypeError' || /fetch/i.test(err.message)
                    ? 'Could not reach the server. Is it running? (npm run dev)'
                    : err.message || 'Something went wrong while downloading.';
            toast(message, 'error');
        } finally {
            setBusy(false);
        }
    }

    function handleUrlChange(e) {
        const value = e.target.value;
        if (video && value !== url) setVideo(null); // clear stale preview on edit
        setUrl(value);
    }

    const pct = progress && !progress.indeterminate ? Math.round(progress.fraction * 100) : 0;
    const avatar = ((video?.author || '?')[0] || '?').toUpperCase();

    return (
        <div className="downloader-card">
            <div className="input-row">
                <div className="input-wrap">
                    <IconLink />
                    <input
                        ref={inputRef}
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Paste YouTube video link here…"
                        aria-label="YouTube video URL"
                        value={url}
                        onChange={handleUrlChange}
                        onKeyDown={(e) => e.key === 'Enter' && parseVideo()}
                    />
                </div>
                <button className="btn btn-primary btn-parse" onClick={parseVideo} disabled={parsing}>
                    {parsing ? <span className="spinner" aria-hidden="true" /> : <IconSearch />}
                    <span>{parsing ? 'Analyzing…' : 'Get Video'}</span>
                </button>
            </div>
            <div className="input-hints">
                <IconInfo />
                Works with youtube.com, youtu.be, Shorts &amp; live streams
            </div>

            {video && (
                <div className="preview">
                    <div className="preview-thumb">
                        <Thumb src={video.thumbnail} />
                        {video.duration > 0 && (
                            <span className="duration-badge">{formatDuration(video.duration)}</span>
                        )}
                    </div>
                    <div className="preview-body">
                        <h3 className="title">{video.title || 'Untitled video'}</h3>
                        <div className="meta">
                            <span className="author">
                                <span className="avatar">{avatar}</span>
                                <span>{video.author || 'Unknown channel'}</span>
                            </span>
                            <span className="stat">
                                <IconEye />
                                {formatViews(video.views)}
                            </span>
                        </div>
                        <div className="format-row">
                            <div className="seg" role="tablist" aria-label="Output format">
                                <button
                                    className={`seg-btn${format === 'mp4' ? ' active' : ''}`}
                                    role="tab"
                                    aria-selected={format === 'mp4'}
                                    onClick={() => setFormat('mp4')}
                                    disabled={busy}
                                >
                                    <IconFilm />
                                    MP4 · Video
                                </button>
                                <button
                                    className={`seg-btn${format === 'mp3' ? ' active' : ''}`}
                                    role="tab"
                                    aria-selected={format === 'mp3'}
                                    onClick={() => setFormat('mp3')}
                                    disabled={busy}
                                >
                                    <IconMusic />
                                    MP3 · Audio
                                </button>
                            </div>
                            <p className="format-hint">
                                {format === 'mp4'
                                    ? 'Full-quality video with merged audio'
                                    : 'Audio only · high-quality MP3'}
                            </p>
                        </div>
                        <button className="btn btn-primary btn-big" onClick={startDownload} disabled={busy}>
                            <IconDownload />
                            <span>Download {format.toUpperCase()}</span>
                        </button>
                        <p className="dl-hint">
                            HD videos take a few minutes to prepare — watch the progress below; the file
                            saves automatically when it’s ready.
                        </p>
                        {progress && (
                            <div className="progress">
                                <div className="progress-top">
                                    <span>{progress.label}</span>
                                    <span className="pct">{progress.indeterminate ? '' : `${pct}%`}</span>
                                </div>
                                <div className={`bar${progress.indeterminate ? ' indet' : ''}`}>
                                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
