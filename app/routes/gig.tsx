import { type DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect } from 'react';
import { LuFilePen, LuFileText } from 'react-icons/lu';
import { redirect, useLoaderData } from 'react-router';
import ActionSelector from '@/components/ActionSelector';
import NavBarButton from '@/components/NavBarButton';
import NavBarLink from '@/components/NavBarLink';
import SongCard from '@/components/SongCard';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { useNavbar } from '@/contexts/NavbarContext';
import { type Gig, gigConverter } from '@/firestore/gigs';
import type { Song } from '@/firestore/songs';
import { calculateSetListLength } from '@/firestore/songs';
import { useToastHelpers } from '@/hooks/useToastHelpers';
import { type AppData, loadAppData } from '@/loaders/appData';
import { getTitle } from '@/utils/general';
import { generateSetListPdf } from '@/utils/generate-pdf';

interface GigLoaderData extends Pick<AppData, 'band'> {
    gigId: string;
    gig: DocumentSnapshot<Gig>;
    songs: {
        one: DocumentSnapshot<Song>[];
        two: DocumentSnapshot<Song>[];
        pocket: DocumentSnapshot<Song>[];
    };
}

export async function clientLoader({
    request,
    params
}: {
    request: Request;
    params: Record<string, string | undefined>;
}) {
    const { band } = await loadAppData(request);

    const { gigId } = params;
    if (!gigId) {
        throw redirect('/');
    }

    const gigDoc = await getDoc(doc(db, 'gigs', gigId).withConverter(gigConverter));
    if (!gigDoc.exists()) {
        throw redirect('/');
    }

    const gigData = gigDoc.data();
    if (!gigData) {
        throw redirect('/');
    }

    // Fetch all songs in parallel
    const [one, two, pocket] = await Promise.all(
        [gigData.one, gigData.two, gigData.pocket].map((refs) => Promise.all(refs.map((ref) => getDoc(ref))))
    );

    return {
        band,
        gigId,
        gig: gigDoc,
        songs: { one, two, pocket }
    };
}

function getSetListTitle(title: string, songs: DocumentSnapshot<Song>[]) {
    return `${title} (${calculateSetListLength(songs)})`;
}

function SetList({
    title,
    songs,
    isSingleSet = false
}: {
    title: string;
    songs: DocumentSnapshot<Song>[];
    isSingleSet?: boolean;
}) {
    const setListTitle = getSetListTitle(title, songs);

    if (!isSingleSet) {
        return (
            <div key={title}>
                <h3 className="text-xl font-bold mb-4">{setListTitle}</h3>
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
    const midpoint = Math.ceil(songs.length / 2),
        firstColumn = songs.slice(0, midpoint),
        secondColumn = songs.slice(midpoint);

    return (
        <div key={title}>
            <h3 className="text-xl font-bold mb-4">{setListTitle}</h3>
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

function getGigDate(gig: DocumentSnapshot<Gig>) {
    const gigData = gig.data();
    if (!gigData) return 'Unknown Date';

    return gigData.date.toDate().toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

export default function GigRoute() {
    const { band, gigId, gig, songs } = useLoaderData<GigLoaderData>(),
        { canEdit, user } = useFirestore(),
        { showError, showSuccess } = useToastHelpers(),
        { setNavbarContent } = useNavbar();

    const generatePDF = useCallback(() => {
        try {
            generateSetListPdf(gig, songs, user);
            showSuccess('PDF generated successfully!');
        } catch (ex) {
            showError('Failed to generate PDF', {
                details: ex instanceof Error ? ex.message : String(ex)
            });
        }
    }, [gig, songs, user, showSuccess, showError]);

    useEffect(() => {
        if (canEdit) {
            setNavbarContent(<NavBarLink icon={<LuFilePen />} text="Edit" to={`/edit-gig/${gigId}`} />);
        } else {
            setNavbarContent(<NavBarButton icon={<LuFileText />} text="PDF" fn={generatePDF} />);
        }

        return () => setNavbarContent(null);
    }, [setNavbarContent, canEdit, gigId, generatePDF]);

    const gigTitle = `${gig.get('venue')} - ${getGigDate(gig)}`,
        pageTitle = getTitle(gigTitle, band);

    return (
        <>
            <title>{pageTitle}</title>
            <div className="p-4">
                <div className="flex flex-col gap-8">
                    <h2 className="text-2xl font-bold mb-2">{gigTitle}</h2>

                    {/* Responsive Sets Layout */}
                    {songs.two.length === 0 ? (
                        <>
                            <div className="grid gap-y-8 grid-cols-1 gap-4">
                                <SetList title="Single Set" songs={songs.one} isSingleSet={true} />
                            </div>
                            {songs.pocket.length > 0 && (
                                <div className="grid gap-y-8 grid-cols-1 md:grid-cols-2 gap-4">
                                    <SetList title="Pocket" songs={songs.pocket} />
                                </div>
                            )}
                        </>
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
