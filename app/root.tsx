import type {
	FirestoreDataConverter,
	QueryDocumentSnapshot,
} from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import type { ClientLoaderFunctionArgs } from "react-router";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "react-router";
import NavLink from "./components/NavLink";
import { db } from "./config/firebase";
import { ActionModeProvider } from "./contexts/ActionContext";
import { FirestoreProvider } from "./contexts/Firestore";
import { NavbarProvider, useNavbar } from "./contexts/NavbarContext";
import { User } from "./firestore/songs";

import "./tailwind.css";

export type Band = {
	description: string;
};

const bandConverter: FirestoreDataConverter<Band> = {
	toFirestore: (band: Band) => band,
	fromFirestore: (snapshot: QueryDocumentSnapshot, options) => {
		const data = snapshot.data(options) as Band;
		return {
			id: snapshot.id,
			...data,
		};
	},
};

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
	const url = new URL(request.url),
		b = url.searchParams.get("b") ?? "qRphnEOTg8GeDc0dQa4K",
		u = url.searchParams.get("u");

	const bands = (
			await getDocs(collection(db, "bands").withConverter(bandConverter))
		).docs,
		band = bands.find((band) => band.id === b);

	if (!band) {
		throw new Error(`Band not found "${b}"`);
	}

	// Parse and validate user param, default to User.None
	let user: User = User.None;
	if (u && Object.values(User).includes(u as User)) {
		user = u as User;
	}

	return { band, bands, user };
}

export function meta() {
	return [
		{ title: "Daisy UI" },
		{ name: "description", content: "Welcome to React Router v7!" },
	];
}

export function links(): Array<{ rel: string; href: string }> {
	return [{ rel: "icon", href: "/favicon.ico" }];
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" data-theme="dim">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function Root() {
	const { band, bands, user } = useLoaderData<typeof clientLoader>();
	const bandData = band.data();

	return (
		<NavbarProvider>
			<FirestoreProvider band={band} bands={bands} userCode={user}>
				<ActionModeProvider>
					<NavbarContent bandDescription={bandData.description} />
					<Outlet />
				</ActionModeProvider>
			</FirestoreProvider>
		</NavbarProvider>
	);
}

function NavbarContent({ bandDescription }: { bandDescription: string }) {
	const { navbarContent } = useNavbar();

	return (
		<div className="navbar bg-base-200 items-center gap-1 py-0 min-h-auto">
			<div className="flex-1">
				<NavLink to="/" className="btn btn-ghost text-xl">
					{bandDescription}
				</NavLink>
			</div>

			{/* Dynamic content from routes */}
			{navbarContent && (
				<>
					<div className="flex flex-none">{navbarContent}</div>
					<div className="divider divider-horizontal m-1 h-8 self-center"></div>
				</>
			)}

			<div className="flex-none">
				<ul className="menu menu-horizontal px-1">
					<li>
						<NavLink to="/" className="btn">
							Gigs
						</NavLink>
					</li>
					<li>
						<NavLink to="/songs" className="btn">
							Songs
						</NavLink>
					</li>
				</ul>
			</div>
		</div>
	);
}
