import Downloader from './Downloader';

export default function Hero() {
    return (
        <section className="hero">
            <span className="pill">
                <span className="dot" /> Fast · Free · No sign-up
            </span>
            <h1>
                Download YouTube videos <span className="grad">in high quality</span>
            </h1>
            <p className="sub">
                Paste any link and grab it as MP4 video or MP3 audio. No watermarks, no limits, no hassle.
            </p>
            <Downloader />
        </section>
    );
}
