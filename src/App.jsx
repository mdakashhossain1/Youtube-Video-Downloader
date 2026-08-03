import { ToastProvider } from './lib/toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function App() {
    return (
        <ToastProvider>
            <Navbar />
            <main>
                <Hero />
                <HowItWorks />
                <Features />
                <Faq />
            </main>
            <Footer />
        </ToastProvider>
    );
}
