import { CalculationResult } from './calculations';
import { CalculatedItem } from '../types';

/**
 * --- TIER SEGMENTATION: CLIENT DATA FILTER (Phase 3 & 4) ---
 * Strips internal cost components, raw formulas, and competitor metadata
 * for Individual/Private tier users to ensure data privacy and a clean consumer UI.
 */
export const clientDataFilter = (result: CalculationResult): CalculationResult => {
    return {
        ...result,
        // Hide internal totals
        totalDirect: 0,
        totalOverhead: 0,
        totalProfit: 0,
        totalLaborCost: 0,
        totalMaterialCost: 0,
        
        items: result.items.map(item => {
            // Create a sanitized item for the consumer
            // We keep the essential display info and the final price
            return {
                ...item,
                // Zero out sensitive cost fields
                matCost: 0,
                labCost: 0,
                wasteCost: 0,
                overheadUnitShare: 0,
                profitAmount: 0,
                directUnitCost: 0,
                totalUnitCost: 0,
                // We keep 'usedPrice' as the consumer price
                // We keep 'totalLinePrice' as the consumer total
            } as CalculatedItem;
        })
    };
};
