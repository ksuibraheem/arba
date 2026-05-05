import { AppState, CalculatedItem, BaseItem, SupplierOption, Language } from '../types';
import { runCognitiveEngine, CognitiveOutputItem } from './cognitiveCalculations';
import { calculateAreaBreakdown, CalculationResult, getDynamicMaterialCost, getDynamicLaborCost } from '../utils/calculations';
import { FULL_ITEMS_DATABASE } from '../constants';
import { learningFeedbackService } from './learningFeedbackService';

// =================== Brain Layer 0: ID Bridge ===================
/**
 * Maps cognitive engine IDs → FULL_ITEMS_DATABASE IDs.
 * Without this mapping, items produced by cognitiveCalculations.ts
 * cannot find their price data, resulting in 0 SAR items.
 */
const COGNITIVE_TO_DB_MAP: Record<string, string> = {
  // Excavation
  'exc_site_clearance': '01.01',
  'exc_digging':        '01.02',
  'exc_rock_digging':   '01.03',
  'exc_shoring':        '01.04',
  'exc_dewatering':     '01.05',
  'exc_cartaway':       '01.06',

  // Backfill & Compaction
  'exc_backfill':       '02.01',
  'exc_compaction':     '02.04',
  'exc_termite':        '02.05',
  'exc_polyethylene':   '02.06',

  // Substructure Concrete
  'sub_blinding':       '03.01',
  'sub_footings':       '03.02',
  'sub_tiebeams':       '03.03',
  'sub_necks':          '03.04',
  'sub_steel':          '03.05',
  'formwork_sub':       '03.06',

  // Superstructure
  'super_columns':      '04.01',
  'super_slabs':        '04.03',
  'super_steel':        '05.03',
  'formwork_super':     '03.06', // same formwork item
  'super_stairs':       '04.04',

  // Masonry — map to structure blocks
  'masonry_block_ext':  '05.04',
  'masonry_block_int':  '05.05',
  'masonry_mortar':     '05.07', // approx → lintels (cement-based)
  'masonry_spatter_dash': '07.01',
  'masonry_plaster_int': '07.01',
  'masonry_plaster_ext': '07.02',

  // Insulation & Waterproofing
  'insulation_foundation': '06.01',
  'insulation_roof_screed': '06.02',
  'insulation_roof':    '06.03',
  'waterproof_wet_areas': '06.04',
  'waterproof_tanks':   '06.05',

  // MEP — Plumbing
  'mep_plumb_supply':   '08.01',
  'mep_plumb_drain':    '08.02',
  'mep_plumb_vent':     '08.02', // use drain prices
  'mep_plumb_ground_tank': '08.03',
  'mep_plumb_fixtures': '08.07',
  'mep_plumb_water_heater': '08.06',

  // MEP — Electrical
  'mep_elec_cables':    '09.03',
  'mep_elec_conduit':   '09.04',
  'mep_elec_db':        '09.02',

  // MEP — HVAC
  'mep_hvac_units':     '10.01',
  'mep_hvac_freon_pipes': '10.02',
  'mep_hvac_condensate': '10.03',

  // Finishes
  'finish_floor_tiles': '11.03',
  'finish_wall_tiles':  '11.04',
  'finish_tile_glue':   '11.03', // bundle with tiles
  'finish_grout':       '11.03',
  'finish_paint_walls': '13.01',
  'finish_primer':      '13.01',
  'finish_gypsum_ceiling': '12.01',

  // Doors & Windows
  'doors_windows_aluminum': '14.01',
  'doors_windows_wood': '14.02',

  // Fire Protection (v8.5 — Advanced Systems)
  'fire_extinguishers': '15.01',
  'fire_pump_set':      '15.06',  // مضخات حريق (Jockey + Electric + Diesel)
  'fire_sprinkler_sys': '15.05',  // شبكة رشاشات
  'fire_alarm_panel':   '15.07',  // لوحة إنذار ذكية
  'fire_fm200':         '15.08',  // FM200/Novec
  'fire_wet_riser':     '21.01',  // شبكة Wet Riser
  'fire_water_tank':    '21.02',  // خزان مياه حريق 200م³

  // Safety
  'safety_hoarding':    '16.01',

  // Electrical Advanced (v8.5)
  'mep_elec_mdb':       '19.01',  // لوحة توزيع رئيسية MDB
  'mep_elec_ats':       '09.12',  // تحويل أوتوماتيكي ATS
  'mep_elec_transformer': '09.16', // محول كهرباء
  'mep_elec_generator': '19.04',  // مولد احتياطي

  // HVAC Central (v8.5)
  'mep_hvac_chiller':   '10.04',  // تشيلر مركزي
  'mep_hvac_ahu':       '10.07',  // وحدة مناولة هواء AHU
  'mep_hvac_fcu':       '10.08',  // FCU ملف ومروحة
  'mep_hvac_ductwork':  '10.09',  // مجاري هواء

  // Smart Systems / ELV (v8.5)
  'elv_bms':            '18.10',  // نظام إدارة المبنى BMS
  'elv_cctv':           '18.03',  // كاميرات مراقبة
  'elv_access_control': '18.05',  // تحكم دخول
  'elv_structured_cabling': '18.01', // شبكة بيانات

  // Consumables — estimated prices
  'consumable_tie_wire': '03.05', // steel-related
  'consumable_spacers': '03.06', // formwork-related
  'water_total':        '02.06', // site services
};

/**
 * Estimated unit prices for cognitive items that have NO match in FULL_ITEMS_DATABASE.
 * Format: { material: SAR/unit, labor: SAR/unit }
 * These are market-based fallbacks so items never show 0 SAR.
 */
const FALLBACK_PRICES: Record<string, { material: number; labor: number }> = {
  // Consumables
  'consumable_tie_wire':  { material: 8,    labor: 2 },
  'consumable_spacers':   { material: 0.5,  labor: 0.2 },
  'water_total':          { material: 0.05, labor: 0.02 },

  // Masonry mortar
  'masonry_mortar':       { material: 18,   labor: 0 },
  'masonry_spatter_dash': { material: 8,    labor: 12 },

  // Finishes sub-items
  'finish_tile_glue':     { material: 35,   labor: 5 },
  'finish_grout':         { material: 12,   labor: 3 },
  'finish_primer':        { material: 8,    labor: 4 },

  // MEP misc
  'mep_plumb_vent':       { material: 25,   labor: 15 },
  'mep_hvac_condensate':  { material: 12,   labor: 8 },
  'mep_hvac_freon_pipes': { material: 45,   labor: 25 },

  // Safety
  'safety_hoarding':      { material: 35,   labor: 15 },
  'safety_night_lights':  { material: 150,  labor: 50 },

  // Summer additives
  'summer_ice_additive':  { material: 25,   labor: 0 },
  'summer_retarder':      { material: 15,   labor: 0 },

  // Fire protection
  'fire_extinguishers':   { material: 120,  labor: 30 },
  'fire_alarm_panel':     { material: 3500, labor: 500 },
  'fire_smoke_detectors': { material: 85,   labor: 35 },
  'fire_pump_set':        { material: 60000, labor: 15000 },
  'fire_sprinkler_sys':   { material: 35,   labor: 15 },
  'fire_fm200':           { material: 25000, labor: 5000 },
  'fire_wet_riser':       { material: 120,  labor: 40 },
  'fire_water_tank':      { material: 45000, labor: 10000 },

  // Electrical Advanced
  'mep_elec_mdb':         { material: 35000, labor: 5000 },
  'mep_elec_transformer': { material: 120000, labor: 15000 },
  'mep_elec_generator':   { material: 90000, labor: 5000 },

  // HVAC Central
  'mep_hvac_chiller':     { material: 1200, labor: 200 },
  'mep_hvac_ahu':         { material: 25000, labor: 5000 },
  'mep_hvac_fcu':         { material: 3000, labor: 500 },
  'mep_hvac_ductwork':    { material: 80,   labor: 40 },

  // Smart Systems / ELV
  'elv_bms':              { material: 105000, labor: 20000 },
  'elv_cctv':             { material: 800,  labor: 200 },
  'elv_access_control':   { material: 2500, labor: 800 },
  'elv_structured_cabling': { material: 200, labor: 80 },

  // Testing & QC
  'test_concrete_cubes':  { material: 150,  labor: 50 },
  'test_soil_compaction': { material: 300,  labor: 100 },
  'test_insulation':      { material: 200,  labor: 100 },
};

/**
 * Maps CognitiveOutputItem -> BaseItem (fallback for missing items)
 * Now includes smart price estimation instead of 0 SAR
 */
function cognitiveToBaseItem(cog: CognitiveOutputItem, projectType: string): BaseItem {
  const fallback = FALLBACK_PRICES[cog.id];
  return {
    id: cog.id,
    category: (cog.category || 'custom') as any,
    type: projectType as any,
    name: cog.name,
    unit: cog.unit,
    qty: cog.procurementQty,
    baseMaterial: fallback?.material ?? 0,
    baseLabor: fallback?.labor ?? 0,
    waste: cog.wastePercent,
    suppliers: [],
    sbc: 'SBC-301/304',
    soilFactor: false
  };
}

/**
 * BOQ Engine — Bridges the advanced cognitive quantities with dynamic market prices.
 * v8.0: Now uses COGNITIVE_TO_DB_MAP for proper ID resolution + FALLBACK_PRICES for coverage.
 */
export function generateDynamicBOQ(state: AppState): CalculationResult {
  const cognitiveOutput = runCognitiveEngine(state.blueprint, state.soilType);
  
  // Flatten all cognitive items into one array
  const allCognitiveItems = [
    ...cognitiveOutput.excavation,
    ...cognitiveOutput.substructure,
    ...cognitiveOutput.superstructure,
    ...cognitiveOutput.masonry,
    ...cognitiveOutput.consumables,
    ...cognitiveOutput.finishes,
    ...cognitiveOutput.facades,
    ...cognitiveOutput.doorsAndWindows,
    ...cognitiveOutput.insulation,
    ...cognitiveOutput.waterproofing,
    ...cognitiveOutput.fireProtection,
    ...cognitiveOutput.testing,
    ...cognitiveOutput.safety,
    ...cognitiveOutput.summerAdditives,
    ...cognitiveOutput.mep              // v8.5 FIX: MEP items were missing from pipeline!
  ];

  const calculatedItems: CalculatedItem[] = [];
  let totalMaterialCost = 0;
  let totalLaborCost = 0;

  // Process each item
  allCognitiveItems.forEach(cogItem => {
    // 1. Try mapped ID first, then direct ID match
    const mappedId = COGNITIVE_TO_DB_MAP[cogItem.id];
    let baseItem = FULL_ITEMS_DATABASE.find(
      dbItem => dbItem.id === (mappedId || cogItem.id)
    );
    
    // Fallback: create a synthetic base item with estimated prices
    if (!baseItem) {
      baseItem = cognitiveToBaseItem(cogItem, state.projectType);
    }

    // Update qty to use the precise cognitive calculation
    const currentItem: BaseItem = {
      ...baseItem,
      qty: cogItem.procurementQty, // Use procurement qty which includes waste and rounding
      name: cogItem.name, // Override name with the highly specific cognitive name
      unit: cogItem.unit
    };

    // 2. Determine Pricing
    // Try to get dynamic market rates first
    let materialUnitCost = getDynamicMaterialCost(currentItem, state.location) ?? currentItem.baseMaterial;
    let laborUnitCost = getDynamicLaborCost(currentItem) ?? currentItem.baseLabor;

    // Apply User Manual Overrides if present
    const userOverride = state.itemOverrides[currentItem.id];
    if (userOverride?.manualPrice !== undefined) {
      materialUnitCost = userOverride.manualPrice;
      laborUnitCost = 0; // If user overrides, assume it's total unit cost
    }

    if (userOverride?.manualQty !== undefined) {
      currentItem.qty = userOverride.manualQty;
    }

    // Apply execution method adjustments
    if (state.executionMethod === 'subcontractor') {
      laborUnitCost *= 1.15; // 15% markup for subcontractors
    } else if (state.executionMethod === 'turnkey') {
      materialUnitCost *= 1.10;
      laborUnitCost *= 1.20;
    }

    // Apply global price adjustment
    if (state.globalPriceAdjustment !== 0) {
      const factor = 1 + (state.globalPriceAdjustment / 100);
      materialUnitCost *= factor;
      laborUnitCost *= factor;
    }

    const isOptimalPrice = (getDynamicMaterialCost(currentItem, state.location) !== null);

    // 3. Calculate Totals
    const lineMatCost = materialUnitCost * currentItem.qty;
    const lineLabCost = laborUnitCost * currentItem.qty;
    const directUnitCost = materialUnitCost + laborUnitCost;
    
    // Profit Calculation
    let targetMargin = state.profitMargin / 100;
    if (state.pricingStrategy === 'target_roi') {
      targetMargin = (state.targetROI / 100) * 1.2;
    }

    let profitAmount = 0;
    if (!currentItem.excludeProfit) {
      profitAmount = directUnitCost * targetMargin;
    }

    const finalUnitPrice = directUnitCost + profitAmount;
    const totalLinePrice = finalUnitPrice * currentItem.qty;

    // =================== v8.5 Brain Insights: Profit Validation ===================
    const baseCost = (baseItem?.baseMaterial ?? 0) + (baseItem?.baseLabor ?? 0);
    let profitStatus: 'balanced' | 'exaggerated' | 'loss' = 'balanced';
    const brainWarnings: string[] = [];

    if (baseCost > 0 && directUnitCost > 0) {
      const profitMarginPercent = ((directUnitCost - baseCost) / baseCost) * 100;

      if (directUnitCost < baseCost * 0.95) {
        profitStatus = 'loss';
        brainWarnings.push(
          state.language === 'ar'
            ? `🔴 تنبيه خسارة: السعر (${directUnitCost.toFixed(0)} ر.س) أقل من التكلفة الأساسية (${baseCost.toFixed(0)} ر.س). خطر تركيب مواد رديئة!`
            : `🔴 Loss Alert: Price (${directUnitCost.toFixed(0)} SAR) below base cost (${baseCost.toFixed(0)} SAR). Risk of substandard materials!`
        );
      } else if (profitMarginPercent > 30) {
        profitStatus = 'exaggerated';
        brainWarnings.push(
          state.language === 'ar'
            ? `🟠 ربح مبالغ: هامش ${profitMarginPercent.toFixed(0)}% يتجاوز 30%. تحقق من توازن التسعير.`
            : `🟠 Exaggerated: ${profitMarginPercent.toFixed(0)}% margin exceeds 30%. Check pricing balance.`
        );
      }
    }

    totalMaterialCost += lineMatCost;
    totalLaborCost += lineLabCost;

    calculatedItems.push({
      ...currentItem,
      displayName: cogItem.name[state.language] + (cogItem.notes ? ` (${cogItem.notes})` : ''),
      matCost: lineMatCost,
      labCost: lineLabCost,
      wasteCost: 0, // Waste is already handled in procurementQty
      directUnitCost,
      overheadUnitShare: 0,
      totalUnitCost: directUnitCost,
      profitAmount,
      finalUnitPrice,
      usedPrice: finalUnitPrice,
      totalLinePrice,
      selectedSupplier: currentItem.suppliers?.[0] || { id: 'market', name: { ar: 'السوق المحلي', en: 'Local Market', fr: 'Marché local', zh: '当地市场' }, tier: 'standard', priceMultiplier: 1 },
      activeParams: userOverride || currentItem.defaultParams,
      isOptimalPrice,
      isManualPrice: userOverride?.manualPrice !== undefined,
      isManualQty: userOverride?.manualQty !== undefined,
      profitStatus,         // v8.5 Brain Insight
      brainWarnings,        // v8.5 Brain Insight
    });
  });

  const totalDirect = totalMaterialCost + totalLaborCost;
  const totalProfit = calculatedItems.reduce((sum, item) => sum + (item.profitAmount * item.qty), 0);
  const totalOverhead = state.fixedOverhead || 0;
  
  // Allocate overhead share proportionally
  if (totalDirect > 0 && totalOverhead > 0) {
    calculatedItems.forEach(item => {
      const shareRatio = (item.matCost + item.labCost) / totalDirect;
      item.overheadUnitShare = (totalOverhead * shareRatio) / (item.qty || 1);
      item.totalUnitCost = item.directUnitCost + item.overheadUnitShare;
      
      // Recalculate final price with overhead
      item.finalUnitPrice = item.totalUnitCost + item.profitAmount;
      item.usedPrice = item.finalUnitPrice;
      item.totalLinePrice = item.finalUnitPrice * item.qty;
    });
  }

  const finalPrice = totalDirect + totalOverhead + totalProfit;

  return {
    items: calculatedItems,
    totalDirect,
    totalOverhead,
    totalProfit,
    finalPrice,
    totalConcreteVolume: cognitiveOutput.summary.totalConcreteM3,
    totalLaborCost,
    totalMaterialCost,
    areaBreakdown: calculateAreaBreakdown(state.blueprint)
  };
}
