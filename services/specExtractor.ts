/**
 * ARBA v8.5 — Spec Extractor Service (محلل المواصفات الفنية)
 * استخراج المواصفات الفنية من وصف بنود جداول الكميات
 * 
 * PURPOSE:
 * - تصنيف البنود حسب التخصص (كهرباء، سباكة، تكييف، حريق، إنشائي، تشطيبات)
 * - استخراج المقاسات والسعات والعلامات التجارية والمواد
 * - بناء بصمة فنية لكل بند لتحسين المطابقة مع قاعدة البيانات
 * 
 * DOES NOT use AI — purely regex-based extraction.
 */

// =================== 1. الأنواع (Types) ===================

export type SpecCategory = 'electrical' | 'plumbing' | 'hvac' | 'fire' | 'structural' | 'finishes' | 'general';

export interface ExtractedSpecs {
  category: SpecCategory;
  subCategory: string;
  size: string | null;
  capacity: string | null;
  grade: string | null;
  brand: string | null;
  material: string | null;
  voltage: string | null;
  specs: string[];
  confidence: number;
}

// =================== 2. قواميس التصنيف (Classification Dictionaries) ===================

/** كلمات مفتاحية لكل فئة — عربي + إنجليزي */
const CATEGORY_KEYWORDS: Record<SpecCategory, RegExp> = {
  electrical: /\b(cable|wire|panel|board|breaker|MCB|MCCB|ELCB|RCD|light|lamp|luminaire|LED|socket|outlet|switch|generator|genset|transformer|ATS|busbar|busduct|tray|conduit|DB|MDB|SMDB|meter|contactor|relay|UPS|earthing|grounding|junction box|gland|lug)\b|كابل|سلك|لوحة كهر|لوحة توزيع|قاطع|إنارة|إضاءة|مفتاح كهر|مولد|محول|باسبار|حوامل كابلات|مجرى|قناة كهر/i,

  plumbing: /\b(pipe|valve|pump|fixture|toilet|basin|sink|faucet|tap|drain|sewer|manhole|tank|water heater|boiler|mixer|trap|coupling|elbow|tee|reducer|PPR|UPVC|CPVC|HDPE|cistern|urinal|bidet|floor drain|roof drain)\b|ماسورة|أنبوب|مضخة|صنبور|خلاط|مغسلة|مرحاض|حوض|صرف|بالوعة|خزان مياه|سخان|محبس|كوع|تي/i,

  hvac: /\b(AC|A\/C|air.?condition|chiller|AHU|FCU|fan coil|duct|ducting|split|VRF|VRV|diffuser|grille|louver|damper|thermostat|condensing|compressor|cooling tower|exhaust fan|fresh air|return air|supply air)\b|تكييف|دكت|تبريد|مكيف|وحدة مناولة|مروحة طرد|فتحة هواء|ناشر هواء/i,

  fire: /\b(sprinkler|detector|alarm|fire pump|fire.?fighting|extinguisher|hose reel|hose cabinet|fire.?hydrant|standpipe|smoke detector|heat detector|fire.?rated|FM.?200|clean agent|VESDA|fire.?damper|fire.?stopping)\b|حريق|رشاش|كاشف دخان|كاشف حرارة|إنذار|طفاية|خرطوم|صندوق حريق|مضخة حريق/i,

  structural: /\b(concrete|steel|rebar|reinforcement|formwork|shoring|scaffolding|precast|beam|column|slab|footing|foundation|pile|retaining wall|shear wall|expansion joint)\b|خرسانة|حديد تسليح|شدات|قوالب|أعمدة|كمرات|أسقف|قواعد|أساسات|خوازيق/i,

  finishes: /\b(paint|plaster|tile|ceramic|porcelain|marble|granite|gypsum|wallpaper|vinyl|epoxy|waterproofing|insulation|cladding|curtain wall|false ceiling|suspended ceiling|raised floor|skirting|cornice)\b|دهان|بلاط|سيراميك|رخام|جبس|عزل|بورسلين|ورق جدران|أرضيات/i,

  general: /./,  // Fallback — always matches
};

/** تصنيفات فرعية لكل فئة */
const SUB_CATEGORY_PATTERNS: { category: SpecCategory; subCategory: string; pattern: RegExp }[] = [
  // ─── Electrical Sub-Categories (ORDER MATTERS — more specific first) ───
  { category: 'electrical', subCategory: 'tray',        pattern: /\b(cable\s*tray|tray|ladder\s*tray)\b|حوامل كابلات|حامل|كابل تري/i },
  { category: 'electrical', subCategory: 'cable',       pattern: /\b(cable|wire|conductor)\b(?!\s*tray)|كابل(?!\s*تري)|سلك|موصل/i },
  { category: 'electrical', subCategory: 'panel',       pattern: /\b(panel|board|DB|MDB|SMDB|ESMDB|switchgear|switchboard)\b|لوحة|توزيع/i },
  { category: 'electrical', subCategory: 'breaker',     pattern: /\b(breaker|MCB|MCCB|ELCB|RCD|ACB|VCB)\b|قاطع/i },
  { category: 'electrical', subCategory: 'light',       pattern: /\b(light|lamp|luminaire|LED|spotlight|downlight|flood|bulb|fixture)\b|إنارة|إضاءة|لمبة|كشاف/i },
  { category: 'electrical', subCategory: 'socket',      pattern: /\b(socket|outlet|receptacle)\b|بريزة|مأخذ/i },
  { category: 'electrical', subCategory: 'switch',      pattern: /\b(switch|dimmer)\b(?!.*gear)|مفتاح/i },
  { category: 'electrical', subCategory: 'conduit',     pattern: /\b(conduit|duct|raceway|trunking)\b|مجرى|قناة/i },
  { category: 'electrical', subCategory: 'generator',   pattern: /\b(generator|genset)\b|مولد/i },
  { category: 'electrical', subCategory: 'ats',         pattern: /\b(ATS|automatic transfer|transfer switch)\b/i },
  { category: 'electrical', subCategory: 'transformer', pattern: /\b(transformer)\b|محول/i },
  { category: 'electrical', subCategory: 'busbar',      pattern: /\b(busbar|busduct|bus.?duct)\b|باسبار/i },
  { category: 'electrical', subCategory: 'earthing',    pattern: /\b(earth|ground|grounding|earthing)\b|تأريض/i },
  { category: 'electrical', subCategory: 'ups',         pattern: /\b(UPS|uninterruptible)\b/i },

  // ─── Plumbing Sub-Categories ───
  { category: 'plumbing', subCategory: 'pipe',     pattern: /\b(pipe|piping|pipeline)\b|ماسورة|أنبوب|مواسير/i },
  { category: 'plumbing', subCategory: 'valve',    pattern: /\b(valve|gate valve|check valve|ball valve|butterfly)\b|محبس|صمام/i },
  { category: 'plumbing', subCategory: 'pump',     pattern: /\b(pump|booster)\b|مضخة/i },
  { category: 'plumbing', subCategory: 'fixture',  pattern: /\b(fixture|toilet|WC|basin|sink|faucet|tap|mixer|urinal|bidet)\b|مرحاض|حوض|مغسلة|صنبور|خلاط/i },
  { category: 'plumbing', subCategory: 'tank',     pattern: /\b(tank|cistern|reservoir)\b|خزان/i },
  { category: 'plumbing', subCategory: 'heater',   pattern: /\b(heater|boiler|water heater|geyser)\b|سخان/i },
  { category: 'plumbing', subCategory: 'drain',    pattern: /\b(drain|sewer|manhole|inspection chamber)\b|صرف|بالوعة|غرفة تفتيش/i },

  // ─── HVAC Sub-Categories ───
  { category: 'hvac', subCategory: 'split',    pattern: /\b(split|mini.?split|wall.?mount)\b|سبليت|جداري/i },
  { category: 'hvac', subCategory: 'chiller',  pattern: /\b(chiller)\b|تشيلر/i },
  { category: 'hvac', subCategory: 'ahu',      pattern: /\b(AHU|air.?handling)\b|وحدة مناولة/i },
  { category: 'hvac', subCategory: 'fcu',      pattern: /\b(FCU|fan.?coil)\b/i },
  { category: 'hvac', subCategory: 'duct',     pattern: /\b(duct|ducting|ductwork)\b|دكت|مجرى هواء/i },
  { category: 'hvac', subCategory: 'vrf',      pattern: /\b(VRF|VRV)\b/i },
  { category: 'hvac', subCategory: 'diffuser', pattern: /\b(diffuser|grille|louver)\b|ناشر|شبك هواء/i },
  { category: 'hvac', subCategory: 'exhaust',  pattern: /\b(exhaust|extract)\b|طرد|شفط/i },

  // ─── Fire Sub-Categories ───
  { category: 'fire', subCategory: 'sprinkler',    pattern: /\b(sprinkler)\b|رشاش/i },
  { category: 'fire', subCategory: 'detector',     pattern: /\b(detector|smoke|heat)\b|كاشف/i },
  { category: 'fire', subCategory: 'alarm',        pattern: /\b(alarm|bell|horn|strobe|sounder)\b|إنذار|جرس/i },
  { category: 'fire', subCategory: 'pump',         pattern: /\b(fire.?pump)\b|مضخة حريق/i },
  { category: 'fire', subCategory: 'extinguisher', pattern: /\b(extinguisher)\b|طفاية/i },
  { category: 'fire', subCategory: 'hose',         pattern: /\b(hose|hose reel|hose cabinet)\b|خرطوم|بكرة/i },
  { category: 'fire', subCategory: 'hydrant',      pattern: /\b(hydrant|standpipe)\b/i },
  { category: 'fire', subCategory: 'panel',        pattern: /\b(fire.?alarm.?panel|FAP|FACP)\b|لوحة إنذار/i },

  // ─── Structural Sub-Categories ───
  { category: 'structural', subCategory: 'concrete',  pattern: /\b(concrete|ready.?mix)\b|خرسانة/i },
  { category: 'structural', subCategory: 'rebar',     pattern: /\b(rebar|reinforcement|steel bar|deformed bar)\b|حديد تسليح/i },
  { category: 'structural', subCategory: 'formwork',  pattern: /\b(formwork|shuttering|mould)\b|شدات|قوالب/i },
  { category: 'structural', subCategory: 'precast',   pattern: /\b(precast|prefab)\b|مسبق الصنع|مسبق الصب/i },
  { category: 'structural', subCategory: 'steel',     pattern: /\b(structural steel|steel structure|I.?beam|H.?beam|channel|angle)\b|حديد إنشائي|هيكل حديدي/i },

  // ─── Finishes Sub-Categories ───
  { category: 'finishes', subCategory: 'paint',       pattern: /\b(paint|painting|coating)\b|دهان|طلاء/i },
  { category: 'finishes', subCategory: 'tile',        pattern: /\b(tile|ceramic|porcelain)\b|بلاط|سيراميك|بورسلين/i },
  { category: 'finishes', subCategory: 'plaster',     pattern: /\b(plaster|plastering|render)\b|لياسة|محارة/i },
  { category: 'finishes', subCategory: 'gypsum',      pattern: /\b(gypsum|drywall|plasterboard)\b|جبس|جبسن بورد/i },
  { category: 'finishes', subCategory: 'marble',      pattern: /\b(marble|granite|stone)\b|رخام|جرانيت|حجر/i },
  { category: 'finishes', subCategory: 'waterproof',  pattern: /\b(waterproof|membrane|bitumen)\b|عزل مائي|رطوبة/i },
  { category: 'finishes', subCategory: 'insulation',  pattern: /\b(insulation|thermal|rockwool|polystyrene|EPS|XPS)\b|عزل حراري/i },
  { category: 'finishes', subCategory: 'ceiling',     pattern: /\b(ceiling|false ceiling|suspended|drop ceiling)\b|سقف مستعار/i },
  { category: 'finishes', subCategory: 'floor',       pattern: /\b(floor|flooring|raised floor|vinyl|epoxy|carpet)\b|أرضيات/i },
];

// =================== 3. أنماط الاستخراج (Extraction Patterns) ===================

/** استخراج المقاسات */
const SIZE_PATTERNS: { name: string; pattern: RegExp; formatter: (match: RegExpMatchArray) => string }[] = [
  // Cable: 3x95mm², 4x2.5mm², 1x240mm², 2.5mm²
  {
    name: 'cable_multi',
    pattern: /(\d+)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(?:mm²|mm2|mm|ملم)/i,
    formatter: (m) => `${m[1]}x${m[2]}mm²`,
  },
  {
    name: 'cable_single',
    pattern: /\b(\d+(?:\.\d+)?)\s*(?:mm²|mm2|ملم²|ملم مربع)/i,
    formatter: (m) => `${m[1]}mm²`,
  },
  // Tray/Duct: 300x100mm, 600x150mm
  {
    name: 'tray_size',
    pattern: /\b(\d+)\s*[xX×]\s*(\d+)\s*(?:mm|ملم)\b/i,
    formatter: (m) => `${m[1]}x${m[2]}mm`,
  },
  // Pipe: 4 inch, 6", 110mm, 25mm
  {
    name: 'pipe_inch',
    pattern: /\b(\d+(?:\.\d+)?)\s*(?:inch|in\b|"|بوصة|انش)/i,
    formatter: (m) => `${m[1]} inch`,
  },
  {
    name: 'pipe_mm',
    pattern: /(?:ø|dia|diameter|قطر)\s*(\d+)\s*(?:mm|ملم)?/i,
    formatter: (m) => `ø${m[1]}mm`,
  },
  // General mm dimension
  {
    name: 'dimension_mm',
    pattern: /\b(\d+)\s*(?:mm|ملم)\b/i,
    formatter: (m) => `${m[1]}mm`,
  },
];

/** استخراج السعات */
const CAPACITY_PATTERNS: { name: string; pattern: RegExp; formatter: (match: RegExpMatchArray) => string }[] = [
  // KVA
  { name: 'kva', pattern: /\b(\d+(?:\.\d+)?)\s*KVA/i, formatter: (m) => `${m[1]}KVA` },
  // Ampere — exclude bare 'A' to avoid matching IDs like MDB-GF-A
  { name: 'amp', pattern: /\b(\d+)\s*(?:AMP|AT\/AF|AT|AF|أمبير)\b/i, formatter: (m) => `${m[1]}A` },
  // Watt/KW
  { name: 'kw', pattern: /\b(\d+(?:\.\d+)?)\s*(?:KW|كيلو واط)/i, formatter: (m) => `${m[1]}KW` },
  { name: 'watt', pattern: /\b(\d+)\s*(?:W\b|Watt|واط)/i, formatter: (m) => `${m[1]}W` },
  // Ton (HVAC)
  { name: 'ton', pattern: /\b(\d+(?:\.\d+)?)\s*(?:TR|طن تبريد|ton|طن)\b/i, formatter: (m) => `${m[1]}TR` },
  // BTU
  { name: 'btu', pattern: /\b(\d+(?:,\d+)?)\s*BTU/i, formatter: (m) => `${m[1].replace(',', '')}BTU` },
  // Ways
  { name: 'ways', pattern: /\b(\d+)\s*(?:ways?|طريق|مسار)/i, formatter: (m) => `${m[1]} ways` },
  // GPM (flow)
  { name: 'gpm', pattern: /\b(\d+)\s*GPM/i, formatter: (m) => `${m[1]}GPM` },
  // L/S (flow)
  { name: 'ls', pattern: /\b(\d+(?:\.\d+)?)\s*(?:L\/S|لتر\/ث)/i, formatter: (m) => `${m[1]}L/S` },
  // HP (horsepower)
  { name: 'hp', pattern: /\b(\d+(?:\.\d+)?)\s*(?:HP|حصان)/i, formatter: (m) => `${m[1]}HP` },
  // Bar (pressure)
  { name: 'bar', pattern: /\b(\d+(?:\.\d+)?)\s*(?:bar|بار)/i, formatter: (m) => `${m[1]}bar` },
  // Poles
  { name: 'poles', pattern: /\b([1234])\s*(?:P|pole|poles|قطب)\b/i, formatter: (m) => `${m[1]}P` },
];

/** قاموس العلامات التجارية */
const KNOWN_BRANDS: { pattern: RegExp; name: string }[] = [
  // Electrical
  { pattern: /\bSCHNEIDER\b/i, name: 'SCHNEIDER' },
  { pattern: /\bABB\b/i, name: 'ABB' },
  { pattern: /\bSIEMENS\b/i, name: 'SIEMENS' },
  { pattern: /\bLEGRAND\b/i, name: 'LEGRAND' },
  { pattern: /\bHAGER\b/i, name: 'HAGER' },
  { pattern: /\bLS\s+ELECTRIC\b/i, name: 'LS' },
  { pattern: /\bEATON\b/i, name: 'EATON' },
  { pattern: /\bGE\b(?!\s*\w{4,})/i, name: 'GE' },
  { pattern: /\bPHILIPS\b/i, name: 'PHILIPS' },
  { pattern: /\bOSRAM\b/i, name: 'OSRAM' },
  { pattern: /\bAL.?FANAR\b|ألفنار/i, name: 'AL-FANAR' },
  { pattern: /\bRIYADH\s+CABLES?\b|الرياض.*كابل/i, name: 'RIYADH CABLES' },
  { pattern: /\bBAHRA\b|بحرة/i, name: 'BAHRA' },
  // Generator
  { pattern: /\bCOMM?INS\b/i, name: 'CUMMINS' },
  { pattern: /\bCUMMINS\b/i, name: 'CUMMINS' },
  { pattern: /\bCATERPILLAR\b|\bCAT\b/i, name: 'CATERPILLAR' },
  { pattern: /\bPERKINS\b/i, name: 'PERKINS' },
  { pattern: /\bZAHID\s+TRACTOR\b|زاهد تراكتور/i, name: 'ZAHID TRACTOR' },
  // HVAC
  { pattern: /\bTRANE\b/i, name: 'TRANE' },
  { pattern: /\bCARRIER\b/i, name: 'CARRIER' },
  { pattern: /\bDAIKIN\b/i, name: 'DAIKIN' },
  { pattern: /\bYORK\b/i, name: 'YORK' },
  { pattern: /\bMIDEA\b/i, name: 'MIDEA' },
  { pattern: /\bLG\b/i, name: 'LG' },
  { pattern: /\bSAMSUNG\b/i, name: 'SAMSUNG' },
  { pattern: /\bMITSUBISHI\b/i, name: 'MITSUBISHI' },
  // Plumbing
  { pattern: /\bGRUNDFOS\b/i, name: 'GRUNDFOS' },
  { pattern: /\bWILO\b/i, name: 'WILO' },
  { pattern: /\bGROHE\b/i, name: 'GROHE' },
  { pattern: /\bAMERICAN\s+STANDARD\b/i, name: 'AMERICAN STANDARD' },
  { pattern: /\bROCA\b/i, name: 'ROCA' },
  { pattern: /\bGEBERIT\b/i, name: 'GEBERIT' },
  { pattern: /\bTOTO\b/i, name: 'TOTO' },
  { pattern: /\bHANSGROHE\b/i, name: 'HANSGROHE' },
  { pattern: /\bIDEAL\s+STANDARD\b/i, name: 'IDEAL STANDARD' },
  // Fire
  { pattern: /\bNAFFCO\b/i, name: 'NAFFCO' },
  { pattern: /\bVIKING\b/i, name: 'VIKING' },
  { pattern: /\bKIDDE\b/i, name: 'KIDDE' },
  { pattern: /\bBOSCH\b/i, name: 'BOSCH' },
  { pattern: /\bHONEYWELL\b/i, name: 'HONEYWELL' },
  { pattern: /\bNOTIFIER\b/i, name: 'NOTIFIER' },
  // Structural
  { pattern: /\bSABIC\b|سابك/i, name: 'SABIC' },
  { pattern: /\bYAMAMAH\b|اليمامة/i, name: 'YAMAMAH' },
  { pattern: /\bRAJHI\s+STEEL\b|الراجحي/i, name: 'RAJHI STEEL' },
];

/** استخراج المواد */
const MATERIAL_PATTERNS: { pattern: RegExp; name: string }[] = [
  // Cable materials
  { pattern: /\bXLPE\b/i, name: 'XLPE' },
  { pattern: /\bPVC\b/i, name: 'PVC' },
  { pattern: /\bLSF\b/i, name: 'LSF' },
  { pattern: /\bLSZH\b|LSOH/i, name: 'LSZH' },
  { pattern: /\bSWA\b/i, name: 'SWA' },
  { pattern: /\bFR\b/i, name: 'FR' },
  // Pipe materials
  { pattern: /\bPPR\b/i, name: 'PPR' },
  { pattern: /\bUPVC\b/i, name: 'UPVC' },
  { pattern: /\bCPVC\b/i, name: 'CPVC' },
  { pattern: /\bHDPE\b/i, name: 'HDPE' },
  { pattern: /\bGI\b|galvanized|مجلفن/i, name: 'GI' },
  { pattern: /\bDI\b|ductile iron/i, name: 'DI' },
  { pattern: /\bcopper\b|نحاس/i, name: 'copper' },
  { pattern: /\bstainless\b|ستانلس|استانلس/i, name: 'stainless' },
  { pattern: /\bcast iron\b|حديد زهر/i, name: 'cast iron' },
  // Tray materials
  { pattern: /\bperforat/i, name: 'perforated' },
  { pattern: /\bladder\b/i, name: 'ladder' },
  { pattern: /\bsolid\b(?!.*state)/i, name: 'solid' },
  { pattern: /\bmesh\b/i, name: 'mesh' },
  { pattern: /\bhot.?dip\b/i, name: 'hot-dip galvanized' },
  // Concrete/structural
  { pattern: /\breinforced\b|مسلح/i, name: 'reinforced' },
  { pattern: /\bprecast\b|مسبق/i, name: 'precast' },
  // General
  { pattern: /\baluminum\b|\baluminium\b|ألمنيوم/i, name: 'aluminum' },
  { pattern: /\bbrass\b|نحاس أصفر/i, name: 'brass' },
];

/** استخراج الجهد */
const VOLTAGE_PATTERNS: { pattern: RegExp; value: string }[] = [
  { pattern: /\bLV\b|low voltage|جهد منخفض/i, value: 'LV' },
  { pattern: /\bMV\b|medium voltage|جهد متوسط/i, value: 'MV' },
  { pattern: /\bHV\b|high voltage|جهد عالي/i, value: 'HV' },
  { pattern: /\b220\s*V\b/i, value: '220V' },
  { pattern: /\b380\s*V\b/i, value: '380V' },
  { pattern: /\b400\s*V\b/i, value: '400V' },
  { pattern: /\b11\s*KV\b/i, value: '11KV' },
  { pattern: /\b13\.8\s*KV\b/i, value: '13.8KV' },
  { pattern: /\b33\s*KV\b/i, value: '33KV' },
  { pattern: /\b0\.6\/1\s*KV\b|600\/1000/i, value: '0.6/1KV' },
];

/** استخراج الدرجة (Grade) */
const GRADE_PATTERNS: { pattern: RegExp; formatter: (m: RegExpMatchArray) => string }[] = [
  // Concrete: C20, C25, C30, C40
  { pattern: /\b(C\d{2})\b/i, formatter: (m) => m[1].toUpperCase() },
  // Steel: G40, G60, G75
  { pattern: /\b(G\d{2,3})\b/i, formatter: (m) => m[1].toUpperCase() },
  // Grade 60, Grade 40
  { pattern: /\bGrade\s+(\d{2,3})\b/i, formatter: (m) => `G${m[1]}` },
];

/** مواصفات إضافية */
const ADDITIONAL_SPEC_PATTERNS: RegExp[] = [
  /\bUL\b/i,
  /\bFM\s*Approved\b/i,
  /\bIEC\b/i,
  /\bBS\b/i,
  /\bASTM\b/i,
  /\bIP\d{2}\b/i,       // IP65, IP55, IP44
  /\bNEMA\b/i,
  /\b[1234]P\b/i,       // 1P, 2P, 3P, 4P (poles)
  /\bTP\+N\b/i,
  /\bSP\b/i,
  /\bDP\b/i,
  /\b3\s*phase\b/i,
  /\bsingle\s*phase\b/i,
  /\bflush\s*mount\b/i,
  /\bsurface\s*mount\b/i,
  /\brecessed\b/i,
  /\bweatherproof\b/i,
  /\bexplosion.?proof\b/i,
  /\bfire.?rated\b/i,
  /\banti.?corrosion\b/i,
  /\boutdoor\b/i,
  /\bindoor\b/i,
  /\bunderground\b/i,
  /\barmoured\b|\barmored\b|مدرع/i,
  /\bunarmoured\b|\bunarmored\b/i,
];

// =================== 4. محرك الاستخراج الرئيسي (Main Extraction Engine) ===================

/**
 * استخراج المواصفات الفنية من وصف بند
 * @param description وصف البند (عربي أو إنجليزي)
 * @param unit وحدة القياس (اختياري — يساعد في تحسين التصنيف)
 */
export function extractSpecs(description: string, unit?: string): ExtractedSpecs {
  if (!description || description.trim().length < 2) {
    return {
      category: 'general', subCategory: 'unknown',
      size: null, capacity: null, grade: null, brand: null,
      material: null, voltage: null, specs: [], confidence: 0,
    };
  }

  const text = description.trim();
  let confidence = 0;

  // ─── 1. Category Detection ───
  let category: SpecCategory = 'general';
  const categoryOrder: SpecCategory[] = ['electrical', 'plumbing', 'hvac', 'fire', 'structural', 'finishes'];
  for (const cat of categoryOrder) {
    if (CATEGORY_KEYWORDS[cat].test(text)) {
      category = cat;
      confidence += 0.25;
      break;
    }
  }

  // Unit-based category hints
  if (category === 'general' && unit) {
    if (/نقطة|point/i.test(unit)) {
      // نقاط كهربائية أو سباكة — check content
      if (/كهرب|elec|socket|light|إنارة|مفتاح/i.test(text)) {
        category = 'electrical';
        confidence += 0.15;
      } else if (/صحي|سباك|plumb|صرف/i.test(text)) {
        category = 'plumbing';
        confidence += 0.15;
      }
    }
  }

  // ─── 2. Sub-Category Detection ───
  let subCategory = 'general';
  for (const entry of SUB_CATEGORY_PATTERNS) {
    if (entry.category === category && entry.pattern.test(text)) {
      subCategory = entry.subCategory;
      confidence += 0.15;
      break;
    }
  }

  // If no sub-category for detected category, try all sub-categories
  if (subCategory === 'general') {
    for (const entry of SUB_CATEGORY_PATTERNS) {
      if (entry.pattern.test(text)) {
        // Update category if sub-category found from different category
        if (category === 'general') {
          category = entry.category;
          confidence += 0.20;
        }
        subCategory = entry.subCategory;
        confidence += 0.10;
        break;
      }
    }
  }

  // ─── 3. Size Extraction ───
  let size: string | null = null;
  for (const sp of SIZE_PATTERNS) {
    const match = text.match(sp.pattern);
    if (match) {
      size = sp.formatter(match);
      confidence += 0.15;
      break;
    }
  }

  // ─── 4. Capacity Extraction ───
  let capacity: string | null = null;
  for (const cp of CAPACITY_PATTERNS) {
    const match = text.match(cp.pattern);
    if (match) {
      capacity = cp.formatter(match);
      confidence += 0.15;
      break;
    }
  }

  // ─── 5. Grade Extraction ───
  let grade: string | null = null;
  for (const gp of GRADE_PATTERNS) {
    const match = text.match(gp.pattern);
    if (match) {
      grade = gp.formatter(match);
      confidence += 0.10;
      break;
    }
  }

  // ─── 6. Brand Detection ───
  let brand: string | null = null;
  for (const bp of KNOWN_BRANDS) {
    if (bp.pattern.test(text)) {
      brand = bp.name;
      confidence += 0.10;
      break;
    }
  }

  // ─── 7. Material Detection ───
  let material: string | null = null;
  for (const mp of MATERIAL_PATTERNS) {
    if (mp.pattern.test(text)) {
      material = mp.name;
      confidence += 0.10;
      break;
    }
  }

  // ─── 8. Voltage Detection ───
  let voltage: string | null = null;
  for (const vp of VOLTAGE_PATTERNS) {
    if (vp.pattern.test(text)) {
      voltage = vp.value;
      confidence += 0.05;
      break;
    }
  }

  // ─── 9. Additional Specs ───
  const specs: string[] = [];
  for (const sp of ADDITIONAL_SPEC_PATTERNS) {
    const match = text.match(sp);
    if (match) {
      const specValue = match[0].trim().toUpperCase();
      if (!specs.includes(specValue)) {
        specs.push(specValue);
      }
    }
  }
  if (specs.length > 0) confidence += Math.min(specs.length * 0.03, 0.10);

  // ─── 10. Confidence Normalization ───
  confidence = Math.min(confidence, 1.0);

  // Penalize general category
  if (category === 'general') {
    confidence = Math.min(confidence, 0.20);
  }

  return {
    category,
    subCategory,
    size,
    capacity,
    grade,
    brand,
    material,
    voltage,
    specs,
    confidence: Math.round(confidence * 100) / 100,
  };
}
