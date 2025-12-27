import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LuHouse } from 'react-icons/lu';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NavBarButton from './NavBarButton';

describe('NavBarButton', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders text content', () => {
        render(<NavBarButton fn={() => {}} text="Click Me" icon={<LuHouse />} />);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('renders with icon', () => {
        render(<NavBarButton fn={() => {}} text="Home" icon={<LuHouse data-testid="icon" />} />);

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('calls fn when clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<NavBarButton fn={handleClick} text="Click Me" icon={<LuHouse />} />);

        await user.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies default button classes', () => {
        render(<NavBarButton fn={() => {}} text="Button" icon={<LuHouse />} />);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('btn', 'btn-sm', 'border');
    });

    it('merges custom className with defaults', () => {
        render(<NavBarButton fn={() => {}} text="Button" icon={<LuHouse />} className="custom-class" />);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('btn', 'btn-sm', 'custom-class');
    });

    it('passes additional props to button element', () => {
        render(<NavBarButton fn={() => {}} text="Button" icon={<LuHouse />} disabled data-testid="test-button" />);
        const button = screen.getByTestId('test-button');

        expect(button).toBeDisabled();
    });

    it('sets title attribute from text prop', () => {
        render(<NavBarButton fn={() => {}} text="Button Title" icon={<LuHouse />} />);
        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('title', 'Button Title');
    });
});
