import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LuCirclePlus } from "react-icons/lu";
import ActionSelector from "@/components/ActionSelector";
import Loading from "@/components/Loading";
import NavLink from "@/components/NavLink";
import SongCard from "@/components/SongCard";
import { useFirestore } from "@/contexts/Firestore";
import { useNavbar } from "@/contexts/NavbarContext";
import type { Song } from "@/firestore/songs";
import { sortBy } from "@/utils/general";

enum FilterOption {
	Orphans = "Orphans",
	Others = "Others",
	All = "All",
}

export default function SongsIndex() {
	const { getSongs, canEdit, isMe } = useFirestore(),
		{ setNavbarContent } = useNavbar(),
		[filter, setFilter] = useState<FilterOption>(FilterOption.All),
		[songs, setSongs] = useState<QueryDocumentSnapshot<Song>[]>([]),
		[loading, setLoading] = useState(true);

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

	useEffect(() => {
		console.log("filter", filter);

		const loadSongs = async () => {
			const songs = await getSongs();
			setSongs(sortBy(songs.docs, "title"));
			setLoading(false);
		};

		loadSongs();
	}, [getSongs, filter]);

	if (loading) {
		return <Loading />;
	}

	if (!songs) {
		throw new Error("Songs not found");
	}

	return (
		<>
			<div className="p-4">
				<div className="flex flex-col gap-2">
					<div className="flex gap-2">
						<h2 className="flex-1 text-2xl font-bold mb-2">
							Songs ({songs.length})
						</h2>

						{isMe ? (
							<div className="filter flex-none">
								<input
									className="btn btn-sm"
									type="radio"
									name="song-type"
									aria-label="Orphans"
									onChange={() => setFilter(FilterOption.Orphans)}
								/>
								<input
									className="btn btn-sm"
									type="radio"
									name="song-type"
									aria-label="Others"
									onChange={() => setFilter(FilterOption.Others)}
								/>
								<input
									className="btn btn-square btn-sm filter-reset"
									type="radio"
									name="song-type"
									aria-label="All"
									onClick={() => setFilter(FilterOption.All)}
								/>
							</div>
						) : null}
					</div>

					{/* Responsive Sets Layout */}
					<div className="grid gap-4 grid-cols-1 md:grid-cols-2">
						{songs.map((song) => (
							<SongCard song={song} key={song.id} />
						))}
					</div>
				</div>
			</div>
			<ActionSelector />
		</>
	);
}
