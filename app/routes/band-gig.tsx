import { LuClock, LuMusic4, LuStar } from "react-icons/lu";
import { Link } from "react-router";

interface Song {
	id: string;
	title: string;
	band: string;
	starter: string;
	featured?: string;
	solos?: string[];
}

interface SetSection {
	title: string;
	songs: Song[];
}

export default function BandGig() {
	const venue = "The Blue Moon Cafe";
	const date = "November 15, 2025";

	const sets: SetSection[] = [
		{
			title: "Set One",
			songs: [
				{
					id: "1",
					title: "Sweet Child O' Mine",
					band: "Guns N' Roses",
					starter: "Alex",
					featured: "Jordan",
					solos: ["Alex", "Sam"],
				},
				{
					id: "2",
					title: "Don't Stop Believin'",
					band: "Journey",
					starter: "Sam",
					solos: ["Alex"],
				},
				{
					id: "3",
					title: "Mr. Brightside",
					band: "The Killers",
					starter: "Jordan",
					featured: "Casey",
					solos: ["Sam", "Alex"],
				},
				{
					id: "4",
					title: "Bohemian Rhapsody",
					band: "Queen",
					starter: "Sam",
					solos: ["Alex", "Jordan", "Casey"],
				},
			],
		},
		{
			title: "Set Two",
			songs: [
				{
					id: "5",
					title: "Hotel California",
					band: "Eagles",
					starter: "Alex",
					featured: "Jordan",
					solos: ["Alex", "Jordan"],
				},
				{
					id: "6",
					title: "Living on a Prayer",
					band: "Bon Jovi",
					starter: "Sam",
					solos: ["Alex"],
				},
				{
					id: "7",
					title: "Free Bird",
					band: "Lynyrd Skynyrd",
					starter: "Alex",
					featured: "Sam",
					solos: ["Alex", "Jordan", "Sam"],
				},
				{
					id: "8",
					title: "Stairway to Heaven",
					band: "Led Zeppelin",
					starter: "Jordan",
					solos: ["Alex", "Sam"],
				},
			],
		},
		{
			title: "Pocket",
			songs: [
				{
					id: "9",
					title: "Wonderwall",
					band: "Oasis",
					starter: "Sam",
					solos: ["Alex"],
				},
				{
					id: "10",
					title: "Black",
					band: "Pearl Jam",
					starter: "Alex",
					featured: "Jordan",
					solos: ["Alex"],
				},
				{
					id: "11",
					title: "Tears in Heaven",
					band: "Eric Clapton",
					starter: "Jordan",
					solos: ["Jordan", "Sam"],
				},
			],
		},
	];

	const handleSongClick = (song: Song) => {
		console.log("Clicked song:", song);
		alert(`Clicked on "${song.title}" by ${song.band}`);
	};

	const renderSongCard = (song: Song) => (
		<button
			key={song.id}
			type="button"
			className="card bg-base-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer w-full"
			onClick={() => handleSongClick(song)}
			aria-label={`${song.title} by ${song.band}`}
		>
			<div className="card-body p-4">
				{/* Song Title and Band */}
				<div className="text-center mb-2">
					<h3 className="card-title text-base justify-center">{song.title}</h3>
					<p className="text-sm opacity-70">{song.band}</p>
				</div>

				{/* Badges */}
				<div className="flex flex-wrap gap-2 justify-center">
					{/* Starter Badge (Blue) */}
					<div className="badge badge-sm badge-info gap-1">
						<LuClock className="h-3 w-3" />
						{song.starter}
					</div>

					{/* Featured Badge (Green) */}
					{song.featured && (
						<div className="badge badge-sm badge-success gap-1">
							<LuStar className="h-3 w-3" />
							{song.featured}
						</div>
					)}

					{/* Solo Badges (Yellow) */}
					{song.solos?.map((solo) => (
						<div
							key={`${song.id}-solo-${solo}`}
							className="badge badge-sm badge-warning gap-1"
						>
							<LuMusic4 className="h-3 w-3" />
							{solo}
						</div>
					))}
				</div>
			</div>
		</button>
	);

	const renderSection = (section: SetSection, isDesktop = false) => (
		<div key={section.title}>
			<h2 className="text-3xl font-bold mb-4">{section.title}</h2>
			<div
				className={
					isDesktop
						? "grid grid-cols-1 gap-4" // Single column on desktop
						: "grid grid-cols-1 md:grid-cols-2 gap-4" // Responsive on mobile
				}
			>
				{section.songs.map(renderSongCard)}
			</div>
		</div>
	);

	return (
		<div className="p-4 max-w-7xl mx-auto">
			<div className="flex flex-col gap-8">
				<h1 className="text-4xl font-bold mb-2">
					{venue} - {date}
				</h1>

				{/* Responsive Sets Layout */}
				<div>
					{/* Mobile: Stack all sets vertically */}
					<div className="flex flex-col gap-8 lg:hidden">
						{sets.map((section) => renderSection(section, false))}
					</div>

					{/* Desktop: Custom grid layout */}
					<div className="hidden lg:block">
						{/* Top row: Set One (left) and Set Two (right) */}
						<div className="grid grid-cols-2 gap-8 mb-8">
							<div>{renderSection(sets[0], true)}</div>
							<div>{renderSection(sets[1], true)}</div>
						</div>

						{/* Bottom row: Pocket (left side only) */}
						<div className="grid grid-cols-2 gap-8">
							<div>{renderSection(sets[2], true)}</div>
							<div /> {/* Empty right column */}
						</div>
					</div>
				</div>

				{/* Navigation */}
				<div className="pt-6">
					<div className="flex gap-4 justify-center">
						<Link to="/" className="btn btn-outline">
							← Back to Home
						</Link>
						<Link to="/about" className="btn btn-outline">
							About
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
