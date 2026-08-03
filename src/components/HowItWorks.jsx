import { Card, CardContent } from './ui/card';
import { Link2, Music, Download } from 'lucide-react';

const STEPS = [
    {
        icon: Link2,
        title: 'Paste a link',
        text: 'Copy any YouTube URL and drop it into the box — we’ll pull every available quality instantly.',
    },
    {
        icon: Music,
        title: 'Pick your format',
        text: 'Choose any resolution, codec, or audio bitrate — MP4 video, WEBM, or MP3 audio.',
    },
    {
        icon: Download,
        title: 'Hit download',
        text: 'Your file is built and saved to disk in seconds — done, no watermarks attached.',
    },
];

export default function HowItWorks() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" id="how">
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">How it works</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Three steps. That’s it.
                </h2>
                <p className="mt-3 text-muted-foreground">
                    No accounts, no installs, no waiting for approval. Just copy, choose, download.
                </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Card key={s.title} className="relative transition-transform hover:-translate-y-1">
                            <CardContent className="p-6">
                                <span className="absolute right-5 top-5 text-4xl font-extrabold text-muted/15">
                                    0{i + 1}
                                </span>
                                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="size-6" />
                                </span>
                                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {s.text}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
