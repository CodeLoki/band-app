import clsx from 'clsx';
import { collection, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { LuAudioLines, LuChevronDown, LuFileMusic, LuHouse } from 'react-icons/lu';
import { Outlet, useNavigate } from 'react-router-dom';
import { type Band, bandConverter } from '@/firestore/bands';
import NavLink from './components/NavLink';
import Toasts from './components/Toasts';
import { db } from './config/firebase';
import { ActionModeProvider } from './contexts/ActionContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { FirestoreProvider, useFirestore } from './contexts/Firestore';
import { NavbarProvider, useNavbar } from './contexts/NavbarContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ToastProvider } from './contexts/ToastContext';
import { User } from './firestore/songs';

import './tailwind.css';

export { default as ErrorBoundary } from './components/ErrorBoundary';

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
);

export default function Root() {
    const [appData, setAppData] = useState<{
        band: QueryDocumentSnapshot<Band>;
        bands: QueryDocumentSnapshot<Band>[];
        user: User;
    } | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            const url = new URL(window.location.href);
            const defaultBandId = 'qRphnEOTg8GeDc0dQa4K';
            const b = url.searchParams.get('b') ?? defaultBandId;
            const u = url.searchParams.get('u') as User | null;

            const bandsSnapshot = await getDocs(collection(db, 'bands').withConverter(bandConverter));
            const bands = bandsSnapshot.docs;
            const band = bands.find((band) => band.id === b);

            if (!band) {
                throw new Error(`Band not found "${b}"`);
            }

            // Parse and validate user param, default to User.None
            let user: User = User.None;
            if (u && Object.values(User).includes(u)) {
                user = u;
            }

            setAppData({ band, bands, user });
        };

        initializeApp().catch(console.error);
    }, []);

    useEffect(() => {
        if (appData?.band) {
            const bandName = appData.band.get('description');
            if (bandName) {
                document.title = bandName;
            }
        }
    }, [appData?.band]);

    if (!appData) {
        return <LoadingScreen />;
    }

    return (
        <ToastProvider>
            <ErrorProvider>
                <NavigationProvider>
                    <NavbarProvider>
                        <FirestoreProvider band={appData.band} bands={appData.bands} userCode={appData.user}>
                            <ActionModeProvider>
                                <div className="text-base-content bg-base-200 min-h-screen">
                                    <NavbarContent />
                                    <Outlet />
                                    <Toasts />
                                </div>
                            </ActionModeProvider>
                        </FirestoreProvider>
                    </NavbarProvider>
                </NavigationProvider>
            </ErrorProvider>
        </ToastProvider>
    );
}

function BandName() {
    const { isMe, canEdit, login, user, band, bands } = useFirestore(),
        navigate = useNavigate(),
        cssBandName = 'btn btn-ghost text-lg',
        { description } = band.data();

    const updateBand = useCallback(
        (b: QueryDocumentSnapshot<Band>, u: User, event: React.MouseEvent) => {
            // Remove focus from the clicked element to close the dropdown
            (event.currentTarget as HTMLElement).blur();

            navigate(`/?b=${b.id}&u=${u}`);
        },
        [navigate]
    );

    if (!isMe) {
        return (
            <h1 className={clsx(cssBandName, 'pointer-events-none')}>
                <LuFileMusic className="h-6 w-6 flex-none" />
                {description}
            </h1>
        );
    }

    if (canEdit) {
        return (
            <h1 className="dropdown dropdown-start">
                <button className={clsx(cssBandName, 'flex items-center gap-2')} tabIndex={0} type="button">
                    <LuFileMusic className="h-6 w-6 flex-none" />
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
            <LuFileMusic className="h-6 w-6 flex-none" />

            {description}
        </button>
    );
}

function NavbarContent() {
    const { navbarContent } = useNavbar();

    return (
        <div className="navbar sticky top-0 z-50 bg-neutral shadow-md items-center gap-1 py-0 min-h-auto">
            <div className="flex-1">
                <BandName />
            </div>

            {/* Dynamic content from routes */}
            {navbarContent && (
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
