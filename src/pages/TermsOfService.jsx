import { Scale, AlertCircle, FileCheck, ShieldAlert, Award } from 'lucide-react';
import DocumentLayout, { DocumentSection as SpotlightCard } from '../components/PageLayout';
import { Link } from '../context/RouterContext';

export default function TermsOfService() {
    return <DocumentLayout type="terms">
        <div className="space-y-8 text-zinc-300 text-sm sm:text-base leading-relaxed">
                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(255, 26, 67, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <FileCheck className="size-5 text-primary" />
                        1. Acceptance of Terms
                    </h2>
                    <p className="mb-3">
                        By visiting, accessing, or using <strong>YTSaver</strong> (accessible at viedown.com), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service, as well as our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> and <Link href="/dmca" className="text-primary underline">DMCA Policy</Link>.
                    </p>
                    <p className="text-zinc-400">
                        If you do not agree with any portion of these terms, you are prohibited from utilizing this web utility.
                    </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(168, 85, 247, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <Award className="size-5 text-purple-400" />
                        2. Permitted Use & Fair Use Doctrine
                    </h2>
                    <p className="mb-3">
                        YTSaver is provided solely as a personal, non-commercial media stream helper tool. You explicitly agree to the following conditions:
                    </p>
                    <ul className="space-y-2 list-disc list-inside text-zinc-400 pl-2">
                        <li>You may only download content for which you own the copyright, have explicit authorization from the copyright holder, or which is distributed under a Creative Commons or public domain license.</li>
                        <li>You agree not to redistribute, broadcast, sell, or commercially exploit any content downloaded through this service.</li>
                        <li>You are solely responsible for ensuring that your download conforms with the Fair Use provisions of your jurisdiction's copyright laws.</li>
                    </ul>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(245, 158, 11, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <AlertCircle className="size-5 text-amber-400" />
                        3. Third-Party Disclaimer & Non-Affiliation
                    </h2>
                    <p className="mb-3">
                        <strong>YTSaver is an independent utility and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with YouTube, Google LLC, Alphabet Inc., or any of their subsidiaries.</strong>
                    </p>
                    <p className="text-zinc-400">
                        The official YouTube website can be found at <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline">youtube.com</a>. The names YouTube, as well as related names, marks, emblems, and images, are registered trademarks of their respective owners.
                    </p>
                </SpotlightCard>

                <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(239, 68, 68, 0.15)">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2.5">
                        <ShieldAlert className="size-5 text-rose-400" />
                        4. Disclaimer of Warranties & Limitation of Liability
                    </h2>
                    <p className="mb-3">
                        This service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, either express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
                    </p>
                    <p className="text-zinc-400">
                        In no event shall YTSaver, its developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to, use of, or inability to use this service.
                    </p>
                </SpotlightCard>
            </div>
    </DocumentLayout>;
}
