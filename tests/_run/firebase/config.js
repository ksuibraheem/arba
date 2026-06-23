"use strict";
/**
 * Firebase Configuration
 * تكوين Firebase للمصادقة والاستضافة
 *
 * ⚠️ SOVEREIGN v8.0 — SECURITY RULE:
 * All credentials MUST come from .env variables.
 * NO hardcoded fallback values allowed in source code.
 * This prevents accidental exposure in public GitHub repos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analytics = exports.storage = exports.db = exports.auth = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const analytics_1 = require("firebase/analytics");
// ⚠️ Validate required environment variables safely for both Vite and Node.js
function getEnv(key, metaValue) {
    // 1. Try Vite's statically injected import.meta.env first (Browser)
    if (metaValue)
        return metaValue;
    // 2. Fallback to process.env (Node.js / Scripts)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    console.warn(`⚠️ Missing environment variable: ${key}`);
    return '';
}
// Firebase configuration — ALL values from .env (no hardcoded secrets)
// ⚠️ Vite requires LITERAL `import.meta.env.VITE_*` for static replacement
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize services
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
// Analytics — safe initialization with error protection
exports.analytics = (() => {
    try {
        if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
            return (0, analytics_1.getAnalytics)(app);
        }
        return null;
    }
    catch (e) {
        console.warn('Analytics initialization skipped:', e);
        return null;
    }
})();
exports.default = app;
