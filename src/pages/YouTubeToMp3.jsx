import { useEffect } from 'react';
import { Music, CheckCircle2, Zap, Shield, Sparkles, Volume2 } from 'lucide-react';
import Downloader from '../components/Downloader';
import { SpotlightCard } from '../components/reactbits';
import { Link } from '../context/RouterContext';

export default function YouTubeToMp3() {
    useEffect(() => {
        document.title = 'YouTube to MP3 Converter — Free 320kbps Audio Downloader | YTSaver';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-zinc-200">YouTube to MP3</span>
            </nav>

            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-bold mb-4">
                    <Music className="size-3.5" />
                    High Bitrate MP3 Audio Downloader
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 font-heading">
                    Convert <span className="text-rose-500">YouTube to MP3</span> in 320 kbps
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Extract crisp, studio-grade MP3 and M4A audio tracks from music videos, podcasts, speeches, and concerts. Completely free with zero software installation.
                </p>
            </div>

            {/* Integrated Downloader Component */}
            <div className="mb-16">
                <Downloader />
            </div>

            {/* SEO Content: Audio Bitrate Comparison & FAQs */}
            <div className="space-y-12">
                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(244, 63, 94, 0.15)">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Volume2 className="size-5 text-rose-400" /> Audio Bitrate Guide: 320kbps vs 256kbps vs 192kbps
                    </h2>
                    <p className="text-sm text-zinc-400 mb-6">
                        Bitrate defines the amount of audio data processed per second. Higher bitrate guarantees wider dynamic range and clearer highs:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 uppercase">Studio Master</span>
                            <h3 className="font-bold text-white text-base mt-2 mb-1">320 kbps MP3</h3>
                            <p className="text-xs text-zinc-400">The highest standard MP3 bitrate available. Ideal for audiophiles, high-end headphones, and car sound systems.</p>
                        </div>

                        <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-400 uppercase">High Fidelity</span>
                            <h3 className="font-bold text-white text-base mt-2 mb-1">256 kbps MP3</h3>
                            <p className="text-xs text-zinc-400">Near-transparent audio reproduction matching Apple Music streaming quality. Excellent balance of quality and file size.</p>
                        </div>

                        <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-400 uppercase">Compact Standard</span>
                            <h3 className="font-bold text-white text-base mt-2 mb-1">192 kbps / 128 kbps</h3>
                            <p className="text-xs text-zinc-400">Compact file size, fast downloads on mobile networks. Great for podcasts, audiobooks, and voice recordings.</p>
                        </div>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
}
