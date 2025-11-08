import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { LuLogOut } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import Loading from '@/components/Loading';
import { db } from '@/config/firebase';
import { type Song, songConverter } from '@/firestore/songs';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToastHelpers } from '@/hooks/useToastHelpers';

// Remove meta function as title is managed by usePageTitle

export default function RehearseSong() {
    const { songId } = useParams(),
        { showError } = useToastHelpers(),
        [song, setSong] = useState<Song | null>(null),
        [loading, setLoading] = useState(true);

    usePageTitle({ pageTitle: song ? `${song.title} - Rehearse` : 'Loading...' });
    if (!songId) {
        throw new Error('No song ID provided.');
    }

    useEffect(() => {
        void (async () => {
            try {
                const songDoc = await getDoc(doc(db, 'songs', songId).withConverter(songConverter));
                if (!songDoc.exists()) {
                    throw new Error('Song not found.');
                }

                const songData = songDoc.data();
                setSong(songData);
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

    if (!song) {
        return;
    }

    return (
        <div className="absolute inset-0 z-50">
            <iframe src={song.groove} title="Tablature" className="h-full w-full" />

            <button
                type="button"
                className="absolute bottom-8 right-8 z-10 btn btn-circle btn-primary btn-lg"
                onClick={() => window.history.back()}
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
    );
}
