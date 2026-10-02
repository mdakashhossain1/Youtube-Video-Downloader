import { useState } from 'react';
import { ArrowUpRight, Mail, Check, RotateCcw } from 'lucide-react';
import { PageHeader } from '../components/PageLayout';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import { Link } from '../context/RouterContext';

export default function ContactUs() {
    const [prepared, setPrepared] = useState(false);
    function handleSubmit(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const subject = `YTSaver: ${form.get('subject')}`;
        const body = `Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\n${form.get('message')}`;
        window.location.href = `mailto:support@viedown.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setPrepared(true);
    }
    return <><PageHeader eyebrow="WE’RE LISTENING" title="Let’s talk." description="A question, a rough edge, or an idea? Send it our way." /><section className="contact-layout container"><aside className="contact-info"><span className="mono">A DIRECT LINE</span><a href="mailto:support@viedown.com" className="contact-email">support@viedown.com <ArrowUpRight size={22} /></a><p>For download issues, include the video link, your browser, and what happened. A little context goes a long way.</p><div className="contact-resource"><span className="mono">LOOKING FOR AN ANSWER?</span><Link href="/#faq">Start with our FAQ <ArrowUpRight size={16} /></Link></div><div className="contact-resource"><span className="mono">COPYRIGHT CONCERNS</span><Link href="/dmca">Read our copyright policy <ArrowUpRight size={16} /></Link></div></aside><SpotlightCard className="contact-form-panel" spotlightColor="rgba(160, 110, 240, 0.12)">{prepared ? <div className="contact-prepared" role="status"><Check size={28} /><h2>Your email is ready.</h2><p>Your email app should open with your message. Send it there to reach our team. If it didn’t open, email <a href="mailto:support@viedown.com">support@viedown.com</a> directly.</p><button onClick={() => setPrepared(false)} className="secondary-button"><RotateCcw size={15} /> Back to your message</button></div> : <form onSubmit={handleSubmit}><div className="form-heading"><h2>A note to the team.</h2><span className="mono">ALL FIELDS REQUIRED</span></div><div className="contact-input-row"><label htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" placeholder="Alex Morgan" required maxLength={100} /></label><label htmlFor="contact-email">Email address<input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label></div><label htmlFor="contact-subject">What’s it about?<select id="contact-subject" name="subject"><option>A general question</option><option>A download issue</option><option>A feature idea</option><option>A partnership</option></select></label><label htmlFor="contact-message">Your message<textarea id="contact-message" name="message" rows={5} placeholder="Tell us a little more…" required maxLength={4000} /></label><div className="contact-form-bottom"><button type="submit" className="primary-button">Prepare email <ArrowUpRight size={17} /></button><span><Mail size={13} /> Opens your email app</span></div></form>}</SpotlightCard></section></>;
}
