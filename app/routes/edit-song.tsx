import { addDoc, collection, type DocumentSnapshot, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useRef } from 'react';
import { LuCircleX, LuTrash2 } from 'react-icons/lu';
import { Form, useLoaderData } from 'react-router';
import CommandPanel from '@/components/CommandPanel';
import Checklist from '@/components/ui/Checklist';
import SelectInput from '@/components/ui/SelectInput';
import TextArea from '@/components/ui/TextArea';
import TextInput from '@/components/ui/TextInput';
import { db } from '@/config/firebase';
import { useFirestore } from '@/contexts/Firestore';
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
import { useToastHelpers } from '@/hooks/useToastHelpers';
import { type AppData, loadAppData } from '@/loaders/appData';
import { getTitle } from '@/utils/general';

interface EditSongLoaderData extends AppData {
    songId: string;
    song?: DocumentSnapshot<Song>;
}

export async function clientLoader({
    request,
    params
}: {
    request: Request;
    params: Record<string, string | undefined>;
}) {
    const appData = await loadAppData(request);

    const { songId } = params;
    if (!songId) {
        throw new Error('No song ID provided.');
    }

    if (songId === 'new') {
        return {
            ...appData,
            songId
        };
    }

    const song = await getDoc(doc(db, 'songs', songId).withConverter(songConverter));
    if (!song.exists()) {
        throw new Error('Song not found.');
    }

    return {
        ...appData,
        songId,
        song
    };
}

function getOptionsFromMap(map: Map<number, string>, includeNone = false) {
    return Array.from(map.entries())
        .filter(([value]) => includeNone || value !== -1)
        .map(([value, label]) => ({
            value,
            label
        }));
}

export default function EditSong() {
    const { canEdit, isMe } = useFirestore(),
        { songId, song, band, bands } = useLoaderData<EditSongLoaderData>(),
        { showError, showSuccess } = useToastHelpers();

    if (!canEdit || !isMe) {
        throw new Error('You do not have permission to edit songs.');
    }

    const formRef = useRef<HTMLFormElement>(null),
        deleteModalRef = useRef<HTMLDialogElement>(null);

    const goBack = useCallback(() => {
        window.history.back();
    }, []);

    const songData = song?.data() ?? ({} as Partial<Song>),
        initialData: Partial<Song> = {
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
            bands: songData.bands || [band]
        };

    const handleSave = useCallback(async () => {
        if (!formRef.current) return;

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
                practice: !!formData.get('practice'),
                bands: formData
                    .getAll('bands')
                    .map((id) => bands.find((b) => b.id === id)?.ref)
                    .filter((ref) => !!ref)
            };

            if (song) {
                await updateDoc(song.ref, songData);
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
    }, [song, bands, showSuccess, showError, goBack]);

    const handleDelete = useCallback(() => {
        deleteModalRef.current?.showModal();
    }, []);

    const resetEditState = useCallback(() => {
        formRef.current?.reset();
    }, []);

    const performDelete = useCallback(async () => {
        if (!song) return;

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
    }, [song, showSuccess, showError, goBack]);

    const pageTitle = getTitle(song ? `Edit "${song.get('title')}` : 'Create Song', band);

    return (
        <>
            <title>{pageTitle}</title>
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
                                    className="checkbox checkbox-accent"
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

                <CommandPanel
                    handleSave={handleSave}
                    handleDelete={songId !== 'new' ? handleDelete : undefined}
                    handleReset={resetEditState}
                />
            </div>
        </>
    );
}
