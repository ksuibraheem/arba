import { Supplier, SupplierProduct } from './services/supplierService';

export type ProjectType = 'villa' | 'tower' | 'rest_house' | 'factory' | 'school' | 'hospital' | 'mosque' | 'hotel' | 'residential_building' | 'sports_complex';
export type LocationType = 'riyadh' | 'jeddah';
export type SoilType = 'sandy' | 'clay' | 'rocky_soft' | 'rocky_hard' | 'marshy';
export type PricingStrategy = 'fixed_margin' | 'target_roi';

// Updated: View Mode to include 'materials'
export type ViewMode = 'pricing' | 'blueprint' | 'materials';

// New: Language Support
export type Language = 'ar' | 'en' | 'fr' | 'zh';

// New: Execution Methods
export type ExecutionMethod = 'in_house' | 'subcontractor' | 'turnkey';

export type SupplierTier = 'premium' | 'standard' | 'budget';

export interface SupplierOption {
  id: string;
  name: Record<Language, string>; // Changed to support multiple languages
  tier: SupplierTier;
  priceMultiplier: number; // 1.0 is base, 1.2 is 20% more expensive
  origin?: string; // e.g., "Saudi", "China", "Europe"
  dynamicPrice?: number; // Exact price override from dynamic supplier product
}

export type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'majlis' | 'office' | 'shop' | 'corridor' | 'service';

export interface RoomConfig {
  id: string;
  type: RoomType;
  name: string;
  count: number;
  area: number;
  sockets: number;
  switches: number;
  acPoints: number;
}

// New: Interior Finishes Types
export type SurfaceLocation = 'floor' | 'ceiling' | 'wall_north' | 'wall_south' | 'wall_east' | 'wall_west';

export interface MaterialDef {
  id: string;
  name: Record<Language, string>;
  type: 'paint' | 'wallpaper' | 'wood' | 'ceramic' | 'marble' | 'carpet';
  color: string;
  textureUrl?: string; // CSS background pattern
  pricePerSqm: number;
}

export interface RoomFinishes {
  roomId: string;
  surfaces: Record<SurfaceLocation, string | null>; // Maps location to MaterialID
}

export type FacadeMaterial = 'paint' | 'stone' | 'glass' | 'cladding' | 'grc';
export type FacadeDirection = 'north' | 'south' | 'east' | 'west';

export interface FacadeConfig {
  id: string;
  direction: FacadeDirection;
  material: FacadeMaterial;
  area: number;
}

// New: Structural Types
export type SlabType = 'solid' | 'hordi' | 'flat' | 'waffle';

// Area Zone Types for detailed breakdown
export type AreaZoneType = 'room' | 'service' | 'corridor' | 'common' | 'closed' | 'open' | 'annex' | 'parking' | 'stairwell' | 'elevator';

export interface FloorZone {
  id: string;
  name: string;
  area: number;
  type: AreaZoneType;
  isOccupied?: boolean;  // Is this space currently in use
  isAvailable?: boolean; // Is this space available for rent/use
}

export interface FloorDetails {
  id: string;
  name: string; // Ground, First, Roof
  area: number;
  height: number;
  slabType: SlabType;
  columnsCount: number;
  zones: FloorZone[]; // Internal subdivisions
  roomsCount?: number;        // عدد الغرف (optional)
  annexesCount?: number;      // عدد الملحقات (optional)
}

// Area Breakdown Summary - for display with percentages
export interface AreaBreakdownSummary {
  totalBuildArea: number;        // إجمالي مساحة البناء
  floorsCount: number;           // عدد الطوابق

  // Area Categories
  roomsArea: number;             // مساحة الغرف
  commonArea: number;            // المساحات المشتركة (ممرات، لوبي)
  closedArea: number;            // المساحات المغلقة (مخازن، خدمات)
  openArea: number;              // المساحات المفتوحة
  annexesArea: number;           // مساحة الملحقات
  serviceArea: number;           // مساحة الخدمات

  // Usage breakdown
  occupiedArea: number;          // المساحات المشغولة
  availableArea: number;         // المساحات المتاحة

  // Percentages (calculated)
  roomsPercent: number;
  commonPercent: number;
  closedPercent: number;
  openPercent: number;
  annexesPercent: number;
  servicePercent: number;
  occupiedPercent: number;
  availablePercent: number;
}

export interface BlueprintConfig {
  plotLength: number;
  plotWidth: number;
  setbackFront: number;
  setbackSide: number;
  floors: FloorDetails[];
}

// New: Team Member Interface
export interface TeamMember {
  id: string;
  role: string;
  count: number;
  monthlyCost: number; // Salary + Benefits
  durationMonths: number;
}

export interface ProjectMetadata {
  clientName: string;
  tenderNumber: string;
  projectName: string;

  companyName: string;
  preparedBy: string;
  confirmationCode: string;

  pricingDate: string;
  executionStartDate: string;
  projectDurationMonths: number;
}

export interface CustomParams {
  depth?: number;
  thickness?: number;
  cementContent?: number;
  steelRatio?: number;     // kg of steel per m3 of concrete (Load Balancing)
  tankType?: 'fiber' | 'grp' | 'concrete';
  elasticity?: number;
  supplierId?: string;

  // Excavation & Backfill Parameters
  excavationDepth?: number;      // عمق الحفر بالأمتار
  subsidenceRatio?: number;      // نسبة الهبوط (0.05 = 5%)
  backfillDensity?: number;      // كثافة الردم (kg/m3)
  compactionLayers?: number;     // عدد طبقات الدمك
  soilReplacement?: boolean;     // هل يوجد إحلال

  manualPrice?: number;
  manualQty?: number;      // Allow user to override calculated quantity
}

export interface BaseItem {
  id: string;
  category: 'site' | 'structure' | 'architecture' | 'mep_elec' | 'mep_plumb' | 'mep_hvac' | 'insulation' | 'safety' | 'gov_fees' | 'production' | 'manpower' | 'custom';
  type: 'all' | 'villa' | 'tower' | 'rest_house' | 'factory';
  name: Record<Language, string>; // Changed to support multiple languages
  unit: string;
  qty: number;
  baseMaterial: number;
  baseLabor: number;
  waste: number;
  suppliers: SupplierOption[];
  sbc: string;
  soilFactor: boolean;
  dependency?: 'land_area' | 'build_area' | 'fixed' | 'cost_percentage' | 'rooms_area' | 'sockets_count' | 'switches_count' | 'wire_length' | 'duration_months' | 'facade_stone' | 'facade_glass' | 'facade_cladding' | 'facade_paint';
  excludeProfit?: boolean;
  defaultParams?: CustomParams;
  isCustom?: boolean; // Flag for user-added items
}

export interface CalculatedItem extends BaseItem {
  matCost: number;
  labCost: number;
  wasteCost: number;
  directUnitCost: number;
  overheadUnitShare: number;
  totalUnitCost: number;
  profitAmount: number;
  finalUnitPrice: number;
  usedPrice: number;
  totalLinePrice: number;

  // NOTE: Calculated items will carry the RESOLVED string name for display, 
  // but we keep the base name object in the BaseItem extension.
  // We add a 'displayName' property for the rendered string.
  displayName: string;

  selectedSupplier: SupplierOption;

  activeParams?: CustomParams;
  isOptimalPrice?: boolean;
  isManualPrice?: boolean;
  isManualQty?: boolean;
}

export interface AppState {
  language: Language; // New State
  viewMode: ViewMode;
  projectType: ProjectType;
  location: LocationType;
  soilType: SoilType;

  // New Execution Settings
  executionMethod: ExecutionMethod;
  globalPriceAdjustment: number; // Percentage +/-

  metadata: ProjectMetadata;

  pricingStrategy: PricingStrategy;
  profitMargin: number;
  targetROI: number;
  totalInvestment: number;
  fixedOverhead: number;

  landArea: number;
  buildArea: number;
  floors: number;

  // New Blueprint Data
  blueprint: BlueprintConfig;

  rooms: RoomConfig[];

  // New: Interior Finishes Data
  interiorFinishes: RoomFinishes[];

  facades: FacadeConfig[];

  // New Team State
  team: TeamMember[];

  // New: User Added Items
  customItems: BaseItem[];

  itemOverrides: Record<string, CustomParams>;

  // Dynamic Supplier Data
  registeredSuppliers: Supplier[];
  supplierProducts: SupplierProduct[];
}