import { Plus, ArrowUpRight } from 'lucide-react';
import { Eyebrow } from './Motion';
import { Link } from '../context/RouterContext';

const questions = [
    ['Is YTSaver free?', 'Yes. You can use the downloader without paying or creating an account.'],
    ['Which formats can I download?', 'Choose from the video and audio formats returned for your link, including MP4, MP3, and M4A. Available quality depends on the original video.'],
    ['Does it work with Shorts?', 'Yes. Paste a regular YouTube link, a youtu.be short link, or a YouTube Shorts URL.'],
    ['Where does my download go?', 'Your browser saves it to your device, usually in the Downloads folder. On mobile, check the Files app or your browser’s download manager.'],
    ['Why might a video be unavailable?', 'Private, removed, age-restricted, or region-restricted videos may be unavailable. Network issues or upstream changes can also interrupt a download. Try another public video or try again later.'],
    ['Can I download any video?', 'Only download videos you own or have permission to save. Respect the creator’s rights and the terms that apply to the content.'],
];
export default function Faq() {
    return <section className="faq-section container" id="faq"><div className="faq-intro"><Eyebrow>A FEW GOOD ANSWERS</Eyebrow><h2>Good to know.</h2><p>Everything else?<br />We’re an email away.</p><Link href="/contact" className="inline-link">Talk to us <ArrowUpRight size={16} /></Link></div><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={18} /></summary><p>{answer}</p></details>)}</div></section>;
}
