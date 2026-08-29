import { type Song, StartsWith } from '@/firestore/songs';

export enum MissingSongField {
    Any = 'any',
    Title = 'title',
    Artist = 'artist',
    Album = 'album',
    LrclibId = 'lrclibId',
    Length = 'length',
    Bpm = 'bpm',
    StartsWith = 'startsWith',
    Groove = 'groove',
    YtMusic = 'ytMusic'
}

export const missingSongFieldLabels: Record<MissingSongField, string> = {
    [MissingSongField.Any]: 'Any Missing',
    [MissingSongField.Title]: 'Title',
    [MissingSongField.Artist]: 'Artist',
    [MissingSongField.Album]: 'Album',
    [MissingSongField.LrclibId]: 'Lyric ID',
    [MissingSongField.Length]: 'Length',
    [MissingSongField.Bpm]: 'BPM',
    [MissingSongField.StartsWith]: 'Starts With',
    [MissingSongField.Groove]: 'GrooveScribe',
    [MissingSongField.YtMusic]: 'YT Music'
};

function isMissingText(value: unknown): boolean {
    return typeof value !== 'string' || value.trim() === '';
}

function isMissingPositiveNumber(value: unknown): boolean {
    return typeof value !== 'number' || !Number.isFinite(value) || value <= 0;
}

function isValidStartsWith(value: unknown): value is StartsWith {
    return typeof value === 'number' && Number.isInteger(value) && Object.values(StartsWith).includes(value);
}

function normalize(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\([^)]*\)/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Original songs are intentionally excluded from missing-data checks.
 */
export function isOriginalSong(song: Partial<Pick<Song, 'artist'>>, bandDescription: string): boolean {
    if (!song.artist || !bandDescription) {
        return false;
    }

    const artist = normalize(song.artist),
        band = normalize(bandDescription);

    if (!artist || !band) {
        return false;
    }

    return artist === band || band.startsWith(`${artist} `) || artist.startsWith(`${band} `);
}

/**
 * These checks intentionally ignore features, solos, drumeo, notes, pad, practice, and bands.
 */
export function getMissingSongFields(song: Partial<Song>): MissingSongField[] {
    const missingFields: MissingSongField[] = [];

    if (isMissingText(song.title)) {
        missingFields.push(MissingSongField.Title);
    }

    if (isMissingText(song.artist)) {
        missingFields.push(MissingSongField.Artist);
    }

    if (isMissingText(song.album)) {
        missingFields.push(MissingSongField.Album);
    }

    if (isMissingText(song.lrclibId)) {
        missingFields.push(MissingSongField.LrclibId);
    }

    if (isMissingPositiveNumber(song.length)) {
        missingFields.push(MissingSongField.Length);
    }

    if (isMissingPositiveNumber(song.bpm)) {
        missingFields.push(MissingSongField.Bpm);
    }

    if (!isValidStartsWith(song.startsWith)) {
        missingFields.push(MissingSongField.StartsWith);
    }

    if (isMissingText(song.groove)) {
        missingFields.push(MissingSongField.Groove);
    }

    if (isMissingText(song.ytMusic)) {
        missingFields.push(MissingSongField.YtMusic);
    }

    return missingFields;
}
