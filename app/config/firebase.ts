import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: 'band-songs-ccb11.firebaseapp.com',
    projectId: 'band-songs-ccb11',
    storageBucket: 'band-songs-ccb11.appspot.com',
    messagingSenderId: '309848194094',
    appId: '1:309848194094:web:955a4fdc2c3fcaffffb3bf'
};

// Validate that the API key is provided
if (!firebaseConfig.apiKey) {
    throw new Error('VITE_FIREBASE_API_KEY environment variable is required');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
