/**
 * Shared test mocks and utilities
 *
 * These mocks are used across multiple test files.
 * Import the vi.mock() call wrappers at the top of your test files.
 */
import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { vi } from 'vitest';
import { DrumPad, Instrument, type Song, StartsWith } from '@/firestore/songs';

// =============================================================================
// Mock Context State Objects
// Use these mutable objects in your tests to control mock behavior
// =============================================================================

/**
 * Mutable context state for FirestoreContext mock.
 * Modify these values in beforeEach() to control behavior per test.
 */
const mockState = vi.hoisted(() => ({
    firestoreContext: {
        canEdit: false,
        isMe: true,
        user: 'me' as const
    },
    setNavbarContent: vi.fn()
}));

export const mockFirestoreContext = mockState.firestoreContext;
export const mockSetNavbarContent = mockState.setNavbarContent;

vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/firestore')>();
    return {
        ...actual,
        getFirestore: vi.fn(),
        collection: vi.fn(),
        getDocs: vi.fn(),
        doc: vi.fn(),
        getDoc: vi.fn(),
        updateDoc: vi.fn()
    };
});

vi.mock('@/config/firebase', () => ({
    db: {},
    auth: {}
}));

vi.mock('@/contexts/Firestore', () => ({
    useFirestore: () => ({
        canEdit: mockState.firestoreContext.canEdit,
        isMe: mockState.firestoreContext.isMe,
        user: mockState.firestoreContext.user
    })
}));

vi.mock('@/contexts/NavbarContext', () => ({
    useNavbar: () => ({
        setNavbarContent: mockState.setNavbarContent
    })
}));

vi.mock('@/contexts/ActionContext', () => ({
    ActionMode: {
        Perform: 'perform',
        Practice: 'practice',
        Rehearse: 'rehearse',
        Edit: 'edit',
        Flag: 'flag'
    },
    useActionContext: () => ({
        mode: 'perform'
    })
}));

vi.mock('@/contexts/NavigationContext', () => ({
    useNavigation: () => ({
        navigateWithParams: vi.fn()
    })
}));

// =============================================================================
// Mock Data Factories
// =============================================================================

export interface MockSongOptions {
    inBand?: boolean;
    practice?: boolean;
    otherBand?: boolean;
    length?: number;
    bandId?: string;
}

/**
 * Creates a mock song document for testing.
 * Works with both QueryDocumentSnapshot (for list views) and DocumentSnapshot (for detail views).
 *
 * @param id - Firestore document ID
 * @param title - Song title
 * @param artist - Artist name (defaults to 'Test Artist')
 * @param options - Additional options for band membership, practice flag, etc.
 */
export function createMockSong(
    id: string,
    title: string,
    artist = 'Test Artist',
    options: MockSongOptions = {}
): QueryDocumentSnapshot<Song> & DocumentSnapshot<Song> {
    const { inBand = true, practice = false, otherBand = false, length = 180, bandId = 'band-1' } = options;

    let bands: { id: string }[] = [];
    if (inBand) {
        bands = [{ id: bandId }];
    } else if (otherBand) {
        bands = [{ id: 'other-band' }];
    }
    // If neither inBand nor otherBand, bands stays empty (orphan)

    // Note: We use a simplified bands structure for mocking.
    // The real Song type uses QueryDocumentSnapshot<Band>[], but for testing
    // we only need the id field which is what the filtering logic uses.
    const songData = {
        title,
        artist,
        startsWith: StartsWith.All,
        pad: DrumPad.None,
        notes: '',
        practice,
        features: Instrument.None,
        solos: [],
        groove: '',
        ytMusic: '',
        bands,
        length
    };

    return {
        id,
        exists: () => true,
        data: () => songData,
        get: (field: string) => {
            if (field === 'title') return title;
            if (field === 'length') return length;
            return undefined;
        },
        ref: { id }
    } as unknown as QueryDocumentSnapshot<Song> & DocumentSnapshot<Song>;
}

/**
 * Creates a mock band document for testing.
 *
 * @param id - Firestore document ID (defaults to 'band-1')
 * @param description - Band description (defaults to 'Test Band')
 */
export function createMockBand(id = 'band-1', description = 'Test Band') {
    return {
        id,
        data: () => ({ description }),
        get: (field: string) => (field === 'description' ? description : undefined)
    };
}

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Resets all shared mock state.
 * Call this in beforeEach() to ensure clean state between tests.
 */
export function resetMockState() {
    mockFirestoreContext.canEdit = false;
    mockFirestoreContext.isMe = true;
    mockFirestoreContext.user = 'me';
    mockSetNavbarContent.mockClear();
}
