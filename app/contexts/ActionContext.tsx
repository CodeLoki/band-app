import { createContext, useContext, useState } from 'react';

export enum ActionMode {
    Perform,
    Rehearse,
    Practice,
    Edit,
    Flag,
    BPM
}

interface ActionModeContextType {
    mode: ActionMode;
    setActionMode: (mode: ActionMode) => void;
    bpmSongId: string | null;
    setBpmSongId: (songId: string | null) => void;
}

const ActionModeContext = createContext<ActionModeContextType>({
    mode: ActionMode.Perform,
    setActionMode: () => {
        throw new Error('setActionMode not implemented');
    },
    bpmSongId: null,
    setBpmSongId: () => {
        throw new Error('setBpmSongId not implemented');
    }
});

interface ActionModeProviderProps {
    children: React.ReactNode;
}

export function ActionModeProvider({ children }: ActionModeProviderProps) {
    const [mode, setActionMode] = useState<ActionMode>(ActionMode.Perform);
    const [bpmSongId, setBpmSongId] = useState<string | null>(null);

    return (
        <ActionModeContext.Provider
            value={{
                mode,
                setActionMode,
                bpmSongId,
                setBpmSongId
            }}
        >
            {children}
        </ActionModeContext.Provider>
    );
}

export function useActionContext() {
    return useContext(ActionModeContext);
}
