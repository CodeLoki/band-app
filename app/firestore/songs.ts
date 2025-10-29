import type {
	DocumentSnapshot,
	FirestoreDataConverter,
	QueryDocumentSnapshot,
} from "firebase/firestore";
import type { Band } from "./bands";

export const songConverter: FirestoreDataConverter<Song> = {
	toFirestore: (song: Song) => song,
	fromFirestore: (snapshot: QueryDocumentSnapshot, options) => {
		const data = snapshot.data(options) as Song;
		return {
			id: snapshot.id,
			...data,
		};
	},
};

export type Song = {
	/** Song artist. */
	artist: string;
	/** Song title. */
	title: string;
	/** Song length. */
	length: number;
	/** The musician that starts the song. */
	startsWith: StartsWith;
	/** The instrument featured in this song. */
	features: Instrument;
	/** The instruments that solo in this song (in order) */
	solos: Instrument[];
	/** The groovescribe drum tab. */
	groove: string;
	/** Any non-groovescribe drum tab. */
	drumeo: string;
	/** Embedded youtube url. */
	ytMusic: string;
	/** Drummer notes for this song. */
	notes: string;
	/** Auxiliary drum pad used in this song. */
	pad: DrumPad;
	/** Indicates this song needs practice */
	practice?: boolean;
	/** The collection of bands that play this song. */
	bands: QueryDocumentSnapshot<Band>[];
};

export enum DrumPad {
	None = -1,
	Cowbell,
	Claps,
	Tambourine,
	BellTree,
	China,
	Edrum,
	VibraSlap,
	Clave,
}

export const drumPadMap = new Map<DrumPad, string>([
	[DrumPad.None, "None"],
	[DrumPad.Cowbell, "Cowbell (#641)"],
	[DrumPad.Claps, "Claps (#800)"],
	[DrumPad.Tambourine, "Tambourine (#724)"],
	[DrumPad.BellTree, "Tree chime (#631)"],
	[DrumPad.China, "China Crash"],
	[DrumPad.Edrum, "EDrum"],
	[DrumPad.VibraSlap, "VibraSlap (#753)"],
	[DrumPad.Clave, "Clave (#736)"],
]);

export enum StartsWith {
	All,
	RhythmGuitar,
	Drums,
	DrumsAndKeys,
	LeadGuitar,
	LeadAndVocals,
	DrumsAndBass,
	DrumsAndGuitar,
	Bass,
	Guitars,
	Vocals,
	Keys,
	Trumpet,
}

export const startsWithMap = new Map<StartsWith, string>([
	[StartsWith.All, "Drums count in"],
	[StartsWith.RhythmGuitar, "Rhythm guitar"],
	[StartsWith.Drums, "Drums"],
	[StartsWith.DrumsAndKeys, "Drums and keys"],
	[StartsWith.LeadGuitar, "Lead guitar"],
	[StartsWith.LeadAndVocals, "Lead guitar and vocals"],
	[StartsWith.DrumsAndBass, "Drums and bass"],
	[StartsWith.DrumsAndGuitar, "Drums and guitar"],
	[StartsWith.Bass, "Bass"],
	[StartsWith.Guitars, "Guitars"],
	[StartsWith.Vocals, "Vocals"],
	[StartsWith.Keys, "Keys"],
	[StartsWith.Trumpet, "Trumpet"],
]);

export enum Instrument {
	None = -1,
	Drums,
	Bass,
	LeadGuitar,
	RhythmGuitar,
	Keys,
	Vocals,
	Trumpet,
}

export const instrumentMap = new Map<Instrument, string>([
	[Instrument.None, "None"],
	[Instrument.Drums, "Drums"],
	[Instrument.Bass, "Bass"],
	[Instrument.LeadGuitar, "Lead Guitar"],
	[Instrument.RhythmGuitar, "Rhythm Guitar"],
	[Instrument.Keys, "Keys"],
	[Instrument.Vocals, "Vocals"],
	[Instrument.Trumpet, "Trumpet"],
]);

export enum ActionMode {
	Perform,
	Rehearse,
	Practice,
	Edit,
	Flag,
}

export enum User {
	None = "",
	Me = "z",
	Vocals = "vocals",
	Guitars = "guitars",
	Mixer = "mix",
}

export function calculateSetListLength(
	songs: DocumentSnapshot<Song>[],
): string {
	return `${Math.round(
		songs.reduce<number>((sum, song) => {
			const { length = 0 } = song.data() ?? {};
			return sum + length;
		}, 0) / 60,
	)} minutes`;
}
