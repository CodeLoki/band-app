import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface LoadingProps {
    /**
     * Delay in milliseconds before showing the loading indicator.
     * Set to 0 to show immediately.
     *
     * @default 250
     */
    debounceMs?: number;
    /**
     * Whether to show as a full-screen overlay or in the content <area shape="" coords="" href="" alt="" className="" />
     * @default false
     */
    fullScreen?: boolean;
}

/**
 * A loading spinner component with optional debouncing.
 * Can be used as a HydrateFallback for React Router's clientLoader.
 *
 * @example
 * // Content-area with default debounce (250ms)
 * <Loading />
 *
 * @example
 * // As HydrateFallback - show immediately, full screen
 * export function HydrateFallback() {
 *   return <Loading debounceMs={0} fullScreen={true} />;
 * }
 */
export default function Loading({ debounceMs = 250, fullScreen = false }: LoadingProps) {
    const [show, setShow] = useState(debounceMs === 0);

    useEffect(() => {
        if (debounceMs === 0) {
            return;
        }

        const timer = setTimeout(() => {
            setShow(true);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [debounceMs]);

    if (!show) {
        return null;
    }

    const cssContainer = fullScreen ? 'fixed inset-0 bg-base-200 z-50' : 'min-h-[calc(100vh-8rem)]';

    return (
        <div className={clsx('flex items-center justify-center', cssContainer)}>
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary" />
        </div>
    );
}
