import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { FormEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CommandPanel from './CommandPanel';

describe('CommandPanel', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders Save and Cancel buttons by default', () => {
        render(<CommandPanel />);

        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('renders Delete button when handleDelete is provided', () => {
        render(<CommandPanel handleDelete={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('submits the parent form when Save button is clicked', () => {
        const handleSubmit = vi.fn((e: FormEvent<HTMLFormElement>) => e.preventDefault());
        render(
            <form onSubmit={handleSubmit}>
                <CommandPanel />
            </form>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls handleDelete when Delete button is clicked', () => {
        const handleDelete = vi.fn();
        render(<CommandPanel handleDelete={handleDelete} />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('calls window.history.back when Cancel button is clicked', () => {
        const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
        render(<CommandPanel />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(historyBackSpy).toHaveBeenCalledTimes(1);
        historyBackSpy.mockRestore();
    });

    it('renders icon buttons with correct classes', () => {
        render(<CommandPanel handleDelete={vi.fn()} />);

        const saveButton = screen.getByRole('button', { name: 'Save' });
        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });

        expect(saveButton).toHaveClass('btn-primary');
        expect(deleteButton).toHaveClass('btn-error');
        expect(cancelButton).toHaveClass('btn-accent');
    });

    it('blurs an action button when clicked', () => {
        render(<CommandPanel />);

        const cancelButton = screen.getByRole('button', { name: 'Cancel' });

        // Focus the button first
        cancelButton.focus();
        expect(document.activeElement).toBe(cancelButton);

        // Click should blur it
        fireEvent.click(cancelButton);
        expect(document.activeElement).not.toBe(cancelButton);
    });

    it('renders a footer command panel', () => {
        render(<CommandPanel />);

        const toolbar = screen.getByRole('toolbar', { name: 'Command Toolbar' });
        expect(toolbar).toBeInTheDocument();
        expect(screen.getByTestId('command-panel')).toBeInTheDocument();
        expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
    });
});
