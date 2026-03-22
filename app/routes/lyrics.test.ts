import { describe, expect, it } from 'vitest';
import { parseSyncedLyrics } from './lyrics';

describe('parseSyncedLyrics', () => {
    it('parses standard LRC format correctly', () => {
        const input = '[00:15.50] First line\n[00:30.00] Second line';
        const result = parseSyncedLyrics(input);

        expect(result).toEqual([
            { timeMs: 15500, text: 'First line' },
            { timeMs: 30000, text: 'Second line' }
        ]);
    });

    it('handles minutes correctly', () => {
        const input = '[02:30.00] Two minutes thirty';
        const result = parseSyncedLyrics(input);

        expect(result).toEqual([{ timeMs: 150000, text: 'Two minutes thirty' }]);
    });

    it('handles centiseconds correctly', () => {
        const input = '[00:00.99] Almost one second';
        const result = parseSyncedLyrics(input);

        expect(result).toEqual([{ timeMs: 990, text: 'Almost one second' }]);
    });

    it('filters out invalid lines', () => {
        const input = '[00:10.00] Valid line\nInvalid line without timestamp\n[00:20.00] Another valid line';
        const result = parseSyncedLyrics(input);

        expect(result).toHaveLength(2);
        expect(result[0].text).toBe('Valid line');
        expect(result[1].text).toBe('Another valid line');
    });

    it('handles empty text lines', () => {
        const input = '[00:05.00] \n[00:10.00]';
        const result = parseSyncedLyrics(input);

        expect(result).toEqual([
            { timeMs: 5000, text: '' },
            { timeMs: 10000, text: '' }
        ]);
    });

    it('returns empty array for empty input', () => {
        expect(parseSyncedLyrics('')).toEqual([]);
    });

    it('returns empty array when no valid lines', () => {
        const input = 'No timestamps here\nStill no timestamps';
        expect(parseSyncedLyrics(input)).toEqual([]);
    });
});
