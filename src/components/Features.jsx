import { ArrowUpRight, AudioLines, Check, MonitorPlay } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';
import { Link } from '../context/RouterContext';
import { Eyebrow } from './Motion';

const heights = [16,26,20,42,30,62,48,76,56,92,70,106,84,120,95,70,110,85,65,98,72,52,86,60,40,68,46,28,48,30,20,36,16];
export function Waveform() {
    return <div className="waveform" aria-hidden="true">{heights.map((height, index) => <span key={index} style={{ '--bar-height': `${height}px`, '--bar-delay': `${index * 30}ms` }} />)}</div>;
}
export default function Features() {
    return <section className="features container" id="features"><div className="section-heading"><div><Eyebrow>CHOOSE WHAT YOU KEEP</Eyebrow><h2>One link.<br /><span className="muted-heading">Two ways to enjoy it.</span></h2></div><p>The whole video or just the soundtrack.<br />Your format. Your device. Your call.</p></div><div className="format-features">
        <SpotlightCard className="format-feature" spotlightColor="rgba(160, 110, 240, 0.16)"><div className="feature-visual video-visual"><div className="visual-topline"><MonitorPlay size={17} /><span>THE FULL PICTURE</span></div><div className="resolution-art"><span>4K<span className="resolution-dot">.</span></span><span className="resolution-caption">EVERY LITTLE DETAIL.</span></div><div className="visual-bottomline"><span>2160P / 1080P / 720P</span><span>MP4</span></div></div><div className="feature-copy"><div><h3>Keep the picture.</h3><p>Tutorials, films, moments worth replaying. Save the available video quality that works for you.</p></div><Link href="/youtube-to-mp4" className="round-link" aria-label="Open MP4 converter"><ArrowUpRight /></Link></div></SpotlightCard>
        <SpotlightCard className="format-feature" spotlightColor="rgba(160, 110, 240, 0.16)"><div className="feature-visual audio-visual"><div className="visual-topline"><AudioLines size={17} /><span>NOTHING BUT THE SOUND</span></div><Waveform /><div className="visual-bottomline"><span>TAKE IT WITH YOU</span><span>MP3 / M4A</span></div></div><div className="feature-copy"><div><h3>Keep the sound.</h3><p>A podcast for the commute. A talk for later. Get the audio, without carrying the video.</p></div><Link href="/youtube-to-mp3" className="round-link" aria-label="Open audio converter"><ArrowUpRight /></Link></div></SpotlightCard>
    </div><div className="feature-footnotes">{['No software to install','Works on mobile & desktop','No media stored on our server'].map(text => <span key={text}><Check size={15} />{text}</span>)}</div></section>;
}
