import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Faq from './components/Faq';
import Footer from './components/Footer';
import { RouterProvider, useRouter, Link } from './context/RouterContext';
import { PageHeader } from './components/PageLayout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DmcaPolicy from './pages/DmcaPolicy';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import YouTubeToMp4 from './pages/YouTubeToMp4';
import YouTubeToMp3 from './pages/YouTubeToMp3';

const routes = {
    '/privacy': PrivacyPolicy, '/privacy-policy': PrivacyPolicy,
    '/terms': TermsOfService, '/terms-of-service': TermsOfService,
    '/dmca': DmcaPolicy, '/dmca-policy': DmcaPolicy, '/copyright': DmcaPolicy,
    '/contact': ContactUs, '/contact-us': ContactUs,
    '/about': AboutUs, '/about-us': AboutUs,
    '/youtube-to-mp4': YouTubeToMp4, '/mp4': YouTubeToMp4,
    '/youtube-to-mp3': YouTubeToMp3, '/mp3': YouTubeToMp3,
};
function MainContent() {
    const { currentPath } = useRouter();
    const path = currentPath.toLowerCase().replace(/\/$/, '') || '/';
    const Page = routes[path];
    useEffect(() => {
        if (path === '/') document.title = 'YTSaver — Your videos. Your way.';
        document.querySelectorAll('.document-section').forEach((section, index) => { section.id = `document-section-${index + 1}`; });
    }, [path]);
    return <div className="app-shell">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Toaster theme="dark" position="top-right" closeButton />
        <Navbar />
        <main className="main-content" id="main-content" tabIndex={-1} key={path}>{Page ? <Page /> : path === '/' ? <><Hero /><Features /><HowItWorks /><Faq /></> : <><PageHeader eyebrow="A LITTLE OFF TRACK" title="Nothing here. Yet." description="This page doesn’t exist. Your next offline moment is back at the downloader." /><div className="not-found container"><Link className="primary-button" href="/">Back to the downloader ↗</Link></div></>}</main>
        <Footer />
    </div>;
}
export default function App() {
    return <RouterProvider><MainContent /></RouterProvider>;
}
