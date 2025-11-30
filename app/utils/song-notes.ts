import { DrumPad, drumPadMap, Instrument, instrumentMap, type Song, startsWithMap, User } from '@/firestore/songs';

/**
 * Represents a note/badge to display for a song.
 */
export interface SongNote {
    type: SongNoteType;
    text: string;
}

export enum SongNoteType {
    StartsWith,
    Pad,
    Notes,
    Features,
    Solos
}

/**
 * Get the notes to display for a song based on the user type.
 *
 * - All users see who starts the song
 * - Drummer (Me) sees: pad, drummer notes
 * - Mixer sees: featured instruments, solo order
 *
 * @param songData - The song data
 * @param user - The current user type
 * @returns Array of notes to display
 */
export function getSongNotes(songData: Song, user: User): SongNote[] {
    const notes: SongNote[] = [];

    const startsWith = startsWithMap.get(songData.startsWith);
    if (startsWith) {
        notes.push({ type: SongNoteType.StartsWith, text: startsWith });
    }

    if (user === User.Me) {
        const { pad } = songData;
        if (pad > DrumPad.None) {
            const padText = drumPadMap.get(pad);
            if (padText) {
                notes.push({ type: SongNoteType.Pad, text: padText });
            }
        }

        const { notes: songNotes } = songData;
        if (songNotes) {
            notes.push({ type: SongNoteType.Notes, text: songNotes });
        }
    }

    if (user === User.Mixer) {
        const { features, solos } = songData;
        if (features && features !== Instrument.None) {
            const featureText = instrumentMap.get(features);
            if (featureText) {
                notes.push({ type: SongNoteType.Features, text: featureText });
            }
        }

        if (solos?.length > 0) {
            for (const inst of solos) {
                const soloText = instrumentMap.get(inst);
                if (soloText) {
                    notes.push({ type: SongNoteType.Solos, text: soloText });
                }
            }
        }
    }

    return notes;
}

/**
 * Format song notes as a string for display (e.g., in PDF).
 *
 * @param notes - Array of song notes
 * @returns Formatted string like "Bass | Cowbell | Watch tempo"
 */
export function formatSongNotes(notes: SongNote[]): string {
    return notes.map((n) => n.text).join(' | ');
}
