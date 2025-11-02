import type { DocumentReference, FirestoreDataConverter, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import type { Band } from './bands.js';
import type { Song } from './songs.ts';

export const gigConverter: FirestoreDataConverter<Gig> = {
    toFirestore: (gig: Gig) => {
        const { id: _id, ...gigData } = gig;
        return gigData;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options) => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            ...data
        } as Gig;
    }
};

export type Gig = {
    id: string;
    band: DocumentReference<Band>;
    date: Timestamp;
    venue: string;
    one: DocumentReference<Song>[];
    two: DocumentReference<Song>[];
    pocket: DocumentReference<Song>[];
};
