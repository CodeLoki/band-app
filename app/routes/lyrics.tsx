import clsx from 'clsx';
import { type DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuLink, LuLogOut, LuPlay, LuSquare } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import { db } from '@/config/firebase';
import { useNavigation } from '@/contexts/NavigationContext';
import { gigConverter } from '@/firestore/gigs';
import { type Song, songConverter } from '@/firestore/songs';
import { type AppData, loadAppData } from '@/loaders/appData';
import { getTitle } from '@/utils/general';

type LyricsPayload = {
    id: number;
    name: string;
    trackName: string;
    artistName: string;
    albumName: string;
    duration: number;
    instrumental: boolean;
    plainLyrics: string;
    syncedLyrics: string;
};

interface LyricsLoaderData extends AppData {
    songId: string;
    song?: DocumentSnapshot<Song>;
    lyrics: LyricsPayload | null;
    gigId: string | null;
    gigSongIds: string[];
}

export async function clientLoader({
    request,
    params
}: {
    request: Request;
    params: Record<string, string | undefined>;
}) {
    const { songId, gigId: gigIdParam } = params;
    if (!songId) {
        throw new Error('No song ID provided.');
    }

    const gigId = gigIdParam === 'all-songs' ? null : (gigIdParam ?? null),
        appData = await loadAppData(request);

    // Load song and gig (if present) in parallel
    const [song, gigDoc] = await Promise.all([
        getDoc(doc(db, 'songs', songId).withConverter(songConverter)),
        gigId ? getDoc(doc(db, 'gigs', gigId).withConverter(gigConverter)) : Promise.resolve(null)
    ]);

    if (!song.exists()) {
        throw new Error('Song not found.');
    }

    // Get ordered song IDs from gig
    let gigSongIds: string[] = [];
    if (gigDoc?.exists()) {
        const gigData = gigDoc.data();
        gigSongIds = [...gigData.one, ...gigData.two, ...gigData.pocket].map((ref) => ref.id);
    }

    const songData = song.data(),
        id = songData.lrclibId;

    let lyrics: LyricsPayload | null = null;
    if (id) {
        // const apiUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(songData.artist)}&track_name=${encodeURIComponent(songData.title)}&album_name=${encodeURIComponent('Bella Donna')}&duration=${songData.length}`;
        const apiUrl = `https://lrclib.net/api/get/${id}`,
            data = await fetch(apiUrl.toLowerCase());
        lyrics = await data.json();
    }

    return {
        ...appData,
        songId,
        song,
        lyrics,
        gigId,
        gigSongIds
    };
}

interface LyricsDisplayProps {
    plainLyrics: string;
    syncedLyrics?: string;
    duration: number;
    isPlaying: boolean;
    onPlaybackEnd: () => void;
}

interface ParsedLyricLine {
    timeMs: number;
    text: string;
}

function parseSyncedLyrics(syncedLyrics: string): ParsedLyricLine[] {
    const lines = syncedLyrics.split('\n');
    return lines
        .map((line) => {
            const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\]\s*(.*)$/);
            if (!match) return null;
            const [, min, sec, ms, text] = match;
            const timeMs =
                Number.parseInt(min, 10) * 60000 + Number.parseInt(sec, 10) * 1000 + Number.parseInt(ms, 10) * 10;
            return { timeMs, text };
        })
        .filter((line): line is ParsedLyricLine => line !== null);
}

interface LyricsLineProps {
    text: string;
    isActive?: boolean;
}

function LyricsLine({ text, isActive }: LyricsLineProps) {
    return (
        <div className={clsx('transition-all duration-300 origin-left', { 'text-primary scale-105': isActive })}>
            {text || '\u00A0'}
        </div>
    );
}

interface PlainLyricsDisplayProps {
    plainLyrics: string;
    duration: number;
    isPlaying: boolean;
    onPlaybackEnd: () => void;
}

function PlainLyricsDisplay({ plainLyrics, duration, isPlaying, onPlaybackEnd }: PlainLyricsDisplayProps) {
    const lyricsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isPlaying || !lyricsRef.current) {
            return;
        }

        const lyricsEl = lyricsRef.current,
            durationMs = duration * 1000;

        let lastTime: number | null = null,
            accumulated = 0,
            animationId: number;

        const animate = (currentTime: number) => {
            if (lastTime === null) {
                lastTime = currentTime;
            }

            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            const scrollableHeight = lyricsEl.scrollHeight - lyricsEl.clientHeight;

            if (scrollableHeight <= 0 || lyricsEl.scrollTop >= scrollableHeight) {
                onPlaybackEnd();
                return;
            }

            const pixelsPerMs = scrollableHeight / durationMs;
            accumulated += pixelsPerMs * deltaTime;

            if (accumulated >= 1) {
                const scrollAmount = Math.floor(accumulated);
                lyricsEl.scrollTop += scrollAmount;
                accumulated -= scrollAmount;
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, duration, onPlaybackEnd]);

    return (
        <div
            ref={lyricsRef}
            className="whitespace-pre-line text-[clamp(1rem,4vw,2.5rem)] flex-1 min-h-0 overflow-y-auto"
        >
            {plainLyrics}
        </div>
    );
}

interface SyncedLyricsDisplayProps {
    lines: ParsedLyricLine[];
    duration: number;
    isPlaying: boolean;
    onPlaybackEnd: () => void;
}

function SyncedLyricsDisplay({ lines, duration, isPlaying, onPlaybackEnd }: SyncedLyricsDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const currentIndexRef = useRef(-1);
    const startTimeRef = useRef<number | null>(null);
    const pausedAtRef = useRef<number>(0);

    useEffect(() => {
        if (!isPlaying) {
            // Store current position when paused
            if (startTimeRef.current !== null) {
                pausedAtRef.current = performance.now() - startTimeRef.current;
            }
            startTimeRef.current = null;
            return;
        }

        // Resume from paused position
        startTimeRef.current = performance.now() - pausedAtRef.current;
        let animationId: number;

        const animate = () => {
            if (startTimeRef.current === null) return;

            const elapsed = performance.now() - startTimeRef.current;
            const durationMs = duration * 1000;

            if (elapsed >= durationMs) {
                onPlaybackEnd();
                return;
            }

            // Find the current line based on elapsed time (2 seconds early for read-ahead)
            const lookAheadMs = 2000;
            let newIndex = -1;
            for (let i = lines.length - 1; i >= 0; i--) {
                if (elapsed + lookAheadMs >= lines[i].timeMs) {
                    newIndex = i;
                    break;
                }
            }

            if (newIndex !== currentIndexRef.current) {
                currentIndexRef.current = newIndex;
                setCurrentIndex(newIndex);

                // Scroll the active line into view
                const line = lineRefs.current[newIndex];
                const container = containerRef.current;
                if (newIndex >= 0 && line && container) {
                    const lineTop = line.offsetTop;
                    const containerHeight = container.clientHeight;
                    const targetScroll = lineTop - containerHeight / 3;
                    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, duration, lines, onPlaybackEnd]);

    return (
        <div ref={containerRef} className="text-[clamp(1rem,4vw,2.5rem)] flex-1 min-h-0 overflow-y-auto">
            {lines.map((line, index) => (
                <div
                    key={`${line.timeMs}-${index}`}
                    ref={(el) => {
                        lineRefs.current[index] = el;
                    }}
                >
                    <LyricsLine text={line.text} isActive={index === currentIndex} />
                </div>
            ))}
        </div>
    );
}

function LyricsDisplay({ plainLyrics, syncedLyrics, duration, isPlaying, onPlaybackEnd }: LyricsDisplayProps) {
    if (syncedLyrics) {
        const parsedLines = parseSyncedLyrics(syncedLyrics);
        if (parsedLines.length > 0) {
            return (
                <SyncedLyricsDisplay
                    lines={parsedLines}
                    duration={duration}
                    isPlaying={isPlaying}
                    onPlaybackEnd={onPlaybackEnd}
                />
            );
        }
    }

    return (
        <PlainLyricsDisplay
            plainLyrics={plainLyrics}
            duration={duration}
            isPlaying={isPlaying}
            onPlaybackEnd={onPlaybackEnd}
        />
    );
}

function ToolbarButton({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    tip: string;
}) {
    return (
        <li>
            <button type="button" className="btn btn-ghost" {...props}>
                {children}
            </button>
        </li>
    );
}

export default function LyricsRoute() {
    const { band, song, songId, lyrics, gigId, gigSongIds } = useLoaderData<LyricsLoaderData>(),
        { navigateWithParams } = useNavigation(),
        songData = song!.data()!,
        [isPlaying, setIsPlaying] = useState(false),
        pageTitle = getTitle(`"${songData.title}" Lyrics`, band),
        currentIndex = gigSongIds.indexOf(songId),
        prevSongId = currentIndex > 0 ? gigSongIds[currentIndex - 1] : null,
        nextSongId = currentIndex < gigSongIds.length - 1 ? gigSongIds[currentIndex + 1] : null;

    const goToSong = useCallback(
        (targetSongId: string) => {
            navigateWithParams(`/gig/${gigId}/lyrics/${targetSongId}`);
        },
        [navigateWithParams, gigId]
    );

    return (
        <>
            <title>{pageTitle}</title>
            <div className="p-4 flex flex-col gap-4 h-[calc(100dvh-40px)] overflow-hidden">
                <h2 className="text-accent text-2xl font-bold flex-none flex items-center gap-2">
                    {songData.title}
                    {lyrics?.syncedLyrics && <LuLink className="size-4" />}
                </h2>
                {lyrics ? (
                    <LyricsDisplay
                        plainLyrics={lyrics.plainLyrics}
                        syncedLyrics={lyrics.syncedLyrics}
                        duration={lyrics.duration}
                        isPlaying={isPlaying}
                        onPlaybackEnd={() => setIsPlaying(false)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-base-content/50">
                        <p>Lyrics not available for this song.</p>
                    </div>
                )}
            </div>

            <ul className="menu menu-horizontal bg-base-200 rounded-box absolute bottom-8 right-8 z-10">
                {gigId && (
                    <ToolbarButton
                        tip="Previous"
                        onClick={() => prevSongId && goToSong(prevSongId)}
                        disabled={!prevSongId}
                    >
                        <LuChevronLeft />
                    </ToolbarButton>
                )}
                <ToolbarButton
                    tip={isPlaying ? 'Stop' : 'Play'}
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={!lyrics}
                >
                    {isPlaying ? <LuSquare /> : <LuPlay />}
                </ToolbarButton>
                {gigId && (
                    <ToolbarButton tip="Next" onClick={() => nextSongId && goToSong(nextSongId)} disabled={!nextSongId}>
                        <LuChevronRight />
                    </ToolbarButton>
                )}
                <div className="divider divider-horizontal"></div>
                <ToolbarButton tip="Exit" onClick={() => navigateWithParams(gigId ? `/gig/${gigId}` : '/songs')}>
                    <LuLogOut />
                </ToolbarButton>
            </ul>
        </>
    );
}
