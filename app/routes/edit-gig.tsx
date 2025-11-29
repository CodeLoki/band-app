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
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuCircleX, LuSave, LuTrash2 } from 'react-icons/lu';
import { Form, useLoaderData } from 'react-router';
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
import { useToastHelpers } from '@/hooks/useToastHelpers';
import { type AppData, loadAppData } from '@/loaders/appData';
import { getTitle, sortBy } from '@/utils/general';

interface EditGigLoaderData extends AppData {
    gigId: string;
    songs: DocumentSnapshot<Song>[];
    gig?: DocumentSnapshot<Gig>;
    gigData?: Gig;
    one?: DocumentSnapshot<Song>[];
    two?: DocumentSnapshot<Song>[];
    pocket?: DocumentSnapshot<Song>[];
}

export async function clientLoader({
    request,
    params
}: {
    request: Request;
    params: Record<string, string | undefined>;
}) {
    const appData = await loadAppData(request),
        { gigId } = params;

    if (!gigId) {
        throw new Error('No gig ID provided.');
    }

    const songs = sortBy(
        (
            await getDocs(
                query(collection(db, 'songs'), where('bands', 'array-contains', appData.band.ref)).withConverter(
                    songConverter
                )
            )
        ).docs,
        'title'
    );

    if (gigId === 'new') {
        return {
            ...appData,
            songs,
            gigId
        };
    }

    const gig = await getDoc(doc(db, 'gigs', gigId).withConverter(gigConverter)),
        gigData = gig?.data();

    if (!gig || !gigData) {
        return {
            ...appData,
            songs,
            gigId,
            gig
        };
    }

    // Fetch all songs in parallel
    const [one, two, pocket] = await Promise.all(
        [gigData.one, gigData.two, gigData.pocket].map((refs) => Promise.all(refs.map((ref) => getDoc(ref))))
    );

    return {
        ...appData,
        songs,
        gigId,
        gig,
        gigData,
        one,
        two,
        pocket
    };
}

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
    const { band, songs, gigId, gig, gigData, one, two, pocket } = useLoaderData<EditGigLoaderData>();

    const { canEdit, isMe } = useFirestore(),
        { setNavbarContent } = useNavbar(),
        { showError, showSuccess } = useToastHelpers(),
        { navigate } = useNavigateWithParams(),
        [currentSetOne, setCurrentSetOne] = useState<DocumentSnapshot<Song>[]>(one ?? []),
        [currentSetTwo, setCurrentSetTwo] = useState<DocumentSnapshot<Song>[]>(two ?? []),
        [currentPocket, setCurrentPocket] = useState<DocumentSnapshot<Song>[]>(pocket ?? []),
        formRef = useRef<HTMLFormElement>(null),
        deleteModalRef = useRef<HTMLDialogElement>(null);

    const getSnapshotsFromSongs = useCallback(
        (songsToConvert: Song[]) => {
            return songsToConvert
                .map((song) => songs.find((doc) => doc.id === song.id))
                .filter((doc): doc is DocumentSnapshot<Song> => doc !== null);
        },
        [songs]
    );

    if (!canEdit || !isMe) {
        throw new Error('You do not have permission to edit gigs.');
    }

    const performDelete = useCallback(async () => {
        if (gig) {
            try {
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

    // Create a single pool of available songs that excludes any song already assigned to any set
    const availableSongs = songs.filter(
        (song) =>
            !currentSetOne.some(({ id }) => id === song.id) &&
            !currentSetTwo.some(({ id }) => id === song.id) &&
            !currentPocket.some(({ id }) => id === song.id)
    );

    const pageTitle = getTitle(gigId === 'new' ? 'Create Gig' : `Edit "${gigData?.venue ?? ''}"`, band);

    return (
        <>
            <title>{pageTitle}</title>
            <div className="m-8">
                <div className="card card-border bg-neutral shadow-xl">
                    <Form ref={formRef} className="card-body space-y-4">
                        <DateInput label="Date" name="date" currentValue={gigData?.date} />
                        <TextInput label="Venue" name="venue" defaultValue={gigData?.venue ?? ''} />

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
        </>
    );
}
