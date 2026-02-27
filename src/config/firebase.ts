// Firebase Configuration
// إعداد Firebase للتطبيق

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAqDvfoKIfKP_U9NpThRlfZGcRX57SkS9s',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'arba-d6baf.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'arba-d6baf',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'arba-d6baf.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '347519117336',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:347519117336:web:92748f8b8d388676837b6d'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
