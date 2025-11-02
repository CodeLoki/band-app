import {
    addDoc,
    collection,
    type DocumentReference,
    type DocumentSnapshot,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LuCircleX, LuSave, LuTrash2 } from 'react-icons/lu';
import { Form, useParams } from 'react-router';
import Loading from '@/components/Loading';
import NavBarButton from '@/components/NavBarButton';
import ShoppingCart from '@/components/ShoppingCart';
import DateInput from '@/components/ui/DateInput';
import TextInput from '@/components/ui/TextInput';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { useNavbar } from '@/contexts/NavbarContext';
import { type Gig, gigConverter } from '@/firestore/gigs';
import type { Song } from '@/firestore/songs';
import { calculateSetListLength, songConverter } from '@/firestore/songs';
import { useNavigateWithParams } from '@/hooks/useNavigateWithParams';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToastHelpers } from '@/hooks/useToastHelpers';
import { sortBy } from '@/utils/general';

function getGigTitle(gig?: { date: Timestamp; venue: string }) {
    const date = gig?.date.toDate() ?? new Date(),
        venue = gig?.venue || 'Unknown Venue';

    return `${venue} - ${date.toLocaleDateString()}`;
}

function getSongsFromDocs(docs: DocumentSnapshot<Song>[]) {
    return docs
        .map((doc) => {
            const data = doc.data();
            return data ? { ...data, id: doc.id } : null;
        })
        .filter((song): song is Song => song !== null);
}

export default function EditGigTest() {
    const { gigId } = useParams(),
        { band, canEdit, isMe } = useFirestore(),
        { setNavbarContent } = useNavbar(),
        { showError, showSuccess } = useToastHelpers(),
        { navigate } = useNavigateWithParams(),
        [gig, setGig] = useState<DocumentSnapshot<Gig> | null>(null),
        [songs, setSongs] = useState<DocumentSnapshot<Song>[]>([]),
        [loading, setLoading] = useState(true),
        [currentSetOne, setCurrentSetOne] = useState<DocumentSnapshot<Song>[]>([]),
        [currentSetTwo, setCurrentSetTwo] = useState<DocumentSnapshot<Song>[]>([]),
        [currentPocket, setCurrentPocket] = useState<DocumentSnapshot<Song>[]>([]),
        formRef = useRef<HTMLFormElement>(null),
        deleteModalRef = useRef<HTMLDialogElement>(null);

    // Stabilize band reference to prevent endless loops
    const bandRef = useMemo(() => band.ref, [band]);

    const getSnapshotsFromSongs = useCallback(
        (songsToConvert: Song[]) => {
            return songsToConvert
                .map((song) => songs.find((doc) => doc.id === song.id))
                .filter((doc): doc is DocumentSnapshot<Song> => doc !== null);
        },
        [songs]
    );

    const [initialData, setInitialData] = useState<
        Pick<Partial<Gig>, 'date' | 'venue'> & {
            one: DocumentSnapshot<Song>[];
            two: DocumentSnapshot<Song>[];
            pocket: DocumentSnapshot<Song>[];
        }
    >({
        date: undefined,
        venue: '',
        one: [],
        two: [],
        pocket: []
    });

    usePageTitle({
        pageTitle: gigId === 'new' ? 'Create Gig' : initialData ? `Edit "${initialData.venue || 'Gig'}"` : 'Loading...'
    });

    if (!canEdit || !isMe) {
        throw new Error('You do not have permission to edit gigs.');
    }

    if (!gigId) {
        throw new Error('No gig ID provided.');
    }

    const performDelete = useCallback(async () => {
        if (gig) {
            try {
                // Close the modal first
                deleteModalRef.current?.close();
                await deleteDoc(gig.ref);
                showSuccess(`Gig "${getGigTitle(gig.data())}" was deleted.`);
                setTimeout(() => navigate('/'), 100);
            } catch (ex) {
                showError('Failed to delete gig.', {
                    details: ex instanceof Error ? ex.message : String(ex)
                });
            }
        }
    }, [showSuccess, showError, gig, navigate]);

    const handleSave = useCallback(() => {
        // Get current form data when clicked
        if (!formRef.current) {
            return;
        }

        try {
            const formData = new FormData(formRef.current),
                fnGetSongsRefs = (songIds: string[]): DocumentReference<Song>[] => {
                    return songIds
                        .map((id) => songs.find((song) => song.id === id))
                        .filter((s) => !!s)
                        .map((s) => s?.ref);
                },
                gigData: Omit<Gig, 'id'> = {
                    band: band.ref,
                    date: Timestamp.fromDate(new Date(formData.get('date') as string)),
                    venue: formData.get('venue') as string,
                    one: fnGetSongsRefs(formData.getAll('setOne') as string[]),
                    two: fnGetSongsRefs(formData.getAll('setTwo') as string[]),
                    pocket: fnGetSongsRefs(formData.getAll('pocket') as string[])
                };

            if (gig) {
                updateDoc(gig.ref, gigData)
                    .then(() => {
                        showSuccess(`Gig "${getGigTitle(gigData)}" saved.`);
                        setTimeout(() => navigate(`/gig/${gig.id}`), 100);
                    })
                    .catch((ex) => {
                        showError('DB operation failed.', {
                            details: ex instanceof Error ? ex.message : String(ex)
                        });
                    });
            } else {
                addDoc(collection(db, 'gigs'), gigData)
                    .then((g) => {
                        showSuccess(`Gig "${getGigTitle(gigData)}" created.`);
                        setTimeout(() => navigate(`/gig/${g.id}`), 100);
                    })
                    .catch((ex) => {
                        showError('DB operation failed.', {
                            details: ex instanceof Error ? ex.message : String(ex)
                        });
                    });
            }
        } catch (error) {
            console.error('Error in save:', error);
        }
    }, [band, gig, navigate, songs, showSuccess, showError]);

    const handleDelete = useCallback(() => {
        deleteModalRef.current?.showModal();
    }, []);

    useEffect(() => {
        setNavbarContent(
            <div className="flex">
                <NavBarButton fn={handleSave} className="text-primary">
                    <LuSave />
                    Save
                </NavBarButton>
                {gigId !== 'new' && (
                    <NavBarButton fn={handleDelete} className="text-error">
                        <LuTrash2 />
                        Delete
                    </NavBarButton>
                )}
                <NavBarButton fn={() => navigate('/')}>
                    <LuCircleX />
                    Cancel
                </NavBarButton>
            </div>
        );

        return () => setNavbarContent(null);
    }, [setNavbarContent, gigId, handleSave, handleDelete, navigate]);

    useEffect(() => {
        (async () => {
            try {
                const allSongs = await getDocs(
                    query(collection(db, 'songs'), where('bands', 'array-contains', bandRef)).withConverter(
                        songConverter
                    )
                );

                setSongs(sortBy(allSongs.docs, 'title'));

                if (gigId === 'new') {
                    return;
                }

                const gigDoc = await getDoc(doc(db, 'gigs', gigId).withConverter(gigConverter));
                if (!gigDoc) {
                    navigate('/');
                    return;
                }

                setGig(gigDoc);

                const gigData = gigDoc.data();
                if (!gigData) {
                    return;
                }

                // Fetch all songs in parallel
                const [one, two, pocket] = await Promise.all([
                    Promise.all(gigData.one.map((ref) => getDoc(ref))),
                    Promise.all(gigData.two.map((ref) => getDoc(ref))),
                    Promise.all(gigData.pocket.map((ref) => getDoc(ref)))
                ]);

                // Extract and set initial selections as DocumentSnapshots
                setCurrentSetOne(one ?? []);
                setCurrentSetTwo(two ?? []);
                setCurrentPocket(pocket ?? []);

                setInitialData({
                    date: gigData.date,
                    venue: gigData.venue,
                    one: one,
                    two: two,
                    pocket: pocket
                });
            } catch (error) {
                showError('Failed to load gig', {
                    details: error instanceof Error ? error.message : String(error)
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [bandRef, gigId, showError, navigate]);

    if (loading) {
        return <Loading />;
    }

    // Create a single pool of available songs that excludes any song already assigned to any set
    const availableSongs = songs.filter(
        (song) =>
            !currentSetOne.some(({ id }) => id === song.id) &&
            !currentSetTwo.some(({ id }) => id === song.id) &&
            !currentPocket.some(({ id }) => id === song.id)
    );

    return (
        <div className="m-8">
            <div className="card card-border bg-neutral shadow-xl">
                <Form ref={formRef} className="card-body space-y-4">
                    <DateInput label="Date" name="date" currentValue={initialData.date} />
                    <TextInput label="Venue" name="venue" defaultValue={initialData.venue} />

                    <h2 className="card-title mt-4">Set One Songs ({calculateSetListLength(currentSetOne)})</h2>
                    <ShoppingCart
                        allItems={getSongsFromDocs(availableSongs)}
                        selectedItems={getSongsFromDocs(currentSetOne)}
                        name="setOne"
                        labelField="title"
                        onChange={(songs) => setCurrentSetOne(getSnapshotsFromSongs(songs))}
                    />

                    <h2 className="card-title mt-4">Set Two Songs ({calculateSetListLength(currentSetTwo)})</h2>
                    <ShoppingCart
                        allItems={getSongsFromDocs(availableSongs)}
                        selectedItems={getSongsFromDocs(currentSetTwo)}
                        name="setTwo"
                        labelField="title"
                        onChange={(songs) => setCurrentSetTwo(getSnapshotsFromSongs(songs))}
                    />

                    <h2 className="card-title mt-4">Pocket Songs ({calculateSetListLength(currentPocket)})</h2>
                    <ShoppingCart
                        allItems={getSongsFromDocs(availableSongs)}
                        selectedItems={getSongsFromDocs(currentPocket)}
                        name="pocket"
                        labelField="title"
                        onChange={(songs) => setCurrentPocket(getSnapshotsFromSongs(songs))}
                    />
                </Form>
            </div>

            <dialog ref={deleteModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete Gig</h3>
                    <p className="py-4">
                        Are you sure you want to delete "<strong>{getGigTitle(gig?.data())}</strong>"?
                    </p>
                    <p className="text-warning text-sm">This action cannot be undone.</p>
                    <div className="modal-action">
                        <button type="button" className="btn btn-error" onClick={performDelete}>
                            <LuTrash2 />
                            Delete
                        </button>
                        <button
                            type="button"
                            className="btn btn-neutral"
                            onClick={() => deleteModalRef.current?.close()}
                        >
                            <LuCircleX />
                            Cancel
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
