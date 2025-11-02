import { useCallback } from 'react';
import { useError } from '@/contexts/ErrorContext';
import { useToastHelpers } from './useToastHelpers';

export function useErrorHandler() {
    const { logError } = useError();
    const { showError, showSuccess, showWarning, showInfo } = useToastHelpers();

    const handleError = useCallback(
        (
            error: unknown,
            message: string,
            options?: {
                source?: string;
                showToast?: boolean;
                action?: { label: string; onClick: () => void };
            }
        ) => {
            const details = error instanceof Error ? error.message : String(error);

            // Always log the error for tracking
            logError(message, {
                details,
                source: options?.source
            });

            // Optionally show toast notification (default: true)
            if (options?.showToast !== false) {
                showError(message, {
                    details,
                    action: options?.action
                });
            }
        },
        [logError, showError]
    );

    const handleSuccess = useCallback(
        (message: string, details?: string) => {
            showSuccess(message, { details });
        },
        [showSuccess]
    );

    const handleWarning = useCallback(
        (message: string, details?: string) => {
            showWarning(message, { details });
        },
        [showWarning]
    );

    const handleInfo = useCallback(
        (message: string, details?: string) => {
            showInfo(message, { details });
        },
        [showInfo]
    );

    return {
        handleError,
        handleSuccess,
        handleWarning,
        handleInfo
    };
}
