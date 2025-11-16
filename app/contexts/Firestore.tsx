import {
    browserSessionPersistence,
    type User as FirebaseUser,
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithPopup
} from 'firebase/auth';
import { createContext, useCallback, useContext, useState } from 'react';
import app from '@/config/firebase';
import { User } from '@/firestore/songs';
import { useToastHelpers } from '@/hooks/useToastHelpers';
import { useError } from './ErrorContext';

interface FirestoreContextType {
    user: User;
    isMe: boolean;
    canEdit: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType>({
    user: User.None,
    canEdit: false,
    isMe: false,
    login: async () => {
        throw new Error('login function not implemented');
    },
    logout: async () => {
        throw new Error('logout function not implemented');
    }
});

interface FirestoreProviderProps {
    children: React.ReactNode;
    userCode: User;
}

export function FirestoreProvider({ children, userCode }: FirestoreProviderProps) {
    const [user, setUser] = useState<FirebaseUser | null>(null),
        [auth, setAuth] = useState<ReturnType<typeof getAuth> | null>(null),
        [canEdit, setCanEdit] = useState(false),
        { logError } = useError(),
        { showSuccess, showError } = useToastHelpers();

    const updateCanEdit = useCallback((user: FirebaseUser | null) => {
        const authorizedUser = import.meta.env.VITE_AUTHORIZED_USER as string | undefined;
        setCanEdit(user?.uid === authorizedUser);
    }, []);

    const login = useCallback(async () => {
        try {
            const a = getAuth(app);
            setAuth(a);

            if (a) {
                onAuthStateChanged(a, (user) => {
                    setUser(user);
                });

                await a.setPersistence(browserSessionPersistence);

                const result = await signInWithPopup(a, new GoogleAuthProvider());
                setUser(result.user);
                updateCanEdit(result.user);
                showSuccess('Successfully logged in!');
            }
        } catch (ex) {
            const errorMessage = ex instanceof Error ? ex.message : String(ex);
            logError('Authentication failed', {
                details: errorMessage,
                source: 'auth'
            });
            showError('Authentication failed', {
                details: errorMessage
            });
        }
    }, [updateCanEdit, showSuccess, logError, showError]);

    const logout = useCallback(async () => {
        try {
            await auth?.signOut();
            setUser(null);
            setAuth(null);
            updateCanEdit(user);
            showSuccess('Successfully logged out!');
        } catch (ex) {
            const errorMessage = ex instanceof Error ? ex.message : String(ex);
            logError('Logout failed', {
                details: errorMessage,
                source: 'auth'
            });
            showError('Logout failed', {
                details: errorMessage
            });
        }
    }, [auth, user, updateCanEdit, showSuccess, logError, showError]);

    return (
        <FirestoreContext.Provider
            value={{
                user: userCode,
                isMe: userCode === User.Me,
                canEdit,
                login,
                logout
            }}
        >
            {children}
        </FirestoreContext.Provider>
    );
}

export function useFirestore() {
    return useContext(FirestoreContext);
}
