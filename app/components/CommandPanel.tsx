import clsx from 'clsx';
import { type MouseEvent, type ReactNode, useCallback } from 'react';
import { LuRotateCcw, LuSave, LuTrash2, LuX } from 'react-icons/lu';

interface CommandPanelProps {
    /**
     * Called to delete the item that is being edited.  If this parameter is omitted the delete button will not be shown.
     */
    handleDelete?: () => void;

    /**
     * Whether to show the form reset action.
     */
    showReset?: boolean;
}

/**
 * A component for showing footer actions for edit/create forms.
 */
export default function CommandPanel({ handleDelete, showReset = false }: CommandPanelProps) {
    const goBack = useCallback(() => {
            window.history.back();
        }, []),
        handleClick = useCallback((e: MouseEvent<HTMLButtonElement>, onClick: () => void) => {
            e.currentTarget.blur();
            onClick();
        }, []),
        secondaryButtons: {
            text: string;
            icon: ReactNode;
            color: string;
            buttonType?: 'button' | 'reset';
            onClick?: () => void;
        }[] = [{ text: 'Cancel', icon: <LuX />, color: 'btn-soft btn-accent btn-neutral-content/30', onClick: goBack }],
        primaryButtons: {
            text: string;
            icon: ReactNode;
            color: string;
            buttonType: 'button' | 'reset' | 'submit';
            onClick?: () => void;
        }[] = [],
        cssCommon = 'btn gap-2 w-full sm:w-auto';

    if (showReset) {
        secondaryButtons.push({
            text: 'Reset',
            icon: <LuRotateCcw />,
            color: 'btn-soft btn-accent btn-neutral-content/30',
            buttonType: 'reset'
        });
    }

    if (handleDelete) {
        primaryButtons.push({
            text: 'Delete',
            icon: <LuTrash2 />,
            color: 'btn-soft btn-error',
            buttonType: 'button',
            onClick: handleDelete
        });
    }

    primaryButtons.push({ text: 'Save', icon: <LuSave />, color: 'btn-soft btn-primary', buttonType: 'submit' });

    return (
        <div
            className="sticky bottom-0 z-20 mt-6 border-t border-base-300 bg-neutral/95 pt-4 pb-2 shadow-[0_-4px_10px_rgba(0,0,0,0.15)] backdrop-blur"
            role="toolbar"
            aria-label="Command Toolbar"
            data-testid="command-panel"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                    {secondaryButtons.map(({ text, icon, color, onClick, buttonType = 'button' }) => (
                        <button
                            key={text}
                            type={buttonType}
                            className={clsx(cssCommon, color)}
                            onClick={onClick ? (e) => handleClick(e, onClick) : undefined}
                            aria-label={text}
                        >
                            {icon}
                            <span>{text}</span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    {primaryButtons.map(({ text, icon, color, onClick, buttonType }) => (
                        <button
                            key={text}
                            type={buttonType}
                            className={clsx(cssCommon, color, text === 'Save' ? 'sm:min-w-28' : '')}
                            onClick={onClick ? (e) => handleClick(e, onClick) : undefined}
                            aria-label={text}
                        >
                            {icon}
                            <span>{text}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
