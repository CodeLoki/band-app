import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionMode } from '@/contexts/ActionContext';
import { DrumPad, Instrument, StartsWith, User } from '@/firestore/songs';

// Mock context values
const mockContext = {
    user: User.Me,
    isMe: true,
    canEdit: true,
    mode: ActionMode.Perform,
    bpmSongId: null as string | null
};

const bpmListeners = new Set<() => void>();

const mockNavigateWithParams = vi.fn();

vi.mock('@/contexts/Firestore', () => ({
    useFirestore: () => ({
        user: mockContext.user,
        isMe: mockContext.isMe,
        canEdit: mockContext.canEdit
    })
}));

vi.mock('@/contexts/ActionContext', () => ({
    ActionMode: {
        Perform: 'perform',
        Practice: 'practice',
        Rehearse: 'rehearse',
        Edit: 'edit',
        Flag: 'flag',
        BPM: 'bpm'
    },
    useActionContext: () => ({
        mode: mockContext.mode,
        bpmSongId: mockContext.bpmSongId,
        setBpmSongId: (songId: string | null) => {
            mockContext.bpmSongId = songId;
            bpmListeners.forEach((listener) => {
                listener();
            });
        }
    })
}));

vi.mock('@/contexts/NavigationContext', () => ({
    useNavigation: () => ({
        navigateWithParams: mockNavigateWithParams
    })
}));

// Mock firebase
vi.mock('firebase/firestore', () => ({
    updateDoc: vi.fn()
}));

import SongCard from './SongCard';

// Helper to create mock song document
function createMockSong(overrides = {}) {
    const songData = {
        title: 'Test Song',
        artist: 'Test Artist',
        bpm: 120,
        startsWith: StartsWith.Bass,
        pad: DrumPad.None,
        notes: '',
        practice: false,
        features: Instrument.None,
        solos: [],
        groove: 'https://groovescribe.com/test',
        ytMusic: 'abc123',
        ...overrides
    };

    const id = (overrides as { id?: string }).id ?? 'song-1';

    return {
        id,
        data: () => songData,
        ref: { id }
    };
}

describe('SongCard', () => {
    beforeEach(() => {
        mockContext.user = User.Me;
        mockContext.isMe = true;
        mockContext.canEdit = true;
        mockContext.mode = ActionMode.Perform;
        mockContext.bpmSongId = null;
        bpmListeners.clear();
        mockNavigateWithParams.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders song title and artist', () => {
        const song = createMockSong();
        render(<SongCard song={song as never} />);

        expect(screen.getByText('Test Song')).toBeInTheDocument();
        expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });

    it('throws error when song data is not found', () => {
        const emptySong = {
            id: 'empty',
            data: () => undefined,
            ref: { id: 'empty' }
        };

        expect(() => render(<SongCard song={emptySong as never} />)).toThrow('Song data not found');
    });

    it('shows practice flag indicator when song is flagged and isMe', () => {
        const song = createMockSong({ practice: true });
        render(<SongCard song={song as never} />);

        expect(screen.getByTitle('Flagged for Practice')).toBeInTheDocument();
    });

    it('does not show practice flag when not isMe', () => {
        mockContext.isMe = false;
        const song = createMockSong({ practice: true });
        render(<SongCard song={song as never} />);

        expect(screen.queryByTitle('Flagged for Practice')).not.toBeInTheDocument();
    });

    it('navigates to rehearse page when in Rehearse mode', () => {
        mockContext.mode = ActionMode.Rehearse;
        const song = createMockSong();
        render(<SongCard song={song as never} />);

        fireEvent.click(screen.getByRole('button'));
        expect(mockNavigateWithParams).toHaveBeenCalledWith('/rehearse/song-1');
    });

    it('navigates to edit page when in Edit mode', () => {
        mockContext.mode = ActionMode.Edit;
        const song = createMockSong();
        render(<SongCard song={song as never} />);

        fireEvent.click(screen.getByRole('button'));
        expect(mockNavigateWithParams).toHaveBeenCalledWith('/edit-song/song-1');
    });

    it('opens external link in Perform mode', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        mockContext.mode = ActionMode.Perform;

        const song = createMockSong({ groove: 'https://groovescribe.com/test' });
        render(<SongCard song={song as never} />);

        fireEvent.click(screen.getByRole('button'));
        expect(windowOpenSpy).toHaveBeenCalledWith('https://groovescribe.com/test');
        windowOpenSpy.mockRestore();
    });

    it('opens Songsterr in Practice mode for drummer', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        mockContext.mode = ActionMode.Practice;

        const song = createMockSong();
        render(<SongCard song={song as never} />);

        fireEvent.click(screen.getByRole('button'));
        expect(windowOpenSpy).toHaveBeenCalledWith(expect.stringContaining('songsterr.com'));
        windowOpenSpy.mockRestore();
    });

    it('only shows one BPM indicator at a time', () => {
        mockContext.mode = ActionMode.BPM;
        const firstSong = createMockSong({ title: 'First Song', bpm: 120, id: 'song-1' });
        const secondSong = createMockSong({ title: 'Second Song', bpm: 90, id: 'song-2' });

        function BpmHarness() {
            const [, forceRender] = useState(0);

            useEffect(() => {
                const listener = () => forceRender((value: number) => value + 1);
                bpmListeners.add(listener);

                return () => {
                    bpmListeners.delete(listener);
                };
            }, []);

            return (
                <>
                    <SongCard song={firstSong as never} />
                    <SongCard song={secondSong as never} />
                </>
            );
        }

        render(<BpmHarness />);

        fireEvent.click(screen.getByRole('button', { name: 'First Song by Test Artist' }));
        expect(screen.getByTitle('120 BPM')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Second Song by Test Artist' }));

        expect(screen.queryByTitle('120 BPM')).not.toBeInTheDocument();
        expect(screen.getByTitle('90 BPM')).toBeInTheDocument();
        expect(mockContext.bpmSongId).toBe('song-2');
    });

    it('displays startsWith badge', () => {
        const song = createMockSong({ startsWith: StartsWith.Bass });
        render(<SongCard song={song as never} />);

        expect(screen.getByText('Bass')).toBeInTheDocument();
    });

    it('displays drum pad badge when set', () => {
        const song = createMockSong({ pad: DrumPad.Cowbell });
        render(<SongCard song={song as never} />);

        expect(screen.getByText('Cowbell (#641)')).toBeInTheDocument();
    });

    it('displays notes badge when present', () => {
        const song = createMockSong({ notes: 'Special notes here' });
        render(<SongCard song={song as never} />);

        expect(screen.getByText('Special notes here')).toBeInTheDocument();
    });
});

describe('SongCard for Mixer user', () => {
    beforeEach(() => {
        mockContext.user = User.Mixer;
        mockContext.isMe = false;
        mockContext.canEdit = false;
        mockContext.mode = ActionMode.Perform;
    });

    afterEach(() => {
        cleanup();
    });

    it('displays features badge for Mixer', () => {
        const song = createMockSong({ features: Instrument.Keys });
        render(<SongCard song={song as never} />);

        expect(screen.getByText('Keys')).toBeInTheDocument();
    });

    it('displays solo badges for Mixer', () => {
        const song = createMockSong({ startsWith: StartsWith.Drums, solos: [Instrument.LeadGuitar, Instrument.Bass] });
        render(<SongCard song={song as never} />);

        expect(screen.getByText('Lead Guitar')).toBeInTheDocument();
        expect(screen.getByText('Bass')).toBeInTheDocument();
    });

    it('opens YouTube Music for Mixer in Perform mode', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        const song = createMockSong({ ytMusic: 'video123' });
        render(<SongCard song={song as never} />);

        fireEvent.click(screen.getByRole('button'));
        expect(windowOpenSpy).toHaveBeenCalledWith('https://www.youtube.com/watch?v=video123');
        windowOpenSpy.mockRestore();
    });
});

describe('SongCard for Vocals user', () => {
    beforeEach(() => {
        mockContext.user = User.Vocals;
        mockContext.isMe = false;
        mockContext.canEdit = false;
        mockContext.mode = ActionMode.Perform;
        mockNavigateWithParams.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('navigates to lyrics page with gigId when provided', () => {
        const song = createMockSong();
        render(<SongCard song={song as never} gigId="gig-123" />);

        fireEvent.click(screen.getByRole('button'));
        expect(mockNavigateWithParams).toHaveBeenCalledWith('/gig/gig-123/lyrics/song-1');
    });

    it('navigates to lyrics page with all-songs when no gigId', () => {
        const song = createMockSong();
        render(<SongCard song={song as never} />);

        fireEvent.click(screen.getByRole('button'));
        expect(mockNavigateWithParams).toHaveBeenCalledWith('/gig/all-songs/lyrics/song-1');
    });
});

describe('SongCard for Guitars user', () => {
    beforeEach(() => {
        mockContext.user = User.Guitars;
        mockContext.isMe = false;
        mockContext.mode = ActionMode.Perform;
    });

    afterEach(() => {
        cleanup();
    });

    it('opens Ultimate Guitar for Guitars user', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
        const song = createMockSong();
        render(<SongCard song={song as never} />);

        fireEvent.click(screen.getByRole('button'));
        expect(windowOpenSpy).toHaveBeenCalledWith(expect.stringContaining('ultimate-guitar.com'));
        windowOpenSpy.mockRestore();
    });
});
