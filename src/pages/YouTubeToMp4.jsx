import { useEffect } from 'react';
import { Film, CheckCircle2, Zap, Shield, Sparkles, HelpCircle } from 'lucide-react';
import Downloader from '../components/Downloader';
import { SpotlightCard } from '../components/reactbits';
import { Link } from '../context/RouterContext';

export default function YouTubeToMp4() {
    useEffect(() => {
        document.title = 'YouTube to MP4 Converter — Download HD & 4K Videos Free | YTSaver';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-zinc-200">YouTube to MP4</span>
            </nav>

            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-4">
                    <Film className="size-3.5" />
                    YouTube to MP4 HD & 4K Downloader
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 font-heading">
                    Convert & Download <span className="text-primary">YouTube to MP4</span>
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Save YouTube videos in pristine MP4 format at up to 4K Ultra HD and 1080p 60fps. Fast, free, and compatible with all media players, smartphones, and PCs.
                </p>
            </div>

            {/* Integrated Downloader Component */}
            <div className="mb-16">
                <Downloader />
            </div>

            {/* SEO Content: Resolution Comparison & Guide */}
            <div className="space-y-12">
                {/* Resolution Guide Table */}
                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(255, 26, 67, 0.15)">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" /> Supported MP4 Video Resolutions
                    </h2>
                    <p className="text-sm text-zinc-400 mb-6">
                        YTSaver extracts every native resolution YouTube delivers. Choose the perfect balance between quality and file size:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-zinc-300">
                                    <th className="pb-3 font-semibold">Resolution</th>
                                    <th className="pb-3 font-semibold">Pixel Dimensions</th>
                                    <th className="pb-3 font-semibold">Best Suited For</th>
                                    <th className="pb-3 font-semibold">File Size</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-zinc-400">
                                <tr>
                                    <td className="py-3 font-bold text-amber-400">4K Ultra HD (2160p)</td>
                                    <td className="py-3">3840 × 2160</td>
                                    <td className="py-3">4K OLED TVs, large monitors, video editing</td>
                                    <td className="py-3">Large (~500MB - 2GB+)</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-bold text-purple-400">2K Quad HD (1440p)</td>
                                    <td className="py-3">2560 × 1440</td>
                                    <td className="py-3">QHD gaming monitors, high-end laptops</td>
                                    <td className="py-3">Moderate (~250MB - 800MB)</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-bold text-emerald-400">1080p Full HD</td>
                                    <td className="py-3">1920 × 1080</td>
                                    <td className="py-3">Recommended for most phones, tablets, PCs</td>
                                    <td className="py-3">Optimal (~100MB - 350MB)</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-bold text-sky-400">720p HD</td>
                                    <td className="py-3">1280 × 720</td>
                                    <td className="py-3">Fast downloads, mobile data, storage savers</td>
                                    <td className="py-3">Compact (~50MB - 150MB)</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-bold text-zinc-300">480p / 360p Standard</td>
                                    <td className="py-3">854×480 / 640×360</td>
                                    <td className="py-3">Basic playback, slow connections</td>
                                    <td className="py-3">Very Small (~20MB - 50MB)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </SpotlightCard>

                {/* 3 Step Instructions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SpotlightCard className="p-6 bg-[#0c0e17]/90 border-white/10 rounded-xl" spotlightColor="rgba(255, 26, 67, 0.12)">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">1</div>
                        <h3 className="font-bold text-white text-base mb-1">Copy Link</h3>
                        <p className="text-xs text-zinc-400">Copy the URL of any YouTube video or Short from your browser or the YouTube app.</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 bg-[#0c0e17]/90 border-white/10 rounded-xl" spotlightColor="rgba(16, 185, 129, 0.12)">
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center mb-3">2</div>
                        <h3 className="font-bold text-white text-base mb-1">Select MP4 Quality</h3>
                        <p className="text-xs text-zinc-400">Choose from 4K, 2K, 1080p, or 720p resolution according to your preference.</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 bg-[#0c0e17]/90 border-white/10 rounded-xl" spotlightColor="rgba(56, 189, 248, 0.12)">
                        <div className="size-8 rounded-lg bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center mb-3">3</div>
                        <h3 className="font-bold text-white text-base mb-1">Instant Save</h3>
                        <p className="text-xs text-zinc-400">Click Download MP4 to save the video file directly into your device's downloads.</p>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
