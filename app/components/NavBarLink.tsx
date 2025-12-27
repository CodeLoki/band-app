import clsx from 'clsx';
import NavLink, { type NavLinkProps } from '@/components/NavLink';

export const NavButtonStyle =
    'btn btn-sm btn-soft btn-accent border border-neutral-content/30 aspect-square md:aspect-auto';

interface NavBarLinkProps extends Omit<NavLinkProps, 'children'> {
    /** The text to display */
    text: string;
    /** The icon to display */
    icon?: React.ReactNode;
}

/**
 * A link designed to appear in the main application navigation bar.
 */
export default function NavBarLink({ text, icon, className, ...props }: NavBarLinkProps) {
    return (
        <NavLink className={clsx(NavButtonStyle, className)} title={text} {...props}>
            {icon}
            <span className="hidden md:inline">{text}</span>
        </NavLink>
    );
}
