import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowRight, Clipboard, Download, Film, Link2, Loader2, Music, RotateCcw, X } from 'lucide-react';
import Magnet from './reactbits/Magnet';
import { isYouTubeUrl, formatDuration, formatViews } from '../lib/utils';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

export default function Downloader({ initialTab = 'video' }) {
    const inputRef = useRef(null);
    const requestRef = useRef(null);
    const downloadTimer = useRef(null);
    const reducedMotion = useReducedMotion();
    const [url, setUrl] = useState('');
    const [resolvedUrl, setResolvedUrl] = useState('');
    const [parsing, setParsing] = useState(false);
    const [video, setVideo] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(initialTab);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => () => { requestRef.current?.abort(); clearTimeout(downloadTimer.current); }, []);

    function changeUrl(value) {
        requestRef.current?.abort();
        requestRef.current = null;
        clearTimeout(downloadTimer.current);
        setDownloadingId(null);
        setUrl(value);
        setVideo(null);
        setParsing(false);
        setError('');
    }

    async function fetchVideo(targetUrl = url) {
        const value = targetUrl.trim();
        if (!value || !isYouTubeUrl(value)) {
            setError(value ? 'Enter a valid YouTube video or Shorts link.' : 'Paste a YouTube link to get started.');
            inputRef.current?.focus();
            return;
        }
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setParsing(true);
        setVideo(null);
        setError('');
        try {
            const response = await fetch(`${API}/formats?url=${encodeURIComponent(value)}`, { signal: controller.signal });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not load this video. Try another link.');
            if (requestRef.current !== controller) return;
            setVideo(data);
            setResolvedUrl(value);
            setActiveTab(initialTab);
        } catch (err) {
            if (err.name !== 'AbortError' && requestRef.current === controller) {
                setError(err.message === 'Failed to fetch' ? 'The download service is unavailable. Please try again shortly.' : err.message);
            }
        } finally {
            if (requestRef.current === controller) setParsing(false);
        }
    }

    async function pasteLink() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) { changeUrl(text); inputRef.current?.focus(); }
        } catch { setError('Paste with Ctrl+V, ⌘V, or your device’s paste menu.'); }
    }

    function download(format) {
        setDownloadingId(`${activeTab}-${format.id}`);
        const params = new URLSearchParams({ url: resolvedUrl, kind: activeTab, format: format.id });
        const link = document.createElement('a');
        link.href = `${API}/download?${params}`;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.info('Download requested. Check your browser’s downloads for progress.');
        clearTimeout(downloadTimer.current);
        downloadTimer.current = setTimeout(() => setDownloadingId(null), 4000);
    }

    const formats = video?.[activeTab] || [];
    return <div className="downloader">
        <form onSubmit={event => { event.preventDefault(); fetchVideo(); }} className="url-form">
            <div className={`url-field ${error ? 'url-field-error' : ''}`}>
                <Link2 size={19} aria-hidden="true" />
                <input ref={inputRef} type="text" inputMode="url" autoComplete="off" aria-label="YouTube video URL" aria-invalid={Boolean(error)} aria-describedby={error ? 'url-error' : 'url-help'} placeholder="Paste your YouTube link here" value={url} onChange={event => changeUrl(event.target.value)} />
                {url ? <button type="button" onClick={() => { changeUrl(''); inputRef.current?.focus(); }} aria-label="Clear link" className="paste-button"><X size={16} /></button> : <button type="button" onClick={pasteLink} className="paste-button"><Clipboard size={14} /><span>Paste</span></button>}
            </div>
            <Magnet padding={8} magnetStrength={12} disabled={reducedMotion || parsing} wrapperClassName="download-magnet"><button className="primary-button" disabled={parsing} type="submit">{parsing ? <><Loader2 size={17} className="spin" /> Finding formats</> : <>Get video <ArrowRight size={18} /></>}</button></Magnet>
        </form>
        {error && <p className="inline-error" id="url-error" role="alert">{error}</p>}
        <div className="input-helper" id="url-help"><span>YouTube videos, Shorts & short links</span><span>MP4 · MP3 · M4A</span></div>
        {parsing && <div className="loading-result" role="status"><div className="skeleton-thumbnail" /><div><span className="skeleton-line" /><span className="skeleton-line short" /><p>Looking up available formats…</p></div></div>}
        {video && <section className="video-result" aria-label="Available downloads" aria-live="polite">
            <div className="video-info">
                {video.thumbnail ? <img src={video.thumbnail} alt={`Thumbnail for ${video.title}`} /> : <div className="thumbnail-fallback"><Film /></div>}
                <div className="video-meta"><span className="mono">READY WHEN YOU ARE</span><h2>{video.title}</h2><p>{video.author}{video.duration > 0 && ` · ${formatDuration(video.duration)}`}{video.views > 0 && ` · ${formatViews(video.views)} views`}</p></div>
                <button type="button" className="text-button" onClick={() => { changeUrl(''); inputRef.current?.focus(); }}><RotateCcw size={14} /> New link</button>
            </div>
            <div className="format-switch" role="group" aria-label="Download format">{[['video', Film, 'Video'], ['audio', Music, 'Audio']].map(([value, Icon, label]) => <button key={value} type="button" aria-pressed={activeTab === value} className={activeTab === value ? 'active' : ''} onClick={() => setActiveTab(value)}><Icon size={15} />{label}<span>{video[value]?.length || 0}</span></button>)}</div>
            <div className="format-list">{formats.length ? formats.map(format => <div className="format-row" key={format.id}><span className="quality-label">{format.badge || format.resolution || format.ext?.toUpperCase()}</span><div className="format-detail"><strong>{format.label}</strong><small>{format.ext?.toUpperCase()}{format.note && ` · ${format.note}`}</small></div>{format.recommended && <span className="recommended">Recommended</span>}<button className="format-download" type="button" disabled={Boolean(downloadingId)} onClick={() => download(format)}>{downloadingId === `${activeTab}-${format.id}` ? <Loader2 size={16} className="spin" /> : <Download size={16} />}<span>{downloadingId === `${activeTab}-${format.id}` ? 'Requested' : 'Download'}</span></button></div>) : <p className="empty-formats">No {activeTab} formats are available for this video. Try the other format or another link.</p>}</div>
            <p className="download-disclaimer">Only download content you own or have permission to save.</p>
        </section>}
    </div>;
}
