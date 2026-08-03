import { IconChevron } from '../lib/icons';

const FAQS = [
    {
        q: 'Is it really free?',
        a: 'Yes — completely. There are no accounts, watermarks, or hidden charges. You can download as many videos as you like.',
    },
    {
        q: 'What quality will I get?',
        a: 'Video downloads keep the highest available resolution of the source video (up to 4K when the source allows), with audio merged in. MP3 downloads are extracted at 192 kbps for great sound at a small file size.',
    },
    {
        q: 'Does it work on mobile?',
        a: 'Yes. The site is fully responsive, so you can paste links and download files from your phone or tablet just as easily as on desktop.',
    },
    {
        q: 'Is it legal to download videos?',
        a: 'Please only download videos you own or have explicit permission to download. Respect copyright and each creator’s terms of service.',
    },
];

export default function Faq() {
    return (
        <section className="section" id="faq">
            <div className="section-head">
                <span className="eyebrow">FAQ</span>
                <h2>Questions, answered</h2>
            </div>
            <div className="faq">
                {FAQS.map((item) => (
                    <details key={item.q}>
                        <summary>
                            {item.q}
                            <IconChevron className="chev" />
                        </summary>
                        <div className="faq-body">{item.a}</div>
                    </details>
                ))}
            </div>
        </section>
    );
}
