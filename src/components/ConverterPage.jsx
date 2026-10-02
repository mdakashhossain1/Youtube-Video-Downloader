import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Faq from './Faq';
import { Link } from '../context/RouterContext';
import SpotlightCard from './reactbits/SpotlightCard';
import { Eyebrow } from './Motion';
import { Waveform } from './Features';

export default function ConverterPage({ mode }) {
    const audio = mode === 'audio';
    useEffect(() => { document.title = audio ? 'YouTube to MP3 & M4A — YTSaver' : 'YouTube to MP4 — YTSaver'; }, [audio]);
    return <><Hero mode={mode} /><section className="converter-details container"><div><Eyebrow>{audio ? 'SOUND THAT GOES WITH YOU' : 'ROOM FOR EVERY FRAME'}</Eyebrow><h2>{audio ? 'Your listening.' : 'Your viewing.'}<br /><span className="muted-heading">On your terms.</span></h2><p>{audio ? 'Turn a video into something you can take on a walk, a drive, or a flight. Choose from the audio formats available for your link.' : 'Make a little room for the videos you want to come back to. Choose a smaller file for your phone or a higher resolution for a bigger screen.'}</p><dl className="spec-list"><div><dt>{audio ? 'Audio formats' : 'Video format'}</dt><dd>{audio ? 'MP3 / M4A / available audio' : 'MP4'}</dd></div><div><dt>{audio ? 'Bitrate' : 'Resolution'}</dt><dd>{audio ? 'Based on available source audio' : 'Up to 4K when available'}</dd></div><div><dt>Works with</dt><dd>Desktop, tablet & mobile</dd></div></dl><Link href={audio ? '/youtube-to-mp4' : '/youtube-to-mp3'} className="inline-link">{audio ? 'Prefer the whole video?' : 'Just want the audio?'} <ArrowUpRight size={16} /></Link></div><SpotlightCard className={`converter-art ${audio ? 'audio-visual' : 'video-visual'}`} spotlightColor="rgba(160, 110, 240, 0.2)"><span className="mono">{audio ? 'A LITTLE MORE LISTENING.' : 'A LITTLE MORE REPLAY.'}</span>{audio ? <Waveform /> : <div className="resolution-art"><span>MP4<span className="resolution-dot">.</span></span></div>}<span className="mono">{audio ? 'PRESS PLAY. ANYWHERE.' : 'ALL THE MOMENTS THAT MATTER.'}</span></SpotlightCard></section><HowItWorks /><Faq /></>;
}
