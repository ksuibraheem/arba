/**
 * Firebase Configuration
 * تكوين Firebase للمصادقة والاستضافة
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'arba-d6baf.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'arba-d6baf',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'arba-d6baf.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '347519117336',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:347519117336:web:3a8a29a68a12f4a4837b6d',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ZS8E7QJ5F0'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
