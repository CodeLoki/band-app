import clsx from 'clsx';
import { type MouseEvent, useEffect, useState } from 'react';
import type { IconType } from 'react-icons/lib';
import {
    LuDrum,
    LuFilePen,
    LuFlag,
    LuGuitar,
    LuLightbulb,
    LuMicVocal,
    LuMonitorPlay,
    LuMusic,
    LuSquareX
} from 'react-icons/lu';
import { ActionMode, useActionContext } from '@/contexts/ActionContext';
import { useFirestore } from '@/contexts/Firestore';
import { User } from '@/firestore/songs';

const ModeToIcon: Map<ActionMode, IconType> = new Map([
    [ActionMode.Rehearse, LuMonitorPlay],
    [ActionMode.Practice, LuMusic],
    [ActionMode.Edit, LuFilePen],
    [ActionMode.Flag, LuFlag],
    [ActionMode.BPM, LuLightbulb]
]);

function getIcon(mode: ActionMode, user: User) {
    if (ModeToIcon.has(mode)) {
        const IconComponent = ModeToIcon.get(mode)!;
        return <IconComponent />;
    }

    if (user === User.Me) {
        return <LuDrum />;
    }

    if (user === User.Vocals) {
        return <LuMicVocal />;
    }

    if (user === User.Guitars) {
        return <LuGuitar />;
    }

    return null;
}

export default function Loading() {
    const { canEdit, user } = useFirestore(),
        { mode, setActionMode } = useActionContext(),
        [icon, setIcon] = useState(getIcon(mode, user)),
        [buttons, setButtons] = useState<[string, ActionMode][]>([]),
        cssCommon = 'btn btn-lg btn-circle';

    useEffect(() => {
        const btns: [string, ActionMode][] = [['Perform', ActionMode.Perform]];

        if (user === User.Me) {
            btns.push(['Practice', ActionMode.Practice]);

            if (canEdit) {
                btns.push(['Edit', ActionMode.Edit]);
                btns.push(['Flag', ActionMode.Flag]);
            } else {
                btns.push(['Rehearse', ActionMode.Rehearse]);
                btns.push(['BPM', ActionMode.BPM]);
            }
        } else if (user === User.Guitars) {
            btns.push(['BPM', ActionMode.BPM]);
        }

        setButtons(btns);
    }, [canEdit, user]);

    function handleClick(mode: ActionMode, event?: MouseEvent<HTMLButtonElement>) {
        event?.currentTarget.blur();
        setActionMode(mode);
        setIcon(getIcon(mode, user));
    }

    if (buttons.length <= 1) {
        return null;
    }

    return (
        <div className="fab fab-flower">
            {/* biome-ignore lint/a11y/useSemanticElements: a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
            <div tabIndex={0} role="button" className={clsx(cssCommon, 'btn-soft')} title="Open Action Menu">
                {icon}
            </div>
            {/* Main Action button replaces the original button when FAB is open */}
            <button
                type="button"
                className={clsx(cssCommon, 'fab-main-action btn-neutral')}
                onClick={(e) => e.currentTarget.blur()}
                title="Close Action Menu"
            >
                <LuSquareX />
            </button>
            {buttons.map(([tip, mode]) => (
                <div key={mode} className="tooltip tooltip-left" data-tip={tip}>
                    <button
                        type="button"
                        className={clsx(cssCommon, 'btn-soft')}
                        onClick={(e) => handleClick(mode, e)}
                        aria-label={tip}
                    >
                        {getIcon(mode, user)}
                    </button>
                </div>
            ))}
        </div>
    );
}
