import { type MouseEvent, useEffect, useState } from "react";
import {
	LuDrum,
	LuFlag,
	LuMonitorPlay,
	LuMusic,
	LuSquareX,
} from "react-icons/lu";
import { ActionMode, useActionContext } from "@/contexts/ActionContext";
import { useFirestore } from "@/contexts/Firestore";

function getIcon(mode: ActionMode) {
	switch (mode) {
		case ActionMode.Practice:
			return <LuMusic />;
		case ActionMode.Rehearse:
			return <LuMonitorPlay />;
		case ActionMode.Flag:
			return <LuFlag />;
		default:
			return <LuDrum />;
	}
}

export default function Loading() {
	const { canEdit } = useFirestore();
	const { mode, setActionMode } = useActionContext();
	const [icon, setIcon] = useState(getIcon(mode));

	useEffect(() => {
		setIcon(getIcon(mode));
	}, [mode]);

	if (!canEdit) {
		return null;
	}

	function handleClick(
		mode: ActionMode,
		event?: MouseEvent<HTMLButtonElement>,
	) {
		event?.currentTarget.blur();
		setActionMode(mode);
	}

	console.log("mode", mode);

	return (
		<div className="fab fab-flower">
			{/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
			<button type="button" className="btn btn-lg btn-info btn-circle">
				{icon}
			</button>
			{/* Main Action button replaces the original button when FAB is open */}
			<button
				type="button"
				className="fab-main-action btn btn-circle btn-lg btn-success"
				onClick={(e) => e.currentTarget.blur()}
			>
				<LuSquareX />
			</button>
			{/* buttons that show up when FAB is open */}
			<div className="tooltip tooltip-left" data-tip="Perform">
				<button
					type="button"
					className="btn btn-lg btn-circle"
					onClick={(e) => handleClick(ActionMode.Perform, e)}
				>
					{getIcon(ActionMode.Perform)}
				</button>
			</div>
			<div className="tooltip tooltip-left" data-tip="Practice">
				<button
					type="button"
					className="btn btn-lg btn-circle"
					onClick={(e) => handleClick(ActionMode.Practice, e)}
				>
					{getIcon(ActionMode.Practice)}
				</button>
			</div>
			<div className="tooltip tooltip-left" data-tip="Rehearse">
				<button
					type="button"
					className="btn btn-lg btn-circle"
					onClick={(e) => handleClick(ActionMode.Rehearse, e)}
				>
					{getIcon(ActionMode.Rehearse)}
				</button>
			</div>
			<div className="tooltip tooltip-left" data-tip="Flag">
				<button
					type="button"
					className="btn btn-lg btn-circle"
					onClick={(e) => handleClick(ActionMode.Flag, e)}
				>
					{getIcon(ActionMode.Flag)}
				</button>
			</div>
		</div>
	);
}
