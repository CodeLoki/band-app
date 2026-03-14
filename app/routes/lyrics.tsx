import clsx from 'clsx';
import { type DocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuLink, LuPlay, LuSquare } from 'react-icons/lu';
import { useLoaderData } from 'react-router';
import { db } from '@/config/firebase';
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
    lyrics: LyricsPayload;
}

export async function clientLoader({
    request,
    params
}: {
    request: Request;
    params: Record<string, string | undefined>;
}) {
    const { songId } = params;
    if (!songId) {
        throw new Error('No song ID provided.');
    }

    const appData = await loadAppData(request);

    const song = await getDoc(doc(db, 'songs', songId).withConverter(songConverter));
    if (!song.exists()) {
        throw new Error('Song not found.');
    }

    const songData = song.data(),
        id = songData.lrclibId;

    if (!id) {
        throw new Error('No lrclib ID for this song.');
    }

    const apiUrl = `https://lrclib.net/api/get/${id}`;
    // const apiUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(songData.artist)}&track_name=${encodeURIComponent(songData.title)}&album_name=${encodeURIComponent('Bella Donna')}&duration=${songData.length}`;

    const data = await fetch(apiUrl.toLowerCase());
    const json = await data.json();
    console.log('Lyrics API response:', json);

    return {
        ...appData,
        songId,
        song,
        lyrics: json
        // lyrics: {
        //     id: 458225,
        //     name: 'Malibu',
        //     trackName: 'Malibu',
        //     artistName: 'Hole',
        //     albumName: 'Celebrity Skin',
        //     duration: 230,
        //     instrumental: false,
        //     plainLyrics:
        //         "Crash and burn\nAll the stars explode, tonight\nHow'd you get so desperate?\nHow'd you stay alive?\n\nHelp, me please\nBurn the sorrow from your eyes\nOh, come on, be alive again\nDon't lay down and die\n\nHey, hey!\nYou know what to do\nOh, baby, drive away, from Malibu\nGet well, soon\nPlease, don't go any higher\nHow are you so burned, when\nYou're barely on fire?\n\nCry to the angels\nI'm gonna rescue you\nI'm gonna set you free, tonight, baby\nPour over me\n\nHey, hey!\nWe're all watching you\nOh, baby, fly away, to Malibu\nCry to the angels\nAnd let them swallow you\nGo and part the sea, yeah, in Malibu\n\nAnd, the sun goes down\nI watch you slip away\nAnd, the sun goes down\nI walk into the waves\nAnd, the sun goes down\nI watch you slip away\nAnd, I would\nAnd, I knew\nLove would tear you apart\nOh, and, I knew\nThe darkest secret of your heart\n\nHey, hey!\nI'm gonna follow you\nOh, baby, fly away, yeah, to Malibu\nOceans of angels\nOceans of stars\nDown by the sea, is where you\nDrown your scars\nOh-oh\n\nI can't be near you\nThe light just radiates\nI can't be near you\nThe light just radiates",
        //     syncedLyrics:
        //         "[00:17.15] Crash and burn\n[00:20.04] All the stars explode, tonight\n[00:24.50] How'd you get so desperate?\n[00:28.06] How'd you stay alive?\n[00:32.67] Help, me please\n[00:35.61] Burn the sorrow from your eyes\n[00:40.18] Oh, come on, be alive again\n[00:44.35] Don't lay down and die\n[00:47.51] Hey, hey!\n[00:50.83] You know what to do\n[00:54.81] Oh, baby, drive away, from Malibu\n[01:01.22] \n[01:04.47] Get well, soon\n[01:07.39] Please, don't go any higher\n[01:11.90] How are you so burned, when\n[01:16.19] You're barely on fire?\n[01:19.62] Cry to the angels\n[01:22.93] I'm gonna rescue you\n[01:25.18] I'm gonna set you free, tonight, baby\n[01:31.45] Pour over me\n[01:34.44] Hey, hey!\n[01:37.90] We're all watching you\n[01:41.99] Oh, baby, fly away, to Malibu\n[01:50.22] Cry to the angels\n[01:53.78] And let them swallow you\n[01:57.55] Go and part the sea, yeah, in Malibu\n[02:03.64] \n[02:06.72] And, the sun goes down\n[02:09.71] I watch you slip away\n[02:13.92] And, the sun goes down\n[02:17.49] I walk into the waves\n[02:21.87] And, the sun goes down\n[02:25.25] I watch you slip away\n[02:29.74] And, I would\n[02:37.51] And, I knew\n[02:39.95] Love would tear you apart\n[02:44.60] Oh, and, I knew\n[02:47.78] The darkest secret of your heart\n[02:53.26] Hey, hey!\n[02:56.48] I'm gonna follow you\n[03:00.74] Oh, baby, fly away, yeah, to Malibu\n[03:08.28] Oceans of angels\n[03:12.02] Oceans of stars\n[03:16.05] Down by the sea, is where you\n[03:21.16] Drown your scars\n[03:23.01] Oh-oh\n[03:25.55] I can't be near you\n[03:28.95] The light just radiates\n[03:33.43] I can't be near you\n[03:36.98] The light just radiates\n[03:41.00] "
        // } //json
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
            const timeMs = Number.parseInt(min) * 60000 + Number.parseInt(sec) * 1000 + Number.parseInt(ms) * 10;
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

export default function LyricsRoute() {
    const { band, song, lyrics } = useLoaderData<LyricsLoaderData>(),
        songData = song!.data()!,
        [isPlaying, setIsPlaying] = useState(false),
        pageTitle = getTitle(`"${songData.title}" Lyrics`, band);

    const buttons = [
        { key: 'prev', tip: 'Previous', icon: <LuChevronLeft />, onClick: () => {} },
        {
            key: 'play',
            tip: isPlaying ? 'Stop' : 'Play',
            icon: isPlaying ? <LuSquare /> : <LuPlay />,
            onClick: () => setIsPlaying(!isPlaying)
        },
        { key: 'next', tip: 'Next', icon: <LuChevronRight />, onClick: () => {} }
    ];

    return (
        <>
            <title>{pageTitle}</title>
            <div className="p-4 flex flex-col gap-4 h-[calc(100dvh-40px)] overflow-hidden">
                <h2 className="text-accent text-2xl font-bold flex-none flex items-center gap-2">
                    {songData.title}
                    {lyrics.syncedLyrics && <LuLink className="size-4" />}
                </h2>
                <LyricsDisplay
                    plainLyrics={lyrics.plainLyrics}
                    syncedLyrics={lyrics.syncedLyrics}
                    duration={lyrics.duration}
                    isPlaying={isPlaying}
                    onPlaybackEnd={() => setIsPlaying(false)}
                />
            </div>

            <ul className="menu menu-horizontal bg-base-200 rounded-box absolute bottom-8 right-8 z-10">
                {buttons.map(({ key, tip, icon, onClick }) => (
                    <li key={key}>
                        <button type="button" className="btn btn-lg btn-ghost" data-tip={tip} onClick={onClick}>
                            {icon}
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );
}
