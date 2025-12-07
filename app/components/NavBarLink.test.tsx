import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import NavBarLink from './NavBarLink';

describe('NavBarLink', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders children content', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test">Test Link</NavBarLink>
            </MemoryRouter>
        );

        expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('applies default btn classes', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test">Link</NavBarLink>
            </MemoryRouter>
        );

        const link = screen.getByText('Link');
        expect(link).toHaveClass('btn', 'btn-neutral', 'btn-sm', 'border', 'border-neutral-content/30');
    });

    it('merges custom className with default classes', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" className="custom-class">
                    Link
                </NavBarLink>
            </MemoryRouter>
        );

        const link = screen.getByText('Link');
        expect(link).toHaveClass('btn', 'btn-neutral', 'btn-sm', 'border', 'border-neutral-content/30', 'custom-class');
    });

    it('passes through other props to NavLink', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" data-testid="nav-bar-link">
                    Link
                </NavBarLink>
            </MemoryRouter>
        );

        expect(screen.getByTestId('nav-bar-link')).toBeInTheDocument();
    });

    it('renders as a link element', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test">Link</NavBarLink>
            </MemoryRouter>
        );

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/test');
    });
});
