import { Supplier, SupplierProduct } from './services/supplierService';

export type ProjectType = 'villa' | 'tower' | 'rest_house' | 'factory' | 'school' | 'hospital' | 'mosque' | 'hotel' | 'residential_building' | 'sports_complex' | 'farm' | 'gas_station' | 'mall' | 'restaurant' | 'car_wash' | 'warehouse' | 'government' | 'clinic';
export type LocationType = 'riyadh' | 'jeddah' | 'dammam' | 'makkah' | 'madinah' | 'abha' | 'tabuk' | 'qassim' | 'hail' | 'jazan' | 'najran' | 'baha' | 'jouf' | 'northern_borders' | 'khobar' | 'yanbu' | 'taif' | 'khamis_mushait' | 'ahsa' | 'hafr_albatin';
export type SoilType = 'normal' | 'sandy' | 'clay' | 'rocky_soft' | 'rocky_hard' | 'marshy';
export type PricingStrategy = 'fixed_margin' | 'target_roi' | 'arba_standard';

// SBC 201 Occupancy Classification Groups
export type SBCOccupancyGroup = 'A-1' | 'A-2' | 'A-3' | 'A-4' | 'A-5' | 'B' | 'E' | 'F-1' | 'F-2' | 'H-1' | 'H-2' | 'H-3' | 'I-1' | 'I-2' | 'I-3' | 'M' | 'R-1' | 'R-2' | 'R-3' | 'R-4' | 'S-1' | 'S-2' | 'U';

// SBC Construction Types
export type ConstructionType = 'IA' | 'IB' | 'IIA' | 'IIB' | 'IIIA' | 'IIIB' | 'IV' | 'VA' | 'VB';

// Foundation Types
export type FoundationType = 'isolated_footings' | 'strip_footings' | 'raft' | 'piles' | 'mat' | 'combined';

// Structural System Types
export type StructuralSystem = 'frame' | 'bearing_wall' | 'steel_frame' | 'precast' | 'mixed';

// Seismic Zone Classification
export type SeismicZone = '0' | '1' | '2A' | '2B' | '3' | '4';

// Concrete Grade
export type ConcreteGrade = 'C20' | 'C25' | 'C30' | 'C35' | 'C40' | 'C45' | 'C50';

// Exposure Category (Environmental)
export type ExposureCategory = 'normal' | 'salt' | 'humidity' | 'coastal' | 'industrial';

// Parking Type
export type ParkingType = 'surface' | 'basement' | 'multi_story' | 'none';

// Insulation Type
export type InsulationType = 'eps' | 'xps' | 'polyurethane' | 'rockwool' | 'none';

// Scope of Work
export type ScopeOfWork = 'shell_core' | 'finishing' | 'turnkey' | 'renovation' | 'maintenance';

// Contractor Classification (Saudi MOMRA)
export type ContractorClassification = '1' | '2' | '3' | '4' | '5';

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

export type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'majlis' | 'office' | 'shop' | 'corridor' | 'service' | 'lab' | 'clinic' | 'prayer' | 'storage' | 'gym' | 'pool' | 'restaurant' | 'reception' | 'parking' | 'guard';

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
  // بيانات العميل
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientIdNumber: string;     // رقم الهوية / السجل التجاري

  // بيانات الموقع والأرض
  projectName: string;
  projectAddress: string;     // عنوان المشروع التفصيلي
  deedNumber: string;         // رقم صك الملكية
  plotNumber: string;         // رقم قطعة الأرض
  planNumber: string;         // رقم المخطط
  buildingPermitNumber: string; // رقم رخصة البناء

  // بيانات المناقصة/العرض
  tenderNumber: string;
  quotationNumber: string;    // رقم عرض السعر
  quotationDate: string;      // تاريخ عرض السعر
  quotationValidityDays: number; // مدة صلاحية العرض (يوم)
  scopeOfWork: ScopeOfWork;   // نطاق العمل

  // بيانات الشركة / المقاول
  companyName: string;
  companyLicense: string;     // رقم السجل التجاري
  companyClassification: ContractorClassification; // درجة التصنيف
  companyPhone: string;
  companyEmail: string;
  vatNumber: string;          // الرقم الضريبي
  preparedBy: string;
  confirmationCode: string;

  // بيانات مالية
  vatPercentage: number;      // نسبة ضريبة القيمة المضافة (15%)
  paymentTerms: string;       // شروط الدفع

  // بيانات الجدول الزمني
  pricingDate: string;
  executionStartDate: string;
  projectDurationMonths: number;

  // بيانات الضمان
  warrantyYearsStructure: number;  // ضمان الهيكل (10 سنوات)
  warrantyYearsFinish: number;     // ضمان التشطيبات
  warrantyYearsMEP: number;        // ضمان الأعمال الكهروميكانيكية
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

// =================== ARBA Cognitive Engine v4.1 — Data Types ===================

/** Material consumption linked to a parent item (e.g., tie-wire → steel) */
export interface ConsumableConfig {
  childItemId: string;          // e.g., 'consumable_tie_wire'
  ratioPerParentUnit: number;   // e.g., 10 kg per ton of steel
  unit: string;                 // kg, liter, bag, etc.
  isHardLinked: boolean;        // If true: parent qty change triggers child recalc
}

/** Heavy equipment required for an item (e.g., excavator for site work) */
export interface EquipmentConfig {
  equipId: string;              // e.g., 'excavator_320'
  hoursPerUnit: number;         // Hours needed per unit of parent item
  costPerHour: number;          // SAR per hour (reference rate)
}

/** Packaging dimensions for discrete unit math (tiles, blocks, plywood) */
export interface DimensionConfig {
  id: string;                   // e.g., 'ceramic_60x60'
  length: number;               // meters
  width: number;                // meters
  packageUnits: number;         // pieces per carton/pallet
  packageAreaSqm: number;       // total m² per package (length × width × packageUnits)
}

// =================== BaseItem (Original + Cognitive Extensions) ===================

export interface BaseItem {
  id: string;
  category: 'site' | 'structure' | 'architecture' | 'mep_elec' | 'mep_plumb' | 'mep_hvac' | 'insulation' | 'safety' | 'gov_fees' | 'production' | 'manpower' | 'custom' | 'landscaping' | 'furniture' | 'elevator' | 'fire_protection' | 'smart_systems' | 'renewable_energy' | 'demolition' | 'temporary_works' | 'testing' | 'external_works';
  type: 'all' | ProjectType;
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

  // === Cognitive Engine v4.1 Extensions (all optional — zero breakage) ===
  consumables?: ConsumableConfig[];       // Hidden materials auto-calculated from parent
  equipments?: EquipmentConfig[];         // Heavy equipment linked to this item
  dimensionConfig?: DimensionConfig;      // Packaging for discrete unit math (ceil logic)
  laborComplexity?: 'basic' | 'skilled' | 'specialist'; // Affects labor productivity factor
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
  language: Language;
  viewMode: ViewMode;
  projectType: ProjectType;
  location: LocationType;
  soilType: SoilType;

  // Execution Settings
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

  // SBC Technical Data — بيانات تقنية حسب كود البناء السعودي
  sbcOccupancyGroup: SBCOccupancyGroup;       // تصنيف الإشغال SBC 201
  constructionType: ConstructionType;          // نوع الإنشاء
  foundationType: FoundationType;              // نظام الأساسات
  structuralSystem: StructuralSystem;           // النظام الإنشائي
  seismicZone: SeismicZone;                    // المنطقة الزلزالية
  windSpeed: number;                           // سرعة الرياح التصميمية (km/h)
  buildingRatio: number;                       // نسبة البناء المسموحة (%)
  fireRating: number;                          // تصنيف مقاومة الحريق (ساعات)
  concreteGrade: ConcreteGrade;                // رتبة الخرسانة
  steelGrade: string;                          // درجة الحديد
  exposureCategory: ExposureCategory;          // فئة التعرض البيئي
  hasBasement: boolean;                        // وجود قبو
  parkingType: ParkingType;                    // نوع المواقف
  hasElevator: boolean;                        // وجود مصعد
  elevatorCount: number;                       // عدد المصاعد
  insulationType: InsulationType;              // نوع العزل الحراري

  // Blueprint Data
  blueprint: BlueprintConfig;

  rooms: RoomConfig[];

  // Interior Finishes Data
  interiorFinishes: RoomFinishes[];

  facades: FacadeConfig[];

  // Team State
  team: TeamMember[];

  // User Added Items
  customItems: BaseItem[];

  itemOverrides: Record<string, CustomParams>;

  // Dynamic Supplier Data
  registeredSuppliers: Supplier[];
  supplierProducts: SupplierProduct[];
}