import { createBrowserRouter } from 'react-router-dom';
import Root, { ErrorBoundary as RootErrorBoundary } from './root';
import NotFound from './routes/404';
import EditGig from './routes/edit-gig';
import EditSong from './routes/edit-song';
import Gig from './routes/gig';
import Home from './routes/home';
import RehearseSong from './routes/rehearse-song';
import Songs from './routes/songs';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <RootErrorBoundary />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: 'songs',
                element: <Songs />
            },
            {
                path: 'edit-song/:songId',
                element: <EditSong />
            },
            {
                path: 'rehearse-song/:songId',
                element: <RehearseSong />
            },
            {
                path: 'gig/:gigId',
                element: <Gig />
            },
            {
                path: 'edit-gig/:gigId',
                element: <EditGig />
            },
            {
                path: '*',
                element: <NotFound />
            }
        ]
    }
]);

export default router;
