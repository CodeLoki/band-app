import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes.tsx';

// Import global styles
import './tailwind.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Failed to find root element');
}

const root = createRoot(container);
root.render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
