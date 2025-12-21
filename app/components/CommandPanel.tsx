import clsx from 'clsx';
import { type MouseEvent, useCallback } from 'react';
import { LuCommand, LuLogOut, LuRotateCcw, LuSave, LuSquareX, LuTrash2 } from 'react-icons/lu';

interface CommandPanelProps {
    /**
     * Called to save the item that is being edited.
     */
    handleSave: () => void;

    /**
     * Called to delete the item that is being edited.  If this parameter is omitted the delete button will not be shown.
     */
    handleDelete?: () => void;

    /**
     * Called to reset the edit state to the original values.  If this parameter is omitted the reset button will not be shown.
     */
    handleReset?: () => void;
}

/**
 * A component for showing a floating command button with Cancel, Save, and optionally Delete and Reset actions.
 */
export default function CommandPanel({ handleSave, handleDelete, handleReset }: CommandPanelProps) {
    const goBack = useCallback(() => {
            window.history.back();
        }, []),
        handleClick = useCallback((e: MouseEvent<HTMLButtonElement>, onClick: () => void) => {
            e.currentTarget.blur();
            onClick();
        }, []),
        buttons = [{ text: 'Cancel', icon: <LuLogOut />, color: 'btn-neutral', onClick: goBack }],
        cssCommon = 'btn btn-lg btn-circle';

    if (handleReset) {
        buttons.push({ text: 'Reset', icon: <LuRotateCcw />, color: 'btn-warning', onClick: handleReset });
    }

    // Add save button.
    buttons.push({ text: 'Save', icon: <LuSave />, color: 'btn-primary', onClick: handleSave });

    if (handleDelete) {
        buttons.push({ text: 'Delete', icon: <LuTrash2 />, color: 'btn-error', onClick: handleDelete });
    }

    return (
        <div className="fab">
            {/* biome-ignore lint/a11y/useSemanticElements: a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
            <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-soft" aria-label="Open Command Menu">
                <LuCommand />
            </div>
            {/* Main Action button replaces the original button when FAB is open */}
            <button
                type="button"
                className={clsx('fab-main-action', cssCommon)}
                onClick={(e) => e.currentTarget.blur()}
                aria-label="Close Command Menu"
            >
                <LuSquareX />
            </button>
            {buttons.map(({ text, icon, color, onClick }) => (
                <div key={text}>
                    {text}
                    <button
                        type="button"
                        className={clsx(cssCommon, color)}
                        onClick={(e) => handleClick(e, onClick)}
                        aria-label={text}
                    >
                        {icon}
                    </button>
                </div>
            ))}
        </div>
    );
}
