import { addDoc, collection, type DocumentSnapshot, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuCircleX, LuSave, LuTrash2 } from 'react-icons/lu';
import { Form, useParams } from 'react-router-dom';
import Loading from '@/components/Loading';
import NavBarButton from '@/components/NavBarButton';
import Checklist from '@/components/ui/Checklist';
import SelectInput from '@/components/ui/SelectInput';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
import { useNavbar } from '@/contexts/NavbarContext';
import {
    DrumPad,
    drumPadMap,
    Instrument,
    instrumentMap,
    type Song,
    StartsWith,
    songConverter,
    startsWithMap
} from '@/firestore/songs';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToastHelpers } from '@/hooks/useToastHelpers';

// Remove meta function as title is managed by usePageTitle

function getOptionsFromMap(map: Map<number, string>, includeNone = false) {
    return Array.from(map.entries())
        .filter(([value]) => includeNone || value !== -1)
        .map(([value, label]) => ({
            value,
            label
        }));
}

export default function EditSong() {
    const { songId } = useParams(),
        { canEdit, isMe, bands, band } = useFirestore(),
        { setNavbarContent } = useNavbar(),
        { showError, showSuccess } = useToastHelpers(),
        [song, setSong] = useState<DocumentSnapshot<Song> | null>(null),
        [loading, setLoading] = useState(true);

    const formRef = useRef<HTMLFormElement>(null);
    const deleteModalRef = useRef<HTMLDialogElement>(null);

    const goBack = useCallback(() => {
        window.history.back();
    }, []);

    usePageTitle({
        pageTitle: songId === 'new' ? 'Create Song' : song ? `Edit "${song.data()?.title || 'Song'}"` : 'Loading...'
    });

    // Form state - only for loading existing data
    const [initialData, setInitialData] = useState<Partial<Song>>({
        title: '',
        artist: '',
        length: 0,
        startsWith: StartsWith.All,
        features: Instrument.None,
        solos: [],
        groove: '',
        ytMusic: '',
        notes: '',
        pad: DrumPad.None,
        practice: false,
        bands: [band]
    });

    if (!canEdit || !isMe) {
        throw new Error('You do not have permission to edit songs.');
    }

    if (!songId) {
        throw new Error('No song ID provided.');
    }

    // Stable save function that doesn't depend on changing state
    const performSave = useCallback(
        async (currentSong: DocumentSnapshot<Song> | null) => {
            if (formRef.current) {
                try {
                    const formData = new FormData(formRef.current);

                    // Convert FormData to a regular object for easier handling
                    const songData = {
                        title: formData.get('title') as string,
                        artist: formData.get('artist') as string,
                        length: parseInt(formData.get('length') as string, 10) || 0,
                        startsWith: parseInt(formData.get('startsWith') as string, 10) as StartsWith,
                        features: parseInt(formData.get('features') as string, 10) as Instrument,
                        solos: formData.getAll('solos').map((s) => parseInt(s as string, 10) as Instrument),
                        groove: formData.get('groove') as string,
                        ytMusic: formData.get('ytMusic') as string,
                        notes: formData.get('notes') as string,
                        pad: parseInt(formData.get('pad') as string, 10) as DrumPad,
                        practice: formData.get('practice') === 'on',
                        bands: formData
                            .getAll('bands')
                            .map((id) => bands.find((b) => b.id === id)?.ref)
                            .filter((ref) => !!ref)
                    };

                    if (currentSong) {
                        await updateDoc(currentSong.ref, songData);
                        showSuccess(`Song ${songData.title} saved.`);
                    } else {
                        await addDoc(collection(db, 'songs'), songData);
                        showSuccess(`Song ${songData.title} created.`);
                    }

                    goBack();
                } catch (ex) {
                    showError('DB operation failed.', {
                        details: ex instanceof Error ? ex.message : String(ex)
                    });
                }
            }
        },
        [bands, showSuccess, showError, goBack]
    );

    // Wrapper that passes current state to the stable function
    const handleSave = useCallback(() => {
        performSave(song);
    }, [performSave, song]);

    const handleDelete = useCallback(() => {
        deleteModalRef.current?.showModal();
    }, []);

    const performDelete = useCallback(async () => {
        if (song) {
            try {
                // Close the modal first
                deleteModalRef.current?.close();

                await deleteDoc(song.ref);
                showSuccess(`Song "${song.data()?.title}" was deleted.`);
                goBack();
            } catch (ex) {
                showError('Failed to delete song.', {
                    details: ex instanceof Error ? ex.message : String(ex)
                });
            }
        }
    }, [song, showSuccess, showError, goBack]);

    useEffect(() => {
        setNavbarContent(
            <div className="flex">
                <NavBarButton fn={handleSave} className="text-primary">
                    <LuSave />
                    Save
                </NavBarButton>
                {songId !== 'new' && (
                    <NavBarButton fn={handleDelete} className="text-errorAdd">
                        <LuTrash2 />
                        Delete
                    </NavBarButton>
                )}
                <NavBarButton fn={goBack}>
                    <LuCircleX />
                    Cancel
                </NavBarButton>
            </div>
        );

        return () => setNavbarContent(null);
    }, [setNavbarContent, songId, handleSave, handleDelete, goBack]);

    useEffect(() => {
        (async () => {
            try {
                if (songId === 'new') {
                    return;
                }

                const songDoc = await getDoc(doc(db, 'songs', songId).withConverter(songConverter));
                if (!songDoc.exists()) {
                    throw new Error('Song not found.');
                }

                setSong(songDoc);

                const songData = songDoc.data();
                setInitialData({
                    title: songData.title || '',
                    artist: songData.artist || '',
                    length: songData.length || 0,
                    startsWith: songData.startsWith || StartsWith.All,
                    features: songData.features || Instrument.None,
                    solos: songData.solos || [],
                    groove: songData.groove || '',
                    ytMusic: songData.ytMusic || '',
                    notes: songData.notes || '',
                    pad: songData.pad || DrumPad.None,
                    practice: songData.practice || false,
                    bands: songData.bands || []
                });
            } catch (error) {
                showError('Failed to load song', {
                    details: error instanceof Error ? error.message : String(error)
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [songId, showError]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="max-w-5xl mx-auto my-5">
            <div className="card card-border bg-neutral shadow-xl">
                <Form ref={formRef} className="card-body">
                    <div className="space-y-4">
                        <TextInput label="Title" name="title" defaultValue={initialData.title} />

                        <TextInput label="Artist" name="artist" defaultValue={initialData.artist} />

                        <TextInput
                            label="Length (seconds)"
                            name="length"
                            defaultValue={initialData.length}
                            type="number"
                        />

                        <SelectInput
                            label="Starts With"
                            name="startsWith"
                            defaultValue={initialData.startsWith || StartsWith.All}
                            options={getOptionsFromMap(startsWithMap)}
                        />

                        <SelectInput
                            label="Features"
                            name="features"
                            defaultValue={initialData.features || Instrument.None}
                            options={getOptionsFromMap(instrumentMap, true)}
                        />

                        <Checklist
                            label="Solos"
                            name="solos"
                            options={getOptionsFromMap(instrumentMap)}
                            values={initialData.solos}
                        />

                        <TextArea label="GrooveScribe" name="groove" defaultValue={initialData.groove} />

                        <TextInput label="YT Music" name="ytMusic" defaultValue={initialData.ytMusic} />

                        <TextInput label="Drum Notes" name="notes" defaultValue={initialData.notes} />

                        <SelectInput
                            label="Percussion Pad"
                            name="pad"
                            defaultValue={initialData.pad || DrumPad.None}
                            options={getOptionsFromMap(drumPadMap, true)}
                        />

                        <Checklist
                            label="Bands"
                            name="bands"
                            options={bands.map((b) => {
                                const { id, description } = b.data();
                                return {
                                    value: id,
                                    label: description
                                };
                            })}
                            values={(initialData.bands ?? []).map(({ id }) => id)}
                        />

                        <label className="flex items-center gap-3 cursor-pointer hover:bg-base-200 rounded-lg p-2 transition-colors">
                            <input
                                type="checkbox"
                                name="practice"
                                value="practice"
                                className="checkbox checkbox-primary"
                                defaultChecked={initialData.practice}
                            />
                            <span className="label-text text-sm">Flag for practice</span>
                        </label>
                    </div>
                </Form>
            </div>
            <dialog ref={deleteModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete Song</h3>
                    <p className="py-4">
                        Are you sure you want to delete "<strong>{song?.data()?.title ?? 'this song'}</strong>"?
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
