export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="card bg-base-200 card-border border-blue-400/30 shadow-md p-8">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="text-base-content/70">Loading...</p>
                </div>
            </div>
        </div>
    );
}
