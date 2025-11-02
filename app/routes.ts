import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
    index('routes/home.tsx'),
    route('gig/:gigId', 'routes/gig.tsx'),
    route('songs', 'routes/songs.tsx'),
    route('edit-song/:songId', 'routes/edit-song.tsx'),
    route('edit-gig/:gigId', 'routes/edit-gig.tsx'),
    route('rehearse/:songId', 'routes/rehearse-song.tsx'),
    route('*', 'routes/404.tsx')
] satisfies RouteConfig;
