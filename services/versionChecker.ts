/**
 * ARBA — Version Checker Service
 * خدمة فحص الإصدار والتحديث الساخن
 *
 * عند الإقلاع: يقرأ /version.json ويقارنه بالنسخة المخزّنة محلياً.
 * عند إصدار جديد: يحفظ المسودة عبر draftAutosaveService ثم يعيد التحميل مرة واحدة.
 * يمنع حلقة reload عبر تخزين النسخة المرئية قبل التحديث.
 */

import { draftAutosaveService } from './draftAutosaveService';

const VERSION_STORAGE_KEY = 'arba_known_version';
const VERSION_URL = '/version.json';

export interface VersionInfo {
    version: string;
    buildDate: string;
}

/**
 * Check for a new version and reload once if needed.
 * Call this once at app startup (e.g. in App.tsx useEffect).
 * Returns the fetched version info, or null on error.
 */
export async function checkForUpdate(): Promise<VersionInfo | null> {
    try {
        // Cache-bust to always get the latest version.json
        const res = await fetch(`${VERSION_URL}?_t=${Date.now()}`);
        if (!res.ok) return null;

        const remote: VersionInfo = await res.json();
        const knownVersion = localStorage.getItem(VERSION_STORAGE_KEY);

        if (knownVersion === remote.version) {
            // Same version — nothing to do
            return remote;
        }

        if (knownVersion === null) {
            // First visit ever — just record the version, don't reload
            localStorage.setItem(VERSION_STORAGE_KEY, remote.version);
            return remote;
        }

        // New version detected — save draft via existing autosave service
        // (single overwritten key, no parallel backup system)
        console.info(`[VersionChecker] Update detected: ${knownVersion} → ${remote.version}`);
        draftAutosaveService.tick(true); // force-save current state

        // Record the new version BEFORE reload to prevent infinite loop
        localStorage.setItem(VERSION_STORAGE_KEY, remote.version);

        // Safe reload
        window.location.reload();
        return remote; // unreachable, but satisfies TS
    } catch (err) {
        console.warn('[VersionChecker] Version check failed (offline?):', err);
        return null;
    }
}

/**
 * Get the currently known version from localStorage.
 */
export function getKnownVersion(): string | null {
    return localStorage.getItem(VERSION_STORAGE_KEY);
}
