import { collection, getDocs, type QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { LuCirclePlus } from 'react-icons/lu';
import ActionSelector from '@/components/ActionSelector';
import Loading from '@/components/Loading';
import NavBarLink from '@/components/NavBarLink';
import SongCard from '@/components/SongCard';
import { db } from '@/config/firebase';
import { useError } from '@/contexts/ErrorContext';
import { useFirestore } from '@/contexts/Firestore';
import { useNavbar } from '@/contexts/NavbarContext';
import { type Song, songConverter } from '@/firestore/songs';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToastHelpers } from '@/hooks/useToastHelpers';
import { sortBy } from '@/utils/general';

// Import our error boundary component
export { default as ErrorBoundary } from '@/components/ErrorBoundary';

// Remove meta function as title is managed by usePageTitle

enum FilterOption {
    Orphans = 'Orphans',
    Others = 'Others',
    All = 'All'
}

export default function SongsIndex() {
    const { band, canEdit, isMe } = useFirestore(),
        { setNavbarContent } = useNavbar(),
        { logError } = useError(),
        { showError } = useToastHelpers(),
        [filter, setFilter] = useState<FilterOption>(FilterOption.All),
        [songs, setSongs] = useState<QueryDocumentSnapshot<Song>[]>([]),
        [loading, setLoading] = useState(true);

    usePageTitle({ pageTitle: 'Songs' });

    useEffect(() => {
        if (canEdit) {
            setNavbarContent(
                <NavBarLink to="/edit-song/new" className="text-primary">
                    <LuCirclePlus />
                    Add
                </NavBarLink>
            );
        }

        return () => setNavbarContent(null);
    }, [setNavbarContent, canEdit]);

    useEffect(() => {
        const loadSongs = async () => {
            try {
                const data = await getDocs(collection(db, 'songs').withConverter(songConverter));

                setSongs(
                    sortBy(
                        data.docs.filter((s) => {
                            const bands = s.data().bands;

                            if (filter === FilterOption.All) {
                                return bands.length > 0 && bands.find((b) => b.id === band.ref.id);
                            }

                            if (filter === FilterOption.Others) {
                                return bands.length > 0 && !bands.find((b) => b.id === band.ref.id);
                            }

                            return bands.length === 0;
                        }),
                        'title'
                    )
                );
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logError('Failed to load songs', {
                    details: errorMessage,
                    source: 'firestore'
                });
                showError('Failed to load songs', {
                    details: errorMessage,
                    action: {
                        label: 'Retry',
                        onClick: () => loadSongs()
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        loadSongs();
    }, [filter, band, logError, showError]);

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <div className="p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <h2 className="flex-1 text-2xl font-bold mb-2">Songs ({songs.length})</h2>

                        {isMe ? (
                            <div className="filter flex-none">
                                <input
                                    className="btn btn-sm"
                                    type="radio"
                                    name="song-type"
                                    aria-label="Orphans"
                                    onChange={() => setFilter(FilterOption.Orphans)}
                                />
                                <input
                                    className="btn btn-sm"
                                    type="radio"
                                    name="song-type"
                                    aria-label="Others"
                                    onChange={() => setFilter(FilterOption.Others)}
                                />
                                <input
                                    className="btn btn-square btn-sm filter-reset"
                                    type="radio"
                                    name="song-type"
                                    aria-label="All"
                                    onClick={() => setFilter(FilterOption.All)}
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Responsive Sets Layout */}
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
