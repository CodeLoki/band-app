import { createBrowserRouter } from 'react-router';
import Root, { HydrateFallback, ErrorBoundary as RootErrorBoundary, clientLoader as rootLoader } from './root';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <RootErrorBoundary />,
        hydrateFallbackElement: <HydrateFallback />,
        loader: rootLoader,
        children: [
            {
                index: true,
                lazy: async () => {
                    const { default: Component, clientLoader } = await import('./routes/home');
                    return { Component, loader: clientLoader };
                }
            },
            {
                path: 'songs',
                lazy: async () => {
                    const { default: Component, clientLoader } = await import('./routes/songs');
                    return { Component, loader: clientLoader };
                }
            },
            {
                path: 'edit-song/:songId',
                lazy: async () => {
                    const { default: Component, clientLoader } = await import('./routes/edit-song');
                    return { Component, loader: clientLoader };
                }
            },
            {
                path: 'rehearse/:songId',
                lazy: async () => {
                    const { default: Component, clientLoader } = await import('./routes/rehearse-song');
                    return { Component, loader: clientLoader };
                }
            },
            {
                path: 'gig/:gigId',
                lazy: async () => {
                    const { default: Component, clientLoader } = await import('./routes/gig');
                    return { Component, loader: clientLoader };
                }
            },
            {
                path: 'edit-gig/:gigId',
                lazy: async () => {
                    const { default: Component, clientLoader } = await import('./routes/edit-gig');
                    return { Component, loader: clientLoader };
                }
            },
            {
                path: '*',
                lazy: async () => {
                    const { default: Component } = await import('./routes/404');
                    return { Component };
                }
            }
        ]
    }
]);

export default router;
