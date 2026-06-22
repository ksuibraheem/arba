/**
 * ============================================================================
 *  MEP Items Database — قاعدة بيانات بنود الأعمال الكهروميكانيكية
 *  ARBA Pro Pricing Platform v10.0
 *  ~200 items: Electrical, Plumbing, HVAC, Fire Protection
 *  Prices: Saudi Market 2025-2026 (SAR)
 * ============================================================================
 */

import { BaseItem, SupplierOption } from '../types';

// ============================================================================
//  SUPPLIERS — الموردين
// ============================================================================

const suppliersCables: SupplierOption[] = [
    { id: 'cable_alfanar', name: { ar: 'ألفنار', en: 'Al-Fanar', fr: 'Al-Fanar', zh: 'Al-Fanar' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'cable_riyadh', name: { ar: 'الرياض للكابلات', en: 'Riyadh Cables', fr: 'Câbles de Riyad', zh: '利雅得电缆' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'cable_bahra', name: { ar: 'كابلات بحرة', en: 'Bahra Cables', fr: 'Câbles Bahra', zh: 'Bahra 电缆' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'cable_imported', name: { ar: 'مستورد', en: 'Imported', fr: 'Importé', zh: '进口' }, tier: 'budget', priceMultiplier: 0.9, origin: 'Various' },
];

const suppliersPanels: SupplierOption[] = [
    { id: 'panel_schneider', name: { ar: 'شنايدر إليكتريك', en: 'Schneider Electric', fr: 'Schneider Electric', zh: '施耐德电气' }, tier: 'premium', priceMultiplier: 1.30, origin: 'France' },
    { id: 'panel_abb', name: { ar: 'ABB', en: 'ABB', fr: 'ABB', zh: 'ABB' }, tier: 'premium', priceMultiplier: 1.20, origin: 'Sweden' },
    { id: 'panel_alfanar', name: { ar: 'ألفنار', en: 'Al-Fanar', fr: 'Al-Fanar', zh: 'Al-Fanar' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'panel_local', name: { ar: 'تصنيع محلي', en: 'Local Manufacturing', fr: 'Fabrication Locale', zh: '本地制造' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Local' },
];

const suppliersBreakers: SupplierOption[] = [
    { id: 'brk_schneider', name: { ar: 'شنايدر', en: 'Schneider', fr: 'Schneider', zh: '施耐德' }, tier: 'premium', priceMultiplier: 1.25, origin: 'France' },
    { id: 'brk_abb', name: { ar: 'ABB', en: 'ABB', fr: 'ABB', zh: 'ABB' }, tier: 'premium', priceMultiplier: 1.20, origin: 'Sweden' },
    { id: 'brk_ls', name: { ar: 'LS Electric', en: 'LS Electric', fr: 'LS Electric', zh: 'LS Electric' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Korea' },
    { id: 'brk_chint', name: { ar: 'تشينت', en: 'Chint', fr: 'Chint', zh: '正泰' }, tier: 'budget', priceMultiplier: 0.75, origin: 'China' },
];

const suppliersLighting: SupplierOption[] = [
    { id: 'light_philips', name: { ar: 'فيليبس', en: 'Philips', fr: 'Philips', zh: '飞利浦' }, tier: 'premium', priceMultiplier: 1.30, origin: 'Netherlands' },
    { id: 'light_osram', name: { ar: 'أوسرام', en: 'Osram', fr: 'Osram', zh: '欧司朗' }, tier: 'standard', priceMultiplier: 1.10, origin: 'Germany' },
    { id: 'light_local', name: { ar: 'محلي', en: 'Local', fr: 'Local', zh: '本地' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'light_china', name: { ar: 'صيني', en: 'Chinese', fr: 'Chinois', zh: '中国' }, tier: 'budget', priceMultiplier: 0.70, origin: 'China' },
];

const suppliersTrays: SupplierOption[] = [
    { id: 'tray_dana', name: { ar: 'دانة', en: 'Dana Steel', fr: 'Dana Acier', zh: 'Dana 钢铁' }, tier: 'premium', priceMultiplier: 1.15, origin: 'UAE/Saudi' },
    { id: 'tray_local', name: { ar: 'مصنع محلي', en: 'Local Factory', fr: 'Usine Locale', zh: '当地工厂' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'tray_china', name: { ar: 'مستورد صيني', en: 'Chinese Import', fr: 'Import Chinois', zh: '中国进口' }, tier: 'budget', priceMultiplier: 0.80, origin: 'China' },
];

const suppliersElecMisc: SupplierOption[] = [
    { id: 'elec_legrand', name: { ar: 'لوقراند', en: 'Legrand', fr: 'Legrand', zh: '罗格朗' }, tier: 'premium', priceMultiplier: 1.30, origin: 'France' },
    { id: 'elec_abb', name: { ar: 'ABB', en: 'ABB', fr: 'ABB', zh: 'ABB' }, tier: 'standard', priceMultiplier: 1.10, origin: 'Sweden' },
    { id: 'elec_mk', name: { ar: 'MK', en: 'MK Electric', fr: 'MK Electric', zh: 'MK' }, tier: 'standard', priceMultiplier: 1.0, origin: 'UK' },
    { id: 'elec_viko', name: { ar: 'فيكو', en: 'Viko', fr: 'Viko', zh: 'Viko' }, tier: 'budget', priceMultiplier: 0.75, origin: 'Turkey' },
];

const suppliersGenerators: SupplierOption[] = [
    { id: 'gen_caterpillar', name: { ar: 'كاتربيلر', en: 'Caterpillar', fr: 'Caterpillar', zh: '卡特彼勒' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'gen_cummins', name: { ar: 'كمنز', en: 'Cummins', fr: 'Cummins', zh: '康明斯' }, tier: 'premium', priceMultiplier: 1.20, origin: 'USA' },
    { id: 'gen_perkins', name: { ar: 'بيركنز', en: 'Perkins', fr: 'Perkins', zh: '珀金斯' }, tier: 'standard', priceMultiplier: 1.0, origin: 'UK' },
    { id: 'gen_sdmo', name: { ar: 'SDMO', en: 'SDMO', fr: 'SDMO', zh: 'SDMO' }, tier: 'standard', priceMultiplier: 1.05, origin: 'France' },
    { id: 'gen_china', name: { ar: 'صيني', en: 'Chinese', fr: 'Chinois', zh: '中国' }, tier: 'budget', priceMultiplier: 0.70, origin: 'China' },
];

const suppliersPlumbing: SupplierOption[] = [
    { id: 'plumb_ktp', name: { ar: 'القبلان KTP', en: 'Al-Qablan KTP', fr: 'Al-Qablan KTP', zh: 'Al-Qablan KTP' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Saudi' },
    { id: 'plumb_aquatherm', name: { ar: 'الأنابيب الخضراء الألمانية (Aquatherm)', en: 'German Green Pipes (Aquatherm)', fr: 'Tuyau Allemand Green', zh: '德国绿管' }, tier: 'premium', priceMultiplier: 1.70, origin: 'Germany' },
    { id: 'plumb_nipro', name: { ar: 'نيبرو', en: 'Nipro', fr: 'Nipro', zh: 'Nipro' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'plumb_aplaco', name: { ar: 'أبلكو', en: 'Aplaco', fr: 'Aplaco', zh: 'Aplaco' }, tier: 'standard', priceMultiplier: 1.05, origin: 'Local' },
    { id: 'plumb_china', name: { ar: 'تجاري صيني', en: 'Chinese Commercial', fr: 'Commercial Chinois', zh: '中国商业' }, tier: 'budget', priceMultiplier: 0.80, origin: 'China' },
];

const suppliersSanitary: SupplierOption[] = [
    { id: 'san_duravit', name: { ar: 'دورافيت', en: 'Duravit', fr: 'Duravit', zh: 'Duravit' }, tier: 'premium', priceMultiplier: 1.50, origin: 'Germany' },
    { id: 'san_ideal', name: { ar: 'إيديال ستاندرد', en: 'Ideal Standard', fr: 'Ideal Standard', zh: 'Ideal Standard' }, tier: 'premium', priceMultiplier: 1.25, origin: 'Europe' },
    { id: 'san_rak', name: { ar: 'RAK', en: 'RAK Ceramics', fr: 'RAK Ceramics', zh: 'RAK' }, tier: 'standard', priceMultiplier: 1.0, origin: 'UAE' },
    { id: 'san_local', name: { ar: 'محلي', en: 'Local Brand', fr: 'Marque Locale', zh: '本地品牌' }, tier: 'budget', priceMultiplier: 0.70, origin: 'Local/China' },
];

const suppliersHVAC: SupplierOption[] = [
    { id: 'hvac_trane', name: { ar: 'تران', en: 'Trane', fr: 'Trane', zh: 'Trane' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'hvac_carrier', name: { ar: 'كارير', en: 'Carrier', fr: 'Carrier', zh: '开利' }, tier: 'premium', priceMultiplier: 1.20, origin: 'USA' },
    { id: 'hvac_york', name: { ar: 'يورك', en: 'York', fr: 'York', zh: '约克' }, tier: 'standard', priceMultiplier: 1.0, origin: 'USA' },
    { id: 'hvac_daikin', name: { ar: 'دايكن', en: 'Daikin', fr: 'Daikin', zh: '大金' }, tier: 'standard', priceMultiplier: 1.10, origin: 'Japan' },
    { id: 'hvac_midea', name: { ar: 'ميديا', en: 'Midea', fr: 'Midea', zh: '美的' }, tier: 'budget', priceMultiplier: 0.80, origin: 'China' },
];

const suppliersDucts: SupplierOption[] = [
    { id: 'duct_alafandi', name: { ar: 'الأفندي', en: 'Al-Afandi', fr: 'Al-Afandi', zh: 'Al-Afandi' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'duct_local', name: { ar: 'مصنع محلي', en: 'Local Factory', fr: 'Usine Locale', zh: '当地工厂' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'duct_china', name: { ar: 'مستورد', en: 'Imported', fr: 'Importé', zh: '进口' }, tier: 'budget', priceMultiplier: 0.85, origin: 'China' },
];

const suppliersFire: SupplierOption[] = [
    { id: 'fire_naffco', name: { ar: 'NAFFCO', en: 'NAFFCO', fr: 'NAFFCO', zh: 'NAFFCO' }, tier: 'premium', priceMultiplier: 1.20, origin: 'UAE' },
    { id: 'fire_kidde', name: { ar: 'Kidde', en: 'Kidde', fr: 'Kidde', zh: 'Kidde' }, tier: 'premium', priceMultiplier: 1.25, origin: 'USA' },
    { id: 'fire_viking', name: { ar: 'Viking', en: 'Viking', fr: 'Viking', zh: 'Viking' }, tier: 'standard', priceMultiplier: 1.10, origin: 'USA' },
    { id: 'fire_bosch', name: { ar: 'بوش', en: 'Bosch', fr: 'Bosch', zh: '博世' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Germany' },
    { id: 'fire_local', name: { ar: 'محلي', en: 'Local Contractor', fr: 'Entrepreneur Local', zh: '当地承包商' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Local' },
];

const suppliersTanks: SupplierOption[] = [
    { id: 'tank_zamil', name: { ar: 'زامل', en: 'Zamil', fr: 'Zamil', zh: 'Zamil' }, tier: 'premium', priceMultiplier: 1.15, origin: 'Saudi' },
    { id: 'tank_local', name: { ar: 'مصنع محلي', en: 'Local Factory', fr: 'Usine Locale', zh: '当地工厂' }, tier: 'standard', priceMultiplier: 1.0, origin: 'Local' },
    { id: 'tank_import', name: { ar: 'مستورد', en: 'Imported', fr: 'Importé', zh: '进口' }, tier: 'budget', priceMultiplier: 0.85, origin: 'Various' },
];


// ============================================================================
//  ELECTRICAL ITEMS — البنود الكهربائية (~80 items)
// ============================================================================

const ELECTRICAL_CABLES: BaseItem[] = [
    // ===== Single Core Wire Rolls (لفات أسلاك) - Al-Fanar / Riyadh =====
    { id: 'EL-W-01', category: 'mep_elec', type: 'commercial', name: { ar: 'سلك نحاس 1.5 مم² (لفة 500 قدم)', en: 'Wire roll 1.5mm² (500ft)', fr: 'Fil 1.5mm² (500ft)', zh: '1.5mm² 导线卷' }, unit: 'لفة', qty: 0, baseMaterial: 125, baseLabor: 80, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC 401-Wire', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-W-02', category: 'mep_elec', type: 'commercial', name: { ar: 'سلك نحاس 2.5 مم² (لفة 500 قدم)', en: 'Wire roll 2.5mm² (500ft)', fr: 'Fil 2.5mm² (500ft)', zh: '2.5mm² 导线卷' }, unit: 'لفة', qty: 0, baseMaterial: 205, baseLabor: 90, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC 401-Wire', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-W-03', category: 'mep_elec', type: 'commercial', name: { ar: 'سلك نحاس 4.0 مم² (لفة 500 قدم)', en: 'Wire roll 4.0mm² (500ft)', fr: 'Fil 4.0mm² (500ft)', zh: '4.0mm² 导线卷' }, unit: 'لفة', qty: 0, baseMaterial: 287, baseLabor: 100, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC 401-Wire', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-W-04', category: 'mep_elec', type: 'commercial', name: { ar: 'سلك نحاس 6.0 مم² (لفة 500 قدم)', en: 'Wire roll 6.0mm² (500ft)', fr: 'Fil 6.0mm² (500ft)', zh: '6.0mm² 导线卷' }, unit: 'لفة', qty: 0, baseMaterial: 444, baseLabor: 120, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC 401-Wire', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-W-05', category: 'mep_elec', type: 'commercial', name: { ar: 'سلك نحاس 10.0 مم² (لفة 500 قدم)', en: 'Wire roll 10.0mm² (500ft)', fr: 'Fil 10.0mm² (500ft)', zh: '10.0mm² 导线卷' }, unit: 'لفة', qty: 0, baseMaterial: 765, baseLabor: 150, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC 401-Wire', soilFactor: false, dependency: 'build_area' },

    // ===== Single Core XLPE Cables — كابلات أحادية =====
    { id: 'EL-C-01', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x2.5mm²', en: 'Cable 1x2.5mm²', fr: 'Câble 1x2.5mm²', zh: '1x2.5mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 3, baseLabor: 4, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C01', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-02', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x4mm²', en: 'Cable 1x4mm²', fr: 'Câble 1x4mm²', zh: '1x4mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 5, baseLabor: 4, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C02', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-03', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x6mm²', en: 'Cable 1x6mm²', fr: 'Câble 1x6mm²', zh: '1x6mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 7, baseLabor: 5, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C03', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-04', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x10mm²', en: 'Cable 1x10mm²', fr: 'Câble 1x10mm²', zh: '1x10mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 12, baseLabor: 5, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C04', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-05', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x16mm²', en: 'Cable 1x16mm²', fr: 'Câble 1x16mm²', zh: '1x16mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 18, baseLabor: 6, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C05', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-06', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x25mm²', en: 'Cable 1x25mm²', fr: 'Câble 1x25mm²', zh: '1x25mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 28, baseLabor: 7, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C06', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-07', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x35mm²', en: 'Cable 1x35mm²', fr: 'Câble 1x35mm²', zh: '1x35mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 38, baseLabor: 8, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C07', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-08', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x50mm²', en: 'Cable 1x50mm²', fr: 'Câble 1x50mm²', zh: '1x50mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 55, baseLabor: 9, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C08', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-09', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x70mm²', en: 'Cable 1x70mm²', fr: 'Câble 1x70mm²', zh: '1x70mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 78, baseLabor: 10, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C09', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-10', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x95mm²', en: 'Cable 1x95mm²', fr: 'Câble 1x95mm²', zh: '1x95mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 105, baseLabor: 12, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C10', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-11', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x120mm²', en: 'Cable 1x120mm²', fr: 'Câble 1x120mm²', zh: '1x120mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 135, baseLabor: 14, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C11', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-12', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x150mm²', en: 'Cable 1x150mm²', fr: 'Câble 1x150mm²', zh: '1x150mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 168, baseLabor: 15, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C12', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-13', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل نحاس 1x240mm²', en: 'Cable 1x240mm²', fr: 'Câble 1x240mm²', zh: '1x240mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 265, baseLabor: 18, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C13', soilFactor: false, dependency: 'build_area' },
    // ===== 3-Phase Multi-Core Cables — كابلات ثلاثية الفاز =====
    { id: 'EL-C-14', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل 3 فيز 4x16mm²', en: 'Cable 4x16mm²', fr: 'Câble 4x16mm²', zh: '4x16mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 55, baseLabor: 12, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C14', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-15', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل 3 فيز 4x25mm²', en: 'Cable 4x25mm²', fr: 'Câble 4x25mm²', zh: '4x25mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 85, baseLabor: 14, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C15', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-16', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل 3 فيز 4x35mm²', en: 'Cable 4x35mm²', fr: 'Câble 4x35mm²', zh: '4x35mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 120, baseLabor: 16, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C16', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-17', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل 3 فيز 4x50mm²', en: 'Cable 4x50mm²', fr: 'Câble 4x50mm²', zh: '4x50mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 175, baseLabor: 18, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C17', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-18', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل 3 فيز 4x95mm²', en: 'Cable 4x95mm²', fr: 'Câble 4x95mm²', zh: '4x95mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 350, baseLabor: 22, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C18', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-19', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل 3 فيز 4x120mm²', en: 'Cable 4x120mm²', fr: 'Câble 4x120mm²', zh: '4x120mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 440, baseLabor: 25, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C19', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-C-20', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل 3 فيز 4x240mm²', en: 'Cable 4x240mm²', fr: 'Câble 4x240mm²', zh: '4x240mm² 电缆' }, unit: 'م.ط', qty: 0, baseMaterial: 880, baseLabor: 35, waste: 0.05, suppliers: suppliersCables, sbc: 'SBC-EL-C20', soilFactor: false, dependency: 'build_area' },
];

const ELECTRICAL_PANELS: BaseItem[] = [
    // ===== Distribution Boards — لوحات التوزيع =====
    { id: 'EL-P-01', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة توزيع 8 طريق', en: 'DB 8 Ways', fr: 'Tableau 8 Départs', zh: '8路配电箱' }, unit: 'عدد', qty: 0, baseMaterial: 450, baseLabor: 200, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P01', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-P-02', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة توزيع 12 طريق', en: 'DB 12 Ways', fr: 'Tableau 12 Départs', zh: '12路配电箱' }, unit: 'عدد', qty: 0, baseMaterial: 650, baseLabor: 250, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P02', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-P-03', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة توزيع 18 طريق', en: 'DB 18 Ways', fr: 'Tableau 18 Départs', zh: '18路配电箱' }, unit: 'عدد', qty: 0, baseMaterial: 850, baseLabor: 300, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P03', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-P-04', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة توزيع 24 طريق', en: 'DB 24 Ways', fr: 'Tableau 24 Départs', zh: '24路配电箱' }, unit: 'عدد', qty: 0, baseMaterial: 1100, baseLabor: 350, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P04', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-P-05', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة توزيع 36 طريق', en: 'DB 36 Ways', fr: 'Tableau 36 Départs', zh: '36路配电箱' }, unit: 'عدد', qty: 0, baseMaterial: 1500, baseLabor: 400, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P05', soilFactor: false, dependency: 'build_area' },
    // ===== SMDB/MDB Panels — لوحات رئيسية =====
    { id: 'EL-P-06', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة SMDB 200A', en: 'SMDB 200A', fr: 'TGBT 200A', zh: 'SMDB 200A' }, unit: 'عدد', qty: 0, baseMaterial: 8000, baseLabor: 3000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P06', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-07', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة SMDB 400A', en: 'SMDB 400A', fr: 'TGBT 400A', zh: 'SMDB 400A' }, unit: 'عدد', qty: 0, baseMaterial: 15000, baseLabor: 4000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P07', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-08', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة MDB 400A', en: 'MDB 400A', fr: 'TG 400A', zh: 'MDB 400A' }, unit: 'عدد', qty: 0, baseMaterial: 25000, baseLabor: 5000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P08', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-09', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة MDB 800A', en: 'MDB 800A', fr: 'TG 800A', zh: 'MDB 800A' }, unit: 'عدد', qty: 0, baseMaterial: 35000, baseLabor: 6000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P09', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-10', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة MDB 1000A', en: 'MDB 1000A', fr: 'TG 1000A', zh: 'MDB 1000A' }, unit: 'عدد', qty: 0, baseMaterial: 42000, baseLabor: 7000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P10', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-11', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة MDB 1250A', en: 'MDB 1250A', fr: 'TG 1250A', zh: 'MDB 1250A' }, unit: 'عدد', qty: 0, baseMaterial: 52000, baseLabor: 8000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P11', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-12', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة MDB 1600A', en: 'MDB 1600A', fr: 'TG 1600A', zh: 'MDB 1600A' }, unit: 'عدد', qty: 0, baseMaterial: 65000, baseLabor: 9000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P12', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-13', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة MDB 2000A', en: 'MDB 2000A', fr: 'TG 2000A', zh: 'MDB 2000A' }, unit: 'عدد', qty: 0, baseMaterial: 85000, baseLabor: 12000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P13', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-14', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة طوارئ ESMDB', en: 'Emergency SMDB', fr: 'TGBT Urgence', zh: '应急SMDB' }, unit: 'عدد', qty: 0, baseMaterial: 12000, baseLabor: 3500, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P14', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-P-15', category: 'mep_elec', type: 'commercial', name: { ar: 'لوحة تحكم إنارة', en: 'Lighting Control Panel', fr: 'Tableau Contrôle Éclairage', zh: '照明控制面板' }, unit: 'عدد', qty: 0, baseMaterial: 5000, baseLabor: 2000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-P15', soilFactor: false, dependency: 'build_area' },
];

const ELECTRICAL_BREAKERS: BaseItem[] = [
    { id: 'EL-B-01', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCB 1P 10-32A', en: 'MCB 1P 10-32A', fr: 'Disjoncteur MCB 1P', zh: 'MCB 1P 10-32A' }, unit: 'عدد', qty: 0, baseMaterial: 25, baseLabor: 15, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B01', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-02', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCB 2P 10-32A', en: 'MCB 2P 10-32A', fr: 'Disjoncteur MCB 2P', zh: 'MCB 2P 10-32A' }, unit: 'عدد', qty: 0, baseMaterial: 55, baseLabor: 20, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B02', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-03', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCB 3P 10-63A', en: 'MCB 3P 10-63A', fr: 'Disjoncteur MCB 3P', zh: 'MCB 3P 10-63A' }, unit: 'عدد', qty: 0, baseMaterial: 85, baseLabor: 25, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B03', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-04', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCCB 100A', en: 'MCCB 100A', fr: 'Disjoncteur MCCB 100A', zh: 'MCCB 100A' }, unit: 'عدد', qty: 0, baseMaterial: 350, baseLabor: 80, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B04', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-05', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCCB 250A', en: 'MCCB 250A', fr: 'Disjoncteur MCCB 250A', zh: 'MCCB 250A' }, unit: 'عدد', qty: 0, baseMaterial: 650, baseLabor: 120, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B05', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-06', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCCB 400A', en: 'MCCB 400A', fr: 'Disjoncteur MCCB 400A', zh: 'MCCB 400A' }, unit: 'عدد', qty: 0, baseMaterial: 1200, baseLabor: 200, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B06', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-07', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCCB 630A', en: 'MCCB 630A', fr: 'Disjoncteur MCCB 630A', zh: 'MCCB 630A' }, unit: 'عدد', qty: 0, baseMaterial: 2200, baseLabor: 300, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B07', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-08', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع MCCB 800A', en: 'MCCB 800A', fr: 'Disjoncteur MCCB 800A', zh: 'MCCB 800A' }, unit: 'عدد', qty: 0, baseMaterial: 3500, baseLabor: 400, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B08', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-B-09', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع ACB 1000A', en: 'ACB 1000A', fr: 'Disjoncteur ACB 1000A', zh: 'ACB 1000A' }, unit: 'عدد', qty: 0, baseMaterial: 12000, baseLabor: 1500, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B09', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'EL-B-10', category: 'mep_elec', type: 'commercial', name: { ar: 'قاطع ACB 1600A', en: 'ACB 1600A', fr: 'Disjoncteur ACB 1600A', zh: 'ACB 1600A' }, unit: 'عدد', qty: 0, baseMaterial: 18000, baseLabor: 2000, waste: 0, suppliers: suppliersBreakers, sbc: 'SBC-EL-B10', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
];

const ELECTRICAL_LIGHTING: BaseItem[] = [
    { id: 'EL-L-01', category: 'mep_elec', type: 'commercial', name: { ar: 'داون لايت LED 9W', en: 'LED Downlight 9W', fr: 'Spot LED 9W', zh: 'LED筒灯 9W' }, unit: 'عدد', qty: 0, baseMaterial: 35, baseLabor: 25, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L01', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-02', category: 'mep_elec', type: 'commercial', name: { ar: 'داون لايت LED 18W', en: 'LED Downlight 18W', fr: 'Spot LED 18W', zh: 'LED筒灯 18W' }, unit: 'عدد', qty: 0, baseMaterial: 55, baseLabor: 25, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L02', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-03', category: 'mep_elec', type: 'commercial', name: { ar: 'داون لايت LED 24W', en: 'LED Downlight 24W', fr: 'Spot LED 24W', zh: 'LED筒灯 24W' }, unit: 'عدد', qty: 0, baseMaterial: 75, baseLabor: 30, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L03', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-04', category: 'mep_elec', type: 'commercial', name: { ar: 'بانل لايت 60x60 40W', en: 'LED Panel 60x60 40W', fr: 'Panneau LED 60x60', zh: 'LED面板灯 60x60' }, unit: 'عدد', qty: 0, baseMaterial: 85, baseLabor: 35, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L04', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-05', category: 'mep_elec', type: 'commercial', name: { ar: 'بانل لايت 120x30 40W', en: 'LED Panel 120x30 40W', fr: 'Panneau LED 120x30', zh: 'LED面板灯 120x30' }, unit: 'عدد', qty: 0, baseMaterial: 95, baseLabor: 35, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L05', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-06', category: 'mep_elec', type: 'commercial', name: { ar: 'كشاف إضاءة LED 100W', en: 'LED Floodlight 100W', fr: 'Projecteur LED 100W', zh: 'LED泛光灯 100W' }, unit: 'عدد', qty: 0, baseMaterial: 180, baseLabor: 45, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L06', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-07', category: 'mep_elec', type: 'commercial', name: { ar: 'كشاف إضاءة LED 200W', en: 'LED Floodlight 200W', fr: 'Projecteur LED 200W', zh: 'LED泛光灯 200W' }, unit: 'عدد', qty: 0, baseMaterial: 320, baseLabor: 55, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L07', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-08', category: 'mep_elec', type: 'commercial', name: { ar: 'إنارة طوارئ بطارية', en: 'Emergency Light Battery', fr: 'Éclairage Urgence', zh: '应急照明灯' }, unit: 'عدد', qty: 0, baseMaterial: 120, baseLabor: 30, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L08', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-09', category: 'mep_elec', type: 'commercial', name: { ar: 'لمبة توفير 20W', en: 'Bulkhead Light 20W', fr: 'Hublot 20W', zh: '舱壁灯 20W' }, unit: 'عدد', qty: 0, baseMaterial: 45, baseLabor: 20, waste: 0.02, suppliers: suppliersLighting, sbc: 'SBC-EL-L09', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-L-10', category: 'mep_elec', type: 'commercial', name: { ar: 'شريط LED لكل متر', en: 'LED Strip per meter', fr: 'Ruban LED par mètre', zh: 'LED灯带/米' }, unit: 'م.ط', qty: 0, baseMaterial: 15, baseLabor: 8, waste: 0.05, suppliers: suppliersLighting, sbc: 'SBC-EL-L10', soilFactor: false, dependency: 'build_area' },
];

const ELECTRICAL_TRAYS: BaseItem[] = [
    { id: 'EL-T-01', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل تري مثقب 100mm', en: 'Perforated Cable Tray 100mm', fr: 'Chemin de Câbles Perforé 100mm', zh: '穿孔电缆桥架 100mm' }, unit: 'م.ط', qty: 0, baseMaterial: 35, baseLabor: 20, waste: 0.05, suppliers: suppliersTrays, sbc: 'SBC-EL-T01', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-T-02', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل تري مثقب 200mm', en: 'Perforated Cable Tray 200mm', fr: 'Chemin de Câbles Perforé 200mm', zh: '穿孔电缆桥架 200mm' }, unit: 'م.ط', qty: 0, baseMaterial: 55, baseLabor: 22, waste: 0.05, suppliers: suppliersTrays, sbc: 'SBC-EL-T02', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-T-03', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل تري مثقب 300mm', en: 'Perforated Cable Tray 300mm', fr: 'Chemin de Câbles Perforé 300mm', zh: '穿孔电缆桥架 300mm' }, unit: 'م.ط', qty: 0, baseMaterial: 75, baseLabor: 25, waste: 0.05, suppliers: suppliersTrays, sbc: 'SBC-EL-T03', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-T-04', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل تري مثقب 400mm', en: 'Perforated Cable Tray 400mm', fr: 'Chemin de Câbles Perforé 400mm', zh: '穿孔电缆桥架 400mm' }, unit: 'م.ط', qty: 0, baseMaterial: 95, baseLabor: 28, waste: 0.05, suppliers: suppliersTrays, sbc: 'SBC-EL-T04', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-T-05', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل تري مثقب 600mm', en: 'Perforated Cable Tray 600mm', fr: 'Chemin de Câbles Perforé 600mm', zh: '穿孔电缆桥架 600mm' }, unit: 'م.ط', qty: 0, baseMaterial: 130, baseLabor: 32, waste: 0.05, suppliers: suppliersTrays, sbc: 'SBC-EL-T05', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-T-06', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل تري سلمي 300mm', en: 'Ladder Cable Tray 300mm', fr: 'Échelle à Câbles 300mm', zh: '梯式电缆桥架 300mm' }, unit: 'م.ط', qty: 0, baseMaterial: 95, baseLabor: 28, waste: 0.05, suppliers: suppliersTrays, sbc: 'SBC-EL-T06', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-T-07', category: 'mep_elec', type: 'commercial', name: { ar: 'كابل تري سلمي 600mm', en: 'Ladder Cable Tray 600mm', fr: 'Échelle à Câbles 600mm', zh: '梯式电缆桥架 600mm' }, unit: 'م.ط', qty: 0, baseMaterial: 160, baseLabor: 35, waste: 0.05, suppliers: suppliersTrays, sbc: 'SBC-EL-T07', soilFactor: false, dependency: 'build_area' },
];

const ELECTRICAL_MISC: BaseItem[] = [
    { id: 'EL-M-01', category: 'mep_elec', type: 'commercial', name: { ar: 'مقبس كهربائي 13A', en: 'Socket Outlet 13A', fr: 'Prise 13A', zh: '13A插座' }, unit: 'عدد', qty: 0, baseMaterial: 25, baseLabor: 35, waste: 0, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M01', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-02', category: 'mep_elec', type: 'commercial', name: { ar: 'مقبس كهربائي 15A', en: 'Socket Outlet 15A', fr: 'Prise 15A', zh: '15A插座' }, unit: 'عدد', qty: 0, baseMaterial: 30, baseLabor: 35, waste: 0, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M02', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-03', category: 'mep_elec', type: 'commercial', name: { ar: 'مقبس كهربائي 20A', en: 'Socket Outlet 20A', fr: 'Prise 20A', zh: '20A插座' }, unit: 'عدد', qty: 0, baseMaterial: 45, baseLabor: 40, waste: 0, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M03', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-04', category: 'mep_elec', type: 'commercial', name: { ar: 'مفتاح إنارة مفرد', en: 'Light Switch Single', fr: 'Interrupteur Simple', zh: '单开关' }, unit: 'عدد', qty: 0, baseMaterial: 15, baseLabor: 30, waste: 0, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M04', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-05', category: 'mep_elec', type: 'commercial', name: { ar: 'مفتاح إنارة مزدوج', en: 'Light Switch Double', fr: 'Interrupteur Double', zh: '双开关' }, unit: 'عدد', qty: 0, baseMaterial: 25, baseLabor: 30, waste: 0, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M05', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-06', category: 'mep_elec', type: 'commercial', name: { ar: 'أنبوب PVC 20mm', en: 'PVC Conduit 20mm', fr: 'Tube PVC 20mm', zh: 'PVC管 20mm' }, unit: 'م.ط', qty: 0, baseMaterial: 3, baseLabor: 8, waste: 0.05, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M06', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-07', category: 'mep_elec', type: 'commercial', name: { ar: 'أنبوب PVC 25mm', en: 'PVC Conduit 25mm', fr: 'Tube PVC 25mm', zh: 'PVC管 25mm' }, unit: 'م.ط', qty: 0, baseMaterial: 4, baseLabor: 8, waste: 0.05, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M07', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-08', category: 'mep_elec', type: 'commercial', name: { ar: 'أنبوب GI 20mm', en: 'GI Conduit 20mm', fr: 'Tube GI 20mm', zh: 'GI管 20mm' }, unit: 'م.ط', qty: 0, baseMaterial: 12, baseLabor: 12, waste: 0.05, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M08', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-09', category: 'mep_elec', type: 'commercial', name: { ar: 'أنبوب GI 25mm', en: 'GI Conduit 25mm', fr: 'Tube GI 25mm', zh: 'GI管 25mm' }, unit: 'م.ط', qty: 0, baseMaterial: 15, baseLabor: 12, waste: 0.05, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M09', soilFactor: false, dependency: 'build_area' },
    { id: 'EL-M-10', category: 'mep_elec', type: 'commercial', name: { ar: 'نظام تأريض', en: 'Earthing System', fr: 'Système de Mise à la Terre', zh: '接地系统' }, unit: 'مجموعة', qty: 0, baseMaterial: 3500, baseLabor: 1500, waste: 0, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M10', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-M-11', category: 'mep_elec', type: 'commercial', name: { ar: 'نظام صواعق', en: 'Lightning Protection', fr: 'Protection Foudre', zh: '防雷系统' }, unit: 'مجموعة', qty: 0, baseMaterial: 5000, baseLabor: 2000, waste: 0, suppliers: suppliersElecMisc, sbc: 'SBC-EL-M11', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
];

const ELECTRICAL_GENERATORS: BaseItem[] = [
    // ===== Generators — المولدات =====
    { id: 'EL-G-01', category: 'mep_elec', type: 'commercial', name: { ar: 'مولد كهربائي 100KVA', en: 'Generator 100KVA', fr: 'Groupe Électrogène 100KVA', zh: '100KVA发电机' }, unit: 'عدد', qty: 0, baseMaterial: 55000, baseLabor: 8000, waste: 0, suppliers: suppliersGenerators, sbc: 'SBC-EL-G01', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-02', category: 'mep_elec', type: 'commercial', name: { ar: 'مولد كهربائي 250KVA', en: 'Generator 250KVA', fr: 'Groupe Électrogène 250KVA', zh: '250KVA发电机' }, unit: 'عدد', qty: 0, baseMaterial: 95000, baseLabor: 10000, waste: 0, suppliers: suppliersGenerators, sbc: 'SBC-EL-G02', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-03', category: 'mep_elec', type: 'commercial', name: { ar: 'مولد كهربائي 500KVA', en: 'Generator 500KVA', fr: 'Groupe Électrogène 500KVA', zh: '500KVA发电机' }, unit: 'عدد', qty: 0, baseMaterial: 165000, baseLabor: 15000, waste: 0, suppliers: suppliersGenerators, sbc: 'SBC-EL-G03', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-04', category: 'mep_elec', type: 'commercial', name: { ar: 'مولد كهربائي 750KVA', en: 'Generator 750KVA', fr: 'Groupe Électrogène 750KVA', zh: '750KVA发电机' }, unit: 'عدد', qty: 0, baseMaterial: 250000, baseLabor: 18000, waste: 0, suppliers: suppliersGenerators, sbc: 'SBC-EL-G04', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-05', category: 'mep_elec', type: 'commercial', name: { ar: 'مولد كهربائي 1000KVA', en: 'Generator 1000KVA', fr: 'Groupe Électrogène 1000KVA', zh: '1000KVA发电机' }, unit: 'عدد', qty: 0, baseMaterial: 380000, baseLabor: 22000, waste: 0, suppliers: suppliersGenerators, sbc: 'SBC-EL-G05', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    // ===== ATS — مفاتيح التحويل التلقائي =====
    { id: 'EL-G-06', category: 'mep_elec', type: 'commercial', name: { ar: 'ATS 100A', en: 'ATS 100A', fr: 'Inverseur Automatique 100A', zh: 'ATS 100A' }, unit: 'عدد', qty: 0, baseMaterial: 8000, baseLabor: 2000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-G06', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-07', category: 'mep_elec', type: 'commercial', name: { ar: 'ATS 200A', en: 'ATS 200A', fr: 'Inverseur Automatique 200A', zh: 'ATS 200A' }, unit: 'عدد', qty: 0, baseMaterial: 12000, baseLabor: 2500, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-G07', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-08', category: 'mep_elec', type: 'commercial', name: { ar: 'ATS 400A', en: 'ATS 400A', fr: 'Inverseur Automatique 400A', zh: 'ATS 400A' }, unit: 'عدد', qty: 0, baseMaterial: 18000, baseLabor: 3000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-G08', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-09', category: 'mep_elec', type: 'commercial', name: { ar: 'ATS 800A', en: 'ATS 800A', fr: 'Inverseur Automatique 800A', zh: 'ATS 800A' }, unit: 'عدد', qty: 0, baseMaterial: 28000, baseLabor: 4000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-G09', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-10', category: 'mep_elec', type: 'commercial', name: { ar: 'ATS 1000A', en: 'ATS 1000A', fr: 'Inverseur Automatique 1000A', zh: 'ATS 1000A' }, unit: 'عدد', qty: 0, baseMaterial: 35000, baseLabor: 5000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-G10', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'EL-G-11', category: 'mep_elec', type: 'commercial', name: { ar: 'ATS 1600A', en: 'ATS 1600A', fr: 'Inverseur Automatique 1600A', zh: 'ATS 1600A' }, unit: 'عدد', qty: 0, baseMaterial: 48000, baseLabor: 6000, waste: 0, suppliers: suppliersPanels, sbc: 'SBC-EL-G11', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
];


// ============================================================================
//  PLUMBING ITEMS — بنود السباكة (~40 items)
// ============================================================================

const PLUMBING_ITEMS: BaseItem[] = [
    // ===== Supply Pipes — مواسير التغذية =====
    { id: 'PL-P-01', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة PPR 20mm', en: 'PPR Pipe 20mm', fr: 'Tube PPR 20mm', zh: 'PPR管 20mm' }, unit: 'م.ط', qty: 0, baseMaterial: 8, baseLabor: 12, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-P01', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-P-02', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة PPR 25mm', en: 'PPR Pipe 25mm', fr: 'Tube PPR 25mm', zh: 'PPR管 25mm' }, unit: 'م.ط', qty: 0, baseMaterial: 12, baseLabor: 14, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-P02', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-P-03', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة PPR 32mm', en: 'PPR Pipe 32mm', fr: 'Tube PPR 32mm', zh: 'PPR管 32mm' }, unit: 'م.ط', qty: 0, baseMaterial: 18, baseLabor: 16, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-P03', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-P-04', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة PPR 40mm', en: 'PPR Pipe 40mm', fr: 'Tube PPR 40mm', zh: 'PPR管 40mm' }, unit: 'م.ط', qty: 0, baseMaterial: 25, baseLabor: 18, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-P04', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-P-05', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة PPR 50mm', en: 'PPR Pipe 50mm', fr: 'Tube PPR 50mm', zh: 'PPR管 50mm' }, unit: 'م.ط', qty: 0, baseMaterial: 35, baseLabor: 20, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-P05', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-P-06', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة PPR 63mm', en: 'PPR Pipe 63mm', fr: 'Tube PPR 63mm', zh: 'PPR管 63mm' }, unit: 'م.ط', qty: 0, baseMaterial: 48, baseLabor: 22, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-P06', soilFactor: false, dependency: 'build_area' },

    // ===== Drain Pipes — مواسير الصرف =====
    { id: 'PL-D-01', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة صرف uPVC 50mm', en: 'uPVC Drain Pipe 50mm', fr: 'Tube PVC Évacuation 50mm', zh: 'uPVC排水管 50mm' }, unit: 'م.ط', qty: 0, baseMaterial: 10, baseLabor: 15, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-D01', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-D-02', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة صرف uPVC 75mm', en: 'uPVC Drain Pipe 75mm', fr: 'Tube PVC Évacuation 75mm', zh: 'uPVC排水管 75mm' }, unit: 'م.ط', qty: 0, baseMaterial: 15, baseLabor: 18, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-D02', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-D-03', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة صرف uPVC 110mm', en: 'uPVC Drain Pipe 110mm', fr: 'Tube PVC Évacuation 110mm', zh: 'uPVC排水管 110mm' }, unit: 'م.ط', qty: 0, baseMaterial: 22, baseLabor: 22, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-D03', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-D-04', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة صرف uPVC 160mm', en: 'uPVC Drain Pipe 160mm', fr: 'Tube PVC Évacuation 160mm', zh: 'uPVC排水管 160mm' }, unit: 'م.ط', qty: 0, baseMaterial: 35, baseLabor: 25, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-D04', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-D-05', category: 'mep_plumb', type: 'commercial', name: { ar: 'ماسورة صرف uPVC 200mm', en: 'uPVC Drain Pipe 200mm', fr: 'Tube PVC Évacuation 200mm', zh: 'uPVC排水管 200mm' }, unit: 'م.ط', qty: 0, baseMaterial: 55, baseLabor: 28, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-701-D05', soilFactor: false, dependency: 'build_area' },

    // ===== Sanitary Fixtures — الأدوات الصحية =====
    { id: 'PL-F-01', category: 'mep_plumb', type: 'commercial', name: { ar: 'طقم مغسلة مع خلاط', en: 'Washbasin with Mixer', fr: 'Lavabo avec Mitigeur', zh: '洗脸盆带龙头' }, unit: 'عدد', qty: 0, baseMaterial: 350, baseLabor: 150, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F01', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-02', category: 'mep_plumb', type: 'commercial', name: { ar: 'كرسي حمام أفرنجي (مع سيفون)', en: 'Western WC with Cistern', fr: 'WC à l\'Anglaise', zh: '坐便器(带水箱)' }, unit: 'عدد', qty: 0, baseMaterial: 450, baseLabor: 200, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F02', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-03', category: 'mep_plumb', type: 'commercial', name: { ar: 'كرسي حمام عربي', en: 'Squatting WC', fr: 'WC à la Turque', zh: '蹲便器' }, unit: 'عدد', qty: 0, baseMaterial: 200, baseLabor: 180, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F03', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-04', category: 'mep_plumb', type: 'commercial', name: { ar: 'شطاف (سبراي)', en: 'Bidet Spray', fr: 'Douchette WC', zh: '妇洗器喷头' }, unit: 'عدد', qty: 0, baseMaterial: 45, baseLabor: 40, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F04', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-05', category: 'mep_plumb', type: 'commercial', name: { ar: 'حوض مطبخ ستانلس ستيل', en: 'Kitchen Sink Stainless Steel', fr: 'Évier Inox', zh: '不锈钢厨房水槽' }, unit: 'عدد', qty: 0, baseMaterial: 400, baseLabor: 200, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F05', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-06', category: 'mep_plumb', type: 'commercial', name: { ar: 'خلاط مطبخ', en: 'Kitchen Mixer Tap', fr: 'Mitigeur Cuisine', zh: '厨房龙头' }, unit: 'عدد', qty: 0, baseMaterial: 180, baseLabor: 80, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F06', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-07', category: 'mep_plumb', type: 'commercial', name: { ar: 'خلاط دش (شاور)', en: 'Shower Mixer', fr: 'Mitigeur Douche', zh: '淋浴龙头' }, unit: 'عدد', qty: 0, baseMaterial: 250, baseLabor: 120, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F07', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-08', category: 'mep_plumb', type: 'commercial', name: { ar: 'بانيو أكريليك', en: 'Acrylic Bathtub', fr: 'Baignoire Acrylique', zh: '亚克力浴缸' }, unit: 'عدد', qty: 0, baseMaterial: 800, baseLabor: 300, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F08', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-09', category: 'mep_plumb', type: 'commercial', name: { ar: 'صفاية أرضية', en: 'Floor Drain', fr: 'Siphon de Sol', zh: '地漏' }, unit: 'عدد', qty: 0, baseMaterial: 25, baseLabor: 35, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-F09', soilFactor: false, dependency: 'build_area' },
    { id: 'PL-F-10', category: 'mep_plumb', type: 'commercial', name: { ar: 'مرآة حمام 60x80', en: 'Bathroom Mirror 60x80', fr: 'Miroir Salle de Bain', zh: '浴室镜 60x80' }, unit: 'عدد', qty: 0, baseMaterial: 120, baseLabor: 40, waste: 0, suppliers: suppliersSanitary, sbc: 'SBC-701-F10', soilFactor: false, dependency: 'build_area' },

    // ===== Tanks & Pumps — الخزانات والمضخات =====
    { id: 'PL-T-01', category: 'mep_plumb', type: 'commercial', name: { ar: 'خزان أرضي فايبر 2000 لتر', en: 'Ground Tank Fiber 2000L', fr: 'Citerne Sol Fibre 2000L', zh: '地面水箱 2000L' }, unit: 'عدد', qty: 0, baseMaterial: 1800, baseLabor: 500, waste: 0, suppliers: suppliersTanks, sbc: 'SBC-701-T01', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-T-02', category: 'mep_plumb', type: 'commercial', name: { ar: 'خزان أرضي فايبر 5000 لتر', en: 'Ground Tank Fiber 5000L', fr: 'Citerne Sol Fibre 5000L', zh: '地面水箱 5000L' }, unit: 'عدد', qty: 0, baseMaterial: 3500, baseLabor: 800, waste: 0, suppliers: suppliersTanks, sbc: 'SBC-701-T02', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-T-03', category: 'mep_plumb', type: 'commercial', name: { ar: 'خزان علوي فايبر 1000 لتر', en: 'Roof Tank Fiber 1000L', fr: 'Citerne Toiture Fibre 1000L', zh: '屋顶水箱 1000L' }, unit: 'عدد', qty: 0, baseMaterial: 1200, baseLabor: 400, waste: 0, suppliers: suppliersTanks, sbc: 'SBC-701-T03', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-T-04', category: 'mep_plumb', type: 'commercial', name: { ar: 'خزان علوي فايبر 2000 لتر', en: 'Roof Tank Fiber 2000L', fr: 'Citerne Toiture Fibre 2000L', zh: '屋顶水箱 2000L' }, unit: 'عدد', qty: 0, baseMaterial: 2000, baseLabor: 600, waste: 0, suppliers: suppliersTanks, sbc: 'SBC-701-T04', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-T-05', category: 'mep_plumb', type: 'commercial', name: { ar: 'مضخة رفع مياه 1HP', en: 'Water Pump 1HP', fr: 'Pompe 1HP', zh: '水泵 1HP' }, unit: 'عدد', qty: 0, baseMaterial: 800, baseLabor: 300, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-T05', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-T-06', category: 'mep_plumb', type: 'commercial', name: { ar: 'مضخة رفع مياه 2HP', en: 'Water Pump 2HP', fr: 'Pompe 2HP', zh: '水泵 2HP' }, unit: 'عدد', qty: 0, baseMaterial: 1500, baseLabor: 400, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-T06', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-T-07', category: 'mep_plumb', type: 'commercial', name: { ar: 'سخان مياه مركزي 100 لتر', en: 'Central Water Heater 100L', fr: 'Chauffe-eau Central 100L', zh: '中央热水器 100L' }, unit: 'عدد', qty: 0, baseMaterial: 1200, baseLabor: 350, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-T07', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-T-08', category: 'mep_plumb', type: 'commercial', name: { ar: 'سخان مياه مركزي 200 لتر', en: 'Central Water Heater 200L', fr: 'Chauffe-eau Central 200L', zh: '中央热水器 200L' }, unit: 'عدد', qty: 0, baseMaterial: 2200, baseLabor: 500, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-T08', soilFactor: false, dependency: 'fixed' },

    // ===== Manholes & Grease Traps — غرف التفتيش =====
    { id: 'PL-M-01', category: 'mep_plumb', type: 'commercial', name: { ar: 'غرفة تفتيش 60x60', en: 'Manhole 60x60cm', fr: 'Regard 60x60cm', zh: '检查井 60x60cm' }, unit: 'عدد', qty: 0, baseMaterial: 450, baseLabor: 350, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-M01', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-M-02', category: 'mep_plumb', type: 'commercial', name: { ar: 'غرفة تفتيش 80x80', en: 'Manhole 80x80cm', fr: 'Regard 80x80cm', zh: '检查井 80x80cm' }, unit: 'عدد', qty: 0, baseMaterial: 700, baseLabor: 450, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-M02', soilFactor: false, dependency: 'fixed' },
    { id: 'PL-M-03', category: 'mep_plumb', type: 'commercial', name: { ar: 'حفرة تحليل (سيبتك تانك)', en: 'Septic Tank', fr: 'Fosse Septique', zh: '化粪池' }, unit: 'عدد', qty: 0, baseMaterial: 4500, baseLabor: 2500, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-M03', soilFactor: true, dependency: 'fixed' },
    { id: 'PL-M-04', category: 'mep_plumb', type: 'commercial', name: { ar: 'حاجز دهون (Grease Trap)', en: 'Grease Trap', fr: 'Bac à Graisses', zh: '隔油池' }, unit: 'عدد', qty: 0, baseMaterial: 1200, baseLabor: 600, waste: 0, suppliers: suppliersPlumbing, sbc: 'SBC-701-M04', soilFactor: false, dependency: 'fixed' },
];


// ============================================================================
//  HVAC ITEMS — بنود التكييف والتهوية (~40 items)
// ============================================================================

const HVAC_ITEMS: BaseItem[] = [
    // ===== Split Units — مكيفات سبلت =====
    { id: 'HV-S-01', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف سبلت 1 طن', en: 'Split AC 1 Ton', fr: 'Climatiseur Split 1 Tonne', zh: '分体式空调 1吨' }, unit: 'عدد', qty: 0, baseMaterial: 1400, baseLabor: 400, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-S01', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-S-02', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف سبلت 1.5 طن', en: 'Split AC 1.5 Ton', fr: 'Climatiseur Split 1.5 Tonne', zh: '分体式空调 1.5吨' }, unit: 'عدد', qty: 0, baseMaterial: 1800, baseLabor: 450, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-S02', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-S-03', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف سبلت 2 طن', en: 'Split AC 2 Ton', fr: 'Climatiseur Split 2 Tonnes', zh: '分体式空调 2吨' }, unit: 'عدد', qty: 0, baseMaterial: 2200, baseLabor: 500, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-S03', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-S-04', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف سبلت 2.5 طن', en: 'Split AC 2.5 Ton', fr: 'Climatiseur Split 2.5 Tonnes', zh: '分体式空调 2.5吨' }, unit: 'عدد', qty: 0, baseMaterial: 2800, baseLabor: 550, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-S04', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-S-05', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف كونسيلد 3 طن', en: 'Concealed AC 3 Ton', fr: 'Climatiseur Gainable 3 Tonnes', zh: '隐藏式空调 3吨' }, unit: 'عدد', qty: 0, baseMaterial: 3500, baseLabor: 800, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-S05', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-S-06', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف كونسيلد 4 طن', en: 'Concealed AC 4 Ton', fr: 'Climatiseur Gainable 4 Tonnes', zh: '隐藏式空调 4吨' }, unit: 'عدد', qty: 0, baseMaterial: 4500, baseLabor: 900, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-S06', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-S-07', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف كونسيلد 5 طن', en: 'Concealed AC 5 Ton', fr: 'Climatiseur Gainable 5 Tonnes', zh: '隐藏式空调 5吨' }, unit: 'عدد', qty: 0, baseMaterial: 5500, baseLabor: 1000, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-S07', soilFactor: false, dependency: 'build_area' },

    // ===== Cassette & Package Units =====
    { id: 'HV-C-01', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف كاسيت 2 طن', en: 'Cassette AC 2 Ton', fr: 'Cassette AC 2 Tonnes', zh: '卡带式空调 2吨' }, unit: 'عدد', qty: 0, baseMaterial: 3200, baseLabor: 700, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-C01', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-C-02', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف كاسيت 3 طن', en: 'Cassette AC 3 Ton', fr: 'Cassette AC 3 Tonnes', zh: '卡带式空调 3吨' }, unit: 'عدد', qty: 0, baseMaterial: 4200, baseLabor: 800, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-C02', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-C-03', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف باكج 5 طن', en: 'Package AC 5 Ton', fr: 'Monobloc AC 5 Tonnes', zh: '柜式空调 5吨' }, unit: 'عدد', qty: 0, baseMaterial: 7500, baseLabor: 1500, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-C03', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'HV-C-04', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف باكج 10 طن', en: 'Package AC 10 Ton', fr: 'Monobloc AC 10 Tonnes', zh: '柜式空调 10吨' }, unit: 'عدد', qty: 0, baseMaterial: 14000, baseLabor: 2500, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-C04', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },
    { id: 'HV-C-05', category: 'mep_hvac', type: 'commercial', name: { ar: 'مكيف باكج 20 طن', en: 'Package AC 20 Ton', fr: 'Monobloc AC 20 Tonnes', zh: '柜式空调 20吨' }, unit: 'عدد', qty: 0, baseMaterial: 25000, baseLabor: 4000, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-C05', soilFactor: false, dependency: 'build_area', laborComplexity: 'specialist' },

    // ===== Central Chiller Systems =====
    { id: 'HV-CH-01', category: 'hvac_central', type: 'commercial', name: { ar: 'شيلر تبريد 50 طن', en: 'Chiller 50 Ton', fr: 'Refroidisseur 50 Tonnes', zh: '冷水机组 50吨' }, unit: 'عدد', qty: 0, baseMaterial: 85000, baseLabor: 15000, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-CH01', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'HV-CH-02', category: 'hvac_central', type: 'commercial', name: { ar: 'شيلر تبريد 100 طن', en: 'Chiller 100 Ton', fr: 'Refroidisseur 100 Tonnes', zh: '冷水机组 100吨' }, unit: 'عدد', qty: 0, baseMaterial: 150000, baseLabor: 22000, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-CH02', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'HV-CH-03', category: 'hvac_central', type: 'commercial', name: { ar: 'شيلر تبريد 200 طن', en: 'Chiller 200 Ton', fr: 'Refroidisseur 200 Tonnes', zh: '冷水机组 200吨' }, unit: 'عدد', qty: 0, baseMaterial: 280000, baseLabor: 35000, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-CH03', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },

    // ===== VRF Systems =====
    { id: 'HV-VRF-01', category: 'hvac_central', type: 'commercial', name: { ar: 'نظام VRF وحدة خارجية 8 طن', en: 'VRF Outdoor Unit 8 Ton', fr: 'VRF Unité Extérieure 8T', zh: 'VRF室外机 8吨' }, unit: 'عدد', qty: 0, baseMaterial: 22000, baseLabor: 5000, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-VRF01', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'HV-VRF-02', category: 'hvac_central', type: 'commercial', name: { ar: 'نظام VRF وحدة خارجية 16 طن', en: 'VRF Outdoor Unit 16 Ton', fr: 'VRF Unité Extérieure 16T', zh: 'VRF室外机 16吨' }, unit: 'عدد', qty: 0, baseMaterial: 42000, baseLabor: 8000, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-VRF02', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'HV-VRF-03', category: 'hvac_central', type: 'commercial', name: { ar: 'وحدة VRF داخلية (كاسيت/دكت)', en: 'VRF Indoor Unit (Cassette/Duct)', fr: 'VRF Unité Intérieure', zh: 'VRF室内机' }, unit: 'عدد', qty: 0, baseMaterial: 3500, baseLabor: 800, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-VRF03', soilFactor: false, dependency: 'build_area' },

    // ===== Ductwork — مجاري الهواء =====
    { id: 'HV-D-01', category: 'mep_hvac', type: 'commercial', name: { ar: 'دكت تكييف جلفنايز', en: 'GI Duct Supply/Return', fr: 'Gaine Galvanisée', zh: '镀锌风管' }, unit: 'م2', qty: 0, baseMaterial: 55, baseLabor: 35, waste: 0.10, suppliers: suppliersDucts, sbc: 'SBC-HVAC-D01', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-D-02', category: 'mep_hvac', type: 'commercial', name: { ar: 'دكت مرن (فليكسبل)', en: 'Flexible Duct', fr: 'Gaine Flexible', zh: '柔性风管' }, unit: 'م.ط', qty: 0, baseMaterial: 25, baseLabor: 15, waste: 0.10, suppliers: suppliersDucts, sbc: 'SBC-HVAC-D02', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-D-03', category: 'mep_hvac', type: 'commercial', name: { ar: 'عزل دكت حراري', en: 'Duct Insulation', fr: 'Isolation Gaine', zh: '风管保温' }, unit: 'م2', qty: 0, baseMaterial: 18, baseLabor: 12, waste: 0.10, suppliers: suppliersDucts, sbc: 'SBC-HVAC-D03', soilFactor: false, dependency: 'build_area' },

    // ===== Diffusers & Grilles — ناشرات ومصبعات =====
    { id: 'HV-G-01', category: 'mep_hvac', type: 'commercial', name: { ar: 'ناشر هواء مربع 30x30', en: 'Square Diffuser 30x30', fr: 'Diffuseur Carré 30x30', zh: '方形风口 30x30' }, unit: 'عدد', qty: 0, baseMaterial: 45, baseLabor: 30, waste: 0, suppliers: suppliersDucts, sbc: 'SBC-HVAC-G01', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-G-02', category: 'mep_hvac', type: 'commercial', name: { ar: 'ناشر هواء مربع 60x60', en: 'Square Diffuser 60x60', fr: 'Diffuseur Carré 60x60', zh: '方形风口 60x60' }, unit: 'عدد', qty: 0, baseMaterial: 65, baseLabor: 35, waste: 0, suppliers: suppliersDucts, sbc: 'SBC-HVAC-G02', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-G-03', category: 'mep_hvac', type: 'commercial', name: { ar: 'مصبعة راجع هواء', en: 'Return Air Grille', fr: 'Grille de Reprise', zh: '回风格栅' }, unit: 'عدد', qty: 0, baseMaterial: 35, baseLabor: 25, waste: 0, suppliers: suppliersDucts, sbc: 'SBC-HVAC-G03', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-G-04', category: 'mep_hvac', type: 'commercial', name: { ar: 'مصبعة هواء نقي (Fresh Air)', en: 'Fresh Air Grille', fr: 'Grille Air Neuf', zh: '新风格栅' }, unit: 'عدد', qty: 0, baseMaterial: 55, baseLabor: 30, waste: 0, suppliers: suppliersDucts, sbc: 'SBC-HVAC-G04', soilFactor: false, dependency: 'build_area' },

    // ===== Exhaust & Ventilation — شفط وتهوية =====
    { id: 'HV-E-01', category: 'mep_hvac', type: 'commercial', name: { ar: 'شفاط حمام 6 بوصة', en: 'Exhaust Fan 6 inch', fr: 'Ventilateur Extracteur 6"', zh: '排气扇 6寸' }, unit: 'عدد', qty: 0, baseMaterial: 80, baseLabor: 45, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-E01', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-E-02', category: 'mep_hvac', type: 'commercial', name: { ar: 'شفاط مطبخ هود', en: 'Kitchen Hood Exhaust', fr: 'Hotte Cuisine', zh: '厨房油烟机' }, unit: 'عدد', qty: 0, baseMaterial: 1500, baseLabor: 500, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-E02', soilFactor: false, dependency: 'fixed' },
    { id: 'HV-E-03', category: 'mep_hvac', type: 'commercial', name: { ar: 'مروحة طرد مركزي', en: 'Centrifugal Exhaust Fan', fr: 'Ventilateur Centrifuge', zh: '离心排气扇' }, unit: 'عدد', qty: 0, baseMaterial: 2500, baseLabor: 800, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-E03', soilFactor: false, dependency: 'fixed', laborComplexity: 'skilled' },

    // ===== Copper Piping for Refrigerant =====
    { id: 'HV-CP-01', category: 'mep_hvac', type: 'commercial', name: { ar: 'مواسير نحاس تبريد 1/4" + 1/2"', en: 'Copper Pipe Set 1/4"+1/2"', fr: 'Tubes Cuivre 1/4"+1/2"', zh: '铜管组 1/4"+1/2"' }, unit: 'م.ط', qty: 0, baseMaterial: 25, baseLabor: 20, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-HVAC-CP01', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-CP-02', category: 'mep_hvac', type: 'commercial', name: { ar: 'مواسير نحاس تبريد 3/8" + 3/4"', en: 'Copper Pipe Set 3/8"+3/4"', fr: 'Tubes Cuivre 3/8"+3/4"', zh: '铜管组 3/8"+3/4"' }, unit: 'م.ط', qty: 0, baseMaterial: 38, baseLabor: 25, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-HVAC-CP02', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-CP-03', category: 'mep_hvac', type: 'commercial', name: { ar: 'مواسير نحاس تبريد 1/2" + 7/8"', en: 'Copper Pipe Set 1/2"+7/8"', fr: 'Tubes Cuivre 1/2"+7/8"', zh: '铜管组 1/2"+7/8"' }, unit: 'م.ط', qty: 0, baseMaterial: 55, baseLabor: 30, waste: 0.10, suppliers: suppliersPlumbing, sbc: 'SBC-HVAC-CP03', soilFactor: false, dependency: 'build_area' },

    // ===== Thermostat & Controls =====
    { id: 'HV-TC-01', category: 'mep_hvac', type: 'commercial', name: { ar: 'ثرموستات عادي', en: 'Standard Thermostat', fr: 'Thermostat Standard', zh: '标准温控器' }, unit: 'عدد', qty: 0, baseMaterial: 80, baseLabor: 40, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-TC01', soilFactor: false, dependency: 'build_area' },
    { id: 'HV-TC-02', category: 'mep_hvac', type: 'commercial', name: { ar: 'ثرموستات ذكي', en: 'Smart Thermostat', fr: 'Thermostat Intelligent', zh: '智能温控器' }, unit: 'عدد', qty: 0, baseMaterial: 250, baseLabor: 60, waste: 0, suppliers: suppliersHVAC, sbc: 'SBC-HVAC-TC02', soilFactor: false, dependency: 'build_area' },
];


// ============================================================================
//  FIRE PROTECTION ITEMS — بنود الحماية من الحريق (~40 items)
// ============================================================================

const FIRE_PROTECTION_ITEMS: BaseItem[] = [
    // ===== Fire Alarm System — نظام إنذار الحريق =====
    { id: 'FP-A-01', category: 'fire_protection', type: 'commercial', name: { ar: 'لوحة إنذار حريق (2 زون)', en: 'Fire Alarm Panel 2 Zone', fr: 'Centrale Incendie 2 Zones', zh: '2区火灾报警主机' }, unit: 'عدد', qty: 0, baseMaterial: 2500, baseLabor: 1200, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A01', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'FP-A-02', category: 'fire_protection', type: 'commercial', name: { ar: 'لوحة إنذار حريق (8 زون)', en: 'Fire Alarm Panel 8 Zone', fr: 'Centrale Incendie 8 Zones', zh: '8区火灾报警主机' }, unit: 'عدد', qty: 0, baseMaterial: 5500, baseLabor: 2000, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A02', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'FP-A-03', category: 'fire_protection', type: 'commercial', name: { ar: 'لوحة إنذار حريق معنونة (Addressable)', en: 'Addressable Fire Alarm Panel', fr: 'Centrale Adressable', zh: '可寻址火灾报警主机' }, unit: 'عدد', qty: 0, baseMaterial: 15000, baseLabor: 4000, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A03', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'FP-A-04', category: 'fire_protection', type: 'commercial', name: { ar: 'كاشف دخان ضوئي', en: 'Photoelectric Smoke Detector', fr: 'Détecteur Fumée Photoélectrique', zh: '光电烟雾探测器' }, unit: 'عدد', qty: 0, baseMaterial: 45, baseLabor: 35, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A04', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-A-05', category: 'fire_protection', type: 'commercial', name: { ar: 'كاشف حرارة', en: 'Heat Detector', fr: 'Détecteur de Chaleur', zh: '热探测器' }, unit: 'عدد', qty: 0, baseMaterial: 40, baseLabor: 35, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A05', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-A-06', category: 'fire_protection', type: 'commercial', name: { ar: 'نقطة نداء يدوية (MCP)', en: 'Manual Call Point', fr: 'Déclencheur Manuel', zh: '手动报警按钮' }, unit: 'عدد', qty: 0, baseMaterial: 55, baseLabor: 35, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A06', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-A-07', category: 'fire_protection', type: 'commercial', name: { ar: 'جرس إنذار (Bell)', en: 'Fire Alarm Bell', fr: 'Cloche Alarme', zh: '报警铃' }, unit: 'عدد', qty: 0, baseMaterial: 65, baseLabor: 30, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A07', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-A-08', category: 'fire_protection', type: 'commercial', name: { ar: 'صفارة إنذار مع فلاش (Sounder Strobe)', en: 'Sounder Strobe', fr: 'Sirène Flash', zh: '声光报警器' }, unit: 'عدد', qty: 0, baseMaterial: 120, baseLabor: 40, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-A08', soilFactor: false, dependency: 'build_area' },

    // ===== Fire Extinguishers — طفايات الحريق =====
    { id: 'FP-E-01', category: 'fire_protection', type: 'commercial', name: { ar: 'طفاية حريق بودرة 6 كجم', en: 'Dry Powder Extinguisher 6kg', fr: 'Extincteur Poudre 6kg', zh: '干粉灭火器 6kg' }, unit: 'عدد', qty: 0, baseMaterial: 85, baseLabor: 20, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-E01', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-E-02', category: 'fire_protection', type: 'commercial', name: { ar: 'طفاية حريق CO2 5 كجم', en: 'CO2 Extinguisher 5kg', fr: 'Extincteur CO2 5kg', zh: 'CO2灭火器 5kg' }, unit: 'عدد', qty: 0, baseMaterial: 200, baseLabor: 20, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-E02', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-E-03', category: 'fire_protection', type: 'commercial', name: { ar: 'خزانة طفاية (كبينة)', en: 'Extinguisher Cabinet', fr: 'Coffret Extincteur', zh: '灭火器箱' }, unit: 'عدد', qty: 0, baseMaterial: 120, baseLabor: 30, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-E03', soilFactor: false, dependency: 'build_area' },

    // ===== Fire Hose System — بكرات الحريق =====
    { id: 'FP-H-01', category: 'fire_protection', type: 'commercial', name: { ar: 'بكرة حريق 25mm مع خزانة', en: 'Fire Hose Reel 25mm with Cabinet', fr: 'Dévidoir Incendie 25mm', zh: '消防软管卷盘 25mm' }, unit: 'عدد', qty: 0, baseMaterial: 800, baseLabor: 350, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-H01', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-H-02', category: 'fire_protection', type: 'commercial', name: { ar: 'خزانة خرطوم حريق 65mm', en: 'Fire Hose Cabinet 65mm', fr: 'Coffret RIA 65mm', zh: '消防栓箱 65mm' }, unit: 'عدد', qty: 0, baseMaterial: 1200, baseLabor: 500, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-H02', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-H-03', category: 'fire_protection', type: 'commercial', name: { ar: 'نقطة اتصال رجال الإطفاء (Siamese)', en: 'Fire Dept Connection (Siamese)', fr: 'Raccord Pompier', zh: '消防接合器' }, unit: 'عدد', qty: 0, baseMaterial: 650, baseLabor: 300, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-H03', soilFactor: false, dependency: 'fixed' },

    // ===== Sprinkler System — نظام الرشاشات =====
    { id: 'FP-SP-01', category: 'fire_protection', type: 'commercial', name: { ar: 'رشاش حريق (Sprinkler Head)', en: 'Sprinkler Head', fr: 'Tête Sprinkler', zh: '喷淋头' }, unit: 'عدد', qty: 0, baseMaterial: 25, baseLabor: 45, waste: 0.05, suppliers: suppliersFire, sbc: 'SBC-801-SP01', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-SP-02', category: 'fire_protection', type: 'commercial', name: { ar: 'ماسورة حريق أسود 2 بوصة', en: 'Black Steel Fire Pipe 2"', fr: 'Tube Acier Noir 2"', zh: '黑钢消防管 2"' }, unit: 'م.ط', qty: 0, baseMaterial: 35, baseLabor: 30, waste: 0.10, suppliers: suppliersFire, sbc: 'SBC-801-SP02', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-SP-03', category: 'fire_protection', type: 'commercial', name: { ar: 'ماسورة حريق أسود 4 بوصة', en: 'Black Steel Fire Pipe 4"', fr: 'Tube Acier Noir 4"', zh: '黑钢消防管 4"' }, unit: 'م.ط', qty: 0, baseMaterial: 75, baseLabor: 45, waste: 0.10, suppliers: suppliersFire, sbc: 'SBC-801-SP03', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-SP-04', category: 'fire_protection', type: 'commercial', name: { ar: 'ماسورة حريق أسود 6 بوصة', en: 'Black Steel Fire Pipe 6"', fr: 'Tube Acier Noir 6"', zh: '黑钢消防管 6"' }, unit: 'م.ط', qty: 0, baseMaterial: 120, baseLabor: 55, waste: 0.10, suppliers: suppliersFire, sbc: 'SBC-801-SP04', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-SP-05', category: 'fire_protection', type: 'commercial', name: { ar: 'محبس إنذار (Alarm Valve)', en: 'Alarm Valve Station', fr: 'Poste de Contrôle', zh: '报警阀' }, unit: 'عدد', qty: 0, baseMaterial: 3500, baseLabor: 1500, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-SP05', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },

    // ===== Fire Pump — مضخات الحريق =====
    { id: 'FP-PM-01', category: 'fire_protection', type: 'commercial', name: { ar: 'مضخة حريق كهربائية 50HP', en: 'Electric Fire Pump 50HP', fr: 'Pompe Incendie Électrique 50HP', zh: '电动消防泵 50HP' }, unit: 'عدد', qty: 0, baseMaterial: 18000, baseLabor: 5000, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-PM01', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'FP-PM-02', category: 'fire_protection', type: 'commercial', name: { ar: 'مضخة حريق ديزل 100HP', en: 'Diesel Fire Pump 100HP', fr: 'Pompe Incendie Diesel 100HP', zh: '柴油消防泵 100HP' }, unit: 'عدد', qty: 0, baseMaterial: 35000, baseLabor: 8000, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-PM02', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'FP-PM-03', category: 'fire_protection', type: 'commercial', name: { ar: 'مضخة جوكي (Jockey Pump)', en: 'Jockey Pump', fr: 'Pompe Jockey', zh: '稳压泵' }, unit: 'عدد', qty: 0, baseMaterial: 3500, baseLabor: 1200, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-PM03', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },

    // ===== Fire Tank — خزانات الحريق =====
    { id: 'FP-TK-01', category: 'fire_protection', type: 'commercial', name: { ar: 'خزان مياه حريق 10,000 لتر', en: 'Fire Water Tank 10,000L', fr: 'Réservoir Incendie 10000L', zh: '消防水箱 10000L' }, unit: 'عدد', qty: 0, baseMaterial: 8000, baseLabor: 3000, waste: 0, suppliers: suppliersTanks, sbc: 'SBC-801-TK01', soilFactor: false, dependency: 'fixed' },
    { id: 'FP-TK-02', category: 'fire_protection', type: 'commercial', name: { ar: 'خزان مياه حريق 30,000 لتر', en: 'Fire Water Tank 30,000L', fr: 'Réservoir Incendie 30000L', zh: '消防水箱 30000L' }, unit: 'عدد', qty: 0, baseMaterial: 22000, baseLabor: 6000, waste: 0, suppliers: suppliersTanks, sbc: 'SBC-801-TK02', soilFactor: false, dependency: 'fixed' },

    // ===== Safety Signs & Emergency — لوحات إرشادية =====
    { id: 'FP-SG-01', category: 'fire_protection', type: 'commercial', name: { ar: 'لوحة إرشادية خروج طوارئ مضيئة', en: 'Illuminated Exit Sign', fr: 'Panneau Sortie Éclairé', zh: '发光出口标志' }, unit: 'عدد', qty: 0, baseMaterial: 85, baseLabor: 30, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-SG01', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-SG-02', category: 'fire_protection', type: 'commercial', name: { ar: 'لوحة تعليمات سلامة', en: 'Safety Instruction Board', fr: 'Panneau Instructions Sécurité', zh: '安全指示牌' }, unit: 'عدد', qty: 0, baseMaterial: 45, baseLabor: 15, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-SG02', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-SG-03', category: 'fire_protection', type: 'commercial', name: { ar: 'باب مقاوم للحريق (ساعتين)', en: 'Fire Rated Door (2 Hours)', fr: 'Porte Coupe-Feu 2H', zh: '2小时防火门' }, unit: 'عدد', qty: 0, baseMaterial: 2500, baseLabor: 600, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-SG03', soilFactor: false, dependency: 'build_area' },
    { id: 'FP-SG-04', category: 'fire_protection', type: 'commercial', name: { ar: 'باب مقاوم للحريق (ساعة)', en: 'Fire Rated Door (1 Hour)', fr: 'Porte Coupe-Feu 1H', zh: '1小时防火门' }, unit: 'عدد', qty: 0, baseMaterial: 1800, baseLabor: 500, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-SG04', soilFactor: false, dependency: 'build_area' },

    // ===== Civil Defense Approval — اعتماد الدفاع المدني =====
    { id: 'FP-CD-01', category: 'fire_protection', type: 'commercial', name: { ar: 'اعتماد الدفاع المدني (رسوم)', en: 'Civil Defense Approval (Fees)', fr: 'Approbation Protection Civile', zh: '民防审批(费用)' }, unit: 'مقطوعية', qty: 1, baseMaterial: 3000, baseLabor: 0, waste: 0, suppliers: [{ id: 'cd_gov', name: { ar: 'الدفاع المدني', en: 'Civil Defense', fr: 'Protection Civile', zh: '民防局' }, tier: 'standard', priceMultiplier: 1 }], sbc: 'SBC-801-CD01', soilFactor: false, dependency: 'fixed', excludeProfit: true },
    { id: 'FP-CD-02', category: 'fire_protection', type: 'commercial', name: { ar: 'نظام إطفاء غازي (FM200) لغرفة سيرفر', en: 'FM200 Gas Suppression System', fr: 'Système Extinction Gaz FM200', zh: 'FM200气体灭火系统' }, unit: 'عدد', qty: 0, baseMaterial: 25000, baseLabor: 8000, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-CD02', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
    { id: 'FP-CD-03', category: 'fire_protection', type: 'commercial', name: { ar: 'نظام ضغط سلالم الدرج', en: 'Stairwell Pressurization System', fr: 'Surpression Cage Escalier', zh: '楼梯加压系统' }, unit: 'عدد', qty: 0, baseMaterial: 15000, baseLabor: 5000, waste: 0, suppliers: suppliersFire, sbc: 'SBC-801-CD03', soilFactor: false, dependency: 'fixed', laborComplexity: 'specialist' },
];


// ============================================================================
//  COMBINED EXPORT — تصدير مجمع
// ============================================================================

export const MEP_ITEMS_DATABASE: BaseItem[] = [
    // Electrical — كهربائي
    ...ELECTRICAL_CABLES,
    ...ELECTRICAL_PANELS,
    ...ELECTRICAL_BREAKERS,
    ...ELECTRICAL_LIGHTING,
    ...ELECTRICAL_TRAYS,
    ...ELECTRICAL_MISC,
    ...ELECTRICAL_GENERATORS,
    // Plumbing — سباكة
    ...PLUMBING_ITEMS,
    // HVAC — تكييف
    ...HVAC_ITEMS,
    // Fire Protection — حماية حريق
    ...FIRE_PROTECTION_ITEMS,
];
