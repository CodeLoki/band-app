import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SelectInput from './SelectInput';

const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
];

describe('SelectInput', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders label and select with correct name and id', () => {
        render(<SelectInput label="Category" name="category" options={mockOptions} />);

        expect(screen.getByText('Category')).toBeInTheDocument();

        const select = screen.getByRole('combobox');
        expect(select).toHaveAttribute('name', 'category');
        expect(select).toHaveAttribute('id', 'category');
    });

    it('renders all options', () => {
        render(<SelectInput label="Category" name="category" options={mockOptions} />);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('renders with defaultValue selected', () => {
        render(<SelectInput label="Category" name="category" options={mockOptions} defaultValue="option2" />);

        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('option2');
    });

    it('works with numeric values', () => {
        const numericOptions = [
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' },
            { value: 3, label: 'Three' }
        ];

        render(<SelectInput label="Number" name="number" options={numericOptions} defaultValue={2} />);

        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('2');
    });

    it('passes additional props to select', () => {
        render(<SelectInput label="Required Select" name="required" options={mockOptions} required disabled />);

        const select = screen.getByRole('combobox');
        expect(select).toBeRequired();
        expect(select).toBeDisabled();
    });

    it('has appropriate styling classes', () => {
        render(<SelectInput label="Style" name="style" options={mockOptions} />);

        const select = screen.getByRole('combobox');
        expect(select).toHaveClass('select', 'select-ghost');
    });
});
