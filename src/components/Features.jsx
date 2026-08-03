import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Bolt, Clapperboard, ShieldCheck, Sparkles } from 'lucide-react';

const FEATURES = [
    {
        icon: Bolt,
        title: 'Blazing fast',
        text: 'Direct stream processing with parallel download and fast merging, right on your machine.',
    },
    {
        icon: Clapperboard,
        title: 'Every quality',
        text: 'All resolutions from 144p to 4K, in H.264, AV1, or VP9 — you pick exactly what you want.',
    },
    {
        icon: ShieldCheck,
        title: 'Private & secure',
        text: 'Your links are processed on the fly and cleaned up right after. Nothing is stored.',
    },
    {
        icon: Sparkles,
        title: '100% free',
        text: 'No accounts, no paywalls, no daily limits. Unlimited downloads, always.',
    },
];

export default function Features() {
    return (
        <section className="border-y bg-card/40" id="features">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge variant="secondary" className="text-primary">
                        Features
                    </Badge>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Built to be fast and safe
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Everything you expect from a professional downloader, without the bloat.
                    </p>
                </div>
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((f) => {
                        const Icon = f.icon;
                        return (
                            <Card
                                key={f.title}
                                className="transition-transform hover:-translate-y-1"
                            >
                                <CardContent className="p-6">
                                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="size-6" />
                                    </span>
                                    <h3 className="mt-5 font-semibold">{f.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {f.text}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
