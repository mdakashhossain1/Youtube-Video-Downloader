import { IconGithub, IconPlay } from '../lib/icons';

export default function Navbar() {
    return (
        <header className="nav">
            <a className="brand" href="#">
                <span className="brand-logo">
                    <IconPlay />
                </span>
                YTSaver
            </a>
            <nav className="nav-links" aria-label="Primary">
                <a href="#how">How it works</a>
                <a href="#features">Features</a>
                <a href="#faq">FAQ</a>
            </nav>
            <div className="nav-right">
                <a className="github-btn" href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <IconGithub />
                    GitHub
                </a>
            </div>
        </header>
    );
}
