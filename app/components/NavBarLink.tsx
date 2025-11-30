import clsx from 'clsx';
import NavLink, { type NavLinkProps } from '@/components/NavLink';

/**
 * A link designed to appear in the main application navigation bar.
 */
export default function NavBarLink({ children, className, ...props }: NavLinkProps) {
    return (
        <NavLink className={clsx('btn btn-ghost btn-sm', className)} {...props}>
            {children}
        </NavLink>
    );
}
