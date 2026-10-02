import { ArrowUpRight } from 'lucide-react';
import { Link } from '../context/RouterContext';
import { Brand } from './Navbar';

export default function Footer() {
    return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Brand /><p>A little less online.<br />A little more yours.</p></div><nav aria-label="Footer navigation"><Link href="/youtube-to-mp4">Video converter</Link><Link href="/youtube-to-mp3">Audio converter</Link><Link href="/about">About YTSaver</Link><Link href="/contact">Contact <ArrowUpRight size={13} /></Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} YTSaver</span><nav aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/dmca">Copyright</Link></nav><span className="footer-signoff">Made for your offline moments <span>↗</span></span></div><p className="footer-disclaimer">YTSaver is an independent tool, unaffiliated with YouTube or Google. Download only content you own or have permission to save.</p></div></footer>;
}
