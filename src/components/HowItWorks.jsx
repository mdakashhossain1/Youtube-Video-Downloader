import { Link2, Music, Download, ArrowRight } from 'lucide-react';
import { SpotlightCard } from './reactbits';

const STEPS = [
    {
        num: '01',
        icon: Link2,
        title: 'Paste Link',
        text: 'Copy any standard YouTube video URL, youtu.be shortlink, or Shorts link and paste it into the box.',
    },
    {
        num: '02',
        icon: Music,
        title: 'Select Format',
        text: 'Toggle between Video (MP4) and Audio (MP3). Choose your preferred resolution or audio bitrate.',
    },
    {
        num: '03',
        icon: Download,
        title: 'Instant Download',
        text: 'The stream downloads immediately to your browser. Zero files remain on the server, guaranteed.',
    },
];

export default function HowItWorks() {
    return (
        <section className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6" id="how">
            <div className="mx-auto max-w-2xl text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Simple Workflow</span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground font-heading">
                    How it works in 3 easy steps
                </h2>
                <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                    Designed for maximum simplicity. No account registration, no captcha delays, no third-party installations.
                </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <SpotlightCard
                            key={s.title}
                            className="relative bg-[#121520]/80 p-8 shadow-xl hover:border-primary/40 transition-all duration-300"
                            spotlightColor="rgba(255, 26, 67, 0.14)"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                    <Icon className="size-6" />
                                </div>
                                <span className="text-4xl font-extrabold text-white/[0.08] font-heading">
                                    {s.num}
                                </span>
                            </div>

                            <h3 className="mt-6 text-xl font-bold text-foreground font-heading">{s.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {s.text}
                            </p>
                        </SpotlightCard>
                    );
                })}
            </div>
        </section>
    );
}
