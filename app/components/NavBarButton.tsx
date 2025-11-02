import clsx from 'clsx';

export default function NavBarButton({
    fn,
    className,
    children,
    ...props
}: { fn: VoidFunction } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type="button" onClick={fn} className={clsx('btn btn-ghost btn-sm', className)} {...props}>
            {children}
        </button>
    );
}
