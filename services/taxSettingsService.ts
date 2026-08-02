/**
 * خدمة إعدادات الضريبة
 * Tax Settings Service — ZATCA-compliant tax configuration
 *
 * Reads from Firestore 'tax_settings/default' single-doc collection.
 * Caches in localStorage ('arba_tax_settings') for synchronous access.
 * Falls back to sensible ZATCA defaults if Firestore is unavailable.
 */

import { firestoreDataService } from './firestoreDataService';
import type {
    TaxSettings,
    TaxCategoryConfig,
    TaxExemptionReason,
} from '../types/accounting';

// ====================== DEFAULTS ======================

const DEFAULT_TAX_SETTINGS: TaxSettings = {
    vatRate: 0.15,
    categories: [
        { code: 'S', nameAr: 'قياسي', nameEn: 'Standard', rate: 0.15 },
        { code: 'Z', nameAr: 'صفرية', nameEn: 'Zero-rated', rate: 0 },
        { code: 'E', nameAr: 'معفاة', nameEn: 'Exempt', rate: 0 },
        { code: 'O', nameAr: 'خارج النطاق', nameEn: 'Out of Scope', rate: 0 },
    ],
    exemptionReasons: [],
};

const LOCAL_STORAGE_KEY = 'arba_tax_settings';
const COLLECTION = 'tax_settings';
const DOC_ID = 'default';

// ====================== CACHE ======================

let _cached: TaxSettings | null = null;
let _loaded = false;

function loadFromLocalStorage(): TaxSettings | null {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw) as TaxSettings;
        }
    } catch {
        // ignore
    }
    return null;
}

function saveToLocalStorage(settings: TaxSettings): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn('⚠️ taxSettingsService: localStorage save failed', e);
    }
}

function getSettings(): TaxSettings {
    if (_cached) return _cached;
    const local = loadFromLocalStorage();
    if (local) {
        _cached = local;
        return local;
    }
    return DEFAULT_TAX_SETTINGS;
}

// ====================== SERVICE ======================

export const taxSettingsService = {
    /**
     * Initialize — load from Firestore, cache locally.
     * Call once at app startup (fire-and-forget is fine).
     */
    async init(): Promise<void> {
        if (_loaded) return;
        try {
            const remote = await firestoreDataService.getDocument<TaxSettings>(COLLECTION, DOC_ID);
            if (remote) {
                _cached = remote;
                saveToLocalStorage(remote);
            } else {
                // Use local or defaults
                _cached = loadFromLocalStorage() ?? DEFAULT_TAX_SETTINGS;
            }
        } catch (error) {
            console.warn('⚠️ taxSettingsService: Firestore load failed, using cached/defaults', error);
            _cached = loadFromLocalStorage() ?? DEFAULT_TAX_SETTINGS;
        }
        _loaded = true;
    },

    /**
     * VAT rate — synchronous, uses cached value.
     * Falls back to 0.15 if nothing is loaded yet.
     */
    getVatRate(): number {
        return getSettings().vatRate ?? 0.15;
    },

    /**
     * All configured tax categories.
     */
    getTaxCategories(): TaxCategoryConfig[] {
        return getSettings().categories ?? DEFAULT_TAX_SETTINGS.categories;
    },

    /**
     * Exemption reason codes for E-category items.
     */
    getExemptionReasons(): TaxExemptionReason[] {
        return getSettings().exemptionReasons ?? [];
    },

    /**
     * Force-refresh from Firestore (e.g., after admin update).
     */
    async refresh(): Promise<void> {
        _loaded = false;
        _cached = null;
        await this.init();
    },

    /**
     * Save updated settings to Firestore + local cache.
     */
    async save(settings: TaxSettings): Promise<void> {
        const data = { ...settings, updatedAt: new Date().toISOString() };
        await firestoreDataService.saveDocument(COLLECTION, DOC_ID, data);
        _cached = data;
        saveToLocalStorage(data);
    },
};

export default taxSettingsService;
