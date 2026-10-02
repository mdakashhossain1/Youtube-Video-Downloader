import { createContext, useContext, useEffect, useState } from 'react';

const RouterContext = createContext({
    currentPath: '/',
    navigate: () => {},
});

export function RouterProvider({ children }) {
    const [currentPath, setCurrentPath] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.location.pathname || '/';
        }
        return '/';
    });

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPath(window.location.pathname || '/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (path) => {
        if (!path) return;
        if (path.startsWith('#')) {
            // Anchor scroll on current page
            const el = document.querySelector(path);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        if (path !== currentPath) {
            window.history.pushState(null, '', path);
            setCurrentPath(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <RouterContext.Provider value={{ currentPath, navigate }}>
            {children}
        </RouterContext.Provider>
    );
}

export function useRouter() {
    return useContext(RouterContext);
}

export function Link({ href, className = '', children, ...props }) {
    const { navigate } = useRouter();

    const handleClick = (e) => {
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
            return; // Normal external navigation
        }
        e.preventDefault();
        navigate(href);
    };

    return (
        <a href={href} onClick={handleClick} className={className} {...props}>
            {children}
        </a>
    );
}
