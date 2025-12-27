import clsx from 'clsx';
import { collection, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { LuCirclePlus } from 'react-icons/lu';
import { useLoaderData, useSearchParams } from 'react-router';
import ActionSelector from '@/components/ActionSelector';
import NavBarLink from '@/components/NavBarLink';
import SongCard from '@/components/SongCard';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { useNavbar } from '@/contexts/NavbarContext';
import { type Song, songConverter } from '@/firestore/songs';
import { loadAppData } from '@/loaders/appData';
import { sortBy } from '@/utils/general';

interface SongsLoaderData {
    allSongs: QueryDocumentSnapshot<Song>[];
    bandId: string;
    bandDescription: string;
}

enum FilterOption {
    Practice = 'practice',
    Orphans = 'orphans',
    Others = 'others',
    All = 'all'
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

export default function SongsIndex() {
    const { allSongs, bandId, bandDescription } = useLoaderData<SongsLoaderData>(),
        { canEdit, isMe } = useFirestore(),
        { setNavbarContent } = useNavbar(),
        [searchParams, setSearchParams] = useSearchParams(),
        filter = (searchParams.get('filter') as FilterOption) ?? FilterOption.All;

    useEffect(() => {
        if (canEdit) {
            setNavbarContent(<NavBarLink icon={<LuCirclePlus />} text="Add" to="/edit-song/new" />);
        }

        return () => setNavbarContent(null);
    }, [setNavbarContent, canEdit]);

    const filteredSongs = allSongs.filter((s) => {
            const bands = s.data().bands;

            if (filter === FilterOption.All) {
                return bands.length > 0 && bands.find((b) => b.id === bandId);
            }

            if (filter === FilterOption.Others) {
                return bands.length > 0 && !bands.find((b) => b.id === bandId);
            }

            if (filter === FilterOption.Practice) {
                return s.data().practice;
            }

            return bands.length === 0;
        }),
        songs = sortBy(filteredSongs, 'title'),
        pageTitle = `Songs | ${bandDescription}`;

    const buttons = [
        [FilterOption.Orphans, 'Orphans'],
        [FilterOption.Others, 'Others'],
        [FilterOption.Practice, 'Practice'],
        [FilterOption.All, 'All', 'filter-reset']
    ] as const;

    return (
        <>
            <title>{pageTitle}</title>
            <div className="p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <h2 className="hidden md:block flex-1 text-2xl font-bold mb-2">Songs ({songs.length})</h2>

                        {isMe ? (
                            <div className="filter flex-none mx-auto md:ms-auto">
                                {buttons.map(([v, t, c = '']) => (
                                    <input
                                        className={clsx('btn btn-sm btn-accent btn-soft', c)}
                                        type="radio"
                                        name="song-type"
                                        aria-label={t}
                                        key={v}
                                        value={v}
                                        checked={filter === v}
                                        onChange={() => {
                                            const next = new URLSearchParams(searchParams.toString());
                                            next.set('filter', v);
                                            setSearchParams(next);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {songs.length ? (
                            songs.map((song) => <SongCard song={song} key={song.id} />)
                        ) : (
                            <div className="p-4">
                                <div className="alert alert-info">
                                    <span>No songs found for the current filter.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ActionSelector />
        </>
    );
}
