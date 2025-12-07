import { doc, getDoc } from 'firebase/firestore';
import { LuLogOut } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import { db } from '@/config/firebase';
import { type Song, songConverter } from '@/firestore/songs';
import { type AppData, loadAppData } from '@/loaders/appData';
import { getTitle } from '@/utils/general';

interface RehearseSongLoaderData extends AppData {
    songId: string;
    song: Song;
}

export async function clientLoader({
    request,
    params
}: {
    request: Request;
    params: Record<string, string | undefined>;
}): Promise<AppData & { songId: string; song: Song }> {
    const appData = await loadAppData(request);

    const { songId } = params;
    if (!songId) {
        throw new Error('No song ID provided.');
    }

    const song = await getDoc(doc(db, 'songs', songId).withConverter(songConverter));
    if (!song.exists()) {
        throw new Error('Song not found.');
    }

    return {
        ...appData,
        songId,
        song: song.data()
    };
}

export default function RehearseSong() {
    const { song, band } = useLoaderData<RehearseSongLoaderData>(),
        pageTitle = getTitle(`${song.title} - Rehearse`, band);

    return (
        <>
            <title>{pageTitle}</title>
            <div className="absolute inset-0 z-50">
                <iframe src={song.groove} title="Tablature" className="h-full w-full" />

                <button
                    type="button"
                    className="absolute bottom-8 right-8 z-10 btn btn-circle btn-primary btn-lg"
                    onClick={() => window.history.back()}
                    data-testid="rehearse-back-button"
                >
                    <LuLogOut />
                </button>

                {song.ytMusic ? (
                    <iframe
                        width="200"
                        height="200"
                        src={`https://www.youtube.com/embed/${song.ytMusic}`}
                        title={`${song.artist} - ${song.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="absolute z-1 left-0 bottom-0"
                    />
                ) : null}
            </div>
        </>
    );
}
