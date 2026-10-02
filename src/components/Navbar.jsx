import { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, useRouter } from '../context/RouterContext';

export function Brand() {
    return <Link href="/" className="brand" aria-label="YTSaver home"><span className="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l12-8Z" fill="currentColor" /><path d="M3 5v14" stroke="currentColor" strokeWidth="2" /></svg></span><span>YT<span className="brand-light">Saver</span><span className="brand-dot">.</span></span></Link>;
}
const links = [['Video', '/youtube-to-mp4'], ['Audio', '/youtube-to-mp3'], ['How it works', '/#how'], ['About', '/about']];

export default function Navbar() {
    const { currentPath } = useRouter();
    const [open, setOpen] = useState(false);
    useEffect(() => { setOpen(false); }, [currentPath]);
    return <header className="site-header"><div className="header-inner"><Brand />
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <Link key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>{label}</Link>)}</nav>
        <Link href="/contact" className="header-contact">Get in touch <ArrowUpRight size={15} /></Link>
        <button className="mobile-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>{open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[...links, ['Contact', '/contact']].map(([label, href]) => <Link href={href} key={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={16} /></Link>)}</nav>}</header>;
}
