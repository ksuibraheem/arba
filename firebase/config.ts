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


// ⚠️ Validate required environment variables safely for both Vite and Node.js
function getEnv(key: string, metaValue: string | undefined): string {
    // 1. Try Vite's statically injected import.meta.env first (Browser)
    if (metaValue) return metaValue;
    
    // 2. Fallback to process.env (Node.js / Scripts)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key] as string;
    }

    console.warn(`⚠️ Missing environment variable: ${key}`);
    return '';
}

// Firebase configuration — ALL values from .env (no hardcoded secrets)
// ⚠️ Vite requires LITERAL `import.meta.env.VITE_*` for static replacement
// Null-safe: import.meta.env may be undefined in Node.js/test environments
const _env = (import.meta as any).env || {};
const firebaseConfig = {
    apiKey: _env.VITE_FIREBASE_API_KEY || '',
    authDomain: _env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: _env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: _env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: _env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: _env.VITE_FIREBASE_APP_ID || '',
    measurementId: _env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services — safe initialization for test environments
export const auth = (() => {
    try { return getAuth(app); }
    catch (e) { console.warn('Auth initialization skipped:', e); return null as any; }
})();
export const db = (() => {
    try { return getFirestore(app); }
    catch (e) { console.warn('Firestore initialization skipped:', e); return null as any; }
})();
export const storage = (() => {
    try { return getStorage(app); }
    catch (e) { console.warn('Storage initialization skipped:', e); return null as any; }
})();

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

