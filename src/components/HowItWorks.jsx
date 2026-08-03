import { IconDownload, IconLink, IconMusic } from '../lib/icons';

const STEPS = [
    {
        icon: IconLink,
        tint: 'tint-red',
        title: 'Paste a link',
        text: 'Copy any YouTube URL and drop it into the box — we’ll pull the video details instantly.',
    },
    {
        icon: IconMusic,
        tint: 'tint-blue',
        title: 'Pick your format',
        text: 'Choose MP4 for full-quality video or MP3 to grab just the audio as a music file.',
    },
    {
        icon: IconDownload,
        tint: 'tint-green',
        title: 'Hit download',
        text: 'Your file is built and saved to disk in seconds — done, no watermarks attached.',
    },
];

export default function HowItWorks() {
    return (
        <section className="section" id="how">
            <div className="section-head">
                <span className="eyebrow">How it works</span>
                <h2>Three steps. That’s it.</h2>
                <p>No accounts, no installs, no waiting for approval. Just copy, choose, download.</p>
            </div>
            <div className="steps">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div className="card" key={s.title}>
                            <span className="step-num">0{i + 1}</span>
                            <div className={`card-icon ${s.tint}`}>
                                <Icon />
                            </div>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
