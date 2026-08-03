import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { IconCheck, IconInfo, IconX } from './icons';

const ToastContext = createContext(() => {});

export function useToast() {
    return useContext(ToastContext);
}

const ICONS = {
    success: IconCheck,
    error: IconX,
    info: IconInfo,
};

const TOAST_MS = 4200;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
        setTimeout(() => {
            setToasts((list) => list.filter((t) => t.id !== id));
        }, 260);
    }, []);

    const toast = useCallback(
        (message, type = 'info') => {
            const id = ++nextId.current;
            setToasts((list) => [...list, { id, message, type }]);
            setTimeout(() => dismiss(id), TOAST_MS);
        },
        [dismiss]
    );

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toasts" role="status" aria-live="polite">
                {toasts.map((t) => {
                    const Icon = ICONS[t.type] || ICONS.info;
                    return (
                        <div key={t.id} className={`toast ${t.type}${t.leaving ? ' leaving' : ''}`}>
                            <Icon />
                            <span>{t.message}</span>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
