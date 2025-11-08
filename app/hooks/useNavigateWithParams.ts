import { useCallback, useRef } from 'react';
import { type NavigateOptions, useNavigate, useSearchParams } from 'react-router-dom';
import { addQueryParamsToUrl } from '@/components/NavLink';

/**
 * Custom hook that provides navigation functions with automatic query parameter preservation.
 */
export function useNavigateWithParams() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Debug: Track if searchParams reference changes
    const searchParamsRef = useRef(searchParams);
    const navigateRef = useRef(navigate);

    if (searchParamsRef.current !== searchParams) {
        console.log('🔄 searchParams changed:', searchParams.toString());
        searchParamsRef.current = searchParams;
    }

    if (navigateRef.current !== navigate) {
        console.log('🔄 navigate function changed');
        navigateRef.current = navigate;
    }

    const navigateWithParams = useCallback(
        (to: string, options?: NavigateOptions & { preserveSearch?: boolean }) => {
            const { preserveSearch = true, ...navigateOptions } = options || {};

            if (!preserveSearch) {
                void navigate(to, navigateOptions);
                return;
            }

            // Use current searchParams instead of the captured one
            const currentSearchParams = new URLSearchParams(window.location.search);
            const toWithParams = addQueryParamsToUrl(to, currentSearchParams);
            void navigate(toWithParams, navigateOptions);
        },
        [navigate] // Only depend on navigate
    );

    return { navigate: navigateWithParams };
}
