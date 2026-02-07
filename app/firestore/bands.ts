import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';

export type Band = {
    id: string;
    description: string;
    logo?: string;
};

export const bandConverter: FirestoreDataConverter<Band> = {
    toFirestore: (band: Band) => {
        const { id: _id, ...bandData } = band;
        return bandData;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options) => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            ...data
        } as Band;
    }
};
