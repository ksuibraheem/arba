// Pre-flight: patch import.meta.env for firebase/config.ts compatibility
// This registers BEFORE any other module via --import flag
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_FIREBASE_API_KEY: 'test-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
    VITE_FIREBASE_APP_ID: '1:000000000000:web:000000000000',
    VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
  },
  writable: true,
  configurable: true,
});
