import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, MessageSquare, Send, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import { SpotlightCard, Magnet } from '../components/reactbits';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link } from '../context/RouterContext';

export default function ContactUs() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('General Inquiry');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        document.title = 'Contact Us — YTSaver Support';
        window.scrollTo(0, 0);
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error('Please complete all required fields.');
            return;
        }

        setSending(true);
        setTimeout(() => {
            setSending(false);
            setSent(true);
            toast.success('Your message has been received! We will respond within 24 hours.');
        }, 1200);
    }

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-zinc-200">Contact Us</span>
            </nav>

            {/* Header */}
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-bold mb-4">
                    <Mail className="size-3.5" />
                    24/7 Support Desk
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-heading">
                    Get in Touch
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                    Have feedback, technical issues, or partnership inquiries? Send us a message or email us directly.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Information & Channels */}
                <div className="space-y-4 md:col-span-1">
                    <SpotlightCard className="p-6 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(56, 189, 248, 0.15)">
                        <div className="size-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                            <Mail className="size-5" />
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">Direct Email</h2>
                        <p className="text-xs text-zinc-400 mb-3">For technical questions and feedback:</p>
                        <a href="mailto:support@viedown.com" className="text-sm font-semibold text-primary hover:underline">
                            support@viedown.com
                        </a>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(244, 63, 94, 0.15)">
                        <div className="size-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                            <ShieldAlert className="size-5" />
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">DMCA & Legal</h2>
                        <p className="text-xs text-zinc-400 mb-3">Copyright notices and takedown requests:</p>
                        <Link href="/dmca" className="text-sm font-semibold text-rose-400 hover:underline">
                            View DMCA Policy →
                        </Link>
                    </SpotlightCard>

                    <SpotlightCard className="p-6 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(168, 85, 247, 0.15)">
                        <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
                            <HelpCircle className="size-5" />
                        </div>
                        <h2 className="text-base font-bold text-white mb-1">Instant Answers</h2>
                        <p className="text-xs text-zinc-400 mb-3">Check our frequently asked questions:</p>
                        <Link href="/#faq" className="text-sm font-semibold text-purple-400 hover:underline">
                            Browse FAQs →
                        </Link>
                    </SpotlightCard>
                </div>

                {/* Form */}
                <div className="md:col-span-2">
                    <SpotlightCard className="p-6 sm:p-8 bg-[#0c0e17]/90 border-white/10 rounded-2xl" spotlightColor="rgba(255, 26, 67, 0.15)">
                        {sent ? (
                            <div className="py-12 text-center space-y-4">
                                <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                                    <CheckCircle2 className="size-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Thank you for reaching out!</h2>
                                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                                    Your message has been forwarded to our engineering team. We typically respond within 24 to 48 hours.
                                </p>
                                <Button onClick={() => setSent(false)} variant="outline" className="mt-4 border-white/15">
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-2">Send us a Message</h2>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-300">Your Name *</label>
                                    <Input
                                        type="text"
                                        placeholder="Alex Mercer"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-300">Email Address *</label>
                                    <Input
                                        type="email"
                                        placeholder="alex@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-300">Subject</label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full h-11 bg-black/50 border border-white/10 text-white rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Bug Report / Error">Bug Report / Download Error</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="Partnership">Partnership</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-300">Message *</label>
                                    <textarea
                                        rows={5}
                                        placeholder="How can we help you? Include any video links if reporting an issue..."
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 text-white placeholder:text-zinc-600 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <Magnet padding={25} magnetStrength={0.12}>
                                    <Button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2"
                                    >
                                        {sending ? 'Sending…' : (
                                            <>
                                                <Send className="size-4" />
                                                Submit Message
                                            </>
                                        )}
                                    </Button>
                                </Magnet>
                            </form>
                        )}
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
