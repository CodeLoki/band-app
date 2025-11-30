import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Toast } from '@/contexts/ToastContext';

// Mock toast data
const mockToasts: Toast[] = [];
const mockRemoveToast = vi.fn();

vi.mock('@/contexts/ToastContext', () => ({
    useToast: () => ({
        toasts: mockToasts,
        removeToast: mockRemoveToast
    })
}));

import Toasts from './Toasts';

describe('Toasts', () => {
    beforeEach(() => {
        mockToasts.length = 0;
        mockRemoveToast.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('returns null when there are no toasts', () => {
        const { container } = render(<Toasts />);
        expect(container.firstChild).toBeNull();
    });

    it('renders toasts when present', () => {
        mockToasts.push({
            id: '1',
            message: 'Test toast message',
            type: 'info',
            timestamp: new Date()
        });

        render(<Toasts />);
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
    });

    it('renders toast details when provided', () => {
        mockToasts.push({
            id: '1',
            message: 'Main message',
            type: 'info',
            timestamp: new Date(),
            details: 'Additional details here'
        });

        render(<Toasts />);
        expect(screen.getByText('Main message')).toBeInTheDocument();
        expect(screen.getByText('Additional details here')).toBeInTheDocument();
    });

    it('applies correct CSS class for error type', () => {
        mockToasts.push({
            id: '1',
            message: 'Error message',
            type: 'error',
            timestamp: new Date()
        });

        render(<Toasts />);
        const alert = document.querySelector('.alert');
        expect(alert).toHaveClass('alert-error');
    });

    it('applies correct CSS class for warning type', () => {
        mockToasts.push({
            id: '1',
            message: 'Warning message',
            type: 'warning',
            timestamp: new Date()
        });

        render(<Toasts />);
        const alert = document.querySelector('.alert');
        expect(alert).toHaveClass('alert-warning');
    });

    it('applies correct CSS class for success type', () => {
        mockToasts.push({
            id: '1',
            message: 'Success message',
            type: 'success',
            timestamp: new Date()
        });

        render(<Toasts />);
        const alert = document.querySelector('.alert');
        expect(alert).toHaveClass('alert-success');
    });

    it('applies correct CSS class for info type', () => {
        mockToasts.push({
            id: '1',
            message: 'Info message',
            type: 'info',
            timestamp: new Date()
        });

        render(<Toasts />);
        const alert = document.querySelector('.alert');
        expect(alert).toHaveClass('alert-info');
    });

    it('calls removeToast when close button is clicked', () => {
        mockToasts.push({
            id: 'toast-123',
            message: 'Closable toast',
            type: 'info',
            timestamp: new Date()
        });

        render(<Toasts />);
        const closeButton = screen.getByRole('button', { name: 'Close' });
        fireEvent.click(closeButton);

        expect(mockRemoveToast).toHaveBeenCalledWith('toast-123');
    });

    it('renders action button when action is provided', () => {
        const actionClick = vi.fn();
        mockToasts.push({
            id: '1',
            message: 'Toast with action',
            type: 'info',
            timestamp: new Date(),
            action: {
                label: 'Retry',
                onClick: actionClick
            }
        });

        render(<Toasts />);
        const actionButton = screen.getByText('Retry');
        expect(actionButton).toBeInTheDocument();

        fireEvent.click(actionButton);
        expect(actionClick).toHaveBeenCalled();
    });

    it('renders multiple toasts', () => {
        mockToasts.push(
            {
                id: '1',
                message: 'First toast',
                type: 'info',
                timestamp: new Date()
            },
            {
                id: '2',
                message: 'Second toast',
                type: 'success',
                timestamp: new Date()
            }
        );

        render(<Toasts />);
        expect(screen.getByText('First toast')).toBeInTheDocument();
        expect(screen.getByText('Second toast')).toBeInTheDocument();
    });
});
