import { Separator } from './ui/separator';
import { siteConfig } from '../config/site';
import { Link } from '../context/RouterContext';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#07090e] text-zinc-400">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand Col */}
                    <div className="space-y-4 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 font-bold hover:opacity-90 transition-opacity">
                            <img
                                src={siteConfig.favicon}
                                alt={`${siteConfig.name} logo`}
                                className="size-7 rounded-md"
                            />
                            <span className="text-lg font-black tracking-tight text-white font-heading">
                                YT<span className="text-primary">Saver</span>
                            </span>
                        </Link>
                        <p className="text-xs leading-relaxed text-zinc-400">
                            Fast, secure, and modern YouTube media converter. Save MP4 videos in up to 4K UHD and studio-grade MP3 audio tracks with zero server storage.
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                            <ShieldCheck className="size-4" />
                            <span>Zero Data Retention</span>
                        </div>
                    </div>

                    {/* SEO Converters Col */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Converters</h3>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">
                                    YouTube Downloader
                                </Link>
                            </li>
                            <li>
                                <Link href="/youtube-to-mp4" className="hover:text-primary transition-colors">
                                    YouTube to MP4 HD
                                </Link>
                            </li>
                            <li>
                                <Link href="/youtube-to-mp3" className="hover:text-primary transition-colors">
                                    YouTube to MP3 (320kbps)
                                </Link>
                            </li>
                            <li>
                                <Link href="/youtube-to-mp4" className="hover:text-primary transition-colors">
                                    4K Video Downloader
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Col */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Resources</h3>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/#how" className="hover:text-primary transition-colors">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/#features" className="hover:text-primary transition-colors">
                                    Key Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/#faq" className="hover:text-primary transition-colors">
                                    Frequently Asked Questions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Compliance Col */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Legal & Compliance</h3>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/dmca" className="hover:text-primary transition-colors">
                                    DMCA & Copyright Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">
                                    Contact Us & Support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <Separator className="border-white/10 my-8" />

                {/* Bottom Legal Disclaimer */}
                <div className="space-y-3 text-center text-xs text-zinc-500">
                    <p className="max-w-2xl mx-auto leading-relaxed">
                        <strong>Disclaimer:</strong> {siteConfig.name} is an independent utility and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with YouTube, Google LLC, or Alphabet Inc. Only download public content that you have rights or permission to save.
                    </p>
                    <p>
                        © {new Date().getFullYear()} {siteConfig.name} (viedown.com). All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
