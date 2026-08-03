import { IconPlay } from '../lib/icons';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="brand">
                <span className="brand-logo footer-logo">
                    <IconPlay />
                </span>
                YTSaver
            </div>
            <p className="disclaimer">
                YTSaver is an independent tool and is not affiliated with, endorsed by, or connected to YouTube
                or Google. Download only content you own or have permission to download.
            </p>
            <p>© 2026 YTSaver · Made for fast, simple video downloads</p>
            <div className="foot-links">
                <a href="#how">How it works</a>
                <a href="#features">Features</a>
                <a href="#faq">FAQ</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
            </div>
        </footer>
    );
}
