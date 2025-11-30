import { cleanup, render, screen } from '@testing-library/react';
import type { Timestamp } from 'firebase/firestore';
import { afterEach, describe, expect, it } from 'vitest';
import DateInput from './DateInput';

// Mock Timestamp
const createMockTimestamp = (dateString: string): Timestamp =>
    ({
        toDate: () => new Date(dateString),
        seconds: 0,
        nanoseconds: 0,
        toMillis: () => new Date(dateString).getTime(),
        isEqual: () => false,
        valueOf: () => dateString
    }) as unknown as Timestamp;

describe('DateInput', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders label and input with correct name and id', () => {
        render(<DateInput label="Start Date" name="startDate" />);

        expect(screen.getByText('Start Date')).toBeInTheDocument();

        const input = screen.getByLabelText('Start Date');
        expect(input).toHaveAttribute('name', 'startDate');
        expect(input).toHaveAttribute('id', 'startDate');
        expect(input).toHaveAttribute('type', 'date');
    });

    it('renders with empty value when no currentValue provided', () => {
        render(<DateInput label="Date" name="date" />);

        const input = screen.getByLabelText('Date');
        expect(input).toHaveValue('');
    });

    it('formats Timestamp to YYYY-MM-DD string', () => {
        const mockTimestamp = createMockTimestamp('2024-06-15T12:00:00Z');
        render(<DateInput label="Event Date" name="eventDate" currentValue={mockTimestamp} />);

        const input = screen.getByLabelText('Event Date');
        expect(input).toHaveValue('2024-06-15');
    });

    it('passes additional props to input', () => {
        render(<DateInput label="Required Date" name="required" required min="2024-01-01" max="2024-12-31" />);

        const input = screen.getByLabelText('Required Date');
        expect(input).toBeRequired();
        expect(input).toHaveAttribute('min', '2024-01-01');
        expect(input).toHaveAttribute('max', '2024-12-31');
    });
});
