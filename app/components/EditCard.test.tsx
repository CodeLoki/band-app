import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import EditCard from './EditCard';

describe('EditCard', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders children content', () => {
        render(
            <EditCard>
                <h1>Test Title</h1>
                <p>Test content</p>
            </EditCard>
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies card styling classes', () => {
        render(
            <EditCard>
                <span data-testid="child">Content</span>
            </EditCard>
        );

        const card = document.querySelector('.card.card-border.bg-neutral.shadow-xl');
        expect(card).toBeInTheDocument();
    });

    it('wraps children in card-body', () => {
        render(
            <EditCard>
                <span data-testid="child">Content</span>
            </EditCard>
        );

        const cardBody = document.querySelector('.card-body');
        expect(cardBody).toBeInTheDocument();
        expect(screen.getByTestId('child').closest('.card-body')).toBeTruthy();
    });

    it('applies max-width container styling', () => {
        render(
            <EditCard>
                <span>Content</span>
            </EditCard>
        );

        const container = document.querySelector('.max-w-5xl.mx-auto');
        expect(container).toBeInTheDocument();
    });
});
