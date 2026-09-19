import { Link, type LinkProps, useLocation, useSearchParams } from 'react-router';

/**
 * Helper function to add query parameters to a URL.
 * Extracted to be reusable across navigation utilities.
 */
export function addQueryParamsToUrl(url: string, searchParams: URLSearchParams): string {
    const search = searchParams.toString();
    if (!search) return url;

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${search}`;
}

export function addBandPrefixToUrl(url: string, pathname: string): string {
    const match = pathname.match(/^\/b\/[^/]+(?:\/|$)/);
    if (!match || !url.startsWith('/') || url.startsWith('/b/')) return url;

    const bandPrefix = match[0].replace(/\/$/, '');
    return `${bandPrefix}${url}`;
}

/**
 * A Link component that automatically preserves query parameters.
 * Set preserveSearch={false} to navigate without preserving params.
 */
export interface NavLinkProps extends LinkProps {
    /**
     * Whether to preserve current URL search parameters when navigating.
     * @default true
     */
    preserveSearch?: boolean;
}

/**
 * A link designed to preserve current URL search parameters by default.
 */
export default function NavLink({ to, preserveSearch = true, ...props }: NavLinkProps) {
    const [searchParams] = useSearchParams(),
        { pathname } = useLocation();

    if (!preserveSearch || typeof to !== 'string') {
        return <Link to={to} {...props} />;
    }

    const toWithParams = addQueryParamsToUrl(addBandPrefixToUrl(to, pathname), searchParams);
    return <Link to={toWithParams} {...props} />;
}
