import clsx from 'clsx';
import { useCallback } from 'react';
import { LuCog, LuSave, LuSquareX, LuTrash2, LuX } from 'react-icons/lu';

interface CommandPanelProps {
    /**
     * Called to save the item that is being edited.
     */
    handleSave: () => void;

    /**
     * Called to delete the item that is being edited.  If this parameter is omitted the delete button will not be shown.
     */
    handleDelete?: () => void;
}

/**
 * A component for showing a floating command button with Cancel, Save, and optionally Delete actions.
 */
export default function CommandPanel({ handleSave, handleDelete }: CommandPanelProps) {
    const goBack = useCallback(() => {
            window.history.back();
        }, []),
        buttons = [{ text: 'Save', icon: <LuSave />, color: 'btn-primary', onClick: handleSave }];

    if (handleDelete) {
        buttons.push({ text: 'Delete', icon: <LuTrash2 />, color: 'btn-error', onClick: handleDelete });
    }

    buttons.push({ text: 'Cancel', icon: <LuX />, color: 'btn-neutral', onClick: goBack });

    return (
        <div className="fab">
            {/* biome-ignore lint/a11y/useSemanticElements: a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
            <div tabIndex={0} role="button" className="btn btn-lg btn-soft btn-circle">
                <LuCog />
            </div>
            {/* Main Action button replaces the original button when FAB is open */}
            <button
                type="button"
                className="fab-main-action btn btn-circle btn-lg btn-neutral"
                onClick={(e) => e.currentTarget.blur()}
            >
                <LuSquareX />
            </button>
            {buttons.map(({ text, icon, color, onClick }) => (
                <div key={text}>
                    {text}
                    <button type="button" className={clsx('btn btn-lg btn-circle btn-accent', color)} onClick={onClick}>
                        {icon}
                    </button>
                </div>
            ))}
        </div>
    );
}
