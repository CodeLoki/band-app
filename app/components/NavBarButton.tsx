import clsx from 'clsx';
import { NavButtonStyle } from '@/components/NavBarLink';

interface NavBarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** The icon to display */
    icon: React.ReactNode;
    /** The text to display */
    text: string;
    /** Function to be called when the button is clicked. */
    fn: VoidFunction;
}

/**
 * A button designed to appear in the main application navigation bar.
 */
export default function NavBarButton({ fn, className, icon, text, ...props }: NavBarButtonProps) {
    return (
        <button type="button" onClick={fn} className={clsx(NavButtonStyle, className)} title={text} {...props}>
            {icon}
            <span className="hidden md:inline">{text}</span>
        </button>
    );
}
