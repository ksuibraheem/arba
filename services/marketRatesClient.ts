/**
 * Market Rates Client — بيانات أسعار مواد البناء للعميل
 * 
 * Client-side service that reads from Firestore `market_rates` collection.
 * Seeds default rates on first load if collection is empty.
 * Provides rates for the pricing calculator UI.
 */

import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';

// =================== Types ===================

export interface ClientMaterialRate {
    id: string;
    category: string;
    subcategory: string;
    nameAr: string;
    nameEn: string;
    unit: string;
    rates: {
        riyadh: number;
        jeddah: number;
        dammam: number;
    };
    currency: 'SAR';
    source: 'local_db' | 'market_api';
    lastUpdated: string;
    confidence: number;
}

export type Region = 'riyadh' | 'jeddah' | 'dammam';

// =================== Default Rates (mirrored from marketRatesEngine) ===================

const DEFAULT_RATES: Omit<ClientMaterialRate, 'id' | 'source' | 'lastUpdated' | 'confidence'>[] = [
    // Concrete & Cement
    { category: 'concrete', subcategory: 'ready_mix_c30', nameAr: 'خرسانة جاهزة C30', nameEn: 'Ready Mix Concrete C30', unit: 'm³', rates: { riyadh: 280, jeddah: 310, dammam: 290 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'ready_mix_c40', nameAr: 'خرسانة جاهزة C40', nameEn: 'Ready Mix Concrete C40', unit: 'm³', rates: { riyadh: 320, jeddah: 350, dammam: 330 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'cement_opc', nameAr: 'أسمنت بورتلاندي عادي', nameEn: 'Ordinary Portland Cement', unit: 'ton', rates: { riyadh: 300, jeddah: 320, dammam: 310 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'sand_washed', nameAr: 'رمل مغسول', nameEn: 'Washed Sand', unit: 'm³', rates: { riyadh: 60, jeddah: 75, dammam: 65 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'gravel_20mm', nameAr: 'حصى 20 مم', nameEn: 'Gravel 20mm', unit: 'm³', rates: { riyadh: 70, jeddah: 85, dammam: 75 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'concrete_blocks', nameAr: 'بلوك خرساني 20 سم', nameEn: 'Concrete Blocks 20cm', unit: 'pc', rates: { riyadh: 4.5, jeddah: 5.0, dammam: 4.8 }, currency: 'SAR' },

    // Steel & Rebar
    { category: 'steel', subcategory: 'rebar_10mm', nameAr: 'حديد تسليح 10 مم', nameEn: 'Rebar 10mm', unit: 'ton', rates: { riyadh: 2800, jeddah: 2900, dammam: 2850 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'rebar_16mm', nameAr: 'حديد تسليح 16 مم', nameEn: 'Rebar 16mm', unit: 'ton', rates: { riyadh: 2700, jeddah: 2800, dammam: 2750 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'structural_steel', nameAr: 'حديد هيكلي', nameEn: 'Structural Steel', unit: 'ton', rates: { riyadh: 4500, jeddah: 4700, dammam: 4600 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'wire_mesh', nameAr: 'شبك حديد ملحوم', nameEn: 'Welded Wire Mesh', unit: 'm²', rates: { riyadh: 18, jeddah: 20, dammam: 19 }, currency: 'SAR' },

    // Wood & Formwork
    { category: 'wood', subcategory: 'plywood_18mm', nameAr: 'خشب بليوود 18 مم', nameEn: 'Plywood 18mm', unit: 'sheet', rates: { riyadh: 120, jeddah: 135, dammam: 128 }, currency: 'SAR' },
    { category: 'wood', subcategory: 'formwork_panels', nameAr: 'ألواح شدات', nameEn: 'Formwork Panels', unit: 'm²', rates: { riyadh: 45, jeddah: 50, dammam: 48 }, currency: 'SAR' },

    // Tiles & Flooring
    { category: 'tiles', subcategory: 'ceramic_floor', nameAr: 'بلاط سيراميك أرضي', nameEn: 'Ceramic Floor Tiles', unit: 'm²', rates: { riyadh: 45, jeddah: 50, dammam: 48 }, currency: 'SAR' },
    { category: 'tiles', subcategory: 'porcelain_floor', nameAr: 'بلاط بورسلين أرضي', nameEn: 'Porcelain Floor Tiles', unit: 'm²', rates: { riyadh: 75, jeddah: 85, dammam: 80 }, currency: 'SAR' },

    // Paint & Coatings
    { category: 'paint', subcategory: 'waterproofing', nameAr: 'عزل مائي', nameEn: 'Waterproofing Membrane', unit: 'm²', rates: { riyadh: 35, jeddah: 40, dammam: 38 }, currency: 'SAR' },
    { category: 'paint', subcategory: 'thermal_insulation', nameAr: 'عزل حراري', nameEn: 'Thermal Insulation', unit: 'm²', rates: { riyadh: 45, jeddah: 50, dammam: 48 }, currency: 'SAR' },

    // Plumbing
    { category: 'plumbing', subcategory: 'pvc_pipe_4', nameAr: 'مواسير PVC 4 بوصة', nameEn: 'PVC Pipe 4"', unit: 'm', rates: { riyadh: 22, jeddah: 25, dammam: 23 }, currency: 'SAR' },

    // Electrical
    { category: 'electrical', subcategory: 'cable_2.5mm', nameAr: 'كيبل كهربائي 2.5 مم', nameEn: 'Electrical Cable 2.5mm', unit: 'm', rates: { riyadh: 3.5, jeddah: 4.0, dammam: 3.8 }, currency: 'SAR' },

    // HVAC
    { category: 'hvac', subcategory: 'split_ac_2ton', nameAr: 'مكيف سبلت 2 طن', nameEn: 'Split AC 2 Ton', unit: 'pc', rates: { riyadh: 2800, jeddah: 3000, dammam: 2900 }, currency: 'SAR' },
];

const RATES_COLLECTION = 'market_rates';
let cachedRates: ClientMaterialRate[] = [];
let ratesLoaded = false;

// =================== Core Functions ===================

/**
 * Load all market rates (seeds if empty)
 */
export async function loadMarketRates(): Promise<ClientMaterialRate[]> {
    if (ratesLoaded && cachedRates.length > 0) {
        return cachedRates;
    }

    try {
        const snapshot = await getDocs(collection(db, RATES_COLLECTION));

        if (snapshot.empty) {
            // Seed Firestore with defaults
            const seeded: ClientMaterialRate[] = [];
            for (const rate of DEFAULT_RATES) {
                const id = `${rate.category}_${rate.subcategory}`;
                const fullRate: ClientMaterialRate = {
                    id,
                    ...rate,
                    source: 'local_db',
                    lastUpdated: new Date().toISOString(),
                    confidence: 0.85,
                };
                await setDoc(doc(db, RATES_COLLECTION, id), fullRate);
                seeded.push(fullRate);
            }
            cachedRates = seeded;
        } else {
            cachedRates = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientMaterialRate));
        }

        ratesLoaded = true;
        return cachedRates;
    } catch (error) {
        console.warn('⚠️ Could not load market rates, using defaults:', error);
        cachedRates = DEFAULT_RATES.map(r => ({
            id: `${r.category}_${r.subcategory}`,
            ...r,
            source: 'local_db' as const,
            lastUpdated: new Date().toISOString(),
            confidence: 0.85,
        }));
        ratesLoaded = true;
        return cachedRates;
    }
}

/**
 * Get a specific material rate
 */
export async function getMarketRate(
    category: string,
    subcategory: string,
    region: Region = 'riyadh'
): Promise<number | null> {
    const rates = await loadMarketRates();
    const rate = rates.find(r => r.category === category && r.subcategory === subcategory);
    return rate ? rate.rates[region] : null;
}

/**
 * Get all rates for a category
 */
export async function getRatesByCategory(category: string): Promise<ClientMaterialRate[]> {
    const rates = await loadMarketRates();
    return rates.filter(r => r.category === category);
}

/**
 * Search rates
 */
export async function searchRates(searchText: string): Promise<ClientMaterialRate[]> {
    const rates = await loadMarketRates();
    const lower = searchText.toLowerCase();
    return rates.filter(r =>
        r.nameAr.includes(searchText) ||
        r.nameEn.toLowerCase().includes(lower) ||
        r.category.includes(lower) ||
        r.subcategory.includes(lower)
    );
}

/**
 * Get available categories
 */
export async function getCategories(): Promise<{ key: string; nameAr: string; nameEn: string; count: number }[]> {
    const rates = await loadMarketRates();
    const map = new Map<string, { nameAr: string; nameEn: string; count: number }>();

    const categoryNames: Record<string, { ar: string; en: string }> = {
        concrete: { ar: 'الخرسانة والأسمنت', en: 'Concrete & Cement' },
        steel: { ar: 'الحديد والصلب', en: 'Steel & Rebar' },
        wood: { ar: 'الأخشاب', en: 'Wood & Formwork' },
        tiles: { ar: 'البلاط والأرضيات', en: 'Tiles & Flooring' },
        paint: { ar: 'الدهانات والعزل', en: 'Paint & Coatings' },
        plumbing: { ar: 'السباكة', en: 'Plumbing' },
        electrical: { ar: 'الكهرباء', en: 'Electrical' },
        hvac: { ar: 'التكييف', en: 'HVAC' },
        aluminum: { ar: 'الألمنيوم والزجاج', en: 'Aluminum & Glass' },
    };

    for (const rate of rates) {
        const existing = map.get(rate.category);
        if (existing) {
            existing.count++;
        } else {
            const names = categoryNames[rate.category] || { ar: rate.category, en: rate.category };
            map.set(rate.category, { nameAr: names.ar, nameEn: names.en, count: 1 });
        }
    }

    return Array.from(map.entries()).map(([key, val]) => ({ key, ...val }));
}

/**
 * Real-time subscription to rate changes
 */
export function subscribeToRates(callback: (rates: ClientMaterialRate[]) => void): Unsubscribe {
    return onSnapshot(collection(db, RATES_COLLECTION), (snapshot) => {
        cachedRates = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClientMaterialRate));
        ratesLoaded = true;
        callback(cachedRates);
    });
}

/**
 * Compare item prices against market rates
 */
export async function compareWithMarket(
    items: { name: string; rate: number; category?: string }[],
    region: Region = 'riyadh'
): Promise<{ itemName: string; importedRate: number; marketRate: number; difference: number; differencePercent: number; status: 'above' | 'at' | 'below' }[]> {
    const allRates = await loadMarketRates();
    const comparisons: any[] = [];

    for (const item of items) {
        const lower = item.name.toLowerCase();
        const match = allRates.find(r =>
            lower.includes(r.nameEn.toLowerCase()) ||
            item.name.includes(r.nameAr) ||
            (item.category && r.category === item.category)
        );

        if (match && item.rate > 0) {
            const marketRate = match.rates[region];
            const diff = item.rate - marketRate;
            const pct = (diff / marketRate) * 100;

            comparisons.push({
                itemName: item.name,
                importedRate: item.rate,
                marketRate,
                difference: diff,
                differencePercent: pct,
                status: pct > 10 ? 'above' : pct < -10 ? 'below' : 'at',
            });
        }
    }

    return comparisons;
}
