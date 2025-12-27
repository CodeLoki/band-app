import clsx from 'clsx';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback } from 'react';
import { LuAudioLines, LuChevronDown, LuHouse, LuListMusic } from 'react-icons/lu';
import { Outlet, ScrollRestoration, useLoaderData, useLocation, useNavigate, useNavigation } from 'react-router';
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
        cssBandName = 'text-md flex items-center gap-2',
        cssBandButton = `btn btn-neutral`,
        { description } = band.data(),
        Icon = <LuListMusic className="h-5 w-5 flex-none hidden md:block" />;

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
            <h1 className={clsx(cssBandName, 'pointer-events-none')} data-testid="band-name">
                {Icon}
                {description}
            </h1>
        );
    }

    if (canEdit) {
        return (
            <h1 className="dropdown dropdown-start">
                <button
                    className={clsx(cssBandName, cssBandButton, 'flex items-center gap-2')}
                    tabIndex={0}
                    type="button"
                    data-testid="band-name"
                >
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
        <button type="button" className={clsx(cssBandName, cssBandButton)} onClick={login} data-testid="band-name">
            {Icon}
            {description}
        </button>
    );
}

function NavbarContent({ band, bands }: { band: QueryDocumentSnapshot<Band>; bands: QueryDocumentSnapshot<Band>[] }) {
    const { navbarContent } = useNavbar(),
        location = useLocation(),
        buttons = new Map([
            ['/', { Icon: LuHouse, label: 'Home' }],
            ['/songs', { Icon: LuAudioLines, label: 'Songs' }]
        ]),
        currentPath = location.pathname.startsWith('/songs') ? '/songs' : '/',
        { Icon: CurrentIcon, label: currentLabel } = buttons.get(currentPath)!;

    return (
        <div className="navbar sticky top-0 z-50 bg-neutral text-neutral-content shadow-md items-center gap-1 px-3 py-1 min-h-auto">
            <div className="flex-1">
                <BandName band={band} bands={bands} />
            </div>

            {/* Dynamic content from routes */}
            {navbarContent && (
                <>
                    <div className="flex flex-none">{navbarContent}</div>
                    <div className="divider divider-horizontal divider-accent/80 m-1 h-8 self-center"></div>
                </>
            )}

            {/* Buttons show up on medium and larger screens  */}
            <div className="hidden md:flex gap-2 flex-none" data-testid="desktop-nav">
                {[...buttons.entries()].map(([to, { Icon, label }]) => (
                    <NavBarLink icon={<Icon />} text={label} to={to} key={to} />
                ))}
            </div>

            {/* Dropdown for small screens */}
            <div className="md:hidden dropdown dropdown-end">
                <button
                    type="button"
                    tabIndex={0}
                    className="btn btn-sm btn-soft btn-accent border border-neutral-content/30"
                >
                    <CurrentIcon />
                    {currentLabel}
                    <LuChevronDown />
                </button>
                <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm">
                    {[...buttons.entries()].map(([to, { Icon, label }]) => (
                        <li key={to}>
                            <NavLink to={to} onClick={(e) => e.currentTarget.blur()}>
                                <Icon />
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
