import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionMode } from '@/contexts/ActionContext';
import ActionSelector from './ActionSelector';

// Mock values that can be changed per test
const mockContext = {
    isMe: true,
    canEdit: true,
    mode: ActionMode.Perform,
    setActionMode: vi.fn()
};

vi.mock('@/contexts/ActionContext', async () => {
    const actual = await vi.importActual('@/contexts/ActionContext');
    return {
        ...actual,
        useActionContext: () => ({
            mode: mockContext.mode,
            setActionMode: mockContext.setActionMode
        })
    };
});

vi.mock('@/contexts/Firestore', () => ({
    useFirestore: () => ({
        isMe: mockContext.isMe,
        canEdit: mockContext.canEdit
    })
}));

describe('ActionSelector', () => {
    beforeEach(() => {
        mockContext.isMe = true;
        mockContext.canEdit = true;
        mockContext.mode = ActionMode.Perform;
        mockContext.setActionMode.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the FAB when isMe is true', () => {
        render(<ActionSelector />);

        // Should render the FAB container with the main action button
        const fabContainer = document.querySelector('.fab');
        expect(fabContainer).toBeInTheDocument();
        expect(document.querySelector('.fab-main-action')).toBeInTheDocument();
    });

    it('renders all mode buttons when canEdit is true', () => {
        render(<ActionSelector />);

        // Check for tooltips using data-tip attribute
        expect(document.querySelector('[data-tip="Perform"]')).toBeInTheDocument();
        expect(document.querySelector('[data-tip="Practice"]')).toBeInTheDocument();
        expect(document.querySelector('[data-tip="Edit"]')).toBeInTheDocument();
        expect(document.querySelector('[data-tip="Flag"]')).toBeInTheDocument();
    });

    it('calls setActionMode when a mode button is clicked', () => {
        render(<ActionSelector />);

        // Find and click the Practice button
        const practiceTooltip = document.querySelector('[data-tip="Practice"]');
        const practiceButton = practiceTooltip?.querySelector('button');

        expect(practiceButton).toBeInTheDocument();
        if (practiceButton) {
            fireEvent.click(practiceButton);
        }
        expect(mockContext.setActionMode).toHaveBeenCalledWith(ActionMode.Practice);
    });

    it('calls setActionMode with Edit mode when Edit button is clicked', () => {
        render(<ActionSelector />);

        const editTooltip = document.querySelector('[data-tip="Edit"]');
        const editButton = editTooltip?.querySelector('button');

        expect(editButton).toBeInTheDocument();
        if (editButton) {
            fireEvent.click(editButton);
        }
        expect(mockContext.setActionMode).toHaveBeenCalledWith(ActionMode.Edit);
    });

    it('calls setActionMode with Flag mode when Flag button is clicked', () => {
        render(<ActionSelector />);

        const flagTooltip = document.querySelector('[data-tip="Flag"]');
        const flagButton = flagTooltip?.querySelector('button');

        expect(flagButton).toBeInTheDocument();
        if (flagButton) {
            fireEvent.click(flagButton);
        }
        expect(mockContext.setActionMode).toHaveBeenCalledWith(ActionMode.Flag);
    });

    it('blurs the main action button when clicked', () => {
        render(<ActionSelector />);

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

describe('ActionSelector when not me', () => {
    beforeEach(() => {
        mockContext.isMe = false;
        mockContext.canEdit = false;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders nothing when isMe is false', () => {
        const { container } = render(<ActionSelector />);

        expect(container.firstChild).toBeNull();
    });
});

describe('ActionSelector without edit permissions', () => {
    beforeEach(() => {
        mockContext.isMe = true;
        mockContext.canEdit = false;
        mockContext.mode = ActionMode.Perform;
        mockContext.setActionMode.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows Rehearse button instead of Edit/Flag when canEdit is false', () => {
        render(<ActionSelector />);

        // Should have Rehearse but not Edit/Flag
        expect(document.querySelector('[data-tip="Rehearse"]')).toBeInTheDocument();
        expect(document.querySelector('[data-tip="Edit"]')).not.toBeInTheDocument();
        expect(document.querySelector('[data-tip="Flag"]')).not.toBeInTheDocument();
    });

    it('calls setActionMode with Rehearse mode when Rehearse button is clicked', () => {
        render(<ActionSelector />);

        const rehearseTooltip = document.querySelector('[data-tip="Rehearse"]');
        const rehearseButton = rehearseTooltip?.querySelector('button');

        expect(rehearseButton).toBeInTheDocument();
        if (rehearseButton) {
            fireEvent.click(rehearseButton);
        }
        expect(mockContext.setActionMode).toHaveBeenCalledWith(ActionMode.Rehearse);
    });
});
