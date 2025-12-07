import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NavBarButton from './NavBarButton';

describe('NavBarButton', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders children correctly', () => {
        render(<NavBarButton fn={() => {}}>Click Me</NavBarButton>);
        expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });

    it('calls fn when clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<NavBarButton fn={handleClick}>Click Me</NavBarButton>);

        await user.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies default button classes', () => {
        render(<NavBarButton fn={() => {}}>Button</NavBarButton>);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('btn', 'btn-ghost', 'btn-sm');
    });

    it('merges custom className with defaults', () => {
        render(
            <NavBarButton fn={() => {}} className="custom-class">
                Button
            </NavBarButton>
        );
        const button = screen.getByRole('button');

        expect(button).toHaveClass('btn', 'btn-ghost', 'btn-sm', 'custom-class');
    });

    it('passes additional props to button element', () => {
        render(
            <NavBarButton fn={() => {}} disabled data-testid="test-button">
                Button
            </NavBarButton>
        );
        const button = screen.getByTestId('test-button');

        expect(button).toBeDisabled();
    });
});
