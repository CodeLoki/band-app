import { useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';

export function useToastHelpers() {
    const { addToast } = useToast();

    const showSuccess = useCallback(
        (message: string, options?: { details?: string; duration?: number }) => {
            addToast({
                message,
                type: 'success',
                details: options?.details,
                duration: options?.duration
            });
        },
        [addToast]
    );

    const showError = useCallback(
        (
            message: string,
            options?: {
                details?: string;
                duration?: number;
                persistent?: boolean;
                action?: { label: string; onClick: () => void };
            }
        ) => {
            addToast({
                message,
                type: 'error',
                details: options?.details,
                duration: options?.duration,
                persistent: options?.persistent,
                action: options?.action
            });
        },
        [addToast]
    );

    const showWarning = useCallback(
        (message: string, options?: { details?: string; duration?: number }) => {
            addToast({
                message,
                type: 'warning',
                details: options?.details,
                duration: options?.duration
            });
        },
        [addToast]
    );

    const showInfo = useCallback(
        (message: string, options?: { details?: string; duration?: number }) => {
            addToast({
                message,
                type: 'info',
                details: options?.details,
                duration: options?.duration
            });
        },
        [addToast]
    );

    const showCustom = useCallback(
        (
            message: string,
            type: 'error' | 'warning' | 'info' | 'success',
            options?: {
                details?: string;
                duration?: number;
                persistent?: boolean;
                action?: { label: string; onClick: () => void };
            }
        ) => {
            addToast({
                message,
                type,
                details: options?.details,
                duration: options?.duration,
                persistent: options?.persistent,
                action: options?.action
            });
        },
        [addToast]
    );

    return {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showCustom
    };
}
