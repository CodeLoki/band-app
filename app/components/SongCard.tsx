import { type DocumentSnapshot, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import { LuClock, LuFlag, LuGuitar, LuMusic4, LuNotepadText, LuStar } from 'react-icons/lu';
import { ActionMode, useActionContext } from '@/contexts/ActionContext';
import { useFirestore } from '@/contexts/Firestore';
import { useNavigation } from '@/contexts/NavigationContext';
import { DrumPad, drumPadMap, Instrument, instrumentMap, type Song, startsWithMap, User } from '@/firestore/songs';
import { CardStyle } from '@/utils/general';

type BadgeColor = 'badge-info' | 'badge-success' | 'badge-warning' | 'badge-error';

type Note = {
    icon: IconType;
    text: string;
    color: BadgeColor;
};

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

function getSongNotes(songData: Song, user: User): Note[] {
    const notes: Note[] = [],
        fnAddNote = (text: Note['text'], icon: Note['icon'], color: Note['color']): number =>
            notes.push({
                icon,
                text,
                color
            });

    const startsWith = startsWithMap.get(songData.startsWith);
    if (startsWith) {
        fnAddNote(startsWith, LuClock, 'badge-info');
    }

    if (user === User.Me) {
        const { pad } = songData;
        if (pad > DrumPad.None) {
            const padText = drumPadMap.get(pad);
            if (padText) {
                fnAddNote(padText, LuStar, 'badge-warning');
            }
        }

        const { notes } = songData;
        if (notes) {
            fnAddNote(notes, LuNotepadText, 'badge-success');
        }
    }

    if (user === User.Mixer) {
        const { features, solos } = songData;
        if (features && features !== Instrument.None) {
            const featureText = instrumentMap.get(features);
            if (featureText) {
                fnAddNote(featureText, LuMusic4, 'badge-success');
            }
        }

        if (solos?.length > 0) {
            solos.forEach((inst) => {
                const soloText = instrumentMap.get(inst);
                if (soloText) {
                    fnAddNote(soloText, LuGuitar, 'badge-warning');
                }
            });
        }
    }

    return notes;
}

export default function SongCard({ song }: { song: DocumentSnapshot<Song> }) {
    const { user, isMe, canEdit } = useFirestore(),
        { mode } = useActionContext(),
        { navigateWithParams } = useNavigation(),
        [songData, setSongData] = useState<Song | undefined>(song.data());

    if (!songData) {
        throw new Error(`Song data not found: "${song.id}"`);
    }

    const notes = getSongNotes(songData, user);

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
        <button
            key={song.id}
            type="button"
            className={CardStyle}
            onClick={handleClick}
            aria-label={`${songData.title} by ${songData.artist}`}
        >
            <div className="card-body p-6">
                <div className="text-center text-base-content">
                    <div className="relative">
                        <h3 className="flex-1 card-title justify-center">{songData.title}</h3>
                        {isMe && songData.practice ? <LuFlag className="flex-none absolute right-0 top-0" /> : null}
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
    );
}
