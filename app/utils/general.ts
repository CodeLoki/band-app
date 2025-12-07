import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import type { Band } from '@/firestore/bands';

export function logError<T extends string>(msg: T, ...args: unknown[]): T {
    console.error(msg, ...args);
    return msg;
}

export function sortBy<T extends DocumentSnapshot>(models: T[], key: keyof DocumentData): T[] {
    return models.sort((a: T, b: T) => {
        const aData = a.data(),
            bData = b.data();

        if (!aData || !bData) {
            throw new Error(logError('[sortBy] Model data not present', models, key, aData, bData));
        }

        // Are we sorting on a Date?
        if (aData[key] instanceof Timestamp && bData[key] instanceof Timestamp) {
            // Get data for comparison and sort newest to oldest.
            return aData[key].toDate() < bData[key].toDate() ? 1 : -1;
        }

        return aData[key] > bData[key] ? 1 : -1;
    });
}

export const CardStyle =
    'card bg-base-100 card-border border-base-300 card-sm hover:-translate-y-1 transition-all duration-200 cursor-pointer w-full';

export function getTitle(title: string, band: DocumentSnapshot<Band>): string {
    return `${title} | ${band.get('description')}`;
}
