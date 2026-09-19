import { createContext, useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { addBandPrefixToUrl } from '@/components/NavLink';

interface NavigationContextType {
    navigateWithParams: (path: string) => void;
    getCurrentParams: () => URLSearchParams;
    buildPathWithParams: (path: string) => string;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

interface NavigationProviderProps {
    children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const getCurrentParams = useCallback((): URLSearchParams => {
        return new URLSearchParams(window.location.search);
    }, []);

    const buildPathWithParams = useCallback(
        (path: string): string => {
            const currentParams = getCurrentParams();
            const searchString = currentParams.toString();
            const bandPath = addBandPrefixToUrl(path, pathname);
            return `${bandPath}${searchString ? `?${searchString}` : ''}`;
        },
        [getCurrentParams, pathname]
    );

    const navigateWithParams = useCallback(
        (path: string): void => {
            const fullPath = buildPathWithParams(path);
            void navigate(fullPath);
        },
        [navigate, buildPathWithParams]
    );

    return (
        <NavigationContext.Provider
            value={{
                navigateWithParams,
                getCurrentParams,
                buildPathWithParams
            }}
        >
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}
