import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Loading from './Loading';

describe('Loading', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it('does not show immediately with default debounce', () => {
        render(<Loading />);
        expect(document.querySelector('.animate-spin')).toBeNull();
    });

    it('shows after debounce delay', () => {
        render(<Loading debounceMs={100} />);

        expect(document.querySelector('.animate-spin')).toBeNull();

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows immediately when debounceMs is 0', () => {
        render(<Loading debounceMs={0} />);
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders full screen variant', () => {
        render(<Loading debounceMs={0} fullScreen={true} />);
        expect(document.querySelector('.fixed.inset-0')).toBeInTheDocument();
    });
});
