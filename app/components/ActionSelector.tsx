import { type MouseEvent, useEffect, useState } from 'react';
import { LuDrum, LuFilePen, LuFlag, LuMonitorPlay, LuMusic, LuSquareX } from 'react-icons/lu';
import { ActionMode, useActionContext } from '@/contexts/ActionContext';
import { useFirestore } from '@/contexts/Firestore';

function getIcon(mode: ActionMode) {
    switch (mode) {
        case ActionMode.Practice:
            return <LuMusic />;
        case ActionMode.Rehearse:
            return <LuMonitorPlay />;
        case ActionMode.Flag:
            return <LuFlag />;
        case ActionMode.Edit:
            return <LuFilePen />;
        default:
            return <LuDrum />;
    }
}

const commonButtons: [string, ActionMode][] = [
    ['Perform', ActionMode.Perform],
    ['Practice', ActionMode.Practice]
];

export default function Loading() {
    const { isMe, canEdit } = useFirestore();
    const { mode, setActionMode } = useActionContext();
    const [icon, setIcon] = useState(getIcon(mode));
    const [buttons, setButtons] = useState<[string, ActionMode][]>([]);

    useEffect(() => {
        setIcon(getIcon(mode));
    }, [mode]);

    useEffect(() => {
        const btns = [...commonButtons];

        if (canEdit) {
            btns.push(['Edit', ActionMode.Edit]);
            btns.push(['Flag', ActionMode.Flag]);
        } else {
            btns.push(['Rehearse', ActionMode.Rehearse]);
        }

        setButtons(btns);
    }, [canEdit]);

    if (!isMe) {
        return null;
    }

    function handleClick(mode: ActionMode, event?: MouseEvent<HTMLButtonElement>) {
        event?.currentTarget.blur();
        setActionMode(mode);
    }

    return (
        <div className="fab fab-flower">
            <button type="button" className="btn btn-lg btn-soft btn-circle">
                {icon}
            </button>
            {/* Main Action button replaces the original button when FAB is open */}
            <button
                type="button"
                className="fab-main-action btn btn-circle btn-lg btn-neutral"
                onClick={(e) => e.currentTarget.blur()}
            >
                <LuSquareX />
            </button>
            {buttons.map(([tip, mode]) => (
                <div key={mode} className="tooltip tooltip-left" data-tip={tip}>
                    <button
                        type="button"
                        className="btn btn-lg btn-circle btn-soft"
                        onClick={(e) => handleClick(mode, e)}
                    >
                        {getIcon(mode)}
                    </button>
                </div>
            ))}
        </div>
    );
}
