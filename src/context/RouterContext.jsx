import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

const RouterContext = createContext({ currentPath: '/', navigate: () => {} });
const locationHref = () => window.location.pathname + window.location.search + window.location.hash;

export function RouterProvider({ children }) {
    const [href, setHref] = useState(locationHref);
    const currentPath = new URL(href, window.location.origin).pathname;
    useEffect(() => {
        const synchronize = () => setHref(locationHref());
        window.addEventListener('popstate', synchronize);
        window.addEventListener('hashchange', synchronize);
        return () => {
            window.removeEventListener('popstate', synchronize);
            window.removeEventListener('hashchange', synchronize);
        };
    }, []);
    useLayoutEffect(() => {
        const frame = requestAnimationFrame(() => {
            const hash = new URL(href, window.location.origin).hash;
            const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (target) target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
            else window.scrollTo({ top: 0, behavior: 'instant' });
        });
        return () => cancelAnimationFrame(frame);
    }, [href]);
    const navigate = path => {
        if (!path) return;
        const target = new URL(path, window.location.href);
        if (target.origin !== window.location.origin) { window.location.href = target.href; return; }
        const nextHref = target.pathname + target.search + target.hash;
        if (nextHref === locationHref()) {
            const element = target.hash ? document.getElementById(decodeURIComponent(target.hash.slice(1))) : null;
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (element) element.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
            else window.scrollTo({ top: 0, behavior: 'instant' });
            return;
        }
        window.history.pushState(null, '', nextHref);
        setHref(nextHref);
    };
    return <RouterContext.Provider value={{ currentPath, navigate }}>{children}</RouterContext.Provider>;
}
export function useRouter() { return useContext(RouterContext); }
export function Link({ href, className = '', children, onClick, ...props }) {
    const { navigate } = useRouter();
    const handleClick = event => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === '_blank' || props.download != null || /^(https?:|mailto:|tel:)/.test(href)) return;
        event.preventDefault();
        navigate(href);
    };
    return <a href={href} onClick={handleClick} className={className} {...props}>{children}</a>;
}
