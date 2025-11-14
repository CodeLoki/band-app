import clsx from 'clsx';
import { collection, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback } from 'react';
import { LuAudioLines, LuChevronDown, LuFileMusic, LuHouse } from 'react-icons/lu';
import { Outlet, ScrollRestoration, useLoaderData, useNavigate } from 'react-router-dom';
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

export async function clientLoader({ request }: { request: Request }) {
    const url = new URL(request.url),
        b = url.searchParams.get('b') ?? 'qRphnEOTg8GeDc0dQa4K',
        u = url.searchParams.get('u') as User | null;

    const bandsSnapshot = await getDocs(collection(db, 'bands').withConverter(bandConverter)),
        bands = bandsSnapshot.docs,
        band = bands.find((band) => band.id === b);

    if (!band) {
        throw new Error(`Band not found "${b}"`);
    }

    let user = User.None;
    if (u && Object.values(User).includes(u)) {
        user = u;
    }

    return { band, bands, user };
}

export default function Root() {
    const appData = useLoaderData() as Awaited<ReturnType<typeof clientLoader>>;

    return (
        <ToastProvider>
            <ErrorProvider>
                <NavigationProvider>
                    <NavbarProvider>
                        <FirestoreProvider band={appData.band} bands={appData.bands} userCode={appData.user}>
                            <ActionModeProvider>
                                <title>{appData.band.get('description')}</title>
                                <div className="text-base-content bg-base-200 min-h-screen">
                                    <NavbarContent />
                                    <Outlet />
                                    <Toasts />
                                </div>
                                <ScrollRestoration />
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
        cssBandName = 'btn btn-neutral text-lg',
        { description } = band.data();

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
