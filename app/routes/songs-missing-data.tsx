import clsx from 'clsx';
import { collection, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';
import { LuPencil } from 'react-icons/lu';
import { useLoaderData, useSearchParams } from 'react-router';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { type Song, songConverter } from '@/firestore/songs';
import { useNavigateWithParams } from '@/hooks/useNavigateWithParams';
import { loadAppData } from '@/loaders/appData';
import {
    getMissingSongFields,
    isOriginalSong,
    MissingSongField,
    missingSongFieldLabels
} from '@/utils/song-data-completeness';

interface SongsMissingDataLoaderData {
    allSongs: QueryDocumentSnapshot<Song>[];
    bandId: string;
    bandDescription: string;
}

interface MissingSongRow {
    song: QueryDocumentSnapshot<Song>;
    missingFields: MissingSongField[];
}

export async function clientLoader({ request }: { request: Request }) {
    const { band } = await loadAppData(request),
        songsSnapshot = await getDocs(collection(db, 'songs').withConverter(songConverter));

    return {
        allSongs: songsSnapshot.docs,
        bandId: band.id,
        bandDescription: band.data().description
    };
}

function sortBySongTitle(a: MissingSongRow, b: MissingSongRow): number {
    return (a.song.data().title || '').localeCompare(b.song.data().title || '');
}

export default function SongsMissingData() {
    const { allSongs, bandId, bandDescription } = useLoaderData<SongsMissingDataLoaderData>(),
        { canEdit } = useFirestore(),
        { navigate } = useNavigateWithParams(),
        [searchParams, setSearchParams] = useSearchParams(),
        filter = (searchParams.get('filter') as MissingSongField) ?? MissingSongField.Any;

    const candidateRows = allSongs
            .map((song) => {
                const songData = song.data();
                return {
                    song,
                    missingFields: getMissingSongFields(songData)
                };
            })
            .filter(({ song, missingFields }) => {
                const songBands = song.data().bands;

                if (songBands.length === 0 || !songBands.find((b) => b.id === bandId)) {
                    return false;
                }

                if (isOriginalSong(song.data(), bandDescription)) {
                    return false;
                }

                if (missingFields.length === 0) {
                    return false;
                }

                return true;
            })
            .sort(sortBySongTitle),
        availableCriteria = Array.from(new Set(candidateRows.flatMap(({ missingFields }) => missingFields))).sort(
            (a, b) => missingSongFieldLabels[a].localeCompare(missingSongFieldLabels[b])
        ),
        filterOptions = [MissingSongField.Any, ...availableCriteria],
        activeFilter = filterOptions.includes(filter) ? filter : MissingSongField.Any,
        visibleFilterOptions =
            activeFilter === MissingSongField.Any ? filterOptions : ([activeFilter, MissingSongField.Any] as const),
        missingRows =
            activeFilter === MissingSongField.Any
                ? candidateRows
                : candidateRows.filter(({ missingFields }) => missingFields.includes(activeFilter)),
        pageTitle = `Missing Song Data | ${bandDescription}`;

    return (
        <>
            <title>{pageTitle}</title>
            <div className="p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <h2 className="flex-1 text-2xl font-bold">Missing Song Data ({missingRows.length})</h2>

                        <div className="filter gap-1 sm:ms-auto">
                            {visibleFilterOptions.map((option) => (
                                <input
                                    key={option}
                                    className={clsx(
                                        'btn btn-sm btn-accent btn-soft',
                                        option === MissingSongField.Any ? 'filter-reset' : ''
                                    )}
                                    type="radio"
                                    name="missing-field-filter"
                                    aria-label={missingSongFieldLabels[option]}
                                    value={option}
                                    checked={activeFilter === option}
                                    onChange={() => {
                                        const next = new URLSearchParams(searchParams.toString());
                                        next.set('filter', option);
                                        setSearchParams(next);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                        {missingRows.length ? (
                            missingRows.map(({ song, missingFields }) => {
                                const songData = song.data();

                                return (
                                    <div key={song.id} className="card bg-base-100 border border-neutral shadow-sm">
                                        <div className="card-body p-4 gap-3">
                                            <div className="flex items-start gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="card-title text-lg">
                                                        {songData.title || '(missing title)'}
                                                    </h3>
                                                    <p className="text-sm opacity-70">
                                                        {songData.artist || '(missing artist)'}
                                                    </p>
                                                </div>

                                                {canEdit ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-soft btn-accent btn-square"
                                                        aria-label={`Edit ${songData.title || 'song'}`}
                                                        title="Edit Song"
                                                        onClick={() => navigate(`/edit-song/${song.id}`)}
                                                    >
                                                        <LuPencil className="size-4" />
                                                    </button>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {missingFields.map((field) => (
                                                    <span
                                                        key={`${song.id}-${field}`}
                                                        className="badge badge-warning badge-soft"
                                                    >
                                                        Missing: {missingSongFieldLabels[field]}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="alert alert-success sm:col-span-2">
                                <span>No songs found for the selected missing-data filter.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
