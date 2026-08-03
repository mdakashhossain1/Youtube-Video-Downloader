import { Play } from 'lucide-react';
import { Separator } from './ui/separator';

export default function Footer() {
    return (
        <footer className="border-t">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <a href="#" className="flex items-center gap-2 font-semibold">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Play className="size-3.5 fill-current" />
                        </span>
                        YTSaver
                    </a>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                        YTSaver is an independent tool and is not affiliated with, endorsed by, or
                        connected to YouTube or Google. Download only content you own or have permission
                        to download.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        © 2026 YTSaver · Made for fast, simple video downloads
                    </p>
                </div>
                <Separator className="my-6" />
                <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                    <a href="#how" className="transition-colors hover:text-foreground">
                        How it works
                    </a>
                    <a href="#features" className="transition-colors hover:text-foreground">
                        Features
                    </a>
                    <a href="#faq" className="transition-colors hover:text-foreground">
                        FAQ
                    </a>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-foreground"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}
