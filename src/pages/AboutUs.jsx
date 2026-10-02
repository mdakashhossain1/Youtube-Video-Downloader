import { useEffect } from 'react';
import { Sparkles, Zap, ShieldCheck, HeartHandshake, Code, Cpu } from 'lucide-react';
import { SpotlightCard } from '../components/reactbits';
import { Link } from '../context/RouterContext';

export default function AboutUs() {
    useEffect(() => {
        document.title = 'About Us — YTSaver';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-zinc-200">About Us</span>
            </nav>

            {/* Header */}
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-4">
                    <Sparkles className="size-3.5" />
                    Built for Creators & Audiophiles
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-heading">
                    About YTSaver
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    We engineered YTSaver to be the fastest, cleanest, and most reliable YouTube media converter on the web.
                </p>
            </div>

            {/* Content Cards */}
            <div className="space-y-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(255, 26, 67, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <Zap className="size-5 text-primary" />
                        Our Mission: A Cleaner Web
                    </h2>
                    <p className="mb-3">
                        Most YouTube downloaders online are plagued with invasive pop-ups, slow queues, aggressive trackers, and misleading download buttons.
                    </p>
                    <p className="text-zinc-400">
                        We built <strong>YTSaver</strong> with a single mission: provide a lightning-fast, ad-free, and privacy-respecting conversion tool that allows users to access their favorite public videos in true <strong>4K UHD</strong>, <strong>1080p Full HD</strong>, and high-bitrate <strong>MP3 320 kbps</strong> audio without compromises.
                    </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(16, 185, 129, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <ShieldCheck className="size-5 text-emerald-400" />
                        Zero Storage & Absolute Privacy
                    </h2>
                    <p className="mb-3">
                        We believe user privacy should be non-negotiable. Unlike older tools that store your downloads on servers or index your download history:
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-zinc-400 pl-2">
                        <li>We never save any media files on disk. Data is streamed in-memory directly to your browser.</li>
                        <li>No login or user registration is ever required.</li>
                        <li>We run automated background cleanup routines to guarantee 0 bytes of orphaned media remain.</li>
                    </ul>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(168, 85, 247, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <Cpu className="size-5 text-purple-400" />
                        State-of-the-Art Architecture
                    </h2>
                    <p className="mb-3">
                        Built with cutting-edge web technologies:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                            <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                                <Code className="size-4 text-primary" /> React 19 & React Bits
                            </h3>
                            <p className="text-xs text-zinc-400">Sleek WebGL shaders, magnetic physics, and spotlight interactions for an unmatched user experience.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                            <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                                <Zap className="size-4 text-amber-400" /> Direct CDN Streaming
                            </h3>
                            <p className="text-xs text-zinc-400">Pipes data straight from origin edge caches to your device without re-encoding delays.</p>
                        </div>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
}
