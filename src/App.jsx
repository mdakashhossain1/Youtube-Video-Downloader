import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Faq from './components/Faq';
import Footer from './components/Footer';

import { RouterProvider, useRouter } from './context/RouterContext';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DmcaPolicy from './pages/DmcaPolicy';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import YouTubeToMp4 from './pages/YouTubeToMp4';
import YouTubeToMp3 from './pages/YouTubeToMp3';

function MainContent() {
    const { currentPath } = useRouter();

    const normalizedPath = currentPath.toLowerCase().replace(/\/$/, '') || '/';

    const renderPage = () => {
        switch (normalizedPath) {
            case '/privacy':
            case '/privacy-policy':
                return <PrivacyPolicy />;
            case '/terms':
            case '/terms-of-service':
                return <TermsOfService />;
            case '/dmca':
            case '/dmca-policy':
            case '/copyright':
                return <DmcaPolicy />;
            case '/contact':
            case '/contact-us':
                return <ContactUs />;
            case '/about':
            case '/about-us':
                return <AboutUs />;
            case '/youtube-to-mp4':
            case '/mp4':
                return <YouTubeToMp4 />;
            case '/youtube-to-mp3':
            case '/mp3':
                return <YouTubeToMp3 />;
            default:
                return (
                    <>
                        <Hero />
                        <HowItWorks />
                        <Features />
                        <Faq />
                    </>
                );
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#07090e] text-zinc-100">
            <Toaster theme="dark" position="top-right" richColors closeButton />
            <Navbar />
            <main className="flex-1">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <RouterProvider>
            <MainContent />
        </RouterProvider>
    );
}
