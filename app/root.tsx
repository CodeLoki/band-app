import clsx from 'clsx';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback } from 'react';
import { LuAudioLines, LuChevronDown, LuFileMusic, LuHouse } from 'react-icons/lu';
import { useNavigation } from 'react-router';
import { Outlet, ScrollRestoration, useLoaderData, useNavigate } from 'react-router-dom';
import Loading from '@/components/Loading';
import NavLink from '@/components/NavLink';
import Toasts from '@/components/Toasts';
import { ActionModeProvider } from '@/contexts/ActionContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { FirestoreProvider, useFirestore } from '@/contexts/Firestore';
import { NavbarProvider, useNavbar } from '@/contexts/NavbarContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { ToastProvider } from '@/contexts/ToastContext';
import type { Band } from '@/firestore/bands';
import type { User } from '@/firestore/songs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { loadAppData } from '@/loaders/appData';

import './tailwind.css';

export { default as ErrorBoundary } from '@/components/ErrorBoundary';

export function HydrateFallback() {
    return <Loading debounceMs={0} fullScreen={false} />;
}

export async function clientLoader({ request }: { request: Request }) {
    return loadAppData(request);
}

export default function Root() {
    const appData = useLoaderData() as Awaited<ReturnType<typeof clientLoader>>,
        navigation = useNavigation(),
        isNavigating = navigation.state === 'loading';

    return (
        <ToastProvider>
            <ErrorProvider>
                <NavigationProvider>
                    <NavbarProvider>
                        <FirestoreProvider userCode={appData.user}>
                            <ActionModeProvider>
                                <title>{appData.band.get('description')}</title>
                                <main className="text-base-content bg-base-200 min-h-screen">
                                    <NavbarContent band={appData.band} bands={appData.bands} />
                                    {isNavigating ? <Loading /> : <Outlet />}
                                    <Toasts />
                                </main>
                                <ScrollRestoration />
                            </ActionModeProvider>
                        </FirestoreProvider>
                    </NavbarProvider>
                </NavigationProvider>
            </ErrorProvider>
        </ToastProvider>
    );
}

function BandName({ band, bands }: { band: QueryDocumentSnapshot<Band>; bands: QueryDocumentSnapshot<Band>[] }) {
    const { isMe, canEdit, login, user } = useFirestore(),
        navigate = useNavigate(),
        isMobile = useIsMobile(),
        cssBandName = 'btn btn-neutral text-lg',
        { description } = band.data(),
        Icon = !isMobile ? <LuFileMusic className="h-6 w-6 flex-none" /> : null;

    const updateBand = useCallback(
        (b: QueryDocumentSnapshot<Band>, u: User, event: React.MouseEvent) => {
            // Remove focus from the clicked element to close the dropdown
            (event.currentTarget as HTMLElement).blur();

            void navigate(`/?b=${b.id}&u=${u}`);
        },
        [navigate]
    );

    if (!isMe) {
        return (
            <h1 className={clsx(cssBandName, 'pointer-events-none')}>
                {Icon}
                {description}
            </h1>
        );
    }

    if (canEdit) {
        return (
            <h1 className="dropdown dropdown-start">
                <button className={clsx(cssBandName, 'flex items-center gap-2')} tabIndex={0} type="button">
                    {Icon}
                    <span>{description}</span>
                    <LuChevronDown className="w-4 h-4 opacity-70" />
                </button>
                <ul tabIndex={-1} className="dropdown-content menu bg-neutral rounded-b-md w-52 p-2 shadow z-10">
                    {bands.map((b) => {
                        const { description } = b.data();
                        return (
                            <li key={b.id}>
                                <button type="button" onClick={(event) => updateBand(b, user, event)}>
                                    {description}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </h1>
        );
    }

    return (
        <button type="button" className={cssBandName} onClick={login}>
            {Icon}
            {description}
        </button>
    );
}

function NavbarContent({ band, bands }: { band: QueryDocumentSnapshot<Band>; bands: QueryDocumentSnapshot<Band>[] }) {
    const { navbarContent } = useNavbar(),
        isMobile = useIsMobile();

    return (
        <div className="navbar sticky top-0 z-50 bg-neutral shadow-md items-center gap-1 py-0 min-h-auto">
            <div className="flex-1">
                <BandName band={band} bands={bands} />
            </div>

            {/* Dynamic content from routes */}
            {navbarContent && !isMobile && (
                <>
                    <div className="flex flex-none">{navbarContent}</div>
                    <div className="divider divider-horizontal m-1 h-8 self-center"></div>
                </>
            )}

            <div className="flex-none flex gap-1">
                <NavLink to="/" className="btn btn-neutral btn-sm">
                    <LuHouse />
                    Home
                </NavLink>
                <NavLink to="/songs" className="btn btn-neutral btn-sm">
                    <LuAudioLines />
                    Songs
                </NavLink>
            </div>
        </div>
    );
}
