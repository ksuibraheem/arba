/**
 * Firebase Configuration
 * تكوين Firebase للمصادقة والاستضافة
 * 
 * ⚠️ SOVEREIGN v8.0 — SECURITY RULE:
 * All credentials MUST come from .env variables.
 * NO hardcoded fallback values allowed in source code.
 * This prevents accidental exposure in public GitHub repos.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';


// ⚠️ Validate required environment variables at startup
function getRequiredEnv(key: string): string {
    const value = import.meta.env[key];
    if (!value) {
        console.error(`❌ Missing required environment variable: ${key}. Check your .env file.`);
        // Return empty string instead of crashing — allows the app to load
        // but Firebase operations will fail gracefully
        return '';
    }
    return value;
}

// Firebase configuration — ALL values from .env (no hardcoded secrets)
const firebaseConfig = {
    apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '' // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics — safe initialization with error protection
export const analytics = (() => {
    try {
        if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
            return getAnalytics(app);
        }
        return null;
    } catch (e) {
        console.warn('Analytics initialization skipped:', e);
        return null;
    }
})();

export default app;

