import { ArrowDown, Film, Music, Check } from 'lucide-react';
import Downloader from './Downloader';
import { AmbientThreads, Eyebrow, RevealText } from './Motion';
import { Link } from '../context/RouterContext';

const content = {
    all: { label: 'YOUR VIDEOS. YOUR WAY.', title: 'Worth watching.', accent: 'Worth keeping.', description: 'Take your favorite videos offline. Paste a YouTube link, pick a format, and make it yours.', note: 'VIDEO & AUDIO, WITHOUT THE EXTRA STEPS' },
    video: { label: 'YOUTUBE → MP4', title: 'Every frame.', accent: 'Yours to keep.', description: 'Save YouTube videos as MP4. Choose from the available resolutions and take the whole picture with you.', note: 'THE BIG PICTURE. THE SMALL DETAILS.' },
    audio: { label: 'YOUTUBE → AUDIO', title: 'Less screen.', accent: 'More sound.', description: 'Keep the part you want to hear. Extract audio from YouTube and choose the format that fits your device.', note: 'YOUR NEXT LISTEN STARTS HERE' },
};

export default function Hero({ mode = 'all' }) {
    const copy = content[mode];
    return <section className={`hero ${mode !== 'all' ? 'converter-hero' : ''}`}>
        <AmbientThreads />
        <div className="hero-inner">
            <Eyebrow>{copy.label}</Eyebrow>
            <h1 className="hero-title" aria-label={`${copy.title} ${copy.accent}`}><RevealText text={copy.title} className="hero-title-line" /><span className="hero-accent"><RevealText text={copy.accent} className="hero-title-line" /></span></h1>
            <p className="hero-description">{copy.description}</p>
            <div className="download-workspace" id="downloader">
                <div className="workspace-heading"><span className="mono">01 / THE DOWNLOADER</span><span className="workspace-caption">One link. All your options.</span></div>
                <div className="mode-links" aria-label="Converter mode">
                    <Link href="/" className={mode === 'all' ? 'selected' : ''} aria-current={mode === 'all' ? 'page' : undefined}>All formats</Link>
                    <Link href="/youtube-to-mp4" className={mode === 'video' ? 'selected' : ''} aria-current={mode === 'video' ? 'page' : undefined}><Film size={14} /> Video / MP4</Link>
                    <Link href="/youtube-to-mp3" className={mode === 'audio' ? 'selected' : ''} aria-current={mode === 'audio' ? 'page' : undefined}><Music size={14} /> Audio / MP3</Link>
                </div>
                <Downloader key={mode} initialTab={mode === 'audio' ? 'audio' : 'video'} />
            </div>
            <div className="hero-assurances">{['Free to use', 'No account needed', 'Straight to your device'].map(text => <span key={text}><Check size={13} />{text}</span>)}</div>
        </div>
        <div className="hero-bottom container"><span className="mono">{copy.note}</span><Link href="/#how" className="scroll-link">A little further down <ArrowDown size={14} /></Link></div>
    </section>;
}
