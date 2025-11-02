import { type DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { LuFilePen } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';
import ActionSelector from '@/components/ActionSelector';
import Loading from '@/components/Loading';
import NavBarLink from '@/components/NavBarLink';
import SongCard from '@/components/SongCard';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { useNavbar } from '@/contexts/NavbarContext';
import { type Gig, gigConverter } from '@/firestore/gigs';
import type { Song } from '@/firestore/songs';
import { calculateSetListLength } from '@/firestore/songs';
import { usePageTitle } from '@/hooks/usePageTitle';

// meta function removed as title is managed by usePageTitle
function SetList({
    title,
    songs,
    isSingleSet = false
}: {
    title: string;
    songs: DocumentSnapshot<Song>[];
    isSingleSet?: boolean;
}) {
    const text = `${title} (${calculateSetListLength(songs)})`;

    if (!isSingleSet) {
        return (
            <div key={title}>
                <h3 className="text-xl font-bold mb-4">{text}</h3>
                <div className="grid grid-cols-1 gap-4">
                    {songs.length ? (
                        songs.map((song) => <SongCard song={song} key={song.id} />)
                    ) : (
                        <p className="italic text-base-content/50">No songs in this set.</p>
                    )}
                </div>
            </div>
        );
    }

    // For single set mode, split songs into two columns
    const midpoint = Math.ceil(songs.length / 2);
    const firstColumn = songs.slice(0, midpoint);
    const secondColumn = songs.slice(midpoint);

    return (
        <div key={title}>
            <h3 className="text-xl font-bold mb-4">{text}</h3>
            <div className="block md:flex md:gap-4 w-full">
                <div className="space-y-4 mb-4 md:mb-0 md:flex-1">
                    {firstColumn.map((song) => (
                        <SongCard song={song} key={song.id} />
                    ))}
                </div>
                <div className="space-y-4 md:flex-1">
                    {secondColumn.map((song) => (
                        <SongCard song={song} key={song.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function GigRoute() {
    const { gigId } = useParams(),
        { canEdit } = useFirestore(),
        navigate = useNavigate(),
        [gig, setGig] = useState<DocumentSnapshot<Gig>>(),
        [songs, setSongs] = useState<{
            one: DocumentSnapshot<Song>[];
            two: DocumentSnapshot<Song>[];
            pocket: DocumentSnapshot<Song>[];
        }>(),
        [loading, setLoading] = useState(true),
        { setNavbarContent } = useNavbar();

    const pageTitle = (() => {
        const gigData = gig?.data();
        if (!gigData) return 'Loading Gig...';
        return `${gigData.venue} - ${gigData.date.toDate().toLocaleDateString('en', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })}`;
    })();

    usePageTitle({ pageTitle });

    useEffect(() => {
        if (canEdit) {
            setNavbarContent(
                <NavBarLink to={`/edit-gig/${gigId}`}>
                    <LuFilePen />
                    Edit
                </NavBarLink>
            );
        }

        return () => setNavbarContent(null);
    }, [setNavbarContent, canEdit, gigId]);

    useEffect(() => {
        if (!gigId) {
            navigate('/');
            return;
        }

        (async () => {
            try {
                const gigDoc = await getDoc(doc(db, 'gigs', gigId).withConverter(gigConverter));
                if (!gigDoc.exists()) {
                    navigate('/');
                    return;
                }

                setGig(gigDoc);

                const gigData = gigDoc.data();
                if (!gigData) {
                    navigate('/');
                    return;
                }

                // Fetch all songs in parallel
                const [one, two, pocket] = await Promise.all([
                    Promise.all(gigData.one.map((ref) => getDoc(ref))),
                    Promise.all(gigData.two.map((ref) => getDoc(ref))),
                    Promise.all(gigData.pocket.map((ref) => getDoc(ref)))
                ]);

                setSongs({ one, two, pocket });
                setLoading(false);
            } catch (error) {
                console.error('Error loading gig:', error);
                navigate('/');
            }
        })();
    }, [gigId, navigate]);

    if (loading) {
        return <Loading />;
    }

    const gigData = gig?.data();
    if (!gigData || !songs) {
        return <Loading />;
    }

    return (
        <>
            <div className="p-4">
                <div className="flex flex-col gap-8">
                    <h2 className="text-2xl font-bold mb-2">{pageTitle}</h2>

                    {/* Responsive Sets Layout */}
                    {songs.two.length === 0 && songs.pocket.length === 0 ? (
                        <div className="grid gap-y-8 grid-cols-1 gap-4">
                            <SetList title="Single Set" songs={songs.one} isSingleSet={true} />
                        </div>
                    ) : (
                        <div className="grid gap-y-8 grid-cols-1 md:grid-cols-2 gap-4">
                            <SetList title="Set One" songs={songs.one} />
                            <SetList title="Set Two" songs={songs.two} />
                            <SetList title="Pocket" songs={songs.pocket} />
                        </div>
                    )}
                </div>
            </div>
            <ActionSelector />
        </>
    );
}
