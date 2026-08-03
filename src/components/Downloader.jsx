import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    AudioLines,
    Clapperboard,
    Download,
    Eye,
    Info,
    Link2,
    Loader2,
    Music,
    Search,
    Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import {
    isYouTubeUrl,
    formatDuration,
    formatViews,
    formatBytes,
    audioCodecName,
} from '../lib/utils';

// In dev, the Vite page (5173) talks to the API (3000) directly, so big file
// transfers never pass through the Vite proxy. In production the built app is
// served by the API itself and relative URLs work.
const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

function videoLabel(f) {
    const codec = f.vcodec ? ` · ${f.vcodec}` : '';
    const size = formatBytes(f.size);
    return `${f.height || 'Auto'}p${f.fps ? ` · ${f.fps} fps` : ''}${codec} · ${(f.ext || '').toUpperCase()}${size ? ` · ≈ ${size}` : ''}`;
}

function audioLabel(f) {
    const bitrate = f.abr ? `${Math.round(f.abr)} kbps` : 'Audio';
    return `${bitrate} · ${audioCodecName(f.acodec) || ''} · ${(f.ext || '').toUpperCase()}`;
}

export default function Downloader() {
    const inputRef = useRef(null);
    const [url, setUrl] = useState('');
    const [parsing, setParsing] = useState(false);
    const [video, setVideo] = useState(null);
    // selection: { kind: 'video'|'audio'|'mp3', id: string|null }
    const [sel, setSel] = useState({ kind: 'video', id: null });
    const [busy, setBusy] = useState(false);
    // progress: null (hidden) | { label, fraction, indeterminate }
    const [progress, setProgress] = useState(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    async function parseVideo() {
        const value = url.trim();
        if (!value) {
            toast.error('Please paste a YouTube link first.');
            inputRef.current?.focus();
            return;
        }
        if (!isYouTubeUrl(value)) {
            toast.error('That doesn’t look like a valid YouTube link.');
            return;
        }

        setParsing(true);
        try {
            const res = await fetch(API + '/formats?url=' + encodeURIComponent(value));
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
            // Preselect the highest-quality video option.
            const best = (data.video && data.video[0]) || (data.combined && data.combined[0]);
            setSel(best ? { kind: 'video', id: best.id } : { kind: 'mp3', id: null });
        } catch (err) {
            setVideo(null);
            toast.error(err.message || 'Something went wrong. Please try again.');
        } finally {
            setParsing(false);
        }
    }

    function buildParams() {
        const params = new URLSearchParams({ url: url.trim() });
        if (sel.kind === 'mp3') {
            params.set('kind', 'mp3');
        } else {
            params.set('kind', sel.kind);
            params.set('format', sel.id || 'mp4');
        }
        return params;
    }

    // Native browser download of the file the server already prepared.
    function triggerDownload() {
        const a = document.createElement('a');
        a.href = API + '/download?' + buildParams().toString();
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
            const res = await fetch(API + '/prepare?' + buildParams().toString());

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
                            setProgress({ label: 'Finalizing file…', fraction: 0.93 });
                        } else if (maxPct > 0) {
                            setProgress({ label: 'Downloading…', fraction: (maxPct / 100) * 0.9 });
                        } else {
                            setProgress({ label: 'Downloading…', indeterminate: true });
                        }
                    } else if (msg.type === 'done') {
                        // File is ready — let the browser save it natively.
                        setProgress({ label: 'Saving file…', indeterminate: true });
                        triggerDownload();
                        toast.success('Download started! Check your browser downloads.');
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
            toast.error(message);
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

    const videoOptions = video
        ? [...(video.video || []), ...(video.combined || [])].sort(
              (a, b) => (b.height || 0) - (a.height || 0) || (b.fps || 0) - (a.fps || 0)
          )
        : [];
    const audioOptions = video?.audio || [];

    const selectedVideo = videoOptions.find((f) => sel.kind === 'video' && f.id === sel.id);
    const selectedAudio = audioOptions.find((f) => sel.kind === 'audio' && f.id === sel.id);

    let downloadLabel = 'Download';
    if (sel.kind === 'video' && selectedVideo) {
        downloadLabel = `Download ${selectedVideo.height || 'Video'}p${selectedVideo.fps ? ` · ${selectedVideo.fps} fps` : ''}`;
    } else if (sel.kind === 'audio' && selectedAudio) {
        downloadLabel = `Download ${Math.round(selectedAudio.abr || 0)} kbps · ${(selectedAudio.ext || '').toUpperCase()}`;
    } else if (sel.kind === 'mp3') {
        downloadLabel = 'Download MP3 · 192 kbps';
    }

    return (
        <Card className="w-full text-left shadow-2xl shadow-black/40">
            <CardContent className="space-y-5 p-6 sm:p-8">
                {/* URL + Get Video */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            type="url"
                            inputMode="url"
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="Paste YouTube video link here…"
                            aria-label="YouTube video URL"
                            className="pl-10"
                            value={url}
                            onChange={handleUrlChange}
                            onKeyDown={(e) => e.key === 'Enter' && parseVideo()}
                        />
                    </div>
                    <Button size="xl" onClick={parseVideo} disabled={parsing} className="shrink-0">
                        {parsing ? <Loader2 className="animate-spin" /> : <Search />}
                        {parsing ? 'Analyzing…' : 'Get Video'}
                    </Button>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Info className="size-3.5" />
                    Works with youtube.com, youtu.be, Shorts &amp; live streams
                </p>

                {video && (
                    <>
                        <Separator />

                        {/* Preview */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border sm:w-56">
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt="Video thumbnail"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                        <Clapperboard className="size-8" />
                                    </div>
                                )}
                                {video.duration > 0 && (
                                    <Badge className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 text-[11px] text-white">
                                        {formatDuration(video.duration)}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                                <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
                                    {video.title || 'Untitled video'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-2 font-medium text-foreground">
                                        <Avatar className="size-6">
                                            <AvatarFallback className="bg-primary text-[10px] font-bold text-primary-foreground">
                                                {avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        {video.author || 'Unknown channel'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="size-3.5" />
                                        {formatViews(video.views)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quality pickers */}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="items-center gap-2">
                                    <Clapperboard className="size-4 text-primary" />
                                    Video quality
                                </Label>
                                <Select
                                    value={sel.kind === 'video' ? sel.id : undefined}
                                    onValueChange={(v) => setSel({ kind: 'video', id: v })}
                                    disabled={busy}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a quality" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                        {videoOptions.map((f) => (
                                            <SelectItem key={f.id} value={f.id}>
                                                {videoLabel(f)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedVideo && (
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Sparkles className="size-3.5 text-primary" />
                                        {selectedVideo.vcodec || 'Video'} ·{' '}
                                        {(selectedVideo.ext || '').toUpperCase()}
                                        {selectedVideo.acodec
                                            ? ' · includes audio'
                                            : ' · merges with best audio'}
                                        {formatBytes(selectedVideo.size)
                                            ? ` · ≈ ${formatBytes(selectedVideo.size)}`
                                            : ''}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="items-center gap-2">
                                    <AudioLines className="size-4 text-primary" />
                                    Audio
                                </Label>
                                <Select
                                    value={sel.kind === 'mp3' ? 'mp3' : sel.kind === 'audio' ? sel.id : undefined}
                                    onValueChange={(v) =>
                                        v === 'mp3'
                                            ? setSel({ kind: 'mp3', id: null })
                                            : setSel({ kind: 'audio', id: v })
                                    }
                                    disabled={busy}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an audio option" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                        <SelectItem value="mp3">
                                            <Music className="size-3.5" /> 192 kbps · MP3 (converted)
                                        </SelectItem>
                                        {audioOptions.map((f) => (
                                            <SelectItem key={f.id} value={f.id}>
                                                {audioLabel(f)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {sel.kind === 'mp3'
                                        ? 'High-quality MP3 converted for any device'
                                        : sel.kind === 'audio'
                                          ? `Original stream${formatBytes(selectedAudio?.size) ? ` · ≈ ${formatBytes(selectedAudio.size)}` : ''}`
                                          : 'Pick MP3 for a converted file or an original stream'}
                                </p>
                            </div>
                        </div>

                        {/* Download */}
                        <Button size="xl" className="w-full" onClick={startDownload} disabled={busy}>
                            <Download />
                            {downloadLabel}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            HD videos take a few minutes to prepare — the file saves automatically when
                            it’s ready.
                        </p>

                        {progress && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{progress.label}</span>
                                    {!progress.indeterminate && (
                                        <span className="font-semibold text-foreground tabular-nums">
                                            {pct}%
                                        </span>
                                    )}
                                </div>
                                <Progress
                                    value={progress.indeterminate ? undefined : pct}
                                    className={progress.indeterminate ? 'animate-pulse' : ''}
                                />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
