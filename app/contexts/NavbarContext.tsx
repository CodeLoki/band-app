import { createContext, useCallback, useContext, useState } from 'react';

interface NavbarContextType {
    navbarContent: React.ReactNode;
    setNavbarContent: (content: React.ReactNode) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: React.ReactNode }) {
    const [navbarContent, setNavbarContentState] = useState<React.ReactNode>(null);

    const setNavbarContent = useCallback((content: React.ReactNode) => {
        setNavbarContentState(content);
    }, []);

    return <NavbarContext.Provider value={{ navbarContent, setNavbarContent }}>{children}</NavbarContext.Provider>;
}

export function useNavbar() {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbar must be used within NavbarProvider');
    }
    return context;
}
