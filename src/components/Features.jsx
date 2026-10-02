import { Bolt, HardDriveDownload, ShieldCheck, Sparkles, Check, Cpu, Globe, Lock } from 'lucide-react';
import { SpotlightCard, ShinyText, GradientText } from './reactbits';

const FEATURES = [
    {
        icon: Bolt,
        title: 'Direct CDN Pipeline',
        tag: 'Speed',
        text: 'Pipes video and audio directly from YouTube CDN to your browser. Zero conversion bottlenecks.',
        highlight: 'Zero latency',
        color: 'rgba(251, 191, 36, 0.18)',
        iconColor: '#fbbf24',
    },
    {
        icon: ShieldCheck,
        title: 'Zero Server Storage',
        tag: 'Privacy',
        text: 'No media files are ever stored on disk. Our automated queue sweeps and purges any chunk immediately.',
        highlight: '100% Private',
        color: 'rgba(34, 197, 94, 0.18)',
        iconColor: '#22c55e',
    },
    {
        icon: Sparkles,
        title: 'Single-Click Formats',
        tag: 'Simple',
        text: 'Clean format picker with dedicated download triggers. No confusing dropdowns or misleading codecs.',
        highlight: 'Intuitive UI',
        color: 'rgba(168, 85, 247, 0.18)',
        iconColor: '#a855f7',
    },
    {
        icon: HardDriveDownload,
        title: 'High-Bitrate Media',
        tag: 'Quality',
        text: 'Save HD MP4 videos (720p/1080p) or studio-grade MP3/M4A audio tracks with complete fidelity.',
        highlight: 'Crystal clear',
        color: 'rgba(255, 26, 67, 0.18)',
        iconColor: '#FF1A43',
    },
    {
        icon: Cpu,
        title: 'Lightning Fast',
        tag: 'Performance',
        text: 'Optimized streaming architecture means your downloads start in seconds, not minutes.',
        highlight: 'Instant start',
        color: 'rgba(59, 130, 246, 0.18)',
        iconColor: '#3b82f6',
    },
    {
        icon: Globe,
        title: 'No Region Blocks',
        tag: 'Global',
        text: 'Download videos from anywhere in the world without VPN or geo-restriction workarounds.',
        highlight: 'Global access',
        color: 'rgba(20, 184, 166, 0.18)',
        iconColor: '#14b8a6',
    },
];

export default function Features() {
    return (
        <section className="features-section" id="features">
            <div className="features-inner">
                {/* Section header */}
                <div className="features-header">
                    <div className="features-badge">
                        <Sparkles className="features-badge-icon" />
                        <ShinyText text="Enterprise-Grade Architecture" speed={3} color="#9ca3af" shineColor="#ffffff" />
                    </div>
                    <h2 className="features-title">
                        <GradientText
                            colors={['#ffffff', '#d1d5db', '#ffffff']}
                            animationSpeed={10}
                        >
                            Engineered for Speed, Privacy &amp; Quality
                        </GradientText>
                    </h2>
                    <p className="features-subtitle">
                        Say goodbye to intrusive pop-ups, slow servers, and complicated selectors.
                        Built for pure performance and complete privacy.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="features-grid">
                    {FEATURES.map((f) => {
                        const Icon = f.icon;
                        return (
                            <SpotlightCard
                                key={f.title}
                                className="feature-card"
                                spotlightColor={f.color}
                            >
                                <div className="feature-card-icon-wrap" style={{ '--icon-color': f.iconColor }}>
                                    <Icon className="feature-card-icon" />
                                </div>
                                <span className="feature-card-tag" style={{ color: f.iconColor }}>
                                    {f.tag}
                                </span>
                                <h3 className="feature-card-title">{f.title}</h3>
                                <p className="feature-card-text">{f.text}</p>
                                <div className="feature-card-highlight">
                                    <Check className="feature-card-check" style={{ color: f.iconColor }} />
                                    <span style={{ color: f.iconColor }}>{f.highlight}</span>
                                </div>
                            </SpotlightCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
