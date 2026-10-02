import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link } from '../context/RouterContext';
import { AmbientThreads, Eyebrow, RevealText } from './Motion';

export function PageHeader({ eyebrow, title, description }) {
    useEffect(() => { document.title = `${title} — YTSaver`; }, [title]);
    return <header className="page-heading"><AmbientThreads compact /><div className="container"><Link href="/" className="back-link"><ArrowLeft size={14} /> Back to the downloader</Link><Eyebrow>{eyebrow}</Eyebrow><h1 aria-label={title}><RevealText text={title} /></h1><p>{description}</p></div></header>;
}

const documents = {
    privacy: { title: 'Privacy policy.', eyebrow: 'YOUR PRIVACY, IN PLAIN VIEW', description: 'How we handle your information and keep your downloads yours.', sections: ['Information we collect', 'Stream processing', 'Cookies & local storage', 'Your data rights', 'Get in touch'] },
    terms: { title: 'Terms of service.', eyebrow: 'THE GROUND RULES', description: 'A few things to know before you use YTSaver.', sections: ['Acceptance of terms', 'Permitted use', 'Third-party disclaimer', 'Warranties & liability'] },
    dmca: { title: 'Respect the creator.', eyebrow: 'DMCA & COPYRIGHT POLICY', description: 'Our approach to copyright and how to raise a concern.', sections: ['Our role', 'Submit a notice', 'Contact the team'] },
};

export function DocumentSection({ children }) {
    return <section className="document-section">{children}</section>;
}

export default function DocumentLayout({ type, children }) {
    const copy = documents[type];
    return <><PageHeader {...copy} /><div className="document-layout container"><aside className="document-sidebar"><span className="mono">IN THIS DOCUMENT</span><ol>{copy.sections.map((section, index) => <li key={section}><a href={`#document-section-${index + 1}`}><span className="mono">0{index + 1}</span>{section}</a></li>)}</ol><div className="document-date"><span className="mono">LAST UPDATED</span><p>October 2026</p></div><Link href="/contact" className="inline-link">Need a hand? <ArrowUpRight size={15} /></Link></aside><article className="document-body">{children}</article></div></>;
}
