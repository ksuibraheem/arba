/**
 * Firebase Configuration
 * تكوين Firebase للمصادقة والاستضافة
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "arba-d6baf.firebaseapp.com",
    projectId: "arba-d6baf",
    storageBucket: "arba-d6baf.firebasestorage.app",
    messagingSenderId: "347519117336",
    appId: "1:347519117336:web:3a8a29a68a12f4a4837b6d",
    measurementId: "G-ZS8E7QJ5F0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
