import { siteConfig } from '../config/site';
import { Link, useRouter } from '../context/RouterContext';

export default function Navbar() {
    const { currentPath, navigate } = useRouter();

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0B0D14]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                {/* Brand Logo & Name */}
                <Link
                    href="/"
                    className="flex items-center gap-3 text-base font-bold tracking-tight hover:opacity-90 transition-opacity"
                >
                    <img
                        src={siteConfig.favicon}
                        alt={`${siteConfig.name} logo`}
                        className="size-8.5 rounded-xl shadow-md shadow-primary/25"
                    />
                    <span className="text-xl font-black tracking-tight font-heading">
                        YT<span className="text-primary">Saver</span>
                    </span>
                </Link>

                {/* Clean Nav Links */}
                <nav className="flex items-center gap-6 sm:gap-7 text-xs sm:text-sm font-semibold text-zinc-400">
                    <button
                        onClick={() => {
                            if (currentPath !== '/') {
                                navigate('/');
                                setTimeout(() => {
                                    document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            } else {
                                document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="hover:text-white transition-colors"
                    >
                        How it works
                    </button>
                    <button
                        onClick={() => {
                            if (currentPath !== '/') {
                                navigate('/');
                                setTimeout(() => {
                                    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            } else {
                                document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="hover:text-white transition-colors"
                    >
                        Features
                    </button>
                    <Link
                        href="/youtube-to-mp4"
                        className={`transition-colors hidden md:inline-block ${currentPath === '/youtube-to-mp4' ? 'text-primary' : 'hover:text-white'}`}
                    >
                        MP4
                    </Link>
                    <Link
                        href="/youtube-to-mp3"
                        className={`transition-colors hidden md:inline-block ${currentPath === '/youtube-to-mp3' ? 'text-primary' : 'hover:text-white'}`}
                    >
                        MP3
                    </Link>
                    <Link
                        href="/contact"
                        className={`transition-colors ${currentPath === '/contact' ? 'text-primary' : 'hover:text-white'}`}
                    >
                        Contact
                    </Link>
                </nav>
            </div>
        </header>
    );
}
