import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import type { Band } from '@/firestore/bands';

export function sortBy<T extends DocumentSnapshot>(models: T[], key: keyof DocumentData): T[] {
    return models.sort((a: T, b: T) => {
        const aData = a.data(),
            bData = b.data();

        if (!aData || !bData) {
            const msg = '[sortBy] Model data not present';
            console.error(msg, models, key, aData, bData);
            throw new Error(msg);
        }

        // Are we sorting on a Date?
        if (aData[key] instanceof Timestamp && bData[key] instanceof Timestamp) {
            // Get data for comparison and sort newest to oldest.
            return aData[key].toDate() < bData[key].toDate() ? 1 : -1;
        }

        return aData[key] > bData[key] ? 1 : -1;
    });
}

export function getTitle(title: string, band: DocumentSnapshot<Band>): string {
    return `${title} | ${band.get('description')}`;
}
