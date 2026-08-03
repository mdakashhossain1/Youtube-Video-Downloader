import { Badge } from './ui/badge';
import Downloader from './Downloader';

export default function Hero() {
    return (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col items-center px-0 pb-12 pt-20 text-center">
                <Badge
                    variant="secondary"
                    className="gap-2 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                    <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.18)]" />
                    Fast · Free · No sign-up
                </Badge>
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
                    Download YouTube videos{' '}
                    <span className="bg-gradient-to-r from-primary via-rose-500 to-orange-500 bg-clip-text text-transparent">
                        in high quality
                    </span>
                </h1>
                <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                    Paste any link and grab it as MP4 video or MP3 audio. No watermarks, no limits, no
                    hassle.
                </p>
                <div className="mt-10 w-full max-w-2xl">
                    <Downloader />
                </div>
            </div>
        </section>
    );
}
