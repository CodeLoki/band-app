import { type DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { useCallback, useEffect, useState } from 'react';
import { LuFilePen, LuFileText } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router-dom';
import ActionSelector from '@/components/ActionSelector';
import Loading from '@/components/Loading';
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
import { getTitle } from '@/utils/general';

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
    const midpoint = Math.ceil(songs.length / 2);
    const firstColumn = songs.slice(0, midpoint);
    const secondColumn = songs.slice(midpoint);

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
    const { gigId } = useParams(),
        { canEdit, band } = useFirestore(),
        navigate = useNavigate(),
        [gig, setGig] = useState<DocumentSnapshot<Gig>>(),
        [songs, setSongs] = useState<{
            one: DocumentSnapshot<Song>[];
            two: DocumentSnapshot<Song>[];
            pocket: DocumentSnapshot<Song>[];
        }>(),
        [loading, setLoading] = useState(true),
        { showError, showSuccess } = useToastHelpers(),
        { setNavbarContent } = useNavbar();

    const generatePDF = useCallback(() => {
        if (!gig || !songs) return;

        const gigData = gig.data();
        if (!gigData) return;

        try {
            const date = getGigDate(gig),
                lineHeight = 10,
                pdf = new jsPDF({
                    format: 'letter'
                });

            const fnRenderHeader = (): number => {
                pdf.setFont('Helvetica', 'bold');
                pdf.text(gigData.venue, lineHeight, 10);
                pdf.text(date, 200, 10, {
                    align: 'right'
                });
                pdf.setFont('Helvetica', 'normal');

                return 30;
            };

            let baseY = fnRenderHeader();

            const fnAddSetList = (
                setTitle: string,
                setSongs: DocumentSnapshot<Song>[],
                xOffset: number,
                yOffset: number
            ) => {
                pdf.setFont('Helvetica', 'bold');
                pdf.text(getSetListTitle(setTitle, setSongs), lineHeight + xOffset, yOffset);
                pdf.setFont('Helvetica', 'normal');

                setSongs.forEach((song, index) => {
                    const data = song.data();
                    if (data) {
                        pdf.text(
                            `${song.data()?.title}`,
                            lineHeight + xOffset,
                            yOffset + lineHeight + index * lineHeight
                        );
                    }
                });
            };

            const { one, two, pocket } = songs;

            if (one.length > 0) {
                fnAddSetList('Set One', one, 0, baseY);
            }

            if (two.length > 0) {
                fnAddSetList('Set Two', two, 100, baseY);
            }

            // Update baseY to account for the tallest set list.
            baseY = baseY + 20 + Math.max(one.length, two.length) * lineHeight;

            if (pocket.length > 0) {
                // Will the pocket set NOT fit on the current page?
                if (baseY + pocket.length * lineHeight > 290) {
                    pdf.addPage();
                    baseY = fnRenderHeader();
                }

                fnAddSetList('Pocket', pocket, 0, baseY);
            }

            pdf.save(`${gigData.venue}-${date}.pdf`);
            showSuccess('PDF generated successfully!');
        } catch (ex) {
            showError('Failed to generate PDF', {
                details: ex instanceof Error ? ex.message : String(ex)
            });
        }
    }, [gig, songs, showSuccess, showError]);

    useEffect(() => {
        if (canEdit) {
            setNavbarContent(
                <NavBarLink to={`/edit-gig/${gigId}`}>
                    <LuFilePen />
                    Edit
                </NavBarLink>
            );
        } else {
            setNavbarContent(
                <NavBarButton fn={generatePDF}>
                    <LuFileText />
                    PDF
                </NavBarButton>
            );
        }

        return () => setNavbarContent(null);
    }, [setNavbarContent, canEdit, gigId, generatePDF]);

    useEffect(() => {
        if (!gigId) {
            void navigate('/');
            return;
        }

        void (async () => {
            try {
                const gigDoc = await getDoc(doc(db, 'gigs', gigId).withConverter(gigConverter));
                if (!gigDoc.exists()) {
                    void navigate('/');
                    return;
                }

                setGig(gigDoc);

                const gigData = gigDoc.data();
                if (!gigData) {
                    void navigate('/');
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
                void navigate('/');
            }
        })();
    }, [gigId, navigate]);

    if (loading) {
        return <Loading />;
    }

    const gigData = gig?.data();
    if (!gig || !gigData || !songs) {
        return <Loading />;
    }

    const pageTitle = getTitle(`${gigData.venue} - ${getGigDate(gig)}`, band);

    return (
        <>
            <title>{pageTitle}</title>
            <div className="p-4">
                <div className="flex flex-col gap-8">
                    <h2 className="text-2xl font-bold mb-2">{pageTitle}</h2>

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
