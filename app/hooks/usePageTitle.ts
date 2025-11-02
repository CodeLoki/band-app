import { useEffect } from 'react';
import { useFirestore } from '@/contexts/Firestore';

interface UsePageTitleOptions {
    /** The page-specific title to show before the band name */
    pageTitle: string;
}

/**
 * Custom hook to manage page titles by prepending the given title to the band name
 * @param options Configuration options for the page title
 * @example
 * // If band name is "My Band":
 * usePageTitle({ pageTitle: 'Home' }); // Sets title to "Home | My Band"
 */
export function usePageTitle({ pageTitle }: UsePageTitleOptions) {
    const { band } = useFirestore();

    useEffect(() => {
        const bandName = band.get('description');
        if (!bandName) return;

        document.title = `${pageTitle} | ${bandName}`;
    }, [band, pageTitle]);
}
