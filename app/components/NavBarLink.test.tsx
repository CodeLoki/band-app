import { cleanup, render, screen } from '@testing-library/react';
import { LuHouse } from 'react-icons/lu';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import NavBarLink from './NavBarLink';

describe('NavBarLink', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders text content', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" text="Test Link" />
            </MemoryRouter>
        );

        expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('renders with icon', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" text="Home" icon={<LuHouse data-testid="icon" />} />
            </MemoryRouter>
        );

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('applies default btn classes', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" text="Link" />
            </MemoryRouter>
        );

        const link = screen.getByRole('link');
        expect(link).toHaveClass('btn', 'btn-sm', 'border');
    });

    it('merges custom className with default classes', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" text="Link" className="custom-class" />
            </MemoryRouter>
        );

        const link = screen.getByRole('link');
        expect(link).toHaveClass('btn', 'btn-sm', 'custom-class');
    });

    it('passes through other props to NavLink', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" text="Link" data-testid="nav-bar-link" />
            </MemoryRouter>
        );

        expect(screen.getByTestId('nav-bar-link')).toBeInTheDocument();
    });

    it('renders as a link element', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" text="Link" />
            </MemoryRouter>
        );

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/test');
    });

    it('sets title attribute from text prop', () => {
        render(
            <MemoryRouter>
                <NavBarLink to="/test" text="Link Title" />
            </MemoryRouter>
        );

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('title', 'Link Title');
    });
});
