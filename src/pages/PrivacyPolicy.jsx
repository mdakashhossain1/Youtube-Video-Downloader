import { Shield, Lock, EyeOff, Server, FileText, CheckCircle2 } from 'lucide-react';
import DocumentLayout, { DocumentSection as SpotlightCard } from '../components/PageLayout';
import { Link } from '../context/RouterContext';

export default function PrivacyPolicy() {
    return <DocumentLayout type="privacy">
        <div className="space-y-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(16, 185, 129, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <EyeOff className="size-5 text-emerald-400" />
                        1. Information We Do NOT Collect
                    </h2>
                    <p className="mb-3">
                        Unlike traditional file converter services, YTSaver is architected with a strict <strong>Zero-Knowledge & Zero-Storage</strong> design philosophy:
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-zinc-400 pl-2">
                        <li><strong>No User Accounts:</strong> You do not need to register, provide an email, or log in to use our service.</li>
                        <li><strong>No Personal Identifiable Information (PII):</strong> We do not ask for, capture, or store names, IP address logs, or physical locations.</li>
                        <li><strong>No Media Files Retained:</strong> Videos and audio streams are piped directly from content delivery networks to your browser without ever being saved to our server disk.</li>
                        <li><strong>No Payment or Financial Details:</strong> YTSaver is 100% free and does not collect payment card information.</li>
                    </ul>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(255, 26, 67, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <Server className="size-5 text-primary" />
                        2. How Stream Processing Works
                    </h2>
                    <p className="mb-3">
                        When you request a download link:
                    </p>
                    <ol className="space-y-2 list-decimal list-inside text-zinc-400 pl-2">
                        <li>Our engine parses the publicly available video metadata to determine available resolutions and formats (e.g. 4K, 1080p, MP3).</li>
                        <li>Upon clicking Download, the data is streamed in chunks directly through an in-memory buffer directly to your browser's download manager.</li>
                        <li>Once the transfer finishes or is interrupted, all transient memory chunks are instantly garbage-collected. Zero temporary files remain.</li>
                    </ol>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(56, 189, 248, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <Lock className="size-5 text-sky-400" />
                        3. Cookies & Local Storage
                    </h2>
                    <p className="mb-3">
                        YTSaver does not employ persistent tracking cookies, fingerprinting scripts, or third-party behavioral advertising trackers.
                    </p>
                    <p className="text-zinc-400">
                        We may use minimal browser Session Storage strictly to maintain your active theme preference or tab selection (e.g., MP4 vs MP3) during your active browser session. This data is stored locally on your device and is never transmitted to any third party.
                    </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(168, 85, 247, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <FileText className="size-5 text-purple-400" />
                        4. GDPR & CCPA Compliance
                    </h2>
                    <p className="mb-3">
                        Because we collect no personal data, no user tracking profiles exist within our infrastructure. In accordance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl border border-white/5 bg-black/40">
                            <h3 className="font-semibold text-white text-sm mb-1">Right to Access / Erase</h3>
                            <p className="text-xs text-zinc-400">No personal data is saved, so there is no private record to retrieve, modify, or delete.</p>
                        </div>
                        <div className="p-3.5 rounded-xl border border-white/5 bg-black/40">
                            <h3 className="font-semibold text-white text-sm mb-1">Do Not Sell My Info</h3>
                            <p className="text-xs text-zinc-400">We do not sell, rent, or monetize user data with data brokers or marketing affiliates.</p>
                        </div>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(245, 158, 11, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <CheckCircle2 className="size-5 text-amber-400" />
                        5. Contacting Our Data Privacy Team
                    </h2>
                    <p className="mb-3">
                        If you have questions or concerns regarding our privacy standards or technical architecture, you can contact us anytime through our <Link href="/contact" className="text-primary underline">Contact Form</Link> or by emailing:
                    </p>
                    <p className="font-mono text-sm text-zinc-300 bg-black/50 p-3 rounded-lg border border-white/10 inline-block">
                        privacy@viedown.com
                    </p>
                </SpotlightCard>
            </div>
    </DocumentLayout>;
}
