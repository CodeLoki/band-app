import { isRouteErrorResponse, useRouteError } from 'react-router';
import { useNavigate } from 'react-router-dom';

export default function ErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    // Don't depend on contexts that might be failing
    // Instead, check environment or URL params directly
    const isMe = new URLSearchParams(window.location.search).get('u') === 'z';

    // Helper function to navigate home while preserving query parameters
    const navigateHome = () => {
        const currentParams = new URLSearchParams(window.location.search);
        const homeUrl = currentParams.toString() ? `/?${currentParams.toString()}` : '/';
        void navigate(homeUrl);
    };

    if (isRouteErrorResponse(error)) {
        console.error(error.status, error.statusText);
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="card w-96 bg-error text-error-content shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">
                            {error.status} {error.statusText}
                        </h2>
                        <p>{error.data}</p>
                        <div className="card-actions justify-end">
                            <button type="button" className="btn btn-outline" onClick={navigateHome}>
                                Go Home
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => window.history.back()}>
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error instanceof Error) {
        console.error(error.message);
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="card w-96 bg-error text-error-content shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Application Error</h2>
                        <p>{error.message}</p>
                        {isMe ? (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm opacity-70">Stack trace</summary>
                                <pre className="text-xs mt-2 p-2 bg-base-200 text-base-content rounded overflow-auto">
                                    {error.stack}
                                </pre>
                            </details>
                        ) : null}
                        <div className="card-actions justify-end">
                            <button type="button" className="btn btn-outline" onClick={navigateHome}>
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100">
            <div className="card w-96 bg-error text-error-content shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Unknown Error</h2>
                    <p>Something went wrong</p>
                    <div className="card-actions justify-end">
                        <button type="button" className="btn btn-outline" onClick={navigateHome}>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
