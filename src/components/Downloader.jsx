import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    CheckCircle2,
    Clipboard,
    Download,
    Eye,
    Film,
    HardDriveDownload,
    Link2,
    Loader2,
    Music,
    RotateCcw,
    Search,
    Sparkles,
    X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { isYouTubeUrl, formatDuration, formatViews } from '../lib/utils';
import { SpotlightCard, Magnet, ShinyText } from './reactbits';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export default function Downloader() {
    const inputRef = useRef(null);
    const [url, setUrl] = useState('');
    const [parsing, setParsing] = useState(false);
    const [video, setVideo] = useState(null);
    const [activeTab, setActiveTab] = useState('video'); // 'video' | 'audio'
    const [downloadingId, setDownloadingId] = useState(null);
    const [downloadStatus, setDownloadStatus] = useState(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    async function handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setUrl(text);
                fetchVideo(text);
            }
        } catch {
            toast.info('Please paste the YouTube link using Ctrl+V or right-click.');
        }
    }

    function handleClear() {
        setUrl('');
        setVideo(null);
        setDownloadStatus(null);
        inputRef.current?.focus();
    }

    async function fetchVideo(targetUrl) {
        const val = (targetUrl || url).trim();
        if (!val) {
            toast.error('Please paste a YouTube link first.');
            inputRef.current?.focus();
            return;
        }

        if (!isYouTubeUrl(val)) {
            toast.error('Please enter a valid YouTube video link.');
            return;
        }

        setParsing(true);
        setDownloadStatus(null);

        try {
            const res = await fetch(`${API}/formats?url=${encodeURIComponent(val)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch video details.');
            }

            setVideo(data);
            setActiveTab('video');
            toast.success('All available qualities loaded! Choose an option below.');
        } catch (err) {
            setVideo(null);
            toast.error(err.message || 'Could not fetch video. Please check the link.');
        } finally {
            setParsing(false);
        }
    }

    function triggerDirectDownload(kind, formatId, label) {
        setDownloadingId(`${kind}-${formatId}`);
        setDownloadStatus(`Starting download for ${label}...`);

        const params = new URLSearchParams({
            url: url.trim(),
            kind: kind,
            format: formatId,
        });

        // Trigger native browser download stream
        const downloadUrl = `${API}/download?${params.toString()}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success(`Download started for ${label}! Check your browser downloads.`);

        setTimeout(() => {
            setDownloadingId(null);
            setDownloadStatus(null);
        }, 4000);
    }

    // Helper for quality badge colors
    const getBadgeStyle = (badge) => {
        const b = String(badge || '').toUpperCase();
        if (b.includes('4K')) return 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
        if (b.includes('1440') || b.includes('2K')) return 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]';
        if (b.includes('1080')) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
        if (b.includes('720')) return 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.25)]';
        if (b.includes('320')) return 'bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]';
        if (b.includes('256')) return 'bg-pink-500/15 text-pink-300 border-pink-500/40';
        if (b.includes('M4A') || b.includes('AAC')) return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
        if (b.includes('LOSSLESS') || b.includes('WAV')) return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
        return 'bg-white/10 text-white/80 border-white/15';
    };

    return (
        <SpotlightCard
            className="w-full text-left shadow-2xl shadow-black/80 bg-[#0c0e17]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl"
            spotlightColor="rgba(255, 26, 67, 0.2)"
        >
            <div className="space-y-6 p-6 sm:p-8">
                {/* ── Search / URL Input ─────────────────────────────────── */}
                <div className="space-y-3.5">
                    <div className="relative flex flex-col gap-2.5 sm:flex-row">
                        <div className="relative flex-1">
                            <Link2 className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                type="url"
                                placeholder="Paste YouTube link here (e.g. https://www.youtube.com/watch?v=...)"
                                aria-label="YouTube video URL"
                                className="h-13 pl-11 pr-24 text-sm sm:text-base rounded-xl border-white/15 bg-black/60 shadow-inner focus-visible:ring-primary focus-visible:border-primary/60 text-white placeholder:text-zinc-500"
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    if (video) setVideo(null);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && fetchVideo()}
                            />
                            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                                {url ? (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        aria-label="Clear link"
                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
                                    >
                                        <X className="size-4" />
                                    </button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="xs"
                                        onClick={handlePaste}
                                        className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                    >
                                        <Clipboard className="size-3.5" />
                                        Paste
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* React Bits Magnetic CTA Button */}
                        <Magnet padding={35} magnetStrength={0.15}>
                            <Button
                                size="lg"
                                onClick={() => fetchVideo()}
                                disabled={parsing}
                                className="h-13 w-full sm:w-auto shrink-0 px-8 font-bold rounded-xl bg-gradient-to-r from-[#FF1A43] to-[#FF4D6D] hover:from-[#ff2b52] hover:to-[#ff607d] text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 border-0"
                            >
                                {parsing ? (
                                    <>
                                        <Loader2 className="size-4.5 animate-spin" />
                                        Analyzing…
                                    </>
                                ) : (
                                    <>
                                        <Search className="size-4.5" />
                                        Get Video
                                    </>
                                )}
                            </Button>
                        </Magnet>
                    </div>

                    {/* Clean Status & Sample Link Row (Zero Clutter) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-2">
                            <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
                            All qualities supported · 4K UHD, 1080p, 720p & MP3 (320kbps)
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                const sample = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                                setUrl(sample);
                                fetchVideo(sample);
                            }}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
                        >
                            Try sample video →
                        </button>
                    </div>
                </div>

                {/* ── Video Result Card ──────────────────────────────────── */}
                {video && (
                    <div className="space-y-6 pt-3 animate-in fade-in-50 duration-300">
                        {/* Video Info Header */}
                        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center">
                            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-white/10 sm:w-48 bg-black/70 shadow-md">
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <Film className="size-8" />
                                    </div>
                                )}
                                {video.duration > 0 && (
                                    <Badge className="absolute bottom-1.5 right-1.5 bg-black/85 px-1.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm shadow-sm border border-white/10">
                                        {formatDuration(video.duration)}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                                <h3 className="line-clamp-2 text-base font-bold leading-snug sm:text-lg text-foreground font-heading">
                                    {video.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-zinc-400">
                                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                                        <CheckCircle2 className="size-3.5 text-primary" />
                                        {video.author}
                                    </span>
                                    {video.views > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Eye className="size-3.5 text-zinc-500" />
                                            {formatViews(video.views)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                                className="self-start sm:self-center shrink-0 gap-1.5 text-xs rounded-lg border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300"
                            >
                                <RotateCcw className="size-3.5" />
                                New link
                            </Button>
                        </div>

                        {/* Format Switcher Tabs (Video vs Audio) */}
                        <div className="space-y-4">
                            <div className="flex rounded-xl border border-white/10 bg-black/50 p-1.5 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('video')}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                                        activeTab === 'video'
                                            ? 'bg-gradient-to-r from-[#FF1A43] to-[#FF4D6D] text-white shadow-lg shadow-primary/25'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    <Film className="size-4" />
                                    <span>Video (MP4)</span>
                                    {video.video?.length > 0 && (
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                                            activeTab === 'video' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                                        }`}>
                                            {video.video.length} Qualities
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('audio')}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                                        activeTab === 'audio'
                                            ? 'bg-gradient-to-r from-[#FF1A43] to-[#FF4D6D] text-white shadow-lg shadow-primary/25'
                                            : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    <Music className="size-4" />
                                    <span>Audio (MP3 / M4A)</span>
                                    {video.audio?.length > 0 && (
                                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                                            activeTab === 'audio' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                                        }`}>
                                            {video.audio.length} Formats
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Format Rows */}
                            <div className="space-y-2.5">
                                {activeTab === 'video' ? (
                                    <>
                                        {(video.video || []).map((fmt) => {
                                            const isThisDownloading =
                                                downloadingId === `video-${fmt.id}`;
                                            return (
                                                <div
                                                    key={fmt.id}
                                                    className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 transition-all hover:border-primary/40 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase border ${getBadgeStyle(fmt.badge || fmt.resolution)}`}>
                                                            {fmt.badge || fmt.resolution}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-foreground text-sm sm:text-base">
                                                                    {fmt.label}
                                                                </span>
                                                                {fmt.recommended && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold"
                                                                    >
                                                                        Recommended
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                                {fmt.ext.toUpperCase()} · {fmt.note}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Magnet padding={20} magnetStrength={0.12}>
                                                        <Button
                                                            onClick={() =>
                                                                triggerDirectDownload(
                                                                    'video',
                                                                    fmt.id,
                                                                    fmt.label
                                                                )
                                                            }
                                                            disabled={Boolean(downloadingId)}
                                                            className="w-full shrink-0 gap-2 sm:w-auto font-semibold rounded-xl bg-white/10 hover:bg-primary hover:text-white transition-all text-white border border-white/10 shadow-sm"
                                                        >
                                                            {isThisDownloading ? (
                                                                <>
                                                                    <Loader2 className="size-4 animate-spin text-primary" />
                                                                    Downloading…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Download className="size-4" />
                                                                    Download MP4
                                                                </>
                                                            )}
                                                        </Button>
                                                    </Magnet>
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <>
                                        {(video.audio || []).map((fmt) => {
                                            const isThisDownloading =
                                                downloadingId === `audio-${fmt.id}`;
                                            return (
                                                <div
                                                    key={fmt.id}
                                                    className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 transition-all hover:border-primary/40 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase border ${getBadgeStyle(fmt.badge || fmt.ext)}`}>
                                                            {fmt.badge || fmt.ext.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-foreground text-sm sm:text-base">
                                                                    {fmt.label}
                                                                </span>
                                                                {fmt.recommended && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold"
                                                                    >
                                                                        Best Audio
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                                {fmt.ext.toUpperCase()} · {fmt.note}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Magnet padding={20} magnetStrength={0.12}>
                                                        <Button
                                                            onClick={() =>
                                                                triggerDirectDownload(
                                                                    'audio',
                                                                    fmt.id,
                                                                    fmt.label
                                                                )
                                                            }
                                                            disabled={Boolean(downloadingId)}
                                                            className="w-full shrink-0 gap-2 sm:w-auto font-semibold rounded-xl bg-white/10 hover:bg-primary hover:text-white transition-all text-white border border-white/10 shadow-sm"
                                                        >
                                                            {isThisDownloading ? (
                                                                <>
                                                                    <Loader2 className="size-4 animate-spin text-primary" />
                                                                    Downloading…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Download className="size-4" />
                                                                    Download Audio
                                                                </>
                                                            )}
                                                        </Button>
                                                    </Magnet>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Active Download Status */}
                        {downloadStatus && (
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/25 p-3.5 text-xs text-primary font-semibold animate-pulse">
                                <HardDriveDownload className="size-4" />
                                <span>{downloadStatus}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SpotlightCard>
    );
}
