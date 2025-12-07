import { href, Link } from 'react-router';

export default function NotFound() {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h2 className="text-5xl font-bold">404</h2>
                    <p className="py-6">Page not found. The page you are looking for does not exist.</p>
                    <Link to={href('/')} className="btn btn-primary">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
