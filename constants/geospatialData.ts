/**
 * ARBA Cognitive Engine v4.1 — Geospatial Data
 * إحداثيات المدن السعودية ومراكز التوريد الصناعية
 * 
 * Used by: environmentalAwarenessService.ts, goldenOutputService.ts
 * Purpose: Calculate distance-based logistics costs and supply waste factors
 */

import { LocationType } from '../types';

// =================== City Coordinates ===================

export const CITY_COORDINATES: Record<LocationType, { lat: number; lng: number; nameAr: string }> = {
    riyadh:           { lat: 24.7136, lng: 46.6753, nameAr: 'الرياض' },
    jeddah:           { lat: 21.4858, lng: 39.1925, nameAr: 'جدة' },
    dammam:           { lat: 26.3927, lng: 49.9777, nameAr: 'الدمام' },
    makkah:           { lat: 21.3891, lng: 39.8579, nameAr: 'مكة المكرمة' },
    madinah:          { lat: 24.5247, lng: 39.5692, nameAr: 'المدينة المنورة' },
    abha:             { lat: 18.2164, lng: 42.5053, nameAr: 'أبها' },
    tabuk:            { lat: 28.3838, lng: 36.5550, nameAr: 'تبوك' },
    qassim:           { lat: 26.3260, lng: 43.9750, nameAr: 'القصيم' },
    hail:             { lat: 27.5219, lng: 41.6907, nameAr: 'حائل' },
    jazan:            { lat: 16.8892, lng: 42.5700, nameAr: 'جازان' },
    najran:           { lat: 17.4933, lng: 44.1277, nameAr: 'نجران' },
    baha:             { lat: 20.0000, lng: 41.4667, nameAr: 'الباحة' },
    jouf:             { lat: 29.7854, lng: 40.0000, nameAr: 'الجوف' },
    northern_borders: { lat: 30.9753, lng: 41.0187, nameAr: 'الحدود الشمالية' },
    khobar:           { lat: 26.2172, lng: 50.1971, nameAr: 'الخبر' },
    yanbu:            { lat: 24.0895, lng: 38.0618, nameAr: 'ينبع' },
    taif:             { lat: 21.2700, lng: 40.4158, nameAr: 'الطائف' },
    khamis_mushait:   { lat: 18.3066, lng: 42.7333, nameAr: 'خميس مشيط' },
    ahsa:             { lat: 25.3483, lng: 49.5856, nameAr: 'الأحساء' },
    hafr_albatin:     { lat: 28.4328, lng: 45.9707, nameAr: 'حفر الباطن' },
};

// =================== Industrial Supply Hubs ===================

export interface SupplyHub {
    id: string;
    name: string;
    nameAr: string;
    lat: number;
    lng: number;
    specializations: string[]; // Material categories available
}

export const SUPPLY_HUBS: SupplyHub[] = [
    {
        id: 'riyadh_2nd_industrial',
        name: 'Riyadh 2nd Industrial City',
        nameAr: 'المنطقة الصناعية الثانية - الرياض',
        lat: 24.5500, lng: 46.8500,
        specializations: ['concrete', 'steel', 'blocks', 'tiles', 'wood', 'paint'],
    },
    {
        id: 'jeddah_1st_industrial',
        name: 'Jeddah 1st Industrial City',
        nameAr: 'المنطقة الصناعية الأولى - جدة',
        lat: 21.4200, lng: 39.2400,
        specializations: ['concrete', 'steel', 'tiles', 'plumbing', 'electrical'],
    },
    {
        id: 'dammam_1st_industrial',
        name: 'Dammam 1st Industrial City',
        nameAr: 'المنطقة الصناعية الأولى - الدمام',
        lat: 26.3500, lng: 50.0500,
        specializations: ['concrete', 'steel', 'blocks', 'hvac', 'electrical'],
    },
];

// =================== Haversine Distance Calculation ===================

/**
 * Calculate the great-circle distance between two points on Earth using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// =================== Distance Factor Logic ===================

export interface DistanceFactor {
    nearestHub: SupplyHub;
    distanceKm: number;
    supplyWasteMultiplier: number;    // 1.0 = no adjustment
    shippingCostPerTon: number;       // SAR per ton
    isRemote: boolean;                // >30km from nearest hub
}

/**
 * Calculate the distance factor for a project location.
 * If the project is >30km from the nearest supply hub,
 * automatically adjusts supply waste and shipping costs.
 */
export function getDistanceFactor(location: LocationType): DistanceFactor {
    const projectCoords = CITY_COORDINATES[location];
    if (!projectCoords) {
        return {
            nearestHub: SUPPLY_HUBS[0],
            distanceKm: 0,
            supplyWasteMultiplier: 1.0,
            shippingCostPerTon: 50,
            isRemote: false,
        };
    }

    // Find nearest supply hub
    let nearestHub = SUPPLY_HUBS[0];
    let minDistance = Infinity;

    for (const hub of SUPPLY_HUBS) {
        const d = calculateHaversineDistance(projectCoords, hub);
        if (d < minDistance) {
            minDistance = d;
            nearestHub = hub;
        }
    }

    const distanceKm = Math.round(minDistance);

    // Supply waste multiplier: increases with distance
    let supplyWasteMultiplier = 1.0;
    if (distanceKm > 300) supplyWasteMultiplier = 1.10;       // +10% for very remote
    else if (distanceKm > 100) supplyWasteMultiplier = 1.06;  // +6% for moderately remote
    else if (distanceKm > 30) supplyWasteMultiplier = 1.03;   // +3% for slightly remote

    // Shipping cost per ton: linear with distance, minimum 50 SAR
    const shippingCostPerTon = Math.max(50, Math.round(distanceKm * 1.5));

    return {
        nearestHub,
        distanceKm,
        supplyWasteMultiplier,
        shippingCostPerTon,
        isRemote: distanceKm > 30,
    };
}
