import { createBrowserRouter } from 'react-router-dom';
import Root, { ErrorBoundary as RootErrorBoundary, clientLoader as rootLoader } from './root';
import NotFound from './routes/404';
import EditGig, { clientLoader as editGigLoader } from './routes/edit-gig';
import EditSong, { clientLoader as editSongLoader } from './routes/edit-song';
import Gig, { clientLoader as gigLoader } from './routes/gig';
import Home, { clientLoader as homeLoader } from './routes/home';
import RehearseSong, { clientLoader as rehearseSongLoader } from './routes/rehearse-song';
import Songs, { clientLoader as songsLoader } from './routes/songs';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <RootErrorBoundary />,
        loader: rootLoader,
        children: [
            {
                index: true,
                element: <Home />,
                loader: homeLoader
            },
            {
                path: 'songs',
                element: <Songs />,
                loader: songsLoader
            },
            {
                path: 'edit-song/:songId',
                element: <EditSong />,
                loader: editSongLoader
            },
            {
                path: 'rehearse/:songId',
                element: <RehearseSong />,
                loader: rehearseSongLoader
            },
            {
                path: 'gig/:gigId',
                element: <Gig />,
                loader: gigLoader
            },
            {
                path: 'edit-gig/:gigId',
                element: <EditGig />,
                loader: editGigLoader
            },
            {
                path: '*',
                element: <NotFound />
            }
        ]
    }
]);

export default router;
