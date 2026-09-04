import { describe, expect, it } from 'vitest';
import { StartsWith } from '@/firestore/songs';
import { getMissingSongFields, isOriginalSong, MissingSongField } from './song-data-completeness';

describe('song-data-completeness', () => {
    it('identifies missing required fields', () => {
        const fields = getMissingSongFields({
            title: '',
            artist: '',
            album: '',
            lrclibId: '',
            length: 0,
            bpm: 0,
            groove: '',
            ytMusic: ''
        });

        expect(fields).toEqual([
            MissingSongField.Title,
            MissingSongField.Artist,
            MissingSongField.Album,
            MissingSongField.LrclibId,
            MissingSongField.Length,
            MissingSongField.Bpm,
            MissingSongField.StartsWith,
            MissingSongField.Groove,
            MissingSongField.YtMusic
        ]);
    });

    it('does not treat excluded fields as missing data', () => {
        const fields = getMissingSongFields({
            title: 'Song',
            artist: 'Artist',
            album: 'Album',
            lrclibId: '12345',
            length: 180,
            bpm: 120,
            startsWith: 0,
            groove: 'https://groovescribe.com/example',
            ytMusic: 'abcd1234',
            drumeo: '',
            notes: '',
            practice: false,
            features: -1,
            solos: [],
            pad: -1
        });

        expect(fields).toEqual([]);
    });

    it('does not require an album when a lyric ID is present', () => {
        const fields = getMissingSongFields({
            title: 'Song',
            artist: 'Artist',
            lrclibId: '12345',
            length: 180,
            bpm: 120,
            startsWith: StartsWith.All,
            groove: 'https://groovescribe.com/example',
            ytMusic: 'abcd1234'
        });

        expect(fields).toEqual([]);
    });

    it('treats zero numeric values as missing for bpm and length', () => {
        const fields = getMissingSongFields({
            title: 'Song',
            artist: 'Artist',
            album: 'Album',
            lrclibId: '12345',
            length: 0,
            bpm: 0,
            startsWith: StartsWith.All,
            groove: 'https://groovescribe.com/example',
            ytMusic: 'abcd1234'
        });

        expect(fields).toEqual([MissingSongField.Length, MissingSongField.Bpm]);
    });

    it('treats startsWith zero as valid because it is the first enum value', () => {
        const fields = getMissingSongFields({
            title: 'Song',
            artist: 'Artist',
            album: 'Album',
            lrclibId: '12345',
            length: 180,
            bpm: 120,
            startsWith: StartsWith.All,
            groove: 'https://groovescribe.com/example',
            ytMusic: 'abcd1234'
        });

        expect(fields).toEqual([]);
    });

    it('treats invalid startsWith values as missing', () => {
        const fields = getMissingSongFields({
            title: 'Song',
            artist: 'Artist',
            album: 'Album',
            lrclibId: '12345',
            length: 180,
            bpm: 120,
            startsWith: 999 as StartsWith,
            groove: 'https://groovescribe.com/example',
            ytMusic: 'abcd1234'
        });

        expect(fields).toEqual([MissingSongField.StartsWith]);
    });

    it('matches original songs using normalized artist and band name', () => {
        expect(isOriginalSong({ artist: 'Group W Bench' }, 'group w bench')).toBe(true);
        expect(isOriginalSong({ artist: ' Group W Bench ' }, 'group w bench')).toBe(true);
        expect(isOriginalSong({ artist: 'Convertible Jerk' }, 'Convertible Jerk (Default Band)')).toBe(true);
        expect(isOriginalSong({ artist: 'Other Artist' }, 'group w bench')).toBe(false);
    });
});
