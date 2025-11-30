import { describe, expect, it } from 'vitest';
import { addQueryParamsToUrl } from './NavLink';

describe('addQueryParamsToUrl', () => {
    it('returns url unchanged when searchParams is empty', () => {
        const result = addQueryParamsToUrl('/path', new URLSearchParams());
        expect(result).toBe('/path');
    });

    it('appends query params with ? for url without existing params', () => {
        const params = new URLSearchParams('foo=bar');
        const result = addQueryParamsToUrl('/path', params);
        expect(result).toBe('/path?foo=bar');
    });

    it('appends query params with & for url with existing params', () => {
        const params = new URLSearchParams('baz=qux');
        const result = addQueryParamsToUrl('/path?foo=bar', params);
        expect(result).toBe('/path?foo=bar&baz=qux');
    });

    it('handles multiple params correctly', () => {
        const params = new URLSearchParams();
        params.set('a', '1');
        params.set('b', '2');
        const result = addQueryParamsToUrl('/path', params);
        expect(result).toBe('/path?a=1&b=2');
    });
});
