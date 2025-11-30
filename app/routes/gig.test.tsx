import { vi } from 'vitest';
import {
    createMockBand,
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

// Setup shared mocks - must be before imports that use them
setupFirestoreMock();
setupFirebaseConfigMock();
setupFirestoreContextMock();
setupNavbarContextMock();
setupActionContextMock();
setupNavigationContextMock();

// Mock jsPDF - use vi.hoisted to create mock functions that can be used in vi.mock
const { mockPdfMethods, MockJsPDF } = vi.hoisted(() => {
    const mockPdfMethods = {
        setFont: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
        addPage: vi.fn()
    };

    // Mock class constructor that returns the mock methods
    class MockJsPDF {
        setFont = mockPdfMethods.setFont;
        text = mockPdfMethods.text;
        save = mockPdfMethods.save;
        addPage = mockPdfMethods.addPage;
    }

    return { mockPdfMethods, MockJsPDF };
});

vi.mock('jspdf', () => ({
    jsPDF: MockJsPDF
}));

// Additional mocks specific to gig route
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@/hooks/useToastHelpers', () => ({
    useToastHelpers: () => ({
        showSuccess: mockShowSuccess,
        showError: mockShowError
    })
}));

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Gig } from '@/firestore/gigs';
import type { Song } from '@/firestore/songs';

import GigRoute from './gig';

// Helper to create mock gig document (gig-specific, not shared)
function createMockGig(
    id: string,
    venue: string,
    date: Date,
    options: { one?: DocumentSnapshot<Song>[]; two?: DocumentSnapshot<Song>[]; pocket?: DocumentSnapshot<Song>[] } = {}
): DocumentSnapshot<Gig> {
    const { one = [], two = [], pocket = [] } = options;

    const mockTimestamp = {
        toDate: () => date
    } as Timestamp;

    return {
        id,
        exists: () => true,
        data: () => ({
            venue,
            date: mockTimestamp,
            band: { id: 'band-1' },
            one: one.map((s) => ({ id: s.id })),
            two: two.map((s) => ({ id: s.id })),
            pocket: pocket.map((s) => ({ id: s.id }))
        }),
        get: (field: string) => {
            if (field === 'venue') return venue;
            if (field === 'date') return mockTimestamp;
            return undefined;
        },
        ref: { id }
    } as unknown as DocumentSnapshot<Gig>;
}

// Use shared mockBand
const mockBand = createMockBand();

describe('Gig route', () => {
    beforeEach(() => {
        resetMockState();
        mockShowSuccess.mockClear();
        mockShowError.mockClear();
        mockPdfMethods.setFont.mockClear();
        mockPdfMethods.text.mockClear();
        mockPdfMethods.save.mockClear();
        mockPdfMethods.addPage.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders gig venue and date', async () => {
        const songs = {
            one: [createMockSong('song-1', 'Opening Song')],
            two: [],
            pocket: []
        };

        const gig = createMockGig('gig-1', 'The Jazz Club', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText(/The Jazz Club/)).toBeInTheDocument();
        });
        // Date should be formatted (Dec 15, 2025 or similar)
        expect(screen.getByText(/Dec.*2025|2025.*Dec/i)).toBeInTheDocument();
    });

    it('renders songs in set one', async () => {
        const songs = {
            one: [createMockSong('song-1', 'First Song'), createMockSong('song-2', 'Second Song')],
            two: [],
            pocket: []
        };

        const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('First Song')).toBeInTheDocument();
        });
        expect(screen.getByText('Second Song')).toBeInTheDocument();
    });

    it('renders single set layout when set two is empty', async () => {
        const songs = {
            one: [createMockSong('song-1', 'Only Set Song')],
            two: [],
            pocket: []
        };

        const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            // Single set heading includes duration
            expect(screen.getByRole('heading', { name: /Single Set \(\d+ minutes?\)/ })).toBeInTheDocument();
        });
        expect(screen.getByText('Only Set Song')).toBeInTheDocument();
    });

    it('renders two sets layout when both sets have songs', async () => {
        const songs = {
            one: [createMockSong('song-1', 'Set One Song')],
            two: [createMockSong('song-2', 'Set Two Song')],
            pocket: []
        };

        const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            // Set headings include duration, e.g. "Set One (3 minutes)"
            expect(screen.getByRole('heading', { name: /Set One \(\d+ minutes?\)/ })).toBeInTheDocument();
        });
        expect(screen.getByRole('heading', { name: /Set Two \(\d+ minutes?\)/ })).toBeInTheDocument();
        expect(screen.getByText('Set One Song')).toBeInTheDocument();
        expect(screen.getByText('Set Two Song')).toBeInTheDocument();
    });

    it('renders pocket songs', async () => {
        const songs = {
            one: [createMockSong('song-1', 'Main Song')],
            two: [createMockSong('song-2', 'Second Set Song')],
            pocket: [createMockSong('song-3', 'Backup Song')]
        };

        const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            // Pocket heading includes duration
            expect(screen.getByRole('heading', { name: /Pocket \(\d+ minutes?\)/ })).toBeInTheDocument();
        });
        expect(screen.getByText('Backup Song')).toBeInTheDocument();
    });

    it('shows empty set message when set has no songs', async () => {
        const songs = {
            one: [],
            two: [createMockSong('song-1', 'Set Two Song')],
            pocket: []
        };

        const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            // Multiple empty sets may show this message
            expect(screen.getAllByText('No songs in this set.').length).toBeGreaterThan(0);
        });
    });

    it('sets navbar to Edit link when canEdit is true', async () => {
        mockFirestoreContext.canEdit = true;

        const songs = { one: [], two: [], pocket: [] };
        const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(mockSetNavbarContent).toHaveBeenCalled();
        });

        // Verify the navbar content is the Edit link
        const navbarContent = mockSetNavbarContent.mock.calls[0][0];
        expect(navbarContent).not.toBeNull();
        expect(navbarContent.props.to).toBe('/edit-gig/gig-1');
    });

    it('sets navbar to PDF button when canEdit is false', async () => {
        mockFirestoreContext.canEdit = false;

        const songs = { one: [], two: [], pocket: [] };
        const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

        const router = createMemoryRouter(
            [
                {
                    path: '/gig/:gigId',
                    element: <GigRoute />,
                    loader: () => ({
                        band: mockBand,
                        gigId: 'gig-1',
                        gig,
                        songs
                    })
                }
            ],
            { initialEntries: ['/gig/gig-1'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(mockSetNavbarContent).toHaveBeenCalled();
        });

        // Verify the navbar content is a button (NavBarButton)
        const navbarContent = mockSetNavbarContent.mock.calls[0][0];
        expect(navbarContent).not.toBeNull();
        expect(navbarContent.props.fn).toBeDefined();
    });

    describe('PDF generation', () => {
        it('generates PDF with venue and date', async () => {
            mockFirestoreContext.canEdit = false;

            const songs = {
                one: [createMockSong('song-1', 'Opening Song')],
                two: [createMockSong('song-2', 'Closing Song')],
                pocket: []
            };

            const gig = createMockGig('gig-1', 'The Jazz Club', new Date('2025-12-15'), songs);

            const router = createMemoryRouter(
                [
                    {
                        path: '/gig/:gigId',
                        element: <GigRoute />,
                        loader: () => ({
                            band: mockBand,
                            gigId: 'gig-1',
                            gig,
                            songs
                        })
                    }
                ],
                { initialEntries: ['/gig/gig-1'] }
            );

            render(<RouterProvider router={router} />);

            // Wait for component to render and navbar to be set
            await waitFor(() => {
                expect(mockSetNavbarContent).toHaveBeenCalled();
            });

            // Get the generatePDF function from the NavBarButton props
            const navbarContent = mockSetNavbarContent.mock.calls[0][0];
            const generatePDF = navbarContent.props.fn;

            // Call generatePDF
            generatePDF();

            // Verify PDF methods were called
            expect(mockPdfMethods.setFont).toHaveBeenCalled();
            expect(mockPdfMethods.text).toHaveBeenCalled();
            expect(mockPdfMethods.save).toHaveBeenCalled();

            // Verify success toast was shown
            expect(mockShowSuccess).toHaveBeenCalledWith('PDF generated successfully!');
        });

        it('includes song titles in PDF', async () => {
            mockFirestoreContext.canEdit = false;

            const songs = {
                one: [createMockSong('song-1', 'First Set Song')],
                two: [createMockSong('song-2', 'Second Set Song')],
                pocket: [createMockSong('song-3', 'Pocket Tune')]
            };

            const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

            const router = createMemoryRouter(
                [
                    {
                        path: '/gig/:gigId',
                        element: <GigRoute />,
                        loader: () => ({
                            band: mockBand,
                            gigId: 'gig-1',
                            gig,
                            songs
                        })
                    }
                ],
                { initialEntries: ['/gig/gig-1'] }
            );

            render(<RouterProvider router={router} />);

            await waitFor(() => {
                expect(mockSetNavbarContent).toHaveBeenCalled();
            });

            // Get and call the generatePDF function
            const navbarContent = mockSetNavbarContent.mock.calls[0][0];
            navbarContent.props.fn();

            // Check that text() was called with song titles
            const textCalls = mockPdfMethods.text.mock.calls.map((call: unknown[]) => call[0]);
            expect(textCalls).toContain('First Set Song');
            expect(textCalls).toContain('Second Set Song');
            expect(textCalls).toContain('Pocket Tune');
        });

        it('shows error toast when PDF generation fails', async () => {
            mockFirestoreContext.canEdit = false;

            // Make save() throw an error
            mockPdfMethods.save.mockImplementationOnce(() => {
                throw new Error('PDF generation failed');
            });

            const songs = { one: [], two: [], pocket: [] };
            const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

            const router = createMemoryRouter(
                [
                    {
                        path: '/gig/:gigId',
                        element: <GigRoute />,
                        loader: () => ({
                            band: mockBand,
                            gigId: 'gig-1',
                            gig,
                            songs
                        })
                    }
                ],
                { initialEntries: ['/gig/gig-1'] }
            );

            render(<RouterProvider router={router} />);

            await waitFor(() => {
                expect(mockSetNavbarContent).toHaveBeenCalled();
            });

            // Get and call the generatePDF function
            const navbarContent = mockSetNavbarContent.mock.calls[0][0];
            navbarContent.props.fn();

            // Verify error toast was shown
            expect(mockShowError).toHaveBeenCalledWith('Failed to generate PDF', {
                details: 'PDF generation failed'
            });
            expect(mockShowSuccess).not.toHaveBeenCalled();
        });

        it('adds new page when pocket songs would overflow', async () => {
            mockFirestoreContext.canEdit = false;

            // Create many songs to trigger page overflow
            // The PDF logic: baseY = 30 + 20 + max(one.length, two.length) * 10
            // Page overflow when: baseY + pocket.length * 10 > 290
            // With 15 songs per set: baseY = 200, so need pocket > 9 songs
            const manySongs = Array.from({ length: 30 }, (_, i) => createMockSong(`song-${i}`, `Song ${i}`));
            const pocketSongs = Array.from({ length: 10 }, (_, i) => createMockSong(`pocket-${i}`, `Pocket ${i}`));

            const songs = {
                one: manySongs.slice(0, 15),
                two: manySongs.slice(15, 30),
                pocket: pocketSongs
            };

            const gig = createMockGig('gig-1', 'Venue', new Date('2025-12-15'), songs);

            const router = createMemoryRouter(
                [
                    {
                        path: '/gig/:gigId',
                        element: <GigRoute />,
                        loader: () => ({
                            band: mockBand,
                            gigId: 'gig-1',
                            gig,
                            songs
                        })
                    }
                ],
                { initialEntries: ['/gig/gig-1'] }
            );

            render(<RouterProvider router={router} />);

            await waitFor(() => {
                expect(mockSetNavbarContent).toHaveBeenCalled();
            });

            // Get and call the generatePDF function
            const navbarContent = mockSetNavbarContent.mock.calls[0][0];
            navbarContent.props.fn();

            // With 30 songs (15 per set), pocket should trigger addPage
            expect(mockPdfMethods.addPage).toHaveBeenCalled();
        });
    });
});
