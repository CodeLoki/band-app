import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TextInput from './TextInput';

describe('TextInput', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders label and input with correct name and id', () => {
        render(<TextInput label="Username" name="username" />);

        expect(screen.getByText('Username')).toBeInTheDocument();

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('name', 'username');
        expect(input).toHaveAttribute('id', 'username');
    });

    it('uses text type by default', () => {
        render(<TextInput label="Email" name="email" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', 'text');
    });

    it('accepts custom input type', () => {
        const { container } = render(<TextInput label="Password" name="password" type="password" />);

        const input = container.querySelector('input[name="password"]');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('renders with defaultValue', () => {
        render(<TextInput label="Name" name="name" defaultValue="John Doe" />);

        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('John Doe');
    });

    it('passes additional props to input', () => {
        render(<TextInput label="Required Field" name="required" required placeholder="Enter value" />);

        const input = screen.getByRole('textbox');
        expect(input).toBeRequired();
        expect(input).toHaveAttribute('placeholder', 'Enter value');
    });
});
