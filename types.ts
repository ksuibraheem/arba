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

// =================== نطاق التسليم — Delivery Scope ===================
export type DeliveryScope =
  | 'excavation_only'     // ⛏️ حفر فقط
  | 'foundation'          // 🏗️ تسليم أساس
  | 'shell'               // 🧱 عظم (Shell & Core)
  | 'shell_mep'           // ⚡ عظم + تمديدات
  | 'finishing_only'       // 🎨 تشطيب داخلي فقط
  | 'turnkey'             // 🔑 تسليم مفتاح
  | 'custom';             // ⚙️ مخصص

// تعريف القسم الهندسي
export interface SectionDef {
  code: string;            // '00' – '17'
  nameAr: string;
  nameEn: string;
  icon: string;            // emoji
  color: string;           // hex
  group: string;           // A–G (UniFormat)
  groupNameAr: string;
  groupNameEn: string;
}

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
  // === v6.0 Structural Extensions ===
  perimeterWallLength?: number;   // محيط الجدران الخارجية (متر طولي)
  internalWallLength?: number;    // إجمالي أطوال القواطع الداخلية (متر طولي)
  slabThickness?: number;          // سماكة السقف (متر) — default by slabType
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

// =================== ARBA-Ops v6.0 — Cognitive Blueprint Schema ===================

/** نوع سند جوانب الحفر */
export type ShoringType = 'none' | 'timber' | 'steel_sheet' | 'concrete_piles' | 'soldier_piles';

/** نوع نزح المياه الجوفية */
export type DewateringType = 'none' | 'surface_pumps' | 'wellpoint' | 'deep_well';

/** Excavation & Earthworks Configuration (بيانات الحفر والتربة) */
export interface ExcavationConfig {
  excavationDepth: number;           // عمق الحفر (متر)
  soilReplacementNeeded: boolean;    // هل يحتاج إحلال
  soilReplacementThickness: number;  // سماكة طبقة الإحلال (متر)
  zeroLevel: number;                 // منسوب الصفر المعماري (متر) relative to natural ground

  // === v8.0: بنود حرجة جديدة ===
  /** سند جوانب الحفر — SBC 303 */
  shoringRequired?: boolean;         // هل يحتاج سند جوانب
  shoringType?: ShoringType;         // نوع السند
  shoringDepth?: number;             // عمق السند (متر) — عادة = عمق الحفر

  /** نزح المياه الجوفية — SBC 303 */
  dewateringRequired?: boolean;      // هل يوجد مياه جوفية
  dewateringType?: DewateringType;   // نوع النزح
  waterTableDepth?: number;          // منسوب المياه الجوفية (متر من سطح الأرض)

  /** تنظيف الموقع وقشط السطح */
  siteClearanceRequired?: boolean;   // هل يحتاج تنظيف موقع
  topsoilStrippingDepth?: number;    // عمق قشط الطبقة السطحية (متر) — عادة 0.15-0.20

  /** حفر صخري */
  rockExcavationPercent?: number;    // نسبة الحفر الصخري من إجمالي الحفر (0-100%)

  /** ردم مستورد من خارج الموقع */
  importedFillRequired?: boolean;    // هل يحتاج ردم من الخارج
  importedFillPercent?: number;      // نسبة الردم المستورد من إجمالي الردم (0-100%)
}

/** Foundation System Configuration (نظام الأساسات) */
export interface FoundationConfig {
  type: FoundationType;              // قواعد منفصلة، شريطية، لبشة
  neckColumnHeight: number;          // ارتفاع رقاب الأعمدة (متر)
  tieBeamDepth: number;              // عمق الميد (متر)
  tieBeamWidth: number;              // عرض الميد (متر)
  footingDepth: number;              // عمق القاعدة (متر) for isolated/strip
  footingWidth: number;              // عرض القاعدة (متر) for isolated/strip
  raftThickness: number;             // سمك اللبشة (متر) — used only if type=raft
}

/** Finish type for a single surface in a room (خامة سطح واحد) */
export type FinishMaterial = 'ceramic_60x60' | 'ceramic_30x60' | 'porcelain_120x60' | 'marble' | 'granite' | 'vinyl' | 'epoxy'
  | 'paint_plastic' | 'paint_velvet' | 'wallpaper' | 'gypsum_board' | 'gypsum_plaster' | 'cement_plaster'
  | 'none';

/** Room finish schedule — what goes on each surface (جدول تشطيبات الغرفة) */
export interface RoomFinishSchedule {
  id: string;
  roomName: string;               // اسم الفراغ (مجلس، نوم رئيسية، مطبخ)
  roomType: RoomType;
  length: number;                 // طول الغرفة (متر)
  width: number;                  // عرض الغرفة (متر)
  height: number;                 // ارتفاع الغرفة (متر)
  floorFinish: FinishMaterial;    // تشطيب الأرضية
  wallFinish: FinishMaterial;     // تشطيب الحوائط
  ceilingFinish: FinishMaterial;  // تشطيب السقف
  wetAreaWallHeight?: number;     // ارتفاع سيراميك الحمام/المطبخ (متر)
  windowDoorRatio: number;        // نسبة الأبواب والنوافذ (0.10 – 0.20)
  floorId: string;                // ربط بالطابق
}

/** Facade definition (تعريف الواجهة) */
export type FacadeFinishType = 'stone_mechanical' | 'stone_glued' | 'profile_paint' | 'grc' | 'glass_curtain' | 'cladding_alucobond' | 'plaster_paint';

export interface FacadeSchedule {
  id: string;
  direction: FacadeDirection;         // شمال، جنوب، شرق، غرب
  width: number;                      // عرض الواجهة (متر)
  totalHeight: number;                // الارتفاع الكلي (متر) — sum of all floor heights
  finishType: FacadeFinishType;       // نوع تشطيب الواجهة
  windowDoorRatio: number;            // نسبة الفتحات (0.15 – 0.30)
}

// =================== ARBA-Ops v6.1 — MEP Configuration ===================

/** نوع ماسورة تغذية */
export type SupplyPipeMaterial = 'ppr' | 'cpvc' | 'copper';
/** نوع ماسورة صرف */
export type DrainPipeMaterial = 'upvc' | 'pvc' | 'hdpe';
/** نوع السخان */
export type WaterHeaterType = 'central' | 'instant' | 'solar';
/** نوع التوصيل الكهربائي */
export type ElectricalPhase = 'single_220v' | 'three_phase_380v';
/** نوع نظام التكييف */
export type HVACSystemType = 'split' | 'central_ducted' | 'vrf' | 'cassette';
/** موقع الكمبرسرات */
export type CondenserLocation = 'roof' | 'ground' | 'balcony';

/** نوع الجهاز الصحي */
export type PlumbingFixtureType =
  'toilet' | 'washbasin' | 'shower' | 'bathtub' |
  'bidet' | 'kitchen_sink' | 'laundry_sink' |
  'washing_machine' | 'dishwasher' | 'floor_drain';

/** جهاز صحي */
export interface PlumbingFixture {
  type: PlumbingFixtureType;
  count: number;
}

/** بيانات السباكة — SBC 701 */
export interface PlumbingConfig {
  supplyPipeMaterial: SupplyPipeMaterial;
  drainPipeMaterial: DrainPipeMaterial;
  waterHeaterType: WaterHeaterType;
  mainLineSize_mm: number;           // قطر الخط الرئيسي — default 25mm
  hasGroundTank: boolean;
  groundTankLiters: number;
  hasRoofTank: boolean;
  roofTankLiters: number;
}

/** بيانات الكهرباء — SBC 401 / IEC 60364 */
export interface ElectricalConfig {
  phaseType: ElectricalPhase;
  mainBreakerAmps: number;           // قاطع رئيسي — default 63A
  hasBackupGenerator: boolean;
}

/** بيانات التكييف */
export interface HVACConfig {
  systemType: HVACSystemType;
  condenserLocation: CondenserLocation;
}

/** MEP مجمع */
export interface MEPConfig {
  plumbing?: PlumbingConfig;
  electrical?: ElectricalConfig;
  hvac?: HVACConfig;
}

// =================== ARBA v7.0 — Exhaustive Engineering Schema ===================

/** رتبة الخرسانة ونوع الأسمنت — SBC 304 / ACI 318-19 */
export type CementType = 'opc' | 'src';
export type ConcreteGradeValue = 20 | 25 | 30 | 35 | 40 | 45 | 50;

export interface ConcreteSpec {
  fcRating: ConcreteGradeValue;          // رتبة الخرسانة (MPa) — default 30
  cementType: CementType;                // OPC عادي أو SRC مقاوم كبريتات — default 'opc'
  maxAggregateSize_mm: number;           // أقصى حجم ركام — default 20
  maxPourTemp_C: number;                 // أقصى حرارة صب — SBC 304: 35°C
  slumpRange_mm: [number, number];       // نطاق الهبوط — [100, 150] default
}

/** حديد التسليح — SBC 304 / ACI 318-19 */
export type RebarGrade = 'G40' | 'G60' | 'G75';

export interface RebarSpec {
  grade: RebarGrade;                     // درجة الحديد — default G60
  yieldStrength_MPa: number;             // إجهاد الخضوع — 420 MPa for G60
  lapLengthMultiplier: number;           // معامل طول التراكب — 60 (Class B safe default)
  minCover_foundation_mm: number;        // غطاء قواعد — SBC 304: 75mm
  minCover_column_mm: number;            // غطاء أعمدة — SBC 304: 40mm
  minCover_slab_mm: number;              // غطاء أسقف — SBC 304: 25mm
  minCover_beam_mm: number;              // غطاء كمرات — SBC 304: 40mm
  minCover_exposed_mm: number;           // غطاء معرض للطقس — SBC 304: 50mm
}

/** اختبارات الجودة — SBC 304 + SBC 701 */
export interface TestingConfig {
  // فحص مكعبات خرسانة — SBC 304
  cubeTestFrequency_m3: number;          // كل كم م³ — default 120
  cubesPerSample: number;                // عدد مكعبات لكل عينة — default 3
  cubeTestCost_SAR: number;              // تكلفة المجموعة — default 200

  // اختبار ضغط سباكة — SBC 701
  pressureTest_PSI: number;              // ضغط الاختبار — default 50
  pressureTestDuration_min: number;      // مدة الاختبار — default 15
  pressureTestCost_SAR: number;          // تكلفة لكل شبكة — default 800

  // اختبار عزل مائي
  waterproofTestCost_SAR: number;        // فحص غمر — default 500

  // اختبار دمك تربة
  compactionTestCost_SAR: number;        // بروكتور — default 300

  // تقرير جيوتقني
  geotechnicalReportCost_SAR: number;    // SPT + حفر — default 5000

  // فحص كهرباء (ميقر)
  electricalTestCost_SAR: number;        // مقاومة عزل — default 700
}

/** سلامة الموقع — OSHA / SBC */
export interface SafetyConfig {
  hoardingHeight_m: number;              // ارتفاع السياج — default 2.4
  hoardingCostPerLm_SAR: number;         // تكلفة/م.ط — default 225
  scaffoldingRequired: boolean;          // هل يحتاج سقالات
  fallProtectionRequired: boolean;       // حماية سقوط
  nightLightingPoints: number;           // نقاط إضاءة ليلية
  nightLightCostPerPoint_SAR: number;    // تكلفة/نقطة — default 75
}

/** عزل حراري — SBC 601 / 602 */
export type InsulationMaterialType = 'eps' | 'xps' | 'rockwool' | 'polyurethane_spray' | 'none';

export interface InsulationSpec {
  wallInsulationType: InsulationMaterialType;     // عزل جدران — default 'eps'
  wallInsulationThickness_mm: number;             // سماكة — default 50
  roofInsulationType: InsulationMaterialType;     // عزل سقف — default 'xps'
  roofInsulationThickness_mm: number;             // سماكة — default 50
}

/** عازل رطوبة DPC — SBC 303 */
export type DPCMaterial = 'bitumen_sbs_3mm' | 'bitumen_sbs_4mm' | 'bitumen_sbs_5mm' | 'hdpe_sheet';

export interface DPCConfig {
  foundationDPC: DPCMaterial;            // عزل أساسات — default 'bitumen_sbs_4mm'
  roofWaterproofing: DPCMaterial;        // عزل سطح — default 'bitumen_sbs_4mm'
  bathroomWaterproofing: boolean;        // عزل حمامات — default true
  overlapMin_mm: number;                 // أدنى تراكب — default 100
}

/** حماية حريق — SBC 801 / NFPA 72 */
export interface FireProtectionConfig {
  smokeDetectorsPerFloor: number;        // كاشفات دخان لكل طابق — auto-calc from rooms
  fireExtinguisherCount: number;         // طفايات — auto-calc
  hasFireAlarmSystem: boolean;           // نظام إنذار — default true for >3 floors
  hasSprinklerSystem: boolean;           // نظام رش — default false for villas
  civilDefenseApprovalCost_SAR: number;  // رسوم سلامة — default 2000
}

/** إعدادات صب الصيف — SBC 304 hot weather */
export interface SummerConcretingConfig {
  isEnabled: boolean;                    // تفعيل — auto from date/location
  iceAdditiveCost_SAR_per_m3: number;    // ثلج مجروش — default 20
  retarderCost_SAR_per_m3: number;       // مؤخر شك — default 12
  laborProductivityFactor: number;       // معامل إنتاجية — default 0.80 (20% reduction)
  noonWorkBanApplies: boolean;           // حظر 12-3 (15 يونيو - 15 سبتمبر)
}

export interface BlueprintConfig {
  plotLength: number;
  plotWidth: number;
  setbackFront: number;
  setbackSide: number;
  setbackRear?: number;                 // ارتداد خلفي (متر)
  floors: FloorDetails[];

  // === v6.0 Engineering Data Sections (optional for backward compat) ===
  excavation?: ExcavationConfig;
  foundation?: FoundationConfig;
  roomFinishes?: RoomFinishSchedule[];
  facadeSchedules?: FacadeSchedule[];

  // === v6.1 Structural Details ===
  columnWidth_cm?: number;              // عرض العمود — default 30
  columnDepth_cm?: number;              // عمق العمود — default 50

  // === v6.1 MEP ===
  mepConfig?: MEPConfig;

  // === v7.0 Exhaustive Engineering Schema ===
  concreteSpec?: ConcreteSpec;           // رتبة الخرسانة والأسمنت
  rebarSpec?: RebarSpec;                 // مواصفات الحديد + أغطية
  testingConfig?: TestingConfig;         // اختبارات الجودة
  safetyConfig?: SafetyConfig;           // سلامة الموقع
  insulationSpec?: InsulationSpec;       // عزل حراري SBC 601
  dpcConfig?: DPCConfig;                 // عزل رطوبة SBC 303
  fireProtection?: FireProtectionConfig; // حماية حريق SBC 801
  summerConcreting?: SummerConcretingConfig; // إعدادات الصيف
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
  topsoilStrippingDepth?: number;
  shoringType?: ShoringType | string;
  shoringDepth?: number;
  dewateringType?: DewateringType | string;
  waterTableDepth?: number;

  manualPrice?: number;
  customPrice?: number;    // Alias for manualPrice — used by temporal audit
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
  category: 'site' | 'structure' | 'architecture' | 'mep_elec' | 'mep_plumb' | 'mep_hvac' | 'insulation' | 'safety' | 'gov_fees' | 'production' | 'manpower' | 'custom' | 'landscaping' | 'furniture' | 'elevator' | 'fire_protection' | 'smart_systems' | 'renewable_energy' | 'demolition' | 'temporary_works' | 'testing' | 'external_works' | 'fire_advanced' | 'elec_advanced' | 'hvac_central';
  type: 'all' | 'commercial' | ProjectType;
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

  // === v8.5 Brain Insights ===
  profitStatus?: 'balanced' | 'exaggerated' | 'loss';  // تحليل هامش الربح
  brainWarnings?: string[];                             // تنبيهات الدماغ الذكي

  // === v9.0 Price Intelligence ===
  scopeLabel?: string;               // "توريد وتنفيذ (شامل: خرسانة+حديد+شدة+صب)"
  priceBreakdownDisplay?: string;    // "خرسانة 265 + حديد 736 + شدة 125 + صب 45 + عمالة 180"
  equipmentDisplay?: string;         // "سقالة داخلية (10 ر.س/م²)"
  equipmentCost?: number;            // تكلفة المعدات المضافة للسعر
  elevationZone?: string;            // "underground" | "ground" | "elevated" | "roof" | "external"

  // === v8.2 Compatibility — used by goldenOutputService & ItemProfitabilityChart ===
  totalMaterialCost?: number;        // إجمالي تكلفة المواد
  totalLaborCost?: number;           // إجمالي تكلفة العمالة
  descriptionAr?: string;            // وصف البند بالعربي
  descriptionEn?: string;            // وصف البند بالإنجليزي
  quantity?: number;                 // الكمية (alias for qty from BaseItem)
}

/** Alias for ItemProfitabilityChart compatibility */
export type ProcessedItem = CalculatedItem;

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

  // =================== نطاق التسليم ===================
  deliveryScope: DeliveryScope;
  enabledSections: string[];  // ['00','01','02',...] — الأقسام المفعّلة
}