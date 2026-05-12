/**
 * ARBA Brain Data Module — Central Index
 * المركز الرئيسي لبيانات الدماغ
 */

// Material Consumption Rates
export {
  CONCRETE_MIX_RATES,
  CONCRETE_GRADE_BY_ELEMENT,
  MORTAR_RATES,
  TILE_RATES,
  PAINT_RATES,
  INSULATION_RATES,
  WATERPROOFING_RATES,
  ENHANCED_WASTE_FACTORS,
  calculateMaterialCostPerUnit,
} from './materialRates';

export type {
  ConcreteMixRate,
  MortarRate,
  TileRate,
  PaintRate,
  InsulationRate,
  WaterproofingRate,
} from './materialRates';

// Labor Productivity
export {
  LABOR_ACTIVITIES,
  WEATHER_FACTORS,
  COMPLEXITY_FACTORS,
  findActivity,
  calculateLaborCost,
} from './laborProductivity';

export type { LaborActivity, ProductivityFactor } from './laborProductivity';

// Market Prices 2026
export {
  MATERIAL_PRICES,
  LABOR_DAILY_RATES,
  EQUIPMENT_RATES,
  READYMIX_BY_CITY,
  getMaterialPrice,
  getReadyMixPrice,
  PRICES_LAST_UPDATED,
  PRICES_VERSION,
} from './marketPrices2026';

export type { MaterialPrice } from './marketPrices2026';
