import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

export interface AppError {
    id: string;
    message: string;
    timestamp: Date;
    details?: string;
    source?: string; // where the error came from (e.g., "firestore", "auth", etc.)
}

interface ErrorContextType {
    errors: AppError[];
    logError: (
        message: string,
        options?: {
            details?: string;
            source?: string;
        }
    ) => void;
    clearErrors: () => void;
    hasErrors: boolean;
}

const ErrorContext = createContext<ErrorContextType>({
    errors: [],
    logError: () => {},
    clearErrors: () => {},
    hasErrors: false
});

interface ErrorProviderProps {
    children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
    const [errors, setErrors] = useState<AppError[]>([]);

    const logError = useCallback(
        (
            message: string,
            options?: {
                details?: string;
                source?: string;
            }
        ) => {
            const newError: AppError = {
                id: crypto.randomUUID(),
                message,
                timestamp: new Date(),
                details: options?.details,
                source: options?.source
            };

            // Log error for debugging/tracking
            setErrors((prev) => [...prev, newError]);

            // Console log for development
            console.error(`[${options?.source || 'App'}] ${message}`, {
                details: options?.details,
                timestamp: newError.timestamp
            });
        },
        []
    );

    const clearErrors = useCallback(() => {
        setErrors([]);
    }, []);

    return (
        <ErrorContext.Provider
            value={{
                errors,
                logError,
                clearErrors,
                hasErrors: errors.length > 0
            }}
        >
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
}
