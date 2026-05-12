/**
 * ARBA Brain v1.0 — Saudi Market Prices 2026
 * أسعار السوق السعودي 2026 — قابلة للتحديث
 *
 * المصادر:
 *  - أسعار الموردين المعتمدين (الراجحي للأسمنت، سابك للحديد، إلخ)
 *  - منصة بلدي — أسعار مواد البناء
 *  - استطلاعات ميدانية — الرياض / جدة / الدمام
 *
 * ⚠️ الأسعار تقريبية — يُفضل تحديثها دورياً (كل 3 أشهر)
 * ⚠️ يتم تطبيق معامل المدينة (locationMultiplier) في calculations.ts
 */

// =====================================================================
// 1. أسعار المواد الأساسية — Basic Materials (ريال سعودي)
// =====================================================================

export interface MaterialPrice {
  id: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  price: number;
  category: string;
  brand?: string;
  lastUpdated: string;
}

export const MATERIAL_PRICES: MaterialPrice[] = [
  // ═══════════════ خرسانة وأسمنت ═══════════════
  { id: 'cement_50kg',      nameAr: 'أسمنت بورتلاندي (50 كجم)',  nameEn: 'Portland Cement (50kg)',    unit: 'كيس',  price: 22,    category: 'cement',    brand: 'اليمامة/الجوف',  lastUpdated: '2026-Q1' },
  { id: 'cement_bulk_ton',  nameAr: 'أسمنت سائب',                nameEn: 'Bulk Cement',               unit: 'طن',   price: 380,   category: 'cement',    lastUpdated: '2026-Q1' },
  { id: 'readymix_C15',     nameAr: 'خرسانة جاهزة C15',         nameEn: 'Ready Mix C15',             unit: 'م3',   price: 190,   category: 'concrete',  lastUpdated: '2026-Q1' },
  { id: 'readymix_C20',     nameAr: 'خرسانة جاهزة C20',         nameEn: 'Ready Mix C20',             unit: 'م3',   price: 210,   category: 'concrete',  lastUpdated: '2026-Q1' },
  { id: 'readymix_C25',     nameAr: 'خرسانة جاهزة C25',         nameEn: 'Ready Mix C25',             unit: 'م3',   price: 235,   category: 'concrete',  lastUpdated: '2026-Q1' },
  { id: 'readymix_C30',     nameAr: 'خرسانة جاهزة C30',         nameEn: 'Ready Mix C30',             unit: 'م3',   price: 265,   category: 'concrete',  lastUpdated: '2026-Q1' },
  { id: 'readymix_C35',     nameAr: 'خرسانة جاهزة C35',         nameEn: 'Ready Mix C35',             unit: 'م3',   price: 295,   category: 'concrete',  lastUpdated: '2026-Q1' },
  { id: 'readymix_C40',     nameAr: 'خرسانة جاهزة C40',         nameEn: 'Ready Mix C40',             unit: 'م3',   price: 330,   category: 'concrete',  lastUpdated: '2026-Q1' },
  { id: 'pump_concrete',    nameAr: 'مضخة خرسانة (أرضي)',       nameEn: 'Concrete Pump (Ground)',     unit: 'م3',   price: 25,    category: 'concrete',  lastUpdated: '2026-Q1' },
  { id: 'pump_boom',        nameAr: 'مضخة بوم (أدوار)',          nameEn: 'Boom Pump (Floors)',         unit: 'م3',   price: 35,    category: 'concrete',  lastUpdated: '2026-Q1' },

  // ═══════════════ حديد تسليح ═══════════════
  { id: 'steel_rebar_ton',  nameAr: 'حديد تسليح (طن)',           nameEn: 'Rebar Steel (ton)',          unit: 'طن',   price: 2800,  category: 'steel',     brand: 'سابك/الراجحي',   lastUpdated: '2026-Q1' },
  { id: 'steel_mesh',       nameAr: 'شبك حديد (لوح)',            nameEn: 'Welded Wire Mesh',           unit: 'لوح',  price: 120,   category: 'steel',     lastUpdated: '2026-Q1' },
  { id: 'tie_wire',         nameAr: 'سلك رباط (كجم)',            nameEn: 'Tie Wire (kg)',              unit: 'كجم',  price: 8,     category: 'steel',     lastUpdated: '2026-Q1' },

  // ═══════════════ بلك / طابوق ═══════════════
  { id: 'block_20cm',       nameAr: 'بلوك خرساني 20سم',         nameEn: 'Concrete Block 20cm',        unit: 'حبة',  price: 3.5,   category: 'blocks',    lastUpdated: '2026-Q1' },
  { id: 'block_15cm',       nameAr: 'بلوك خرساني 15سم',         nameEn: 'Concrete Block 15cm',        unit: 'حبة',  price: 3.0,   category: 'blocks',    lastUpdated: '2026-Q1' },
  { id: 'block_10cm',       nameAr: 'بلوك خرساني 10سم',         nameEn: 'Concrete Block 10cm',        unit: 'حبة',  price: 2.5,   category: 'blocks',    lastUpdated: '2026-Q1' },
  { id: 'block_hordi',      nameAr: 'بلوك هوردي',               nameEn: 'Hordi Block',                unit: 'حبة',  price: 3.5,   category: 'blocks',    lastUpdated: '2026-Q1' },
  { id: 'red_brick',        nameAr: 'طابوق أحمر (فخاري)',       nameEn: 'Red Clay Brick',             unit: 'حبة',  price: 0.8,   category: 'blocks',    lastUpdated: '2026-Q1' },

  // ═══════════════ رمل وحصى ═══════════════
  { id: 'sand_m3',          nameAr: 'رمل (م³)',                  nameEn: 'Sand (m³)',                  unit: 'م3',   price: 60,    category: 'aggregates', lastUpdated: '2026-Q1' },
  { id: 'gravel_m3',        nameAr: 'حصى (م³)',                  nameEn: 'Gravel (m³)',                unit: 'م3',   price: 70,    category: 'aggregates', lastUpdated: '2026-Q1' },
  { id: 'sub_base',         nameAr: 'صبّة تحتية (م³)',           nameEn: 'Sub-base Material',          unit: 'م3',   price: 45,    category: 'aggregates', lastUpdated: '2026-Q1' },

  // ═══════════════ بلاط وسيراميك ═══════════════
  { id: 'ceramic_60x60',    nameAr: 'سيراميك 60×60 (اقتصادي)',  nameEn: 'Ceramic 60x60 (Budget)',     unit: 'م2',   price: 35,    category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'ceramic_60x60_mid',nameAr: 'سيراميك 60×60 (متوسط)',    nameEn: 'Ceramic 60x60 (Mid)',        unit: 'م2',   price: 55,    category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'porcelain_60x60',  nameAr: 'بورسلان 60×60',            nameEn: 'Porcelain 60x60',            unit: 'م2',   price: 65,    category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'porcelain_120x60', nameAr: 'بورسلان 120×60',           nameEn: 'Porcelain 120x60',           unit: 'م2',   price: 95,    category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'marble_m2',        nameAr: 'رخام طبيعي (م²)',          nameEn: 'Natural Marble',             unit: 'م2',   price: 120,   category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'granite_m2',       nameAr: 'جرانيت (م²)',              nameEn: 'Granite',                    unit: 'م2',   price: 140,   category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'interlock_m2',     nameAr: 'إنترلوك (م²)',             nameEn: 'Interlock Paving',           unit: 'م2',   price: 40,    category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'tile_adhesive',    nameAr: 'غراء سيراميك (20كجم)',     nameEn: 'Tile Adhesive (20kg)',       unit: 'كيس',  price: 30,    category: 'tiles',     lastUpdated: '2026-Q1' },
  { id: 'grout_kg',         nameAr: 'فوجة / ترويبة (كجم)',      nameEn: 'Tile Grout (kg)',            unit: 'كجم',  price: 3,     category: 'tiles',     lastUpdated: '2026-Q1' },

  // ═══════════════ دهانات ═══════════════
  { id: 'paint_plastic_18L',nameAr: 'دهان بلاستيك (18 لتر)',    nameEn: 'Plastic Paint (18L)',        unit: 'برميل', price: 350,  category: 'paints',    brand: 'جوتن/ناشيونال',  lastUpdated: '2026-Q1' },
  { id: 'paint_exterior_18L',nameAr: 'دهان خارجي (18 لتر)',     nameEn: 'Exterior Paint (18L)',       unit: 'برميل', price: 420,  category: 'paints',    lastUpdated: '2026-Q1' },
  { id: 'primer_18L',       nameAr: 'برايمر / أساس (18 لتر)',   nameEn: 'Primer (18L)',               unit: 'برميل', price: 180,  category: 'paints',    lastUpdated: '2026-Q1' },
  { id: 'putty_25kg',       nameAr: 'معجون (25 كجم)',            nameEn: 'Wall Putty (25kg)',          unit: 'كيس',  price: 45,    category: 'paints',    lastUpdated: '2026-Q1' },

  // ═══════════════ عزل ═══════════════
  { id: 'membrane_3mm',     nameAr: 'ميمبرين SBS 3مم (م²)',     nameEn: 'SBS Membrane 3mm',           unit: 'م2',   price: 28,    category: 'insulation', lastUpdated: '2026-Q1' },
  { id: 'membrane_4mm',     nameAr: 'ميمبرين SBS 4مم (م²)',     nameEn: 'SBS Membrane 4mm',           unit: 'م2',   price: 38,    category: 'insulation', lastUpdated: '2026-Q1' },
  { id: 'bitumen_primer',   nameAr: 'برايمر بيتوميني (لتر)',    nameEn: 'Bitumen Primer (L)',         unit: 'لتر',  price: 12,    category: 'insulation', lastUpdated: '2026-Q1' },
  { id: 'eps_50mm',         nameAr: 'عزل EPS 50مم (م²)',        nameEn: 'EPS Insulation 50mm',        unit: 'م2',   price: 25,    category: 'insulation', lastUpdated: '2026-Q1' },
  { id: 'xps_50mm',         nameAr: 'عزل XPS 50مم (م²)',        nameEn: 'XPS Insulation 50mm',        unit: 'م2',   price: 40,    category: 'insulation', lastUpdated: '2026-Q1' },
  { id: 'rockwool_50mm',    nameAr: 'صوف صخري 50مم (م²)',       nameEn: 'Rock Wool 50mm',             unit: 'م2',   price: 35,    category: 'insulation', lastUpdated: '2026-Q1' },

  // ═══════════════ خشب وشدة ═══════════════
  { id: 'plywood_18mm',     nameAr: 'بليوت 18مم (لوح)',         nameEn: 'Plywood 18mm Sheet',         unit: 'لوح',  price: 95,    category: 'formwork',  lastUpdated: '2026-Q1' },
  { id: 'timber_prop',      nameAr: 'جك حديد (دعامة)',          nameEn: 'Steel Prop',                 unit: 'حبة',  price: 45,    category: 'formwork',  lastUpdated: '2026-Q1' },
  { id: 'shuttering_oil',   nameAr: 'زيت شدة (لتر)',            nameEn: 'Shuttering Oil (L)',         unit: 'لتر',  price: 8,     category: 'formwork',  lastUpdated: '2026-Q1' },

  // ═══════════════ جبس ═══════════════
  { id: 'gypsum_board',     nameAr: 'جبس بورد 12.5مم (لوح)',    nameEn: 'Gypsum Board 12.5mm',        unit: 'لوح',  price: 28,    category: 'gypsum',    lastUpdated: '2026-Q1' },
  { id: 'gypsum_mr_board',  nameAr: 'جبس بورد مقاوم رطوبة',    nameEn: 'MR Gypsum Board',            unit: 'لوح',  price: 38,    category: 'gypsum',    lastUpdated: '2026-Q1' },
  { id: 'metal_furring',    nameAr: 'قنوات معدنية (م.ط)',       nameEn: 'Metal Furring Channel',      unit: 'م.ط',  price: 6,     category: 'gypsum',    lastUpdated: '2026-Q1' },

  // ═══════════════ أبواب ═══════════════
  { id: 'door_wood_press',  nameAr: 'باب خشب مضغط (HDF)',       nameEn: 'HDF Wood Door',              unit: 'حبة',  price: 350,   category: 'doors',     lastUpdated: '2026-Q2' },
  { id: 'door_wood_solid',  nameAr: 'باب خشب طبيعي (زان/سنديان)', nameEn: 'Solid Wood Door',          unit: 'حبة',  price: 1200,  category: 'doors',     lastUpdated: '2026-Q2' },
  { id: 'door_steel',       nameAr: 'باب حديد (أمان)',           nameEn: 'Steel Security Door',        unit: 'حبة',  price: 1800,  category: 'doors',     lastUpdated: '2026-Q2' },
  { id: 'door_aluminum',    nameAr: 'باب ألمنيوم (شامل زجاج)',   nameEn: 'Aluminum Door with Glass',  unit: 'حبة',  price: 900,   category: 'doors',     lastUpdated: '2026-Q2' },
  { id: 'door_pvc',         nameAr: 'باب PVC (حمامات)',          nameEn: 'PVC Door (Bathrooms)',       unit: 'حبة',  price: 280,   category: 'doors',     lastUpdated: '2026-Q2' },

  // ═══════════════ نوافذ ═══════════════
  { id: 'window_alum_std',  nameAr: 'نافذة ألمنيوم عادي',       nameEn: 'Standard Aluminum Window',   unit: 'م2',   price: 250,   category: 'windows',   lastUpdated: '2026-Q2' },
  { id: 'window_alum_therm',nameAr: 'نافذة ألمنيوم عازل حراري', nameEn: 'Thermal Break Aluminum Window', unit: 'م2', price: 450,  category: 'windows',   lastUpdated: '2026-Q2' },
  { id: 'window_upvc',      nameAr: 'نافذة UPVC',               nameEn: 'UPVC Window',                unit: 'م2',   price: 380,   category: 'windows',   lastUpdated: '2026-Q2' },
  { id: 'glass_double',     nameAr: 'زجاج مزدوج 6/12/6',        nameEn: 'Double Glazing 6/12/6',      unit: 'م2',   price: 180,   category: 'windows',   lastUpdated: '2026-Q2' },

  // ═══════════════ مواسير سباكة ═══════════════
  { id: 'pipe_ppr_25',      nameAr: 'ماسورة PPR 25مم (تغذية)',  nameEn: 'PPR Pipe 25mm',              unit: 'م.ط',  price: 8,     category: 'plumbing',  lastUpdated: '2026-Q2' },
  { id: 'pipe_cpvc_25',     nameAr: 'ماسورة CPVC 25مم',         nameEn: 'CPVC Pipe 25mm',             unit: 'م.ط',  price: 12,    category: 'plumbing',  lastUpdated: '2026-Q2' },
  { id: 'tank_fiber_1000',  nameAr: 'خزان فايبر 1000 لتر',      nameEn: 'Fiber Tank 1000L',           unit: 'حبة',  price: 450,   category: 'plumbing',  lastUpdated: '2026-Q2' },
  { id: 'tank_grp_2000',    nameAr: 'خزان GRP 2000 لتر',        nameEn: 'GRP Tank 2000L',             unit: 'حبة',  price: 1200,  category: 'plumbing',  lastUpdated: '2026-Q2' },

  // ═══════════════ كهرباء ═══════════════
  { id: 'panel_main_63a',   nameAr: 'لوحة رئيسية 63 أمبير',     nameEn: 'Main Panel 63A',             unit: 'حبة',  price: 1800,  category: 'electrical', lastUpdated: '2026-Q2' },
  { id: 'cable_4mm',        nameAr: 'كابل 4مم² (3 كور)',        nameEn: 'Cable 4mm² (3 Core)',        unit: 'م.ط',  price: 8,     category: 'electrical', lastUpdated: '2026-Q2' },
  { id: 'cable_6mm',        nameAr: 'كابل 6مم² (3 كور)',        nameEn: 'Cable 6mm² (3 Core)',        unit: 'م.ط',  price: 12,    category: 'electrical', lastUpdated: '2026-Q2' },
  { id: 'led_panel_60x60',  nameAr: 'لوحة LED 60×60 (40W)',     nameEn: 'LED Panel 60x60 (40W)',      unit: 'حبة',  price: 85,    category: 'electrical', lastUpdated: '2026-Q2' },

  // ═══════════════ تكييف ═══════════════
  { id: 'ac_split_1_5ton',  nameAr: 'مكيف سبليت 1.5 طن',       nameEn: 'Split AC 1.5 Ton',           unit: 'حبة',  price: 2200,  category: 'hvac',      lastUpdated: '2026-Q2' },
  { id: 'ac_split_2ton',    nameAr: 'مكيف سبليت 2 طن',         nameEn: 'Split AC 2 Ton',             unit: 'حبة',  price: 2800,  category: 'hvac',      lastUpdated: '2026-Q2' },
  { id: 'ac_central_ton',   nameAr: 'تكييف مركزي (لكل طن)',    nameEn: 'Central AC (per Ton)',       unit: 'طن',   price: 4500,  category: 'hvac',      lastUpdated: '2026-Q2' },

  // ═══════════════ أنظمة سلامة وإطفاء ═══════════════
  { id: 'smoke_detector',   nameAr: 'كاشف دخان (Smoke Detector)', nameEn: 'Smoke Detector',          unit: 'حبة',  price: 65,    category: 'fire_safety', lastUpdated: '2026-Q2' },
  { id: 'fire_extinguisher',nameAr: 'طفاية حريق (6 كجم)',       nameEn: 'Fire Extinguisher (6kg)',    unit: 'حبة',  price: 120,   category: 'fire_safety', lastUpdated: '2026-Q2' },
  { id: 'sprinkler_head',   nameAr: 'رأس رشاش إطفاء',          nameEn: 'Sprinkler Head',             unit: 'حبة',  price: 45,    category: 'fire_safety', lastUpdated: '2026-Q2' },
  { id: 'fire_alarm_panel', nameAr: 'لوحة إنذار حريق (8 مناطق)', nameEn: 'Fire Alarm Panel (8 Zone)', unit: 'حبة',  price: 3500,  category: 'fire_safety', lastUpdated: '2026-Q2' },
];

// =====================================================================
// 2. أسعار العمالة اليومية — Daily Labor Rates
// =====================================================================

export const LABOR_DAILY_RATES: Record<string, { nameAr: string; nameEn: string; daily: number; monthly: number }> = {
  laborer:       { nameAr: 'عامل عادي',      nameEn: 'Laborer',          daily: 120,  monthly: 2800 },
  mason:         { nameAr: 'بنّاء',           nameEn: 'Mason',            daily: 200,  monthly: 4500 },
  carpenter:     { nameAr: 'نجار',            nameEn: 'Carpenter',        daily: 200,  monthly: 4500 },
  steelfixer:    { nameAr: 'حداد مسلح',       nameEn: 'Steel Fixer',      daily: 250,  monthly: 5500 },
  plasterer:     { nameAr: 'مبيّض / لياس',    nameEn: 'Plasterer',        daily: 200,  monthly: 4500 },
  tiler:         { nameAr: 'بلاّط',           nameEn: 'Tiler',            daily: 250,  monthly: 5500 },
  painter:       { nameAr: 'دهّان',           nameEn: 'Painter',          daily: 180,  monthly: 4000 },
  plumber:       { nameAr: 'سبّاك',           nameEn: 'Plumber',          daily: 250,  monthly: 5500 },
  electrician:   { nameAr: 'كهربائي',         nameEn: 'Electrician',      daily: 250,  monthly: 5500 },
  hvac_tech:     { nameAr: 'فني تكييف',       nameEn: 'HVAC Technician',  daily: 280,  monthly: 6000 },
  welder:        { nameAr: 'لحام',            nameEn: 'Welder',           daily: 280,  monthly: 6000 },
  foreman:       { nameAr: 'مشرف / فورمان',   nameEn: 'Foreman',          daily: 300,  monthly: 6500 },
  site_engineer: { nameAr: 'مهندس موقع',      nameEn: 'Site Engineer',    daily: 500,  monthly: 12000 },
  // === أعمال إضافية ===
  door_installer:{ nameAr: 'فني أبواب ونوافذ', nameEn: 'Door/Window Installer', daily: 220, monthly: 5000 },
  ac_installer:  { nameAr: 'فني تركيب تكييف', nameEn: 'AC Installer',     daily: 300,  monthly: 6500 },
  elevator_tech: { nameAr: 'فني مصاعد',       nameEn: 'Elevator Technician', daily: 350, monthly: 7500 },
  aluminum_tech: { nameAr: 'فني ألمنيوم',     nameEn: 'Aluminum Technician', daily: 250, monthly: 5500 },
};

// =====================================================================
// 3. أسعار المعدات — Equipment Rates
// =====================================================================

export const EQUIPMENT_RATES: Record<string, { nameAr: string; nameEn: string; daily: number; monthly: number }> = {
  bobcat:      { nameAr: 'بوبكات',            nameEn: 'Bobcat/Skid Steer',   daily: 450,  monthly: 9000 },
  excavator:   { nameAr: 'حفارة (بكلين)',     nameEn: 'Excavator',           daily: 800,  monthly: 16000 },
  loader:      { nameAr: 'لودر (شيول)',       nameEn: 'Wheel Loader',        daily: 600,  monthly: 12000 },
  crane_25t:   { nameAr: 'رافعة 25 طن',      nameEn: 'Crane 25 Ton',        daily: 1200, monthly: 25000 },
  crane_50t:   { nameAr: 'رافعة 50 طن',      nameEn: 'Crane 50 Ton',        daily: 2000, monthly: 40000 },
  roller:      { nameAr: 'هراس (رولر)',       nameEn: 'Compaction Roller',   daily: 400,  monthly: 8000 },
  generator:   { nameAr: 'مولد كهرباء',      nameEn: 'Generator',           daily: 200,  monthly: 4000 },
  water_tanker:{ nameAr: 'وايت ماء',         nameEn: 'Water Tanker',        daily: 150,  monthly: 3500 },
  dump_truck:  { nameAr: 'قلاب (16م³)',      nameEn: 'Dump Truck (16m³)',   daily: 500,  monthly: 10000 },
  mixer_truck: { nameAr: 'خلاطة',            nameEn: 'Mixer Truck',         daily: 350,  monthly: 7000 },
  scaffolding: { nameAr: 'سقالات (م²/شهر)',  nameEn: 'Scaffolding (m²/mo)', daily: 0,    monthly: 8 },
};

// =====================================================================
// 4. أسعار الخرسانة الجاهزة حسب المدينة — Ready-Mix by City
// =====================================================================

export const READYMIX_BY_CITY: Record<string, Record<string, number>> = {
  riyadh:           { C15: 190, C20: 210, C25: 235, C30: 265, C35: 295, C40: 330 },
  jeddah:           { C15: 195, C20: 215, C25: 240, C30: 270, C35: 300, C40: 340 },
  dammam:           { C15: 185, C20: 205, C25: 230, C30: 260, C35: 290, C40: 325 },
  makkah:           { C15: 200, C20: 220, C25: 245, C30: 280, C35: 310, C40: 350 },
  madinah:          { C15: 200, C20: 218, C25: 242, C30: 275, C35: 305, C40: 345 },
  abha:             { C15: 210, C20: 230, C25: 255, C30: 290, C35: 320, C40: 360 },
  tabuk:            { C15: 215, C20: 235, C25: 260, C30: 295, C35: 325, C40: 365 },
  qassim:           { C15: 180, C20: 200, C25: 225, C30: 255, C35: 285, C40: 320 },
  hail:             { C15: 200, C20: 220, C25: 245, C30: 275, C35: 305, C40: 345 },
  // === المدن المضافة ===
  jazan:            { C15: 210, C20: 230, C25: 258, C30: 290, C35: 322, C40: 362 },
  najran:           { C15: 208, C20: 228, C25: 253, C30: 285, C35: 318, C40: 358 },
  baha:             { C15: 212, C20: 232, C25: 258, C30: 292, C35: 325, C40: 365 },
  jouf:             { C15: 218, C20: 238, C25: 265, C30: 298, C35: 330, C40: 370 },
  northern_borders: { C15: 220, C20: 240, C25: 268, C30: 300, C35: 335, C40: 375 },
  khobar:           { C15: 185, C20: 205, C25: 230, C30: 260, C35: 290, C40: 325 },
  yanbu:            { C15: 198, C20: 218, C25: 243, C30: 275, C35: 308, C40: 348 },
  taif:             { C15: 205, C20: 225, C25: 250, C30: 282, C35: 315, C40: 355 },
  khamis_mushait:   { C15: 210, C20: 230, C25: 255, C30: 290, C35: 320, C40: 360 },
  ahsa:             { C15: 188, C20: 208, C25: 233, C30: 263, C35: 293, C40: 328 },
  hafr_albatin:     { C15: 215, C20: 235, C25: 262, C30: 295, C35: 328, C40: 368 },
};

// =====================================================================
// 5. Helper: البحث عن سعر مادة
// =====================================================================

export function getMaterialPrice(materialId: string): number {
  const item = MATERIAL_PRICES.find(m => m.id === materialId);
  return item?.price || 0;
}

export function getReadyMixPrice(city: string, grade: string): number {
  const cityPrices = READYMIX_BY_CITY[city] || READYMIX_BY_CITY['riyadh'];
  return cityPrices[grade] || cityPrices['C25'] || 235;
}

/** تاريخ آخر تحديث شامل */
export const PRICES_LAST_UPDATED = '2026-Q2';
export const PRICES_VERSION = '2.0.0';
