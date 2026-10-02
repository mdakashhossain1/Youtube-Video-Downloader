import { Copyright, ShieldCheck, Mail, Send, AlertTriangle, FileText } from 'lucide-react';
import DocumentLayout, { DocumentSection as SpotlightCard } from '../components/PageLayout';
import { Link } from '../context/RouterContext';

export default function DmcaPolicy() {
    return <DocumentLayout type="dmca">
        <div className="space-y-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(244, 63, 94, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <ShieldCheck className="size-5 text-rose-400" />
                        1. Our Role as a Technology Provider
                    </h2>
                    <p className="mb-3">
                        YTSaver is a transient client-side proxy tool. We do not host, store, index, or maintain any video or audio files on our servers. All media data is streamed on-demand directly from YouTube's public content delivery servers to the end-user's device.
                    </p>
                    <p className="text-zinc-400">
                        Because we store zero files, removing a video from YouTube's origin servers automatically prevents any downloads from completing via our service.
                    </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(255, 26, 67, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <FileText className="size-5 text-primary" />
                        2. Filing a DMCA Takedown Notice
                    </h2>
                    <p className="mb-4">
                        If you believe your copyrighted work is being accessed through YTSaver in a manner that constitutes infringement, please provide our Designated DMCA Agent with a formal written notice containing the following elements pursuant to 17 U.S.C. § 512(c)(3):
                    </p>
                    <div className="space-y-3 text-zinc-300">
                        <div className="p-3 rounded-xl border border-white/5 bg-black/40">
                            <strong>1. Identification of the copyrighted work:</strong> Provide the title, artist name, and specific URL of the copyrighted material.
                        </div>
                        <div className="p-3 rounded-xl border border-white/5 bg-black/40">
                            <strong>2. Identification of the infringing material:</strong> Specific YouTube video URL(s) to be blacklisted from our conversion pipeline.
                        </div>
                        <div className="p-3 rounded-xl border border-white/5 bg-black/40">
                            <strong>3. Contact information:</strong> Your legal full name, address, telephone number, and official email address.
                        </div>
                        <div className="p-3 rounded-xl border border-white/5 bg-black/40">
                            <strong>4. Good Faith statement:</strong> "I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."
                        </div>
                        <div className="p-3 rounded-xl border border-white/5 bg-black/40">
                            <strong>5. Accuracy statement under penalty of perjury:</strong> "The information in this notification is accurate, and under penalty of perjury, I am authorized to act on behalf of the copyright owner."
                        </div>
                        <div className="p-3 rounded-xl border border-white/5 bg-black/40">
                            <strong>6. Signature:</strong> A physical or electronic signature of the authorized copyright holder or representative.
                        </div>
                    </div>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(56, 189, 248, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <Mail className="size-5 text-sky-400" />
                        3. Designated DMCA Agent Contact
                    </h2>
                    <p className="mb-4">
                        Please direct all formal DMCA notices and copyright inquiries to our designated copyright team:
                    </p>
                    <div className="p-4 rounded-xl border border-white/10 bg-black/50 space-y-2 font-mono text-sm text-zinc-300">
                        <p><strong className="text-white">Attention:</strong> YTSaver DMCA Compliance Agent</p>
                        <p><strong className="text-white">Email:</strong> <span className="text-primary">dmca@viedown.com</span></p>
                        <p><strong className="text-white">Response Turnaround:</strong> Typically within 24 to 48 business hours</p>
                    </div>
                    <p className="mt-4 text-xs text-zinc-500">
                        Upon receipt of a valid and verified notice, we will immediately add the specified YouTube video ID(s) to our automated blacklist, disabling any further parsing or streaming.
                    </p>
                </SpotlightCard>
            </div>
    </DocumentLayout>;
}
