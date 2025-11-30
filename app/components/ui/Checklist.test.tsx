import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Checklist from './Checklist';

const mockOptions = [
    { value: 'rock', label: 'Rock' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'blues', label: 'Blues' }
];

describe('Checklist', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders legend with label', () => {
        render(<Checklist label="Genres" name="genres" options={mockOptions} />);

        expect(screen.getByText('Genres')).toBeInTheDocument();
    });

    it('renders all options as checkboxes', () => {
        render(<Checklist label="Genres" name="genres" options={mockOptions} />);

        expect(screen.getByText('Rock')).toBeInTheDocument();
        expect(screen.getByText('Jazz')).toBeInTheDocument();
        expect(screen.getByText('Blues')).toBeInTheDocument();

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(3);
    });

    it('all checkboxes have correct name attribute', () => {
        render(<Checklist label="Genres" name="genres" options={mockOptions} />);

        const checkboxes = screen.getAllByRole('checkbox');
        for (const checkbox of checkboxes) {
            expect(checkbox).toHaveAttribute('name', 'genres');
        }
    });

    it('checkboxes have correct value attributes', () => {
        render(<Checklist label="Genres" name="genres" options={mockOptions} />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toHaveAttribute('value', 'rock');
        expect(checkboxes[1]).toHaveAttribute('value', 'jazz');
        expect(checkboxes[2]).toHaveAttribute('value', 'blues');
    });

    it('pre-checks options based on values prop', () => {
        render(<Checklist label="Genres" name="genres" options={mockOptions} values={['rock', 'blues']} />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toBeChecked(); // rock
        expect(checkboxes[1]).not.toBeChecked(); // jazz
        expect(checkboxes[2]).toBeChecked(); // blues
    });

    it('renders with no pre-checked options when values is empty', () => {
        render(<Checklist label="Genres" name="genres" options={mockOptions} values={[]} />);

        const checkboxes = screen.getAllByRole('checkbox');
        for (const checkbox of checkboxes) {
            expect(checkbox).not.toBeChecked();
        }
    });

    it('works with numeric values', () => {
        const numericOptions = [
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' },
            { value: 3, label: 'Three' }
        ];

        render(<Checklist label="Numbers" name="numbers" options={numericOptions} values={[1, 3]} />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toBeChecked(); // 1
        expect(checkboxes[1]).not.toBeChecked(); // 2
        expect(checkboxes[2]).toBeChecked(); // 3
    });
});
