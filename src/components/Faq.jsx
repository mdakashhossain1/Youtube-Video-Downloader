import { Card } from './ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from './ui/accordion';

const FAQS = [
    {
        q: 'Is it really free?',
        a: 'Yes — completely. There are no accounts, watermarks, or hidden charges. You can download as many videos as you like.',
    },
    {
        q: 'What qualities are available?',
        a: 'Every format YouTube provides for the video — resolutions from 144p to 4K, in H.264, AV1, or VP9, in MP4 or WEBM containers. Audio can be grabbed as the original stream (M4A/Opus) or converted to MP3.',
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
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" id="faq">
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">FAQ</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Questions, answered
                </h2>
            </div>
            <Card className="mx-auto mt-10 max-w-2xl">
                <Accordion type="single" collapsible className="w-full px-2">
                    {FAQS.map((item) => (
                        <AccordionItem key={item.q} value={item.q}>
                            <AccordionTrigger>{item.q}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Card>
        </section>
    );
}
