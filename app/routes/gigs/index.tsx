import type { DocumentSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LuFilePen } from "react-icons/lu";
import { redirect, useParams } from "react-router";
import ActionSelector from "@/components/ActionSelector";
import Loading from "@/components/Loading";
import NavLink from "@/components/NavLink";
import SongCard from "@/components/SongCard";
import { useFirestore } from "@/contexts/Firestore";
import { useNavbar } from "@/contexts/NavbarContext";
import type { Gig } from "@/firestore/gigs";
import type { Song } from "@/firestore/songs";
import { calculateSetListLength } from "@/firestore/songs";

function SetList({
	title,
	songs,
}: {
	title: string;
	songs: DocumentSnapshot<Song>[];
}) {
	const text = `${title} (${calculateSetListLength(songs)})`;

	return (
		<div key={title}>
			<h3 className="text-xl font-bold mb-4">{text}</h3>
			<div className="grid grid-cols-1 gap-4">
				{songs.map((song) => (
					<SongCard song={song} key={song.id} />
				))}
			</div>
		</div>
	);
}

export default function GigIndex() {
	const { gigId } = useParams(),
		{ getGig, canEdit } = useFirestore(),
		[gig, setGig] = useState<DocumentSnapshot<Gig>>(),
		[songs, setSongs] = useState<{
			one: DocumentSnapshot<Song>[];
			two: DocumentSnapshot<Song>[];
			pocket: DocumentSnapshot<Song>[];
		}>(),
		[loading, setLoading] = useState(true),
		{ setNavbarContent } = useNavbar();

	if (!gigId) {
		throw redirect("/");
	}

	useEffect(() => {
		if (canEdit) {
			setNavbarContent(
				<NavLink to="/" className="btn">
					<LuFilePen />
					Edit
				</NavLink>,
			);
		}

		return () => setNavbarContent(null);
	}, [setNavbarContent, canEdit]);

	useEffect(() => {
		const loadGigAndSongs = async () => {
			const gigDoc = await getGig(gigId);
			setGig(gigDoc);

			const gigData = gigDoc.data();
			if (!gigData) {
				throw redirect("/");
			}

			// Fetch all songs in parallel
			const [one, two, pocket] = await Promise.all([
				Promise.all(gigData.one.map((ref) => getDoc(ref))),
				Promise.all(gigData.two.map((ref) => getDoc(ref))),
				Promise.all(gigData.pocket.map((ref) => getDoc(ref))),
			]);

			setSongs({ one, two, pocket });
			setLoading(false);
		};

		loadGigAndSongs();
	}, [getGig, gigId]);

	if (loading) {
		return <Loading />;
	}

	const gigData = gig?.data();
	if (!gigData || !songs) {
		throw redirect("/");
	}

	const { venue } = gigData,
		date = gigData.date.toDate().toLocaleDateString("en", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});

	return (
		<>
			<div className="p-4">
				<div className="flex flex-col gap-8">
					<h2 className="text-2xl font-bold mb-2">
						{venue} - {date}
					</h2>

					{/* Responsive Sets Layout */}
					<div className="grid gap-y-8 grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<SetList title={"Set One"} songs={songs.one} />
						</div>
						<div>
							<SetList title={"Set Two"} songs={songs.two} />
						</div>
						<div>
							<SetList title={"Pocket"} songs={songs.pocket} />
						</div>
					</div>
				</div>
			</div>
			<ActionSelector />
		</>
	);
}
