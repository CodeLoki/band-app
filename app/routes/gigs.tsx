import { Outlet } from "react-router";

export function meta() {
	return [
		{ title: "Home - Daisy UI" },
		{
			name: "description",
			content: "Welcome to Daisy UI with React Router v7!",
		},
	];
}

export default function GigsRoute() {
	return <Outlet />;
}
