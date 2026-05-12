/**
 * Arba Local Pricing Engine — Frontend Calculator (Unlimited, Free)
 * محرك التسعير المحلي — حسابات فورية مجانية
 * 
 * PRICING HIERARCHY (v2 — Hybrid Triple-Source):
 * 1. Manual User Override (manualPrice) — highest priority
 * 2. Supplier Link (dynamicPrice from linked supplier)
 * 3. Dynamic API (market rates from getMarketRates)
 * 4. Arba Benchmark (baseMaterial/baseLabor defaults)
 * 
 * This is the client-side engine: unlimited free local calculations.
 * For "Certified Prices" use the server-side certifyPrice() Cloud Function.
 */
import { AppState, CalculatedItem, CustomParams, SupplierOption, BaseItem, Language, AreaBreakdownSummary, BlueprintConfig } from '../types';
import { SupplierProduct } from '../services/supplierService';
import { FULL_ITEMS_DATABASE, REF_LAND_AREA, REF_BUILD_AREA, SOIL_MULTIPLIERS, EST_COST_PER_SQM } from '../constants';
import { findActivity } from '../data/laborProductivity';
import { getReadyMixPrice, getMaterialPrice } from '../data/marketPrices2026';
import { CONCRETE_GRADE_BY_ELEMENT, calculateMaterialCostPerUnit } from '../data/materialRates';
import { generateDynamicBOQ } from '../services/boqEngine';
export interface CalculationResult {
    items: CalculatedItem[];
    totalDirect: number;
    totalOverhead: number;
    totalProfit: number;
    finalPrice: number;
    totalConcreteVolume: number;
    totalLaborCost: number;
    totalMaterialCost: number;
    areaBreakdown: AreaBreakdownSummary;  // Add area breakdown to results
}

// Calculate Area Breakdown from Blueprint
export const calculateAreaBreakdown = (blueprint: BlueprintConfig): AreaBreakdownSummary => {
    let totalBuildArea = 0;
    let roomsArea = 0;
    let commonArea = 0;
    let closedArea = 0;
    let openArea = 0;
    let annexesArea = 0;
    let serviceArea = 0;
    let occupiedArea = 0;
    let availableArea = 0;

    blueprint.floors.forEach(floor => {
        totalBuildArea += floor.area;

        floor.zones.forEach(zone => {
            switch (zone.type) {
                case 'room':
                    roomsArea += zone.area;
                    break;
                case 'common':
                case 'corridor':
                case 'stairwell':
                case 'elevator':
                    commonArea += zone.area;
                    break;
                case 'closed':
                case 'parking':
                    closedArea += zone.area;
                    break;
                case 'open':
                    openArea += zone.area;
                    break;
                case 'annex':
                    annexesArea += zone.area;
                    break;
                case 'service':
                    serviceArea += zone.area;
                    break;
            }

            // Usage tracking
            if (zone.isOccupied) {
                occupiedArea += zone.area;
            }
            if (zone.isAvailable) {
                availableArea += zone.area;
            }
        });
    });

    // If no zones defined, estimate based on floor area
    if (roomsArea === 0 && commonArea === 0 && blueprint.floors.length > 0) {
        // Default breakdown: 60% rooms, 15% common, 10% service, 10% closed, 5% open
        roomsArea = totalBuildArea * 0.60;
        commonArea = totalBuildArea * 0.15;
        serviceArea = totalBuildArea * 0.10;
        closedArea = totalBuildArea * 0.10;
        openArea = totalBuildArea * 0.05;
        occupiedArea = totalBuildArea * 0.75;
        availableArea = totalBuildArea * 0.25;
    }

    // Calculate percentages
    const calcPercent = (val: number) => totalBuildArea > 0 ? Math.round((val / totalBuildArea) * 100) : 0;

    return {
        totalBuildArea,
        floorsCount: blueprint.floors.length,
        roomsArea,
        commonArea,
        closedArea,
        openArea,
        annexesArea,
        serviceArea,
        occupiedArea,
        availableArea,
        roomsPercent: calcPercent(roomsArea),
        commonPercent: calcPercent(commonArea),
        closedPercent: calcPercent(closedArea),
        openPercent: calcPercent(openArea),
        annexesPercent: calcPercent(annexesArea),
        servicePercent: calcPercent(serviceArea),
        occupiedPercent: calcPercent(occupiedArea),
        availablePercent: calcPercent(availableArea),
    };
};

export function getDynamicMaterialCost(item: BaseItem, location: string): number | null {
    // Basic mapping from item.id to activityType in materialRates.ts
    const mapping: Record<string, string> = {
        '06.01': 'blockwork_20cm',
        '06.02': 'blockwork_15cm',
        '06.03': 'blockwork_10cm',
        '07.01': 'plaster_internal', // Defaulting to internal for general plaster item
        '11.03': 'ceramic_floor',
        '11.04': 'ceramic_wall',
        '11.05': 'porcelain_floor',
        '11.01': 'marble',
        '11.02': 'granite',
        '11.06': 'interlock',
        '13.01': 'plastic_interior',
    };

    const activityType = mapping[item.id];
    if (activityType) {
        // Assume default prices for now; these can be dynamically fetched from getMarketRates later
        const mockPrices = { 
            cement_per_kg: 0.44, 
            sand_m3: 60, 
            block_20cm: 3.5, 
            block_15cm: 3.0, 
            block_10cm: 2.5, 
            tile_adhesive_per_kg: 1.5, 
            grout_per_kg: 3.0 
        };
        const cost = calculateMaterialCostPerUnit(activityType, mockPrices);
        if (cost !== null) return cost;
    }

    return null;
}

export function getDynamicLaborCost(item: BaseItem): number | null {
    // Basic mapping from item.id to activityId in laborProductivity.ts
    const mapping: Record<string, string> = {
        '01.02': 'exc_normal',
        '01.03': 'exc_rock',
        '02.01': 'backfill',
        '03.02': 'concrete_found',
        '03.03': 'concrete_columns',
        '03.04': 'concrete_slabs',
        '06.01': 'blockwork_20',
        '06.02': 'blockwork_15',
        '06.03': 'blockwork_10',
        '07.01': 'plaster_internal',
        '11.03': 'tiling_floor',
        '11.04': 'tiling_wall',
        '11.05': 'tiling_floor', // porcelain uses similar labor
        '13.01': 'painting_interior',
        '09.02': 'plumbing_rough',
        '09.03': 'plumbing_finish',
        '10.02': 'electrical_rough',
        '10.03': 'electrical_finish',
    };

    const activityId = mapping[item.id];
    if (activityId) {
        const activity = findActivity(activityId);
        if (activity) return activity.laborCostPerUnit;
    }

    return null;
}

export const calculateProjectCosts = (state: AppState): CalculationResult => {
    return generateDynamicBOQ(state);
};