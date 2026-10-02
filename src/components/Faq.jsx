import { useState } from 'react';
import { SpotlightCard, ShinyText, GradientText } from './reactbits';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
    {
        q: 'Is it completely free to use?',
        a: 'Yes, 100% free with no hidden subscriptions, no account registrations, and no download throttles. Always free, forever.',
    },
    {
        q: 'Are any files saved on your server?',
        a: 'No. Our server utilizes a direct-streaming pipeline coupled with an automated FileCleanupQueue that immediately removes any temporary data from disk. Zero files remain on the server after your download.',
    },
    {
        q: 'What formats and qualities can I download?',
        a: 'You can download MP4 high definition videos (with audio included) in 720p or 360p, or extract high-quality audio tracks in MP3 or M4A format. More quality options are coming soon.',
    },
    {
        q: 'Does it work with YouTube Shorts and mobile devices?',
        a: 'Yes. YTSaver supports regular YouTube links, youtu.be shortlinks, and Shorts across desktop, iPhone, iPad, and Android devices.',
    },
    {
        q: 'How fast are the downloads?',
        a: 'Very fast. We stream directly from YouTube\'s CDN to your browser without intermediate servers, so your download speed is only limited by your internet connection.',
    },
    {
        q: 'Do I need to install any software?',
        a: 'No installation required. YTSaver runs entirely in your web browser. Just paste a link and click download — nothing else needed.',
    },
];

function FaqItem({ item, isOpen, onToggle }) {
    return (
        <SpotlightCard
            className="faq-item-card"
            spotlightColor="rgba(255, 26, 67, 0.12)"
        >
            <button className="faq-question" onClick={onToggle} aria-expanded={isOpen}>
                <span>{item.q}</span>
                <ChevronDown
                    className="faq-chevron"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>
            <div className="faq-answer-wrap" style={{ maxHeight: isOpen ? '200px' : '0' }}>
                <p className="faq-answer">{item.a}</p>
            </div>
        </SpotlightCard>
    );
}

export default function Faq() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="faq-section" id="faq">
            {/* Header */}
            <div className="faq-header">
                <div className="faq-badge">
                    <HelpCircle className="faq-badge-icon" />
                    <ShinyText text="Got Questions?" speed={4} color="#9ca3af" shineColor="#ffffff" />
                </div>
                <h2 className="faq-title">
                    <GradientText colors={['#ffffff', '#d1d5db', '#ffffff']} animationSpeed={12}>
                        Frequently Asked Questions
                    </GradientText>
                </h2>
                <p className="faq-subtitle">
                    Everything you need to know about formats, privacy, and performance.
                </p>
            </div>

            {/* FAQ list */}
            <div className="faq-list">
                {FAQS.map((item, i) => (
                    <FaqItem
                        key={item.q}
                        item={item}
                        isOpen={openIndex === i}
                        onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                    />
                ))}
            </div>
        </section>
    );
}
