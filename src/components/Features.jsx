import { IconBolt, IconFilm, IconShield, IconStar } from '../lib/icons';

const FEATURES = [
    {
        icon: IconBolt,
        tint: 'tint-red',
        title: 'Blazing fast',
        text: 'Direct stream processing with parallel video & audio download and fast merging.',
    },
    {
        icon: IconFilm,
        tint: 'tint-blue',
        title: 'HD quality',
        text: 'Keep the original resolution up to 4K, with the audio track merged right in.',
    },
    {
        icon: IconShield,
        tint: 'tint-green',
        title: 'Private & secure',
        text: 'Your links are processed on the fly and cleaned up right after. Nothing is stored.',
    },
    {
        icon: IconStar,
        tint: 'tint-violet',
        title: '100% free',
        text: 'No accounts, no paywalls, no daily limits. Unlimited downloads, always.',
    },
];

export default function Features() {
    return (
        <section className="section" id="features">
            <div className="section-head">
                <span className="eyebrow">Features</span>
                <h2>Built to be fast and safe</h2>
                <p>Everything you expect from a professional downloader, without the bloat.</p>
            </div>
            <div className="features">
                {FEATURES.map((f) => {
                    const Icon = f.icon;
                    return (
                        <div className="card" key={f.title}>
                            <div className={`card-icon ${f.tint}`}>
                                <Icon />
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
