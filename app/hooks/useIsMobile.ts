import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if the viewport is mobile-sized.
 * Uses matchMedia API for efficient viewport matching.
 *
 * @param breakpoint - Maximum width in pixels to consider as mobile (default: 768)
 * @returns boolean indicating if viewport is at or below the breakpoint
 *
 * @example
 * const isMobile = useIsMobile(); // defaults to 768px
 * const isSmall = useIsMobile(640); // custom breakpoint
 */
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

        // Set initial value
        setIsMobile(mediaQuery.matches);

        // Listen for changes
        const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [breakpoint]);

    return isMobile;
}
