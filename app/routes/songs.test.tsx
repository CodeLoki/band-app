import {
    createMockSong,
    mockFirestoreContext,
    mockSetNavbarContent,
    resetMockState,
    setupActionContextMock,
    setupFirebaseConfigMock,
    setupFirestoreContextMock,
    setupFirestoreMock,
    setupNavbarContextMock,
    setupNavigationContextMock
} from '@/test/mocks';

// Setup all mocks - must be before imports that use them
setupFirestoreMock();
setupFirebaseConfigMock();
setupFirestoreContextMock();
setupNavbarContextMock();
setupActionContextMock();
setupNavigationContextMock();

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import Songs from './songs';

describe('Songs route', () => {
    beforeEach(() => {
        resetMockState();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders songs when available', async () => {
        const songs = [
            createMockSong('song-1', 'Test Song', 'Test Artist'),
            createMockSong('song-2', 'Another Song', 'Another Artist')
        ];

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: songs,
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('Test Song')).toBeInTheDocument();
        });
        expect(screen.getByText('Another Song')).toBeInTheDocument();
    });

    it('renders empty message when no songs match filter', async () => {
        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: [],
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText(/no songs found/i)).toBeInTheDocument();
        });
    });

    it('renders filter buttons when isMe', async () => {
        mockFirestoreContext.isMe = true;

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: [],
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByRole('radio', { name: 'Orphans' })).toBeInTheDocument();
        });
        expect(screen.getByRole('radio', { name: 'Others' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Practice' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument();
    });

    it('hides filter buttons when not isMe', async () => {
        mockFirestoreContext.isMe = false;

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: [],
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText(/no songs found/i)).toBeInTheDocument();
        });
        expect(screen.queryByRole('radio', { name: 'All' })).not.toBeInTheDocument();
    });

    it('filters songs by band membership', async () => {
        const songs = [
            createMockSong('song-1', 'In Band Song', 'Artist', { inBand: true }),
            createMockSong('song-2', 'Not In Band', 'Artist', { inBand: false })
        ];

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: songs,
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs?filter=all'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            // Only songs in the band should show with 'all' filter
            expect(screen.getByText('In Band Song')).toBeInTheDocument();
        });
        expect(screen.queryByText('Not In Band')).not.toBeInTheDocument();
    });

    it('displays song count in heading', async () => {
        const songs = [createMockSong('song-1', 'Song 1', 'Artist'), createMockSong('song-2', 'Song 2', 'Artist')];

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: songs,
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('Songs (2)')).toBeInTheDocument();
        });
    });

    it('calls setNavbarContent with Add link when canEdit is true', async () => {
        mockFirestoreContext.canEdit = true;

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: [],
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(mockSetNavbarContent).toHaveBeenCalled();
        });

        // Verify the navbar content contains the Add link
        const navbarContent = mockSetNavbarContent.mock.calls[0][0];
        expect(navbarContent).not.toBeNull();
        expect(navbarContent.props.to).toBe('/edit-song/new');
    });

    it('does not set navbar content when canEdit is false', async () => {
        mockFirestoreContext.canEdit = false;

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: [],
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText(/no songs found/i)).toBeInTheDocument();
        });

        // Should only be called with null (cleanup)
        expect(mockSetNavbarContent).not.toHaveBeenCalledWith(expect.anything());
    });

    it('filters to show orphan songs (no band)', async () => {
        const songs = [
            createMockSong('song-1', 'Band Song', 'Artist', { inBand: true }),
            createMockSong('song-2', 'Orphan Song', 'Artist', { inBand: false, otherBand: false })
        ];

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: songs,
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs?filter=orphans'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('Orphan Song')).toBeInTheDocument();
        });
        expect(screen.queryByText('Band Song')).not.toBeInTheDocument();
    });

    it('filters to show songs from other bands', async () => {
        const songs = [
            createMockSong('song-1', 'My Band Song', 'Artist', { inBand: true }),
            createMockSong('song-2', 'Other Band Song', 'Artist', { inBand: false, otherBand: true })
        ];

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: songs,
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs?filter=others'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('Other Band Song')).toBeInTheDocument();
        });
        expect(screen.queryByText('My Band Song')).not.toBeInTheDocument();
    });

    it('filters to show practice songs', async () => {
        const songs = [
            createMockSong('song-1', 'Regular Song', 'Artist', { inBand: true }),
            createMockSong('song-2', 'Practice Song', 'Artist', { inBand: true, practice: true }),
            createMockSong('song-3', 'Orphan Practice', 'Artist', { practice: true })
        ];

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: songs,
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs?filter=practice'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('Practice Song')).toBeInTheDocument();
        });
        expect(screen.getByText('Orphan Practice')).toBeInTheDocument();
        expect(screen.queryByText('Regular Song')).not.toBeInTheDocument();
    });

    it('changes filter when clicking filter buttons', async () => {
        const user = userEvent.setup();
        const songs = [
            createMockSong('song-1', 'Band Song', 'Artist', { inBand: true }),
            createMockSong('song-2', 'Other Band Song', 'Artist', { inBand: false, otherBand: true }),
            createMockSong('song-3', 'Orphan Song', 'Artist', { inBand: false }),
            createMockSong('song-4', 'Practice Song', 'Artist', { inBand: true, practice: true })
        ];

        const router = createMemoryRouter(
            [
                {
                    path: '/songs',
                    element: <Songs />,
                    loader: () => ({
                        allSongs: songs,
                        bandId: 'band-1',
                        bandDescription: 'Test Band'
                    })
                }
            ],
            { initialEntries: ['/songs'] }
        );

        render(<RouterProvider router={router} />);

        // Default filter is 'All' - should show band songs
        await waitFor(() => {
            expect(screen.getByText('Band Song')).toBeInTheDocument();
        });
        expect(screen.getByText('Practice Song')).toBeInTheDocument();
        expect(screen.queryByText('Other Band Song')).not.toBeInTheDocument();
        expect(screen.queryByText('Orphan Song')).not.toBeInTheDocument();

        // Click 'Others' filter
        await user.click(screen.getByRole('radio', { name: 'Others' }));
        await waitFor(() => {
            expect(screen.getByText('Other Band Song')).toBeInTheDocument();
        });
        expect(screen.queryByText('Band Song')).not.toBeInTheDocument();

        // Click 'Orphans' filter
        await user.click(screen.getByRole('radio', { name: 'Orphans' }));
        await waitFor(() => {
            expect(screen.getByText('Orphan Song')).toBeInTheDocument();
        });
        expect(screen.queryByText('Other Band Song')).not.toBeInTheDocument();

        // Click 'Practice' filter
        await user.click(screen.getByRole('radio', { name: 'Practice' }));
        await waitFor(() => {
            expect(screen.getByText('Practice Song')).toBeInTheDocument();
        });
        expect(screen.queryByText('Orphan Song')).not.toBeInTheDocument();

        // Click 'All' filter to go back
        await user.click(screen.getByRole('radio', { name: 'All' }));
        await waitFor(() => {
            expect(screen.getByText('Band Song')).toBeInTheDocument();
        });
        expect(screen.getByText('Practice Song')).toBeInTheDocument();
    });
});
