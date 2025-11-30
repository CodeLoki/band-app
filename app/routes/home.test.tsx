import { vi } from 'vitest';
import { createMockBand, mockFirestoreContext, resetMockState, setupFirestoreContextMock } from '@/test/mocks';

// Setup shared mocks
setupFirestoreContextMock();

// Mock specific to home route
const mockNavigate = vi.fn();

vi.mock('@/hooks/useNavigateWithParams', () => ({
    useNavigateWithParams: () => ({
        navigate: mockNavigate
    })
}));

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Gig } from '@/firestore/gigs';

import Home from './home';

// Helper to create mock gig documents (home-specific, uses QueryDocumentSnapshot)
function createMockGig(id: string, venue: string, date: Date): QueryDocumentSnapshot<Gig> {
    return {
        id,
        data: () => ({
            venue,
            date: { toDate: () => date },
            band: { id: 'band-1' }
        }),
        ref: { id }
    } as unknown as QueryDocumentSnapshot<Gig>;
}

// Use shared mockBand
const mockBand = createMockBand();

describe('Home route', () => {
    beforeEach(() => {
        resetMockState();
        mockNavigate.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders gigs when available', async () => {
        const gigs = [
            createMockGig('gig-1', 'The Blue Note', new Date('2025-12-15')),
            createMockGig('gig-2', 'Jazz Corner', new Date('2025-12-20'))
        ];

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: <Home />,
                    loader: () => ({ band: mockBand, gigs })
                }
            ],
            { initialEntries: ['/'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('The Blue Note')).toBeInTheDocument();
        });
        expect(screen.getByText('Jazz Corner')).toBeInTheDocument();
    });

    it('renders empty message when no gigs', async () => {
        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: <Home />,
                    loader: () => ({ band: mockBand, gigs: [] })
                }
            ],
            { initialEntries: ['/'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('No gigs scheduled.')).toBeInTheDocument();
        });
    });

    it('renders gig dates', async () => {
        const gigs = [createMockGig('gig-1', 'Venue', new Date('2025-12-25'))];

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: <Home />,
                    loader: () => ({ band: mockBand, gigs })
                }
            ],
            { initialEntries: ['/'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            // Date format depends on locale, so check for "Date:" prefix
            expect(screen.getByText(/Date:/)).toBeInTheDocument();
        });
    });

    it('shows add button when canEdit is true', async () => {
        mockFirestoreContext.canEdit = true;

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: <Home />,
                    loader: () => ({ band: mockBand, gigs: [] })
                }
            ],
            { initialEntries: ['/'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            // FAB should be present
            expect(document.querySelector('.fab')).toBeInTheDocument();
        });
    });

    it('hides add button when canEdit is false', async () => {
        mockFirestoreContext.canEdit = false;

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: <Home />,
                    loader: () => ({ band: mockBand, gigs: [] })
                }
            ],
            { initialEntries: ['/'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            expect(screen.getByText('No gigs scheduled.')).toBeInTheDocument();
        });
        expect(document.querySelector('.fab')).not.toBeInTheDocument();
    });

    it('gig cards link to gig detail page', async () => {
        const gigs = [createMockGig('gig-123', 'Test Venue', new Date('2025-12-15'))];

        const router = createMemoryRouter(
            [
                {
                    path: '/',
                    element: <Home />,
                    loader: () => ({ band: mockBand, gigs })
                }
            ],
            { initialEntries: ['/'] }
        );

        render(<RouterProvider router={router} />);

        await waitFor(() => {
            const link = screen.getByRole('link', { name: /test venue/i });
            expect(link).toHaveAttribute('href', '/gig/gig-123');
        });
    });
});
