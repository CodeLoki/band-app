import type {
	DocumentReference,
	FirestoreDataConverter,
	QueryDocumentSnapshot,
	Timestamp,
} from "firebase/firestore";
import type { Song } from "./songs.ts";

export const gigConverter: FirestoreDataConverter<Gig> = {
	toFirestore: (gig: Gig) => gig,
	fromFirestore: (snapshot: QueryDocumentSnapshot, options) => {
		const data = snapshot.data(options) as Gig;
		return {
			id: snapshot.id,
			...data,
		};
	},
};

export type Gig = {
	date: Timestamp;
	venue: string;
	one: DocumentReference<Song>[];
	two: DocumentReference<Song>[];
	pocket: DocumentReference<Song>[];
};
