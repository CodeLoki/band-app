import { type DocumentSnapshot, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import { LuClock, LuFlag, LuGuitar, LuMusic4, LuNotepadText, LuStar } from 'react-icons/lu';
import { ActionMode, useActionContext } from '@/contexts/ActionContext';
import { useFirestore } from '@/contexts/Firestore';
import { useNavigation } from '@/contexts/NavigationContext';
import { type Song, User } from '@/firestore/songs';
import { CardStyle } from '@/utils/general';
import { getSongNotes, type SongNote, SongNoteType } from '@/utils/song-notes';

type BadgeColor = 'badge-info' | 'badge-success' | 'badge-warning' | 'badge-error';

const NoteTypeToBadgeColor: Record<SongNoteType, BadgeColor> = {
    [SongNoteType.StartsWith]: 'badge-info',
    [SongNoteType.Pad]: 'badge-warning',
    [SongNoteType.Notes]: 'badge-success',
    [SongNoteType.Features]: 'badge-success',
    [SongNoteType.Solos]: 'badge-warning'
};

const NoteTypeToIcon: Record<SongNoteType, IconType> = {
    [SongNoteType.StartsWith]: LuClock,
    [SongNoteType.Pad]: LuStar,
    [SongNoteType.Notes]: LuNotepadText,
    [SongNoteType.Features]: LuMusic4,
    [SongNoteType.Solos]: LuGuitar
};

interface DisplayNote extends SongNote {
    icon: IconType;
    color: BadgeColor;
}

function toDisplayNote(note: SongNote): DisplayNote {
    return {
        ...note,
        icon: NoteTypeToIcon[note.type],
        color: NoteTypeToBadgeColor[note.type]
    };
}

enum TabSource {
    Songsterr,
    UltimateGuitar,
    LyricsGenius,
    GrooveScribe,
    YouTubeMusic
}

/**
 * Calculated tablature source website (based on user and whether performance or practice).
 */
function getTabSource(user: User, mode?: ActionMode): TabSource {
    if (user === User.Me) {
        return mode === ActionMode.Practice ? TabSource.Songsterr : TabSource.GrooveScribe;
    }

    if (user === User.Vocals) {
        return TabSource.LyricsGenius;
    }

    if (user === User.Guitars) {
        return TabSource.UltimateGuitar;
    }

    return TabSource.YouTubeMusic;
}

/**
 * Returns the URL for the passed tab source.
 */
function getTabLink(song: Song, tabSource: TabSource): string | undefined {
    const q = encodeURI(`${song.artist} ${song.title}`);

    if (tabSource === TabSource.YouTubeMusic) {
        const { ytMusic } = song;
        if (ytMusic) {
            return `https://www.youtube.com/watch?v=${ytMusic}`;
        }

        return `https://www.youtube.com/results?search_query=${q}`;
    }

    if (tabSource === TabSource.LyricsGenius) {
        return `https://genius.com/search?q=${q}`;
        // return `https://songmeanings.com/query/?query=${q}&type=songtitles`;
        // return `https://search.azlyrics.com/search.php?q=${q}`;
    }

    if (tabSource === TabSource.UltimateGuitar) {
        return `https://www.ultimate-guitar.com/search.php?search_type=title&value=${q}`;
    }

    if (tabSource === TabSource.Songsterr) {
        return `https://www.songsterr.com/?pattern=${q}&inst=drum`;
    }

    if (tabSource === TabSource.GrooveScribe) {
        return song.groove;
    }

    return undefined;
}

interface SongCardProps {
    song: DocumentSnapshot<Song>;
}

/**
 * A card for showing song details and allowing actions based on current user and action mode context.
 */
export default function SongCard({ song }: SongCardProps) {
    const { user, isMe, canEdit } = useFirestore(),
        { mode } = useActionContext(),
        { navigateWithParams } = useNavigation(),
        [songData, setSongData] = useState<Song | undefined>(song.data());

    if (!songData) {
        throw new Error(`Song data not found: "${song.id}"`);
    }

    const notes = getSongNotes(songData, user).map(toDisplayNote);

    const handleClick = async () => {
        if (canEdit && mode === ActionMode.Flag) {
            const practice = !songData.practice;
            await updateDoc(song.ref, {
                practice
            });

            setSongData({
                ...songData,
                practice
            });
            return;
        }

        if (mode === ActionMode.Rehearse) {
            navigateWithParams(`/rehearse/${song.id}`);
            return;
        }

        if (mode === ActionMode.Edit) {
            navigateWithParams(`/edit-song/${song.id}`);
            return;
        }

        const link = getTabLink(songData, getTabSource(user, mode));
        if (link) {
            window.open(link);
        }
    };

    return (
        <div className="indicator w-full">
            {isMe && songData.practice ? (
                <div
                    className="indicator-item bg-accent text-accent-foreground rounded-full p-2 right-6 top-6"
                    title="Flagged for Practice"
                >
                    <LuFlag />
                </div>
            ) : null}
            <button
                key={song.id}
                type="button"
                className={CardStyle}
                onClick={handleClick}
                aria-label={`${songData.title} by ${songData.artist}`}
                data-song-card-id={song.id}
            >
                <div className="card-body p-6">
                    <div className="text-center text-base-content">
                        <div className="relative">
                            <h3 className="flex-1 card-title justify-center">{songData.title}</h3>
                        </div>
                        <p className="text-sm opacity-70">{songData.artist}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                        {notes.map((note, index) => (
                            <div
                                key={`${song.id}-note-${index}`}
                                className={`rounded-md badge badge-sm ${note.color} gap-1`}
                            >
                                <note.icon className="h-3 w-3" />
                                {note.text}
                            </div>
                        ))}
                    </div>
                </div>
            </button>
        </div>
    );
}
