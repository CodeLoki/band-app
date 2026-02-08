import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type React from 'react';
import { useCallback } from 'react';
import { LuAudioLines, LuHouse, LuLogIn } from 'react-icons/lu';
import { href, Outlet, ScrollRestoration, useLoaderData, useLocation, useNavigate, useNavigation } from 'react-router';
import Loading from '@/components/Loading';
import NavBarLink from '@/components/NavBarLink';
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
import { type AppData, loadAppData } from '@/loaders/appData';

import './tailwind.css';

export { default as ErrorBoundary } from '@/components/ErrorBoundary';

export function HydrateFallback() {
    return <Loading debounceMs={0} fullScreen={false} />;
}

export async function clientLoader({ request }: { request: Request }) {
    return loadAppData(request);
}

export default function Root() {
    const appData = useLoaderData<AppData>(),
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
                                <main className="text-base-content bg-base-100 min-h-screen">
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

function GoHomeButton() {
    return (
        <NavLink
            to={href('/')}
            title="Go Home"
            className="btn btn-square btn-sm btn-soft btn-accent border border-neutral-content/30"
        >
            <LuHouse className="size-4" />
            <span className="sr-only">Go Home</span>
        </NavLink>
    );
}

function LoginButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className="btn btn-square btn-sm btn-soft btn-accent border border-neutral-content/30"
            data-testid="btn-login"
            title="Login"
            {...props}
        >
            <LuLogIn className="size-4" />
            <span className="sr-only">Login</span>
        </button>
    );
}

function LeftNav({ band, bands }: { band: QueryDocumentSnapshot<Band>; bands: QueryDocumentSnapshot<Band>[] }) {
    const { isMe, canEdit, user } = useFirestore(),
        navigate = useNavigate(),
        { pathname } = useLocation(),
        isOnHomeRoute = pathname === '/',
        cssBandName = 'text-md flex items-center gap-2',
        { description } = band.data();

    const updateBand = useCallback(
        (b: QueryDocumentSnapshot<Band>, u: User, event: React.MouseEvent) => {
            // Close the details element
            const details = (event.currentTarget as HTMLElement).closest('details');
            if (details) {
                details.removeAttribute('open');
            }

            void navigate(`/?b=${b.id}&u=${u}`);
        },
        [navigate]
    );

    if (!isMe || !canEdit) {
        if (isOnHomeRoute) {
            return null;
        }

        return (
            <>
                <GoHomeButton />
                <h1 className={cssBandName} data-testid="band-name">
                    {description}
                </h1>
            </>
        );
    }

    return (
        <>
            {isOnHomeRoute ? null : <GoHomeButton />}

            <ul className="menu menu-horizontal p-0">
                <li>
                    <details>
                        <summary>{description}</summary>
                        <ul className="bg-neutral rounded-sm w-52 p-0 shadow z-10">
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
                    </details>
                </li>
            </ul>
        </>
    );
}

function NavbarContent({ band, bands }: { band: QueryDocumentSnapshot<Band>; bands: QueryDocumentSnapshot<Band>[] }) {
    const { isMe, canEdit, login } = useFirestore(),
        { navbarContent } = useNavbar(),
        location = useLocation(),
        isOnSongsRoute = location.pathname === '/songs',
        showLogin = isMe && !canEdit;

    const controls: React.ReactNode[] = [];

    if (navbarContent) {
        controls.push(
            <div key="navbarContent" className="flex flex-none">
                {navbarContent}
            </div>
        );
    }

    if (!isOnSongsRoute || showLogin) {
        if (controls.length) {
            controls.push(
                <div
                    key="divider"
                    className="divider divider-horizontal divider-accent/80 m-0 md:m-1 h-6 self-center"
                ></div>
            );
        }

        if (!isOnSongsRoute) {
            controls.push(<NavBarLink key="songs" icon={<LuAudioLines />} text="Songs" to={href('/songs')} />);
        }

        if (showLogin) {
            controls.push(<LoginButton key="login" onClick={login} />);
        }
    }

    return (
        <div className="navbar sticky top-0 z-50 bg-neutral text-neutral-content shadow-xl items-center gap-1 px-3 py-1 min-h-auto">
            <div className="flex-1 flex items-center gap-2">
                <LeftNav band={band} bands={bands} />
            </div>

            {controls.map((control) => control)}
        </div>
    );
}
