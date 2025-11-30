import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import NotFound from './404';

describe('NotFound route', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders 404 heading', () => {
        const router = createMemoryRouter([{ path: '*', element: <NotFound /> }], {
            initialEntries: ['/non-existent-page']
        });

        render(<RouterProvider router={router} />);

        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('renders page not found message', () => {
        const router = createMemoryRouter([{ path: '*', element: <NotFound /> }], { initialEntries: ['/anything'] });

        render(<RouterProvider router={router} />);

        expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    it('renders Go Home link', () => {
        const router = createMemoryRouter([{ path: '*', element: <NotFound /> }], { initialEntries: ['/missing'] });

        render(<RouterProvider router={router} />);

        const link = screen.getByRole('link', { name: /go home/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/');
    });
});
