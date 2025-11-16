import { collection, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { type Band, bandConverter } from '@/firestore/bands';
import { User } from '@/firestore/songs';

export interface AppData {
    band: QueryDocumentSnapshot<Band>;
    bands: QueryDocumentSnapshot<Band>[];
    user: User;
}

let bandsCache: QueryDocumentSnapshot<Band>[] | null = null;

async function loadBands(): Promise<QueryDocumentSnapshot<Band>[]> {
    if (bandsCache) {
        return bandsCache;
    }

    const bandsSnapshot = await getDocs(collection(db, 'bands').withConverter(bandConverter));
    bandsCache = bandsSnapshot.docs;
    return bandsCache;
}

export async function loadAppData(request: Request): Promise<AppData> {
    const url = new URL(request.url),
        defaultBandId = 'qRphnEOTg8GeDc0dQa4K',
        b = url.searchParams.get('b') ?? defaultBandId,
        u = url.searchParams.get('u') as User | null;

    // Load bands from cache or fetch if not cached
    const bands = await loadBands(),
        band = bands.find((band) => band.id === b);

    if (!band) {
        throw new Error(`Band not found "${b}"`);
    }

    // Parse and validate user param, default to User.None
    let user = User.None;
    if (u && Object.values(User).includes(u)) {
        user = u;
    }

    return { band, bands, user };
}

// Helper to clear cache if needed (e.g., when adding/editing bands)
export function clearBandsCache() {
    bandsCache = null;
}
