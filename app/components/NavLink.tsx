import { Link, type LinkProps, useSearchParams } from 'react-router';

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

/**
 * A Link component that automatically preserves query parameters.
 * Set preserveSearch={false} to navigate without preserving params.
 */
export interface NavLinkProps extends LinkProps {
    preserveSearch?: boolean;
}

export default function NavLink({ to, preserveSearch = true, ...props }: NavLinkProps) {
    const [searchParams] = useSearchParams();

    if (!preserveSearch || typeof to !== 'string') {
        return <Link to={to} {...props} />;
    }

    const toWithParams = addQueryParamsToUrl(to, searchParams);
    return <Link to={toWithParams} {...props} />;
}
