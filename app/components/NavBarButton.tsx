import clsx from 'clsx';

interface NavBarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Function to be called when the button is clicked.
     */
    fn: VoidFunction;
}

/**
 * A button designed to appear in the main application navigation bar.
 */
export default function NavBarButton({ fn, className, children, ...props }: NavBarButtonProps) {
    return (
        <button
            type="button"
            onClick={fn}
            className={clsx('btn btn-sm btn-neutral border border-neutral-content/30', className)}
            {...props}
        >
            {children}
        </button>
    );
}
