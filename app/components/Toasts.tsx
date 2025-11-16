import { useToast } from '@/contexts/ToastContext';

/**
 * Toast notification display component that renders all active toasts in a toast container.
 * This component should be placed once in your app layout (typically in root.tsx) and will
 * automatically display toasts created through the toast system.
 *
 * @example
 * // 1. Basic usage - Place in your root component
 * import Toasts from '@/components/Toasts';
 *
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <YourAppContent />
 *       <Toasts /> // Place at the end of your app
 *     </ToastProvider>
 *   );
 * }
 *
 * @example
 * // 2. Create toasts from anywhere in your app using toast helpers
 * import { useToastHelpers } from '@/hooks/useToastHelpers';
 *
 * function MyComponent() {
 *   const { showSuccess, showError, showWarning, showInfo } = useToastHelpers();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       showSuccess('Data saved successfully!');
 *     } catch (error) {
 *       showError('Failed to save data', {
 *         details: error.message,
 *         action: { label: 'Retry', onClick: handleSave }
 *       });
 *     }
 *   };
 * }
 *
 * @example
 * // 3. Create toasts with custom options using toast context
 * import { useToast } from '@/contexts/ToastContext';
 *
 * function MyComponent() {
 *   const { addToast } = useToast();
 *
 *   const showCustomToast = () => {
 *     addToast({
 *       message: 'Custom notification',
 *       type: 'info',
 *       details: 'This toast has custom settings',
 *       duration: 10000, // 10 seconds
 *       persistent: true, // Won't auto-dismiss
 *       action: {
 *         label: 'View Details',
 *         onClick: () => console.log('Action clicked')
 *       }
 *     });
 *   };
 * }
 *
 * @example
 * // 4. Error handling with structured logging
 * import { useErrorHandler } from '@/hooks/useErrorHandler';
 *
 * function MyComponent() {
 *   const { handleError } = useErrorHandler();
 *
 *   const riskyOperation = async () => {
 *     try {
 *       await apiCall();
 *     } catch (error) {
 *       handleError(error, 'Operation failed', {
 *         source: 'api',
 *         action: { label: 'Retry', onClick: riskyOperation }
 *       });
 *     }
 *   };
 * }
 *
 * @returns JSX element containing all active toast notifications, or null if no toasts
 */
export default function Toasts() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    function getStatusCss(toastType: string) {
        switch (toastType) {
            case 'error':
                return 'alert-error';
            case 'warning':
                return 'alert-warning';
            case 'success':
                return 'alert-success';
            default:
                return 'alert-info';
        }
    }

    return (
        <div className="toast toast-start z-50">
            {toasts.map((toast) => (
                <div key={toast.id} className={`alert shadow-lg ${getStatusCss(toast.type)}`}>
                    <div className="flex-1">
                        <div className="flex flex-col">
                            <span className="font-medium">{toast.message}</span>
                            {toast.details && <span className="text-sm opacity-70 mt-1">{toast.details}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {toast.action && (
                            <button type="button" className="btn btn-sm btn-ghost" onClick={toast.action.onClick}>
                                {toast.action.label}
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
