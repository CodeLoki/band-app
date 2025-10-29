import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LuCirclePlus } from "react-icons/lu";
import Loading from "@/components/Loading";
import NavLink from "@/components/NavLink";
import { useFirestore } from "@/contexts/Firestore";
import { useNavbar } from "@/contexts/NavbarContext";
import type { Gig } from "@/firestore/gigs";
import { CardStyle, sortBy } from "@/utils/general";

export function meta() {
	return [
		{ title: "Home - Daisy UI" },
		{
			name: "description",
			content: "Welcome to Daisy UI with React Router v7!",
		},
	];
}

const renderGig = (gig: QueryDocumentSnapshot<Gig>) => {
	const data = gig.data(),
		date = data.date.toDate().toLocaleDateString();

	return (
		<NavLink
			key={gig.id}
			to={`gigs/${gig.id}`}
			className={CardStyle}
			aria-label={`${data.venue} on ${date}`}
		>
			<div className="card-body text-base-content text-center mb-2">
				<h2 className="card-title text-blue-200 justify-center">
					{data.venue}
				</h2>
				<p>Date: {date}</p>
			</div>
		</NavLink>
	);
};

export default function Home() {
	const { getGigs, canEdit } = useFirestore();
	const [gigs, setGigs] = useState<QueryDocumentSnapshot<Gig>[]>([]);
	const { setNavbarContent } = useNavbar();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const gigs = await getGigs();
			setGigs(sortBy(gigs.docs, "date"));
			setLoading(false);
		})();
	}, [getGigs]);

	useEffect(() => {
		if (canEdit) {
			setNavbarContent(
				<NavLink to="/" className="btn">
					<LuCirclePlus />
					Add
				</NavLink>,
			);
		}

		return () => setNavbarContent(null);
	}, [setNavbarContent, canEdit]);

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="bg-base-800 m-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{gigs.map(renderGig)}
		</div>
	);
}
