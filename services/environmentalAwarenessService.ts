/**
 * ARBA Cognitive Engine v4.1 — Environmental Awareness Service
 * خدمة الوعي البيئي — الموسم والمناخ والجغرافيا
 * 
 * LAYER 4: The Environment Layer
 * - Seasonal Awareness: Auto-adjusts concrete curing costs and labor productivity
 * - Climate Logic: Links project location and execution date to cost modifiers
 * 
 * READS FROM: AppState.location, AppState.metadata.executionStartDate
 * WRITES TO: Nothing (pure calculation — stateless)
 * 
 * ⚠️ MIDDLEWARE: Does NOT modify calculateProjectCosts().
 */

import { LocationType, Language } from '../types';

// =================== Types ===================

export type Season = 'summer' | 'winter' | 'moderate';

export interface SeasonalAdjustment {
    season: Season;
    seasonLabel: Record<Language, string>;

    // Concrete adjustments (SAR per m³)
    concreteCuringCost: number;           // Extra curing cost (water/burlap spraying)
    concreteAdmixtureCost: number;        // Chemical additives (Retarder in summer, Accelerator in winter)
    concreteAdmixtureType: string;        // 'retarder' | 'accelerator' | 'none'
    concreteTotalExtraCost: number;       // Sum of curing + admixture

    // Timing restrictions
    concreteTimingRestriction?: Record<Language, string>;

    // Labor productivity
    laborProductivityFactor: number;      // 1.0 = normal | 0.75-0.85 = summer | 0.90-0.95 = winter
    laborProductivityImpact: Record<Language, string>;

    // Summary
    isAdjusted: boolean;                  // True if any adjustment is non-zero
}

// =================== City Climate Classification ===================

/** Cities categorized by climate severity */
const HOT_CITIES: LocationType[] = ['makkah', 'jeddah', 'ahsa', 'jazan', 'yanbu'];
const COLD_CITIES: LocationType[] = ['abha', 'tabuk', 'hail', 'jouf', 'northern_borders', 'baha'];
const HUMID_CITIES: LocationType[] = ['jeddah', 'dammam', 'khobar', 'jazan', 'yanbu'];

// =================== Season Detection ===================

/**
 * Determine the season from a date string
 */
export function getSeasonFromDate(dateStr?: string): Season {
    const month = dateStr
        ? new Date(dateStr).getMonth() + 1
        : new Date().getMonth() + 1;

    if (month >= 5 && month <= 9) return 'summer';      // May - September
    if (month >= 11 || month <= 2) return 'winter';      // November - February
    return 'moderate';                                     // March-April, October
}

const SEASON_LABELS: Record<Season, Record<Language, string>> = {
    summer:   { ar: 'صيف', en: 'Summer', fr: 'Été', zh: '夏季' },
    winter:   { ar: 'شتاء', en: 'Winter', fr: 'Hiver', zh: '冬季' },
    moderate: { ar: 'معتدل', en: 'Moderate', fr: 'Modéré', zh: '温和' },
};

// =================== Core Logic ===================

/**
 * Calculate seasonal adjustments for a project based on location and execution date.
 * Returns cost modifiers for concrete work and labor productivity penalties.
 */
export function getSeasonalAdjustments(
    location: LocationType,
    executionStartDate?: string
): SeasonalAdjustment {
    const season = getSeasonFromDate(executionStartDate);
    const isHot = HOT_CITIES.includes(location);
    const isCold = COLD_CITIES.includes(location);
    const isHumid = HUMID_CITIES.includes(location);

    // === SUMMER ===
    if (season === 'summer') {
        const curingCost = isHot ? 15 : 8;          // Hot cities need more water/ice
        const admixtureCost = isHot ? 25 : 12;      // Retarder chemicals

        // Labor productivity: hot+humid = worst case
        let laborFactor = 0.85;
        if (isHot && isHumid) laborFactor = 0.75;    // Jeddah, Jazan in summer
        else if (isHot) laborFactor = 0.80;           // Makkah, Ahsa

        return {
            season,
            seasonLabel: SEASON_LABELS.summer,
            concreteCuringCost: curingCost,
            concreteAdmixtureCost: admixtureCost,
            concreteAdmixtureType: 'retarder',
            concreteTotalExtraCost: curingCost + admixtureCost,
            concreteTimingRestriction: {
                ar: 'الصب مسموح فقط بعد 4:00 عصراً أو قبل 8:00 صباحاً',
                en: 'Pouring allowed only after 4 PM or before 8 AM',
                fr: 'Coulage autorisé uniquement après 16h ou avant 8h',
                zh: '仅允许在下午4点后或上午8点前浇筑',
            },
            laborProductivityFactor: laborFactor,
            laborProductivityImpact: {
                ar: `إنتاجية العمالة ${(laborFactor * 100).toFixed(0)}% بسبب الحرارة`,
                en: `Labor productivity at ${(laborFactor * 100).toFixed(0)}% due to heat`,
                fr: `Productivité à ${(laborFactor * 100).toFixed(0)}% (chaleur)`,
                zh: `劳动生产率 ${(laborFactor * 100).toFixed(0)}%（高温）`,
            },
            isAdjusted: true,
        };
    }

    // === WINTER ===
    if (season === 'winter' && isCold) {
        const blanketCost = 20;   // Thermal blankets for curing
        const acceleratorCost = 18;

        return {
            season,
            seasonLabel: SEASON_LABELS.winter,
            concreteCuringCost: blanketCost,
            concreteAdmixtureCost: acceleratorCost,
            concreteAdmixtureType: 'accelerator',
            concreteTotalExtraCost: blanketCost + acceleratorCost,
            laborProductivityFactor: 0.90,
            laborProductivityImpact: {
                ar: 'إنتاجية العمالة 90% بسبب البرودة',
                en: 'Labor productivity at 90% due to cold',
                fr: 'Productivité à 90% (froid)',
                zh: '劳动生产率 90%（寒冷）',
            },
            isAdjusted: true,
        };
    }

    // === MODERATE / WINTER IN WARM CITIES ===
    return {
        season,
        seasonLabel: SEASON_LABELS[season],
        concreteCuringCost: 0,
        concreteAdmixtureCost: 0,
        concreteAdmixtureType: 'none',
        concreteTotalExtraCost: 0,
        laborProductivityFactor: 1.0,
        laborProductivityImpact: {
            ar: 'إنتاجية طبيعية 100%',
            en: 'Normal productivity 100%',
            fr: 'Productivité normale 100%',
            zh: '正常生产率 100%',
        },
        isAdjusted: false,
    };
}
