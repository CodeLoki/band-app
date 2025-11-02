import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info' | 'success';
    timestamp: Date;
    details?: string;
    duration?: number; // in milliseconds, default 5000
    action?: {
        label: string;
        onClick: () => void;
    };
    persistent?: boolean; // if true, won't auto-dismiss
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
    hasToasts: boolean;
}

const ToastContext = createContext<ToastContextType>({
    toasts: [],
    addToast: () => {},
    removeToast: () => {},
    clearToasts: () => {},
    hasToasts: false
});

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(
        (toast: Omit<Toast, 'id' | 'timestamp'>) => {
            const newToast: Toast = {
                ...toast,
                id: crypto.randomUUID(),
                timestamp: new Date(),
                duration: toast.duration ?? 5000
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto-remove unless persistent
            if (!toast.persistent) {
                setTimeout(() => {
                    removeToast(newToast.id);
                }, newToast.duration);
            }
        },
        [removeToast]
    );

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider
            value={{
                toasts,
                addToast,
                removeToast,
                clearToasts,
                hasToasts: toasts.length > 0
            }}
        >
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
