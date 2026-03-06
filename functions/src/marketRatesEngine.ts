/**
 * Arba Market Rates Engine — بيانات أسعار مواد البناء السعودية
 * 
 * Part of Arba API Gateway 🏗️
 * 
 * Provides material pricing data for Saudi construction projects.
 * Phase 1: Local Firestore-based database with ~50 common materials
 * Phase 2: External REST API integration (structured but not connected)
 * 
 * Covers 3 regions: Riyadh, Jeddah, Dammam
 * ALL logic is server-only.
 */

import * as admin from 'firebase-admin';

const db = admin.firestore();
const RATES_COLLECTION = 'market_rates';
const RATE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// =================== Types ===================

export interface MaterialRate {
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
    confidence: number; // 0-1
}

export interface RateQuery {
    category?: string;
    subcategory?: string;
    region?: 'riyadh' | 'jeddah' | 'dammam';
    search?: string;
}

export interface MarketComparison {
    itemName: string;
    importedRate: number;
    marketRate: number;
    difference: number;
    differencePercent: number;
    status: 'above_market' | 'at_market' | 'below_market';
}

export interface SyncResult {
    success: boolean;
    source: string;
    ratesUpdated: number;
    timestamp: string;
}

// =================== LOCAL RATE DATABASE ===================

/**
 * Default Saudi construction material rates (SAR)
 * Based on average 2024-2025 market prices
 * 50 materials across 10 categories
 */
const DEFAULT_RATES: Omit<MaterialRate, 'id' | 'source' | 'lastUpdated' | 'confidence'>[] = [
    // ===== 1. Concrete & Cement (1-7) =====
    { category: 'concrete', subcategory: 'ready_mix_c30', nameAr: 'خرسانة جاهزة C30', nameEn: 'Ready Mix Concrete C30', unit: 'm³', rates: { riyadh: 280, jeddah: 310, dammam: 290 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'ready_mix_c40', nameAr: 'خرسانة جاهزة C40', nameEn: 'Ready Mix Concrete C40', unit: 'm³', rates: { riyadh: 320, jeddah: 350, dammam: 330 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'cement_opc', nameAr: 'أسمنت بورتلاندي عادي', nameEn: 'Ordinary Portland Cement', unit: 'ton', rates: { riyadh: 300, jeddah: 320, dammam: 310 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'cement_src', nameAr: 'أسمنت مقاوم للكبريتات', nameEn: 'Sulfate Resistant Cement', unit: 'ton', rates: { riyadh: 350, jeddah: 370, dammam: 360 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'sand_washed', nameAr: 'رمل مغسول', nameEn: 'Washed Sand', unit: 'm³', rates: { riyadh: 60, jeddah: 75, dammam: 65 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'gravel_20mm', nameAr: 'حصى 20 مم', nameEn: 'Gravel 20mm', unit: 'm³', rates: { riyadh: 70, jeddah: 85, dammam: 75 }, currency: 'SAR' },
    { category: 'concrete', subcategory: 'concrete_blocks', nameAr: 'بلوك خرساني 20 سم', nameEn: 'Concrete Blocks 20cm', unit: 'pc', rates: { riyadh: 4.5, jeddah: 5.0, dammam: 4.8 }, currency: 'SAR' },

    // ===== 2. Steel & Rebar (8-14) =====
    { category: 'steel', subcategory: 'rebar_10mm', nameAr: 'حديد تسليح 10 مم', nameEn: 'Rebar 10mm', unit: 'ton', rates: { riyadh: 2800, jeddah: 2900, dammam: 2850 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'rebar_12mm', nameAr: 'حديد تسليح 12 مم', nameEn: 'Rebar 12mm', unit: 'ton', rates: { riyadh: 2750, jeddah: 2850, dammam: 2800 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'rebar_16mm', nameAr: 'حديد تسليح 16 مم', nameEn: 'Rebar 16mm', unit: 'ton', rates: { riyadh: 2700, jeddah: 2800, dammam: 2750 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'rebar_20mm', nameAr: 'حديد تسليح 20 مم', nameEn: 'Rebar 20mm', unit: 'ton', rates: { riyadh: 2700, jeddah: 2800, dammam: 2750 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'structural_steel', nameAr: 'حديد هيكلي', nameEn: 'Structural Steel', unit: 'ton', rates: { riyadh: 4500, jeddah: 4700, dammam: 4600 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'wire_mesh', nameAr: 'شبك حديد ملحوم', nameEn: 'Welded Wire Mesh', unit: 'm²', rates: { riyadh: 18, jeddah: 20, dammam: 19 }, currency: 'SAR' },
    { category: 'steel', subcategory: 'steel_pipes', nameAr: 'مواسير حديد 4 بوصة', nameEn: 'Steel Pipes 4"', unit: 'm', rates: { riyadh: 85, jeddah: 92, dammam: 88 }, currency: 'SAR' },

    // ===== 3. Wood & Formwork (15-19) =====
    { category: 'wood', subcategory: 'plywood_18mm', nameAr: 'خشب بليوود 18 مم', nameEn: 'Plywood 18mm', unit: 'sheet', rates: { riyadh: 120, jeddah: 135, dammam: 128 }, currency: 'SAR' },
    { category: 'wood', subcategory: 'timber_softwood', nameAr: 'خشب طري', nameEn: 'Softwood Timber', unit: 'm³', rates: { riyadh: 1800, jeddah: 2000, dammam: 1900 }, currency: 'SAR' },
    { category: 'wood', subcategory: 'formwork_panels', nameAr: 'ألواح شدات', nameEn: 'Formwork Panels', unit: 'm²', rates: { riyadh: 45, jeddah: 50, dammam: 48 }, currency: 'SAR' },
    { category: 'wood', subcategory: 'mdf_16mm', nameAr: 'MDF 16 مم', nameEn: 'MDF Board 16mm', unit: 'sheet', rates: { riyadh: 85, jeddah: 95, dammam: 90 }, currency: 'SAR' },
    { category: 'wood', subcategory: 'doors_wooden', nameAr: 'أبواب خشب داخلية', nameEn: 'Interior Wood Doors', unit: 'pc', rates: { riyadh: 450, jeddah: 500, dammam: 480 }, currency: 'SAR' },

    // ===== 4. Tiles & Flooring (20-25) =====
    { category: 'tiles', subcategory: 'ceramic_floor', nameAr: 'بلاط سيراميك أرضي', nameEn: 'Ceramic Floor Tiles', unit: 'm²', rates: { riyadh: 45, jeddah: 50, dammam: 48 }, currency: 'SAR' },
    { category: 'tiles', subcategory: 'porcelain_floor', nameAr: 'بلاط بورسلين أرضي', nameEn: 'Porcelain Floor Tiles', unit: 'm²', rates: { riyadh: 75, jeddah: 85, dammam: 80 }, currency: 'SAR' },
    { category: 'tiles', subcategory: 'marble_floor', nameAr: 'رخام أرضي', nameEn: 'Marble Flooring', unit: 'm²', rates: { riyadh: 180, jeddah: 200, dammam: 190 }, currency: 'SAR' },
    { category: 'tiles', subcategory: 'granite_floor', nameAr: 'جرانيت أرضي', nameEn: 'Granite Flooring', unit: 'm²', rates: { riyadh: 220, jeddah: 250, dammam: 235 }, currency: 'SAR' },
    { category: 'tiles', subcategory: 'ceramic_wall', nameAr: 'بلاط سيراميك جدران', nameEn: 'Ceramic Wall Tiles', unit: 'm²', rates: { riyadh: 40, jeddah: 45, dammam: 42 }, currency: 'SAR' },
    { category: 'tiles', subcategory: 'epoxy_floor', nameAr: 'أرضيات إيبوكسي', nameEn: 'Epoxy Flooring', unit: 'm²', rates: { riyadh: 120, jeddah: 135, dammam: 128 }, currency: 'SAR' },

    // ===== 5. Paint & Coatings (26-30) =====
    { category: 'paint', subcategory: 'interior_emulsion', nameAr: 'دهان داخلي مائي', nameEn: 'Interior Emulsion Paint', unit: 'gallon', rates: { riyadh: 85, jeddah: 92, dammam: 88 }, currency: 'SAR' },
    { category: 'paint', subcategory: 'exterior_paint', nameAr: 'دهان خارجي', nameEn: 'Exterior Paint', unit: 'gallon', rates: { riyadh: 120, jeddah: 130, dammam: 125 }, currency: 'SAR' },
    { category: 'paint', subcategory: 'primer', nameAr: 'برايمر تأسيسي', nameEn: 'Primer', unit: 'gallon', rates: { riyadh: 65, jeddah: 72, dammam: 68 }, currency: 'SAR' },
    { category: 'paint', subcategory: 'waterproofing', nameAr: 'عزل مائي', nameEn: 'Waterproofing Membrane', unit: 'm²', rates: { riyadh: 35, jeddah: 40, dammam: 38 }, currency: 'SAR' },
    { category: 'paint', subcategory: 'thermal_insulation', nameAr: 'عزل حراري', nameEn: 'Thermal Insulation', unit: 'm²', rates: { riyadh: 45, jeddah: 50, dammam: 48 }, currency: 'SAR' },

    // ===== 6. Plumbing (31-36) =====
    { category: 'plumbing', subcategory: 'pvc_pipe_4', nameAr: 'مواسير PVC 4 بوصة', nameEn: 'PVC Pipe 4"', unit: 'm', rates: { riyadh: 22, jeddah: 25, dammam: 23 }, currency: 'SAR' },
    { category: 'plumbing', subcategory: 'cpvc_pipe_1', nameAr: 'مواسير CPVC 1 بوصة', nameEn: 'CPVC Pipe 1"', unit: 'm', rates: { riyadh: 15, jeddah: 17, dammam: 16 }, currency: 'SAR' },
    { category: 'plumbing', subcategory: 'water_heater', nameAr: 'سخان مياه 50 لتر', nameEn: 'Water Heater 50L', unit: 'pc', rates: { riyadh: 650, jeddah: 700, dammam: 680 }, currency: 'SAR' },
    { category: 'plumbing', subcategory: 'toilet_set', nameAr: 'طقم حمام كامل', nameEn: 'Toilet Set Complete', unit: 'set', rates: { riyadh: 1200, jeddah: 1350, dammam: 1280 }, currency: 'SAR' },
    { category: 'plumbing', subcategory: 'sink_kitchen', nameAr: 'حوض مطبخ ستانلس', nameEn: 'Stainless Kitchen Sink', unit: 'pc', rates: { riyadh: 350, jeddah: 400, dammam: 380 }, currency: 'SAR' },
    { category: 'plumbing', subcategory: 'water_tank', nameAr: 'خزان مياه 1000 لتر', nameEn: 'Water Tank 1000L', unit: 'pc', rates: { riyadh: 450, jeddah: 500, dammam: 480 }, currency: 'SAR' },

    // ===== 7. Electrical (37-42) =====
    { category: 'electrical', subcategory: 'cable_2.5mm', nameAr: 'كيبل كهربائي 2.5 مم', nameEn: 'Electrical Cable 2.5mm', unit: 'm', rates: { riyadh: 3.5, jeddah: 4.0, dammam: 3.8 }, currency: 'SAR' },
    { category: 'electrical', subcategory: 'cable_4mm', nameAr: 'كيبل كهربائي 4 مم', nameEn: 'Electrical Cable 4mm', unit: 'm', rates: { riyadh: 5.5, jeddah: 6.0, dammam: 5.8 }, currency: 'SAR' },
    { category: 'electrical', subcategory: 'distribution_board', nameAr: 'لوحة توزيع 12 خط', nameEn: 'Distribution Board 12-way', unit: 'pc', rates: { riyadh: 280, jeddah: 310, dammam: 295 }, currency: 'SAR' },
    { category: 'electrical', subcategory: 'socket_outlet', nameAr: 'مقبس كهربائي', nameEn: 'Socket Outlet', unit: 'pc', rates: { riyadh: 18, jeddah: 20, dammam: 19 }, currency: 'SAR' },
    { category: 'electrical', subcategory: 'light_switch', nameAr: 'مفتاح إضاءة', nameEn: 'Light Switch', unit: 'pc', rates: { riyadh: 15, jeddah: 17, dammam: 16 }, currency: 'SAR' },
    { category: 'electrical', subcategory: 'led_panel_60x60', nameAr: 'لوحة LED 60×60', nameEn: 'LED Panel 60x60', unit: 'pc', rates: { riyadh: 85, jeddah: 95, dammam: 90 }, currency: 'SAR' },

    // ===== 8. HVAC (43-46) =====
    { category: 'hvac', subcategory: 'split_ac_2ton', nameAr: 'مكيف سبلت 2 طن', nameEn: 'Split AC 2 Ton', unit: 'pc', rates: { riyadh: 2800, jeddah: 3000, dammam: 2900 }, currency: 'SAR' },
    { category: 'hvac', subcategory: 'duct_gi', nameAr: 'دكت تكييف صاج مجلفن', nameEn: 'GI AC Duct', unit: 'kg', rates: { riyadh: 12, jeddah: 14, dammam: 13 }, currency: 'SAR' },
    { category: 'hvac', subcategory: 'chiller_100tr', nameAr: 'تشيلر 100 طن', nameEn: 'Chiller 100TR', unit: 'pc', rates: { riyadh: 180000, jeddah: 195000, dammam: 188000 }, currency: 'SAR' },
    { category: 'hvac', subcategory: 'exhaust_fan', nameAr: 'مروحة شفط', nameEn: 'Exhaust Fan', unit: 'pc', rates: { riyadh: 250, jeddah: 280, dammam: 265 }, currency: 'SAR' },

    // ===== 9. Aluminum & Glass (47-50) =====
    { category: 'aluminum', subcategory: 'curtain_wall', nameAr: 'حائط ستائري ألمنيوم', nameEn: 'Aluminum Curtain Wall', unit: 'm²', rates: { riyadh: 650, jeddah: 720, dammam: 685 }, currency: 'SAR' },
    { category: 'aluminum', subcategory: 'window_sliding', nameAr: 'نافذة ألمنيوم منزلقة', nameEn: 'Sliding Aluminum Window', unit: 'm²', rates: { riyadh: 350, jeddah: 400, dammam: 380 }, currency: 'SAR' },
    { category: 'aluminum', subcategory: 'tempered_glass_10mm', nameAr: 'زجاج مقوى 10 مم', nameEn: 'Tempered Glass 10mm', unit: 'm²', rates: { riyadh: 180, jeddah: 200, dammam: 190 }, currency: 'SAR' },
    { category: 'aluminum', subcategory: 'double_glazed', nameAr: 'زجاج مزدوج', nameEn: 'Double Glazed Unit', unit: 'm²', rates: { riyadh: 280, jeddah: 310, dammam: 295 }, currency: 'SAR' },
];

// =================== Core Functions ===================

/**
 * Get a single material rate by category and subcategory
 */
export async function getRate(
    category: string,
    subcategory: string,
    region: 'riyadh' | 'jeddah' | 'dammam' = 'riyadh'
): Promise<MaterialRate | null> {
    // Try Firestore cache first
    const cacheKey = `${category}_${subcategory}`;
    const cacheDoc = await db.collection(RATES_COLLECTION).doc(cacheKey).get();

    if (cacheDoc.exists) {
        const cached = cacheDoc.data() as MaterialRate;
        const age = Date.now() - new Date(cached.lastUpdated).getTime();
        if (age < RATE_CACHE_TTL_MS) {
            return cached;
        }
    }

    // Fallback to local database
    const localRate = DEFAULT_RATES.find(
        r => r.category === category && r.subcategory === subcategory
    );

    if (!localRate) return null;

    const rate: MaterialRate = {
        id: cacheKey,
        ...localRate,
        source: 'local_db',
        lastUpdated: new Date().toISOString(),
        confidence: 0.85,
    };

    // Cache in Firestore
    await db.collection(RATES_COLLECTION).doc(cacheKey).set(rate);

    return rate;
}

/**
 * Query multiple rates by category and/or search text
 */
export async function queryRates(query: RateQuery): Promise<MaterialRate[]> {
    let results = [...DEFAULT_RATES];

    // Filter by category
    if (query.category) {
        results = results.filter(r => r.category === query.category);
    }

    // Filter by subcategory
    if (query.subcategory) {
        results = results.filter(r => r.subcategory === query.subcategory);
    }

    // Search filter (Arabic + English)
    if (query.search) {
        const searchLower = query.search.toLowerCase();
        results = results.filter(r =>
            r.nameAr.includes(query.search!) ||
            r.nameEn.toLowerCase().includes(searchLower) ||
            r.category.includes(searchLower) ||
            r.subcategory.includes(searchLower)
        );
    }

    return results.map((r, idx) => ({
        id: `${r.category}_${r.subcategory}`,
        ...r,
        source: 'local_db' as const,
        lastUpdated: new Date().toISOString(),
        confidence: 0.85,
    }));
}

/**
 * Get all available categories
 */
export function getCategories(): { key: string; nameAr: string; nameEn: string; count: number }[] {
    const categoryMap = new Map<string, { nameAr: string; nameEn: string; count: number }>();

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

    for (const rate of DEFAULT_RATES) {
        const existing = categoryMap.get(rate.category);
        if (existing) {
            existing.count++;
        } else {
            const names = categoryNames[rate.category] || { ar: rate.category, en: rate.category };
            categoryMap.set(rate.category, { nameAr: names.ar, nameEn: names.en, count: 1 });
        }
    }

    return Array.from(categoryMap.entries()).map(([key, val]) => ({ key, ...val }));
}

/**
 * Compare imported item rates against market rates
 */
export async function compareWithMarket(
    items: { name: string; rate: number; category?: string }[],
    region: 'riyadh' | 'jeddah' | 'dammam' = 'riyadh'
): Promise<MarketComparison[]> {
    const comparisons: MarketComparison[] = [];
    const allRates = await queryRates({});

    for (const item of items) {
        // Try to find a matching market rate
        const nameLower = item.name.toLowerCase();
        const match = allRates.find(r =>
            nameLower.includes(r.nameEn.toLowerCase()) ||
            item.name.includes(r.nameAr) ||
            (item.category && r.category === item.category)
        );

        if (match && item.rate > 0) {
            const marketRate = match.rates[region];
            const difference = item.rate - marketRate;
            const differencePercent = (difference / marketRate) * 100;

            comparisons.push({
                itemName: item.name,
                importedRate: item.rate,
                marketRate,
                difference,
                differencePercent,
                status: differencePercent > 10 ? 'above_market' :
                    differencePercent < -10 ? 'below_market' : 'at_market',
            });
        }
    }

    return comparisons;
}

// =================== External API Connector (Future) ===================

/**
 * Sync rates from an external market API
 * PLACEHOLDER — structured for future REST API integration
 * 
 * Expected external API format:
 * GET https://api.example.com/v1/rates?category=steel&region=riyadh
 * Headers: { Authorization: 'Bearer <API_KEY>' }
 * 
 * Response: { rates: MaterialRate[], lastUpdated: string }
 */
export async function syncExternalRates(
    _apiKey?: string,
    _apiUrl?: string
): Promise<SyncResult> {
    // Phase 2: Implement actual REST API call here
    // 
    // const response = await fetch(`${apiUrl}/v1/rates`, {
    //     headers: { 'Authorization': `Bearer ${apiKey}` },
    // });
    // const data = await response.json();
    // 
    // // Update Firestore cache
    // for (const rate of data.rates) {
    //     await db.collection(RATES_COLLECTION).doc(rate.id).set({
    //         ...rate,
    //         source: 'market_api',
    //         lastUpdated: new Date().toISOString(),
    //         confidence: 0.95,
    //     });
    // }

    return {
        success: true,
        source: 'local_db',
        ratesUpdated: DEFAULT_RATES.length,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Get engine health stats
 */
export function getEngineStats() {
    return {
        engine: 'marketRatesEngine',
        totalMaterials: DEFAULT_RATES.length,
        categories: getCategories().length,
        regions: ['riyadh', 'jeddah', 'dammam'],
        source: 'local_db',
        externalApiConnected: false,
        cacheTtlMs: RATE_CACHE_TTL_MS,
    };
}
