import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function App() {
    return (
        <div className="flex min-h-screen flex-col">
            <Toaster theme="dark" position="top-right" richColors closeButton />
            <Navbar />
            <main className="flex-1">
                <Hero />
                <HowItWorks />
                <Features />
                <Faq />
            </main>
            <Footer />
        </div>
    );
}
