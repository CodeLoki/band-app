interface EditCardProps {
    children: React.ReactNode;
}

/**
 * A card component for edit/create forms with consistent styling.
 */
export default function EditCard({ children }: EditCardProps) {
    return (
        <div className="max-w-5xl mx-auto my-2">
            <div className="card card-border bg-neutral shadow-xl">
                <div className="card-body">{children}</div>
            </div>
        </div>
    );
}
