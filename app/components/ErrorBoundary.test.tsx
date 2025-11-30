import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-router
const mockNavigate = vi.fn();
const mockError = { status: 404, statusText: 'Not Found', data: 'Page not found' };

vi.mock('react-router', () => ({
    useNavigate: () => mockNavigate,
    useRouteError: () => mockError,
    isRouteErrorResponse: (error: unknown) =>
        error !== null && typeof error === 'object' && 'status' in error && 'statusText' in error
}));

import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders route error response with status and message', () => {
        render(<ErrorBoundary />);

        expect(screen.getByText('404 Not Found')).toBeInTheDocument();
        expect(screen.getByText('Page not found')).toBeInTheDocument();
    });

    it('renders Go Home and Go Back buttons for route errors', () => {
        render(<ErrorBoundary />);

        expect(screen.getByText('Go Home')).toBeInTheDocument();
        expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('navigates home when Go Home is clicked', () => {
        render(<ErrorBoundary />);

        fireEvent.click(screen.getByText('Go Home'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('calls window.history.back when Go Back is clicked', () => {
        const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
        render(<ErrorBoundary />);

        fireEvent.click(screen.getByText('Go Back'));
        expect(historyBackSpy).toHaveBeenCalled();
    });
});

describe('ErrorBoundary with Error instance', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders Error message', async () => {
        const testError = new Error('Test error message');

        vi.doMock('react-router', () => ({
            useNavigate: () => mockNavigate,
            useRouteError: () => testError,
            isRouteErrorResponse: () => false
        }));

        const { default: ErrorBoundaryError } = await import('./ErrorBoundary');
        render(<ErrorBoundaryError />);

        expect(screen.getByText('Application Error')).toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('shows stack trace when isMe is true', async () => {
        const testError = new Error('Test error');
        testError.stack = 'Error stack trace here';

        // Set URL param to indicate isMe
        Object.defineProperty(window, 'location', {
            value: { search: '?u=z' },
            writable: true
        });

        vi.doMock('react-router', () => ({
            useNavigate: () => mockNavigate,
            useRouteError: () => testError,
            isRouteErrorResponse: () => false
        }));

        const { default: ErrorBoundaryWithStack } = await import('./ErrorBoundary');
        render(<ErrorBoundaryWithStack />);

        expect(screen.getByText('Stack trace')).toBeInTheDocument();
    });
});

describe('ErrorBoundary with unknown error', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders unknown error message', async () => {
        vi.doMock('react-router', () => ({
            useNavigate: () => mockNavigate,
            useRouteError: () => 'some string error',
            isRouteErrorResponse: () => false
        }));

        const { default: ErrorBoundaryUnknown } = await import('./ErrorBoundary');
        render(<ErrorBoundaryUnknown />);

        expect(screen.getByText('Unknown Error')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
