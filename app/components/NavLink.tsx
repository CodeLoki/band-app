import type { LinkProps } from "react-router";
import { Link, useSearchParams } from "react-router";

/**
 * A Link component that automatically preserves query parameters.
 * Set preserveSearch={false} to navigate without preserving params.
 */
interface NavLinkProps extends LinkProps {
	preserveSearch?: boolean;
}

export default function NavLink({
	to,
	preserveSearch = true,
	...props
}: NavLinkProps) {
	const [searchParams] = useSearchParams();

	if (!preserveSearch || typeof to !== "string") {
		return <Link to={to} {...props} />;
	}

	const search = searchParams.toString();
	const separator = to.includes("?") ? "&" : "?";
	const toWithParams = search ? `${to}${separator}${search}` : to;

	return <Link to={toWithParams} {...props} />;
}
