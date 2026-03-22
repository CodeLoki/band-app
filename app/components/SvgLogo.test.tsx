import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SvgLogo from './SvgLogo';

// Mock DOMPurify
vi.mock('dompurify', () => ({
    default: {
        sanitize: vi.fn((input: string) => input)
    }
}));

import DOMPurify from 'dompurify';

// Helper to create mock band document
function createMockBand(logo: string | null = null) {
    return {
        id: 'band-1',
        data: () => ({ logo, name: 'Test Band' }),
        ref: { id: 'band-1' }
    };
}

describe('SvgLogo', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders sanitized SVG when logo exists', () => {
        const svgContent = '<svg><circle cx="50" cy="50" r="40"/></svg>';
        const band = createMockBand(svgContent);

        const { container } = render(<SvgLogo band={band as never} />);

        expect(container.querySelector('div')).toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
        expect(container.querySelector('circle')).toBeInTheDocument();
    });

    it('returns null when logo is null', () => {
        const band = createMockBand(null);

        const { container } = render(<SvgLogo band={band as never} />);

        expect(container.innerHTML).toBe('');
    });

    it('returns null when logo is empty string', () => {
        const band = createMockBand('');

        const { container } = render(<SvgLogo band={band as never} />);

        expect(container.innerHTML).toBe('');
    });

    it('applies default fill-current class', () => {
        const band = createMockBand('<svg></svg>');

        const { container } = render(<SvgLogo band={band as never} />);

        expect(container.querySelector('.fill-current')).toBeInTheDocument();
    });

    it('applies custom className alongside default class', () => {
        const band = createMockBand('<svg></svg>');

        const { container } = render(<SvgLogo band={band as never} className="w-10 h-10" />);

        const div = container.querySelector('div');
        expect(div).toHaveClass('fill-current');
        expect(div).toHaveClass('w-10');
        expect(div).toHaveClass('h-10');
    });

    it('sanitizes SVG with correct DOMPurify options', () => {
        const svgContent = '<svg><circle/></svg>';
        const band = createMockBand(svgContent);

        render(<SvgLogo band={band as never} />);

        expect(DOMPurify.sanitize).toHaveBeenCalledWith(svgContent, {
            USE_PROFILES: { svg: true, svgFilters: true }
        });
    });
});
