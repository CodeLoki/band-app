import { createContext, useContext, useState } from "react";

export enum ActionMode {
	Perform,
	Rehearse,
	Practice,
	Edit,
	Flag,
}

interface ActionModeContextType {
	mode: ActionMode;
	setActionMode: (mode: ActionMode) => void;
}

const ActionModeContext = createContext<ActionModeContextType>({
	mode: ActionMode.Perform,
	setActionMode: () => {
		throw new Error("setActionMode not implemented");
	},
});

interface ActionModeProviderProps {
	children: React.ReactNode;
}

export function ActionModeProvider({ children }: ActionModeProviderProps) {
	const [mode, setActionMode] = useState<ActionMode>(ActionMode.Perform);

	return (
		<ActionModeContext.Provider
			value={{
				mode,
				setActionMode,
			}}
		>
			{children}
		</ActionModeContext.Provider>
	);
}

export function useActionContext() {
	return useContext(ActionModeContext);
}
