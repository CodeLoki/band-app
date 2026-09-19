import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SvgLogo from './SvgLogo';

// Helper to create mock band document
function createMockBand(id = 'band-1') {
    return {
        id,
        data: () => ({ description: 'Test Band' }),
        ref: { id }
    };
}

describe('SvgLogo', () => {
    afterEach(() => {
        cleanup();
    });

    it('loads the logo from the immutable band ID', () => {
        const band = createMockBand('h5u5HWubdsLZdh5asOWn');

        const { container } = render(<SvgLogo band={band as never} />);

        expect(container.querySelector('img')).toHaveAttribute('src', '/logos/h5u5HWubdsLZdh5asOWn.svg');
        expect(screen.getByAltText('Test Band logo')).toBeInTheDocument();
    });

    it('applies the provided className', () => {
        const band = createMockBand();

        const { container } = render(<SvgLogo band={band as never} />);

        expect(container.querySelector('img')).toBeInTheDocument();
    });

    it('applies custom className alongside default class', () => {
        const band = createMockBand();

        const { container } = render(<SvgLogo band={band as never} className="w-10 h-10" />);

        const image = container.querySelector('img');
        expect(image).toHaveClass('w-10');
        expect(image).toHaveClass('h-10');
    });

    it('returns null when the local logo does not exist', () => {
        const band = createMockBand('missing-band');

        const { container } = render(<SvgLogo band={band as never} />);

        fireEvent.error(container.querySelector('img')!);
        expect(container.innerHTML).toBe('');
    });
});
