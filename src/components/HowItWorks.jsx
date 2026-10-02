import { ArrowUpRight } from 'lucide-react';
import { Eyebrow } from './Motion';
import { Link } from '../context/RouterContext';

const steps = [
    ['01', 'Find something good.', 'Copy the link to a YouTube video or Short you have permission to download.'],
    ['02', 'Make it your format.', 'Paste the link above. Pick video or audio, then choose an available quality.'],
    ['03', 'Take it offline.', 'Hit download. Your browser saves the file straight to your device.'],
];
export default function HowItWorks() {
    return <section className="how-section container" id="how"><div className="how-intro"><Eyebrow>FROM LINK TO LIBRARY</Eyebrow><h2>Three steps.<br />Zero fuss.</h2><Link href="/#downloader" className="inline-link">Let’s get started <ArrowUpRight size={16} /></Link></div><ol className="steps">{steps.map(([number, title, description]) => <li key={number}><span className="step-number mono">{number}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={20} className="step-arrow" /></li>)}</ol></section>;
}
