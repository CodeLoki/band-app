import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CommandPanel from './CommandPanel';

describe('CommandPanel', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders Save and Cancel buttons by default', () => {
        render(<CommandPanel handleSave={vi.fn()} />);

        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('renders Delete button when handleDelete is provided', () => {
        render(<CommandPanel handleSave={vi.fn()} handleDelete={vi.fn()} />);

        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls handleSave when Save button is clicked', () => {
        const handleSave = vi.fn();
        render(<CommandPanel handleSave={handleSave} />);

        // Find the button within the div that contains "Save" text
        const saveDiv = screen.getByText('Save').closest('div');
        const saveButton = saveDiv?.querySelector('button');
        expect(saveButton).not.toBeNull();
        fireEvent.click(saveButton as HTMLButtonElement);

        expect(handleSave).toHaveBeenCalledTimes(1);
    });

    it('calls handleDelete when Delete button is clicked', () => {
        const handleDelete = vi.fn();
        render(<CommandPanel handleSave={vi.fn()} handleDelete={handleDelete} />);

        const deleteDiv = screen.getByText('Delete').closest('div');
        const deleteButton = deleteDiv?.querySelector('button');
        expect(deleteButton).not.toBeNull();
        fireEvent.click(deleteButton as HTMLButtonElement);

        expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    it('calls window.history.back when Cancel button is clicked', () => {
        const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
        render(<CommandPanel handleSave={vi.fn()} />);

        const cancelDiv = screen.getByText('Cancel').closest('div');
        const cancelButton = cancelDiv?.querySelector('button');
        expect(cancelButton).not.toBeNull();
        fireEvent.click(cancelButton as HTMLButtonElement);

        expect(historyBackSpy).toHaveBeenCalledTimes(1);
        historyBackSpy.mockRestore();
    });

    it('renders icon buttons with correct classes', () => {
        render(<CommandPanel handleSave={vi.fn()} handleDelete={vi.fn()} />);

        const saveDiv = screen.getByText('Save').closest('div');
        const deleteDiv = screen.getByText('Delete').closest('div');
        const cancelDiv = screen.getByText('Cancel').closest('div');

        const saveButton = saveDiv?.querySelector('button');
        const deleteButton = deleteDiv?.querySelector('button');
        const cancelButton = cancelDiv?.querySelector('button');

        expect(saveButton).toHaveClass('btn-primary');
        expect(deleteButton).toHaveClass('btn-error');
        expect(cancelButton).toHaveClass('btn-neutral');
    });

    it('blurs the main action button when clicked', () => {
        render(<CommandPanel handleSave={vi.fn()} />);

        const mainActionButton = document.querySelector('.fab-main-action') as HTMLButtonElement;
        expect(mainActionButton).toBeInTheDocument();

        // Focus the button first
        mainActionButton.focus();
        expect(document.activeElement).toBe(mainActionButton);

        // Click should blur it
        fireEvent.click(mainActionButton);
        expect(document.activeElement).not.toBe(mainActionButton);
    });
});
